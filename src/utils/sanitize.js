/**
 * Sanitize user-input strings before sending to Supabase or displaying.
 * Strips control characters and trims whitespace.
 */
export function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[\x00-\x1F\x7F]/g, "").trim();
}

/**
 * Validate and clamp a numeric value within bounds.
 */
export function clampNumber(val, min, max) {
  const num = Number(val);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

/**
 * Validate email format (basic check).
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
