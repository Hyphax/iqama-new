// Prayer-specific color stories — each prayer has its own luxurious palette
export const PRAYER_AURA = {
  Fajr: {
    primary: "#C9A0DC",
    secondary: "#7B68AE",
    tertiary: "#2D1B69",
    accent: "#E8D5F5",
    glow: "rgba(201,160,220,0.15)",
    gradient: ["#2D1B69", "#7B68AE", "#C9A0DC"],
    cardGradient: ["rgba(201,160,220,0.12)", "rgba(45,27,105,0.06)"],
    ringColors: ["#C9A0DC", "#7B68AE"],
  },
  Dhuhr: {
    primary: "#F5C842",
    secondary: "#D4A017",
    tertiary: "#8B6914",
    accent: "#FFF3C4",
    glow: "rgba(245,200,66,0.12)",
    gradient: ["#8B6914", "#D4A017", "#F5C842"],
    cardGradient: ["rgba(245,200,66,0.10)", "rgba(139,105,20,0.05)"],
    ringColors: ["#F5C842", "#D4A017"],
  },
  Asr: {
    primary: "#FF9A5C",
    secondary: "#E06B2D",
    tertiary: "#8B3A0F",
    accent: "#FFD4B8",
    glow: "rgba(255,154,92,0.12)",
    gradient: ["#8B3A0F", "#E06B2D", "#FF9A5C"],
    cardGradient: ["rgba(255,154,92,0.10)", "rgba(139,58,15,0.05)"],
    ringColors: ["#FF9A5C", "#E06B2D"],
  },
  Maghrib: {
    primary: "#FF6B8A",
    secondary: "#C0392B",
    tertiary: "#6B1520",
    accent: "#FFB3C1",
    glow: "rgba(255,107,138,0.14)",
    gradient: ["#6B1520", "#C0392B", "#FF6B8A"],
    cardGradient: ["rgba(255,107,138,0.12)", "rgba(107,21,32,0.06)"],
    ringColors: ["#FF6B8A", "#C0392B"],
  },
  Isha: {
    primary: "#6C8EF5",
    secondary: "#3D5AF1",
    tertiary: "#1A237E",
    accent: "#B8C9FF",
    glow: "rgba(108,142,245,0.16)",
    gradient: ["#1A237E", "#3D5AF1", "#6C8EF5"],
    cardGradient: ["rgba(108,142,245,0.12)", "rgba(26,35,126,0.06)"],
    ringColors: ["#6C8EF5", "#3D5AF1"],
  },
};

