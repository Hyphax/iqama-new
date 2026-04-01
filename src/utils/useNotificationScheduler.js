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
 */
function parseTimeToDate(timeStr) {
  const [time, period] = timeStr.split(" ");
  const [rawH, rawM] = time.split(":").map(Number);
  let hours = rawH;
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

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
 * Schedule a daily dua reminder at 9:00 AM if not already past.
 */
async function scheduleDuaReminder() {
  const now = new Date();
  const duaTime = new Date();
  duaTime.setHours(9, 0, 0, 0);

  const seconds = Math.floor((duaTime - now) / 1000);
  if (seconds <= 0) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Dua Reminder",
      body: "Take a moment to make dua today",
      sound: true,
    },
    trigger: { seconds },
  });
}

/**
 * Schedule an evening streak reminder at 9:00 PM if not already past.
 */
async function scheduleStreakReminder() {
  const now = new Date();
  const streakTime = new Date();
  streakTime.setHours(21, 0, 0, 0);

  const seconds = Math.floor((streakTime - now) / 1000);
  if (seconds <= 0) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Don't break your streak!",
      body: "Mark your prayers before the day ends",
      sound: true,
    },
    trigger: { seconds },
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
    hasSetup.current = true;

    (async () => {
      const granted = await requestPermissions();
      if (!granted) {
        console.log("Notification permission denied");
        return;
      }
      await setupChannel();
      console.log("Notifications setup complete");
    })();
  }, []);

  // Schedule/re-schedule whenever prayer data or settings change
  useEffect(() => {
    if (!prayerData?.prayers?.length) return;

    const prayers = prayerData.prayers;
    const { reminderMinutes, duaNotification, streakReminders } = settings;

    (async () => {
      // Cancel all existing scheduled notifications and re-schedule fresh
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Prayer reminders
      await schedulePrayerReminders(prayers, reminderMinutes);

      // Dua notification
      if (duaNotification) {
        await scheduleDuaReminder();
      }

      // Streak reminder
      if (streakReminders) {
        await scheduleStreakReminder();
      }

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`Scheduled ${scheduled.length} notifications`);
    })();
  }, [
    prayerData,
    settings.reminderMinutes,
    settings.duaNotification,
    settings.streakReminders,
  ]);
}
