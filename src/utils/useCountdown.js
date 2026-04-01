import { useState, useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";

/**
 * Parse a target time string ("H:MM AM/PM") into a future Date.
 * Returns null if the format is invalid.
 */
function parseTargetTime(targetTime) {
  if (typeof targetTime !== "string") return null;

  const match = targetTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

  let targetHours = hours;
  if (period === "PM" && hours !== 12) targetHours += 12;
  if (period === "AM" && hours === 12) targetHours = 0;

  const now = new Date();
  const target = new Date();
  target.setHours(targetHours, minutes, 0, 0);

  // If target is in the past, it's tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}

/**
 * Countdown hook that calculates time remaining until a target time string.
 * Pauses the interval when the app is backgrounded and resumes on foreground.
 * @param {string} targetTime - Time in "H:MM AM/PM" format (e.g. "5:30 PM")
 * @returns {{ hours: number, minutes: number, seconds: number }}
 */
export function useCountdown(targetTime) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const intervalRef = useRef(null);

  const calculateTimeLeft = useCallback(() => {
    const target = parseTargetTime(targetTime);
    if (!target) return { hours: 0, minutes: 0, seconds: 0 };

    const diff = target - new Date();
    if (diff > 0) {
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  }, [targetTime]);

  useEffect(() => {
    if (!targetTime) return;

    // Validate upfront
    if (!parseTargetTime(targetTime)) {
      console.warn(`useCountdown: invalid targetTime format "${targetTime}". Expected "H:MM AM/PM".`);
      return;
    }

    const startInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Sync to wall clock on each tick
      setTimeLeft(calculateTimeLeft());
      intervalRef.current = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
    };

    const stopInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Start immediately
    startInterval();

    // Pause when backgrounded, resume when foregrounded
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        startInterval();
      } else {
        stopInterval();
      }
    });

    return () => {
      stopInterval();
      subscription.remove();
    };
  }, [targetTime, calculateTimeLeft]);

  return timeLeft;
}