// ─── White / Light Theme Design Tokens ───────────────────────────────────────
// ULTRA PREMIUM WHITE THEME - Pro Max Level
export const WHITE_THEME = {
  // Backgrounds - refined luxury warm palette
  background: "#F9F6F0", // ultra warm ivory canvas
  backgroundAlt: "#F3EFE6", // deeper cream for contrast
  backgroundElevated: "#FDFCFA", // elevated surfaces
  card: "#FEFDFB", // premium warm white cards
  cardBorder: "rgba(139,90,43,0.08)", // subtle warm hairline
  cardBorderAccent: "rgba(184,134,11,0.22)", // gold accent border

  // Shadows - ultra premium depth
  cardShadow: {
    shadowColor: "#8B6914",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardShadowStrong: {
    shadowColor: "#6B5010",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  cardShadowElevated: {
    shadowColor: "#4A3508",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 10,
  },
  cardShadowUltra: {
    shadowColor: "#3A2805",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 36,
    elevation: 14,
  },

  // Typography — warm dark for maximum readability
  text: "#1A1409", // primary — rich warm black
  textSub: "rgba(26,20,9,0.75)", // secondary — boosted from 0.68
  textTertiary: "rgba(26,20,9,0.55)", // tertiary — boosted from 0.48
  textMuted: "rgba(26,20,9,0.45)", // muted — boosted from 0.32
  textFaint: "rgba(26,20,9,0.25)", // faint — boosted from 0.18

  // Accents - luxury gold palette
  gold: "#C9A227", // refined gold accent
  goldBright: "#E5B82A", // bright gold highlight
  goldLight: "#EBD99E", // light gold
  goldDim: "rgba(201,162,39,0.12)", // soft gold tint fill
  goldBorder: "rgba(184,134,11,0.25)", // gold border
  goldGlow: "rgba(212,175,55,0.25)", // gold glow effect

  // Premium gradient backgrounds for cards
  cardGradientStart: "#FEFDFB",
  cardGradientEnd: "#F8F4EC",
  cardGradientAccent: "rgba(201,162,39,0.06)",

  // Semantic - refined colors
  success: "#0D7A4D", // refined green
  successBg: "rgba(13,122,77,0.08)",
  successBorder: "rgba(13,122,77,0.15)",
  successLight: "rgba(13,122,77,0.12)",
  missed: "#B91C1C", // refined red
  missedBg: "rgba(185,28,28,0.07)",
  missedBorder: "rgba(185,28,28,0.15)",
  missedLight: "rgba(185,28,28,0.10)",

  // UI elements - premium feel
  separator: "rgba(139,90,43,0.08)",
  inputBg: "rgba(139,90,43,0.04)",
  inputBorder: "rgba(139,90,43,0.10)",
  switchTrackFalse: "rgba(139,90,43,0.12)",
  switchTrackTrue: "rgba(201,162,39,0.25)",
  statusBar: "dark",
  blurTint: "light",

  // Interactive states
  buttonPrimary: "#C9A227",
  buttonPrimaryText: "#FFFFFF",
  buttonSecondary: "rgba(201,162,39,0.12)",
  buttonSecondaryText: "#8B6914",

  // Overlay and modal
  overlay: "rgba(26,20,9,0.45)",
  modalBg: "rgba(254,253,251,0.98)",
  modalBorder: "rgba(184,134,11,0.12)",

  // Icon colors
  iconPrimary: "#8B6914",
  iconSecondary: "rgba(139,105,20,0.6)",
  iconMuted: "rgba(139,105,20,0.35)",

  // Divider and subtle borders
  divider: "rgba(139,90,43,0.06)",
  dividerStrong: "rgba(139,90,43,0.10)",
};

// Gold luxury palette
export const GOLD = {
  light: "#F5DEB3",
  medium: "#D4AF37",
  dark: "#B8860B",
  gradient: ["#F5DEB3", "#D4AF37", "#B8860B"],
  shimmer: "rgba(212,175,55,0.3)",
};

export const GOLD_GRADIENT_RICH = ["#D4AF37", "#B8860B", "#8B6914"];
export const DEEP_GOLD_GRADIENT = ["#D4AF37", "#B8860B", "#8B6914"];
export const GOLD_GRADIENT = ["#F5DEB3", "#D4AF37", "#B8860B"];
export const GLASS_GRADIENT = [
  "rgba(255,255,255,0.08)",
  "rgba(255,255,255,0.02)",
];

// Premium shadow presets (dark theme)
export const SHADOWS = {
  glow: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.30,
    shadowRadius: 18,
  }),
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.40,
    shadowRadius: 28,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.50,
    shadowRadius: 36,
  },
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.20,
    shadowRadius: 14,
  },
};

/**
 * getShadow(isWhite, level)
 * Returns the correct shadow for the current theme.
 * level: "soft" | "card" | "elevated" | "ultra"
 */
export function getShadow(isWhite, level = "card") {
  if (!isWhite) return SHADOWS[level] ?? SHADOWS.card;
  if (level === "soft") return WHITE_THEME.cardShadow;
  if (level === "elevated") return WHITE_THEME.cardShadowElevated;
  if (level === "ultra") return WHITE_THEME.cardShadowUltra;
  return WHITE_THEME.cardShadowStrong;
}

export const iqamaTheme = {
  colors: {
    background: "#080814",
    cardBackground: "rgba(255,255,255,0.05)",
    elevatedCard: "rgba(255,255,255,0.08)",
    glass: "rgba(255,255,255,0.06)",
    glassBorder: "rgba(255,255,255,0.10)",

    neonCyan: "#D4AF37",
    electricBlue: "#B8860B",
    neonCyanDim: "rgba(212,175,55,0.4)",
    electricBlueDim: "rgba(184,134,11,0.3)",

    goldAccent: "#D4AF37",
    goldLight: "#F5DEB3",
    textPrimary: "#FAFAFA",
    textSecondary: "rgba(255,255,255,0.75)",
    textMuted: "rgba(255,255,255,0.50)",

    success: "#00FFAA",
    missed: "#FF4C6E",
    upcoming: "rgba(255,255,255,0.08)",

    border: "rgba(255,255,255,0.08)",
    overlay: "rgba(8,8,20,0.92)",
  },

  spacing: {
    horizontal: 24,
    cardGap: 16,
    borderRadius: 24,
    buttonRadius: 16,
  },
};
