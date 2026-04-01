import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";

// Set notification handler (how notifications behave when app is in foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Parse a 12h time string like "5:30 AM" into a Date object for today.
 * Throws if the format is invalid.
 */
function parseTimeToDate(timeStr) {
  if (typeof timeStr !== "string" || !/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(timeStr.trim())) {
    throw new Error(`Invalid time string: "${timeStr}". Expected format "H:MM AM/PM".`);
  }

  const [time, period] = timeStr.trim().split(" ");
  const [rawH, rawM] = time.split(":").map(Number);

  if (rawH < 1 || rawH > 12 || rawM < 0 || rawM > 59) {
    throw new Error(`Invalid time values in "${timeStr}". Hours must be 1-12, minutes 0-59.`);
  }

  let hours = rawH;
  if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours, rawM, 0, 0);
  return date;
}

/**
 * Schedule all prayer reminder notifications.
 * Cancels existing ones first, then schedules fresh based on current prayer times + settings.
 */
async function schedulePrayerReminders(prayers, reminderMinutes) {
  const now = new Date();
  const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  for (const prayer of prayers) {
    if (!prayerNames.includes(prayer.name)) continue;

    const prayerDate = parseTimeToDate(prayer.time);
    const reminderDate = new Date(prayerDate.getTime() - reminderMinutes * 60 * 1000);
    const secondsUntilReminder = Math.floor((reminderDate - now) / 1000);

    if (secondsUntilReminder <= 0) continue; // prayer already passed

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${prayer.name} in ${reminderMinutes} minutes`,
        body: `Time to prepare for ${prayer.name} prayer`,
        sound: true,
      },
      trigger: { seconds: secondsUntilReminder },
    });
  }
}

/**
 * Schedule a repeating daily dua reminder at 9:00 AM.
 */
async function scheduleDuaReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Dua Reminder",
      body: "Take a moment to make dua today",
      sound: true,
    },
    trigger: { type: "daily", hour: 9, minute: 0, repeats: true },
  });
}

/**
 * Schedule a repeating daily streak reminder at 9:00 PM.
 */
async function scheduleStreakReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Don't break your streak!",
      body: "Mark your prayers before the day ends",
      sound: true,
    },
    trigger: { type: "daily", hour: 21, minute: 0, repeats: true },
  });
}

/**
 * Request notification permissions. Returns true if granted.
 */
async function requestPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Setup Android notification channel.
 */
async function setupChannel() {
  await Notifications.setNotificationChannelAsync("prayer-reminders", {
    name: "Prayer Reminders",
    importance: Notifications.AndroidImportance?.MAX ?? 4,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
  });
}

/**
 * Main hook: call from home screen with prayer data and settings.
 * Handles permissions, channel setup, and scheduling.
 */
export function useNotificationScheduler(prayerData, settings) {
  const hasSetup = useRef(false);

  // One-time setup: permissions + channel
  useEffect(() => {
    if (hasSetup.current) return;

    (async () => {
      const granted = await requestPermissions();
      if (!granted) {
        console.log("Notification permission denied");
        return;
      }
      await setupChannel();
      hasSetup.current = true;
      console.log("Notifications setup complete");
    })();
  }, []);

  // Stable serialisation of prayer times so the effect only re-runs
  // when the actual times change, not when the prayerData object reference changes.
  const prayerTimesKey = prayerData?.prayers
    ?.map((p) => `${p.name}:${p.time}`)
    .join("|") ?? "";

  // Schedule/re-schedule whenever prayer data or settings change
  useEffect(() => {
    const prayers = prayerData?.prayers;
    const { reminderMinutes, duaNotification, streakReminders } = settings;

    (async () => {
      // Cancel all existing scheduled notifications and re-schedule fresh
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Prayer reminders (only if prayer data is available)
      if (prayers?.length) {
        await schedulePrayerReminders(prayers, reminderMinutes);
      }

      // Dua notification (independent of prayer data)
      if (duaNotification) {
        await scheduleDuaReminder();
      }

      // Streak reminder (independent of prayer data)
      if (streakReminders) {
        await scheduleStreakReminder();
      }

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`Scheduled ${scheduled.length} notifications`);
    })();
  }, [
    prayerTimesKey,
    settings.reminderMinutes,
    settings.duaNotification,
    settings.streakReminders,
  ]);
}
