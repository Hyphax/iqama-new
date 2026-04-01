/**
 * Sanitize user-input strings before sending to Supabase or displaying.
 * Strips control characters and trims whitespace.
 */
export function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[\x00-\x1F\x7F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "").trim();
}

/**
 * Validate and clamp a numeric value within bounds.
 */
export function clampNumber(val, min, max) {
  const num = Number(val);
  const minNum = Number(min);
  const maxNum = Number(max);
  if (!Number.isFinite(minNum) || !Number.isFinite(maxNum)) {
    throw new TypeError("clampNumber requires finite min/max bounds");
  }
  const [lo, hi] = minNum <= maxNum ? [minNum, maxNum] : [maxNum, minNum];
  if (!Number.isFinite(num)) return lo;
  return Math.max(lo, Math.min(hi, num));
}

/**
 * Validate email format (basic check).
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
