import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dbInsert, IS_SUPABASE_READY } from "./supabaseClient";

const STORAGE_KEYS = {
  COMPLETED_PREFIX: "iqama_completed_",
  STREAK: "iqama_streak_data",
  SETTINGS: "iqama_settings",
};

// ─── Supabase prayer sync helper ─────────────────────────────────────────────
async function syncPrayerToSupabase(dateStr, prayers) {
  if (!IS_SUPABASE_READY) return;
  try {
    const userId = await AsyncStorage.getItem("iqama_supabase_user_id");
    if (!userId) return;

    await dbInsert("prayer_logs", {
      user_id: userId,
      date: dateStr,
      fajr: prayers.Fajr || false,
      dhuhr: prayers.Dhuhr || false,
      asr: prayers.Asr || false,
      maghrib: prayers.Maghrib || false,
      isha: prayers.Isha || false,
    }, { upsert: true, returnRow: false });
  } catch (e) {
    console.warn("[PrayerStorage] Supabase sync error:", e?.message);
  }
}

async function syncStreakToSupabase(currentStreak, bestStreak) {
  if (!IS_SUPABASE_READY) return;
  try {
    const userId = await AsyncStorage.getItem("iqama_supabase_user_id");
    if (!userId) return;

    const { dbUpdate } = require("./supabaseClient");
    await dbUpdate("users", `id=eq.${userId}`, {
      current_streak: currentStreak,
      best_streak: bestStreak,
    });
  } catch (e) {
    console.warn("[PrayerStorage] Streak sync error:", e?.message);
  }
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function getDateKey(date) {
  return date.toISOString().split("T")[0];
}

// Calculate streak from stored data
async function calculateStreak() {
  try {
    const today = new Date();
    let currentStreak = 0;
    let bestStreak = 0;
    const streakDays = [];

    // Helper to check if a day is completed (at least 3 prayers)
    const isDayCompleted = async (date) => {
      const key = `${STORAGE_KEYS.COMPLETED_PREFIX}${getDateKey(date)}`;
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return false;
      const completed = JSON.parse(stored);
      const count = Object.keys(completed).filter((k) => completed[k] === true).length;
      return count >= 3;
    };

    // Check today first
    const todayCompleted = await isDayCompleted(today);

    // If today is not yet completed, start counting streak from yesterday
    // (user may not have finished today's prayers yet)
    const streakStartOffset = todayCompleted ? 0 : 1;

    // Calculate current streak
    for (let i = streakStartOffset; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const completed = await isDayCompleted(checkDate);
      if (completed) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }

    // Build last 7 days for streak dots display
    for (let i = 6; i >= 0; i--) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const completed = await isDayCompleted(checkDate);
      streakDays.push(completed);
    }

    // Calculate best streak from last 90 days
    let tempStreak = 0;
    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const completed = await isDayCompleted(checkDate);
      if (completed) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Ensure bestStreak is at least currentStreak
    bestStreak = Math.max(bestStreak, currentStreak);

    return { currentStreak, bestStreak, streakDays };
  } catch (e) {
    console.error("Failed to calculate streak:", e);
    return { currentStreak: 0, bestStreak: 0, streakDays: Array(7).fill(false) };
  }
}

// Get monthly stats for tracker
async function getMonthlyStats(year, month) {
  try {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let totalCompleted = 0;
    let totalPossible = daysInMonth * 5; // 5 prayers per day
    const calendarData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const key = `${STORAGE_KEYS.COMPLETED_PREFIX}${getDateKey(date)}`;
      const stored = await AsyncStorage.getItem(key);

      if (stored) {
        const completed = JSON.parse(stored);
        const count = Object.values(completed).filter(Boolean).length;
        totalCompleted += count;
        calendarData.push({
          day,
          completed: count === 5,
          partial: count > 0 && count < 5,
          count,
        });
      } else {
        calendarData.push({ day, completed: false, partial: false, count: 0 });
      }
    }

    return { totalCompleted, totalPossible, calendarData, daysInMonth };
  } catch (e) {
    console.error("Failed to get monthly stats:", e);
    return { totalCompleted: 0, totalPossible: 0, calendarData: [], daysInMonth: 30 };
  }
}

