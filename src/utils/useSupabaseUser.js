/**
 * useSupabaseUser.js
 *
 * Central hook for managing the user's Supabase profile.
 * Creates user on first launch, syncs profile data to cloud.
 *
 * Usage:
 *   const { userId, isReady, syncProfile, updateProfile } = useSupabaseUser();
 */

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dbInsert, dbGetOne, dbUpdate, dbSelect, IS_SUPABASE_READY } from "./supabaseClient";
import { getMySquadCode } from "./useSquadSync";

// ─── Storage Keys ────────────────────────────────────────────────────────────

const USER_ID_KEY = "iqama_supabase_user_id";

// ─── Context ─────────────────────────────────────────────────────────────────

const SupabaseUserContext = createContext(null);

/**
 * Provider — wrap your app with this (in _layout.jsx)
 */
export function SupabaseUserProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // ── Initialize: find or create user ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        if (!IS_SUPABASE_READY) {
          setIsReady(true);
          return;
        }

        // Check if we have a saved user ID
        const savedId = await AsyncStorage.getItem(USER_ID_KEY);

        if (savedId) {
          // Fetch existing user
          const user = await dbGetOne("users", "id", savedId);
          if (user) {
            setUserId(user.id);
            setUserProfile(user);
            setIsReady(true);
            return;
          }
        }

        // No saved user — check by squad_code
        const squadCode = await getMySquadCode();
        const existingUser = await dbGetOne("users", "squad_code", squadCode);

        if (existingUser) {
          // User exists in DB (maybe reinstalled app)
          await AsyncStorage.setItem(USER_ID_KEY, existingUser.id);
          setUserId(existingUser.id);
          setUserProfile(existingUser);
          setIsReady(true);
          return;
        }

        // Create new user
        const newUser = await dbInsert("users", {
          squad_code: squadCode,
          display_name: "",
          email: "",
          age: "",
          gender: "",
          mood: "",
          scroll_hours: 0,
          user_need: "peace",
          current_streak: 0,
          best_streak: 0,
        }, { upsert: true, returnRow: true });

        if (newUser && newUser.id) {
          await AsyncStorage.setItem(USER_ID_KEY, newUser.id);
          setUserId(newUser.id);
          setUserProfile(newUser);

          // Also create default settings row
          await dbInsert("user_settings", {
            user_id: newUser.id,
            calculation_method: "ISNA",
            madhab: "Hanafi",
            hijri_adjustment: 0,
            reminder_minutes: 10,
            focus_mode: true,
            dua_notification: true,
            streak_reminders: false,
            white_theme: false,
          }, { upsert: true, returnRow: false });
        }

        setIsReady(true);
      } catch (e) {
        console.error("[SupabaseUser] Init error:", e);
        setIsReady(true);
      }
    })();
  }, []);

  // ── Update profile fields ────────────────────────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    if (!userId || !IS_SUPABASE_READY) return false;
    try {
      const success = await dbUpdate("users", `id=eq.${userId}`, updates);
      if (success) {
        setUserProfile((prev) => (prev ? { ...prev, ...updates } : updates));
      }
      return success;
    } catch (e) {
      console.warn("[SupabaseUser] updateProfile error:", e?.message);
      return false;
    }
  }, [userId]);

  // ── Update settings ──────────────────────────────────────────────────────
  const updateCloudSettings = useCallback(async (settingsUpdates) => {
    if (!userId || !IS_SUPABASE_READY) return false;
    try {
      // Map camelCase to snake_case
      const mapped = {};
      const keyMap = {
        calculationMethod: "calculation_method",
        madhab: "madhab",
        hijriAdjustment: "hijri_adjustment",
        reminderMinutes: "reminder_minutes",
        focusModeEnabled: "focus_mode",
        duaNotification: "dua_notification",
        streakReminders: "streak_reminders",
        whiteTheme: "white_theme",
      };

      for (const [key, value] of Object.entries(settingsUpdates)) {
        const dbKey = keyMap[key];
        if (dbKey) mapped[dbKey] = value;
      }

      if (Object.keys(mapped).length === 0) return true;

      return await dbUpdate("user_settings", `user_id=eq.${userId}`, mapped);
    } catch (e) {
      console.warn("[SupabaseUser] updateCloudSettings error:", e?.message);
      return false;
    }
  }, [userId]);

  // ── Sync prayer log for a date ───────────────────────────────────────────
  const syncPrayerLog = useCallback(async (date, prayers) => {
    if (!userId || !IS_SUPABASE_READY) return false;
    try {
      return await dbInsert("prayer_logs", {
        user_id: userId,
        date: date,  // YYYY-MM-DD
        fajr: prayers.Fajr || false,
        dhuhr: prayers.Dhuhr || false,
        asr: prayers.Asr || false,
        maghrib: prayers.Maghrib || false,
        isha: prayers.Isha || false,
      }, { upsert: true, returnRow: false });
    } catch (e) {
      console.warn("[SupabaseUser] syncPrayerLog error:", e?.message);
      return false;
    }
  }, [userId]);

  // ── Sync streak data ─────────────────────────────────────────────────────
  const syncStreak = useCallback(async (currentStreak, bestStreak) => {
    if (!userId || !IS_SUPABASE_READY) return false;
    return updateProfile({ current_streak: currentStreak, best_streak: bestStreak });
  }, [userId, updateProfile]);

  // ── Get prayer logs from cloud (for restore) ────────────────────────────
  const getPrayerLogs = useCallback(async (startDate, endDate) => {
    if (!userId || !IS_SUPABASE_READY) return [];
    try {
      const rows = await dbSelect(
        "prayer_logs",
        `user_id=eq.${userId}&date=gte.${startDate}&date=lte.${endDate}&select=*&order=date.asc`
      );
      return rows || [];
    } catch (e) {
      console.warn("[SupabaseUser] getPrayerLogs error:", e?.message);
      return [];
    }
  }, [userId]);

  return (
    <SupabaseUserContext.Provider
      value={{
        userId,
        userProfile,
        isReady,
        isSupabaseReady: IS_SUPABASE_READY,
        updateProfile,
        updateCloudSettings,
        syncPrayerLog,
        syncStreak,
        getPrayerLogs,
      }}
    >
      {children}
    </SupabaseUserContext.Provider>
  );
}

/**
 * Hook — use anywhere inside the provider
 */
export function useSupabaseUser() {
  const ctx = useContext(SupabaseUserContext);
  if (!ctx) {
    // Fallback if used outside provider
    return {
      userId: null,
      userProfile: null,
      isReady: true,
      isSupabaseReady: false,
      updateProfile: async () => false,
      updateCloudSettings: async () => false,
      syncPrayerLog: async () => false,
      syncStreak: async () => false,
      getPrayerLogs: async () => [],
    };
  }
  return ctx;
}

export default useSupabaseUser;
