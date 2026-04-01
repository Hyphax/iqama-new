import { useMemo } from "react";
import { useSettings } from "@/utils/useSettings";

/**
 * Centralized theme color hook.
 * Returns a consistent set of semantic color tokens for both dark and white themes.
 * Use this instead of defining local useThemeColors() in each screen.
 */
export function useThemeColors() {
  const { settings } = useSettings();
  const w = settings.whiteTheme === true;

  return useMemo(() => ({
    isWhite: w,

    // Backgrounds
    bg: w ? "#F9F6F0" : "#080814",
    bgAlt: w ? "#F3EFE6" : "rgba(8,8,20,0.65)",
    bgElevated: w ? "#FDFCFA" : "rgba(12,12,26,0.5)",

    // Card backgrounds
    cardBg: w ? "rgba(254,253,251,0.88)" : "rgba(12,12,26,0.55)",
    cardBorder: w ? "rgba(139,90,43,0.08)" : undefined,

    // Text hierarchy
    text: w ? "#1A1409" : "#FAFAFA",
    textSecondary: w ? "rgba(26,20,9,0.72)" : "rgba(255,255,255,0.55)",
    textTertiary: w ? "rgba(26,20,9,0.55)" : "rgba(255,255,255,0.32)",
    textMuted: w ? "rgba(26,20,9,0.45)" : "rgba(255,255,255,0.22)",
    textFaint: w ? "rgba(26,20,9,0.25)" : "rgba(255,255,255,0.14)",
    textSubtle: w ? "rgba(26,20,9,0.58)" : "rgba(255,255,255,0.38)",

    // Arabic text
    arabic: w ? "rgba(26,20,9,0.9)" : "rgba(255,255,255,0.92)",

    // Blur
    blurTint: w ? "light" : "dark",
    blurIntensity: w ? 40 : 20,

    // Icons
    iconMuted: w ? "rgba(139,105,20,0.40)" : "rgba(255,255,255,0.15)",
    iconPrimary: w ? "#8B6914" : "rgba(212,175,55,0.7)",

    // Gold accents
    gold: w ? "#C9A227" : "#D4AF37",
    goldDim: w ? "rgba(201,162,39,0.12)" : "rgba(212,175,55,0.12)",
    goldBorder: w ? "rgba(184,134,11,0.25)" : "rgba(212,175,55,0.15)",

    // Status bar
    statusBar: w ? "dark" : "light",
  }), [w]);
}