// Get prayer breakdown stats for current month
async function getPrayerBreakdown(year, month) {
  try {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const currentDay = today.getFullYear() === year && today.getMonth() === month
      ? today.getDate()
      : daysInMonth;

    const prayerCounts = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };

    for (let day = 1; day <= currentDay; day++) {
      const date = new Date(year, month, day);
      const key = `${STORAGE_KEYS.COMPLETED_PREFIX}${getDateKey(date)}`;
      const stored = await AsyncStorage.getItem(key);

      if (stored) {
        const completed = JSON.parse(stored);
        Object.keys(prayerCounts).forEach((prayer) => {
          if (completed[prayer]) prayerCounts[prayer]++;
        });
      }
    }

    const breakdown = Object.entries(prayerCounts).map(([name, count]) => ({
      name,
      count,
      total: currentDay,
      percentage: currentDay > 0 ? Math.round((count / currentDay) * 100) : 0,
    }));

    // Sort by percentage descending, mark lowest as most missed
    breakdown.sort((a, b) => b.percentage - a.percentage);
    if (breakdown.length > 0) {
      const lowest = breakdown[breakdown.length - 1];
      lowest.isMissed = lowest.percentage < 100;
    }

    return breakdown;
  } catch (e) {
    console.error("Failed to get prayer breakdown:", e);
    return [];
  }
}

export function usePrayerStorage() {
  const [completedPrayers, setCompletedPrayers] = useState({});
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    bestStreak: 0,
    streakDays: Array(7).fill(false),
  });

  // Load today's completed prayers
  useEffect(() => {
    const load = async () => {
      try {
        const key = `${STORAGE_KEYS.COMPLETED_PREFIX}${getTodayKey()}`;
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          setCompletedPrayers(JSON.parse(stored));
        }
        const streak = await calculateStreak();
        setStreakData(streak);
      } catch (e) {
        console.error("Failed to load prayer data:", e);
      }
    };
    load();
  }, []);

  const togglePrayerComplete = useCallback(async (prayerName) => {
    try {
      const todayKey = getTodayKey();
      const key = `${STORAGE_KEYS.COMPLETED_PREFIX}${todayKey}`;
      const stored = await AsyncStorage.getItem(key);
      const current = stored ? JSON.parse(stored) : {};
      const updated = { ...current, [prayerName]: !current[prayerName] };

      await AsyncStorage.setItem(key, JSON.stringify(updated));
      setCompletedPrayers(updated);

      // Recalculate streak
      const streak = await calculateStreak();
      setStreakData(streak);

      // Sync to Supabase (fire & forget)
      syncPrayerToSupabase(todayKey, updated);
      syncStreakToSupabase(streak.currentStreak, streak.bestStreak);
    } catch (e) {
      console.error("Failed to toggle prayer:", e);
    }
  }, []);

  const markPrayerComplete = useCallback(async (prayerName) => {
    try {
      const todayKey = getTodayKey();
      const key = `${STORAGE_KEYS.COMPLETED_PREFIX}${todayKey}`;
      const stored = await AsyncStorage.getItem(key);
      const current = stored ? JSON.parse(stored) : {};
      const updated = { ...current, [prayerName]: true };

      await AsyncStorage.setItem(key, JSON.stringify(updated));
      setCompletedPrayers(updated);

      const streak = await calculateStreak();
      setStreakData(streak);

      // Sync to Supabase (fire & forget)
      syncPrayerToSupabase(todayKey, updated);
      syncStreakToSupabase(streak.currentStreak, streak.bestStreak);
    } catch (e) {
      console.error("Failed to mark prayer:", e);
    }
  }, []);

  return {
    completedPrayers,
    streakData,
    togglePrayerComplete,
    markPrayerComplete,
    getMonthlyStats,
    getPrayerBreakdown,
  };
}

export { calculateStreak, getMonthlyStats, getPrayerBreakdown, STORAGE_KEYS, getTodayKey };
