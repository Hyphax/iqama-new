import { useState, useEffect } from "react";

/**
 * Countdown hook that calculates time remaining until a target time string.
 * @param {string} targetTime - Time in "H:MM AM/PM" format (e.g. "5:30 PM")
 * @returns {{ hours: number, minutes: number, seconds: number }}
 */
export function useCountdown(targetTime) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetTime) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const [time, period] = targetTime.split(" ");
      if (!time || !period) return { hours: 0, minutes: 0, seconds: 0 };

      const [hours, minutes] = time.split(":").map(Number);
      let targetHours = hours;

      if (period === "PM" && hours !== 12) targetHours += 12;
      if (period === "AM" && hours === 12) targetHours = 0;

      const target = new Date();
      target.setHours(targetHours, minutes, 0, 0);

      // If target is in the past, it's tomorrow
      if (target < now) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target - now;
      if (diff > 0) {
        return {
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        };
      }
      return { hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  return timeLeft;
}
