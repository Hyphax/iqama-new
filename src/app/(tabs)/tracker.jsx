import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share as RNShare,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import {
  Flame,
  Trophy,
  TrendingUp,
  Target,
  Check,
  X as XIcon,
  Clock,
  AlertTriangle,
  Users,
  Sparkles,
  Award,
  Zap,
  Heart,
  Shield,
  Star,
  Crown,
  UserPlus,
  Copy,
  Share,
  Link,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";
import Animated, {
  FadeInDown,
  FadeIn,
  FadeInUp,
  LayoutAnimationConfig,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import {
  usePrayerStorage,
  getMonthlyStats,
  getPrayerBreakdown,
  calculateStreak,
  STORAGE_KEYS,
  getTodayKey,
} from "@/utils/usePrayerStorage";
import { useSquad } from "@/utils/useSquadSync";
import { SHADOWS, getShadow, WHITE_THEME } from "@/utils/iqamaTheme";
import { useSettings } from "@/utils/useSettings";
import { useSkipInitialEntering } from "@/utils/useSkipInitialEntering";

const { width: SW, height: SH } = Dimensions.get("window");
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const P_SHORT = ["F", "D", "A", "M", "I"];
const P_CLR = {
  Fajr: "#C9A0DC",
  Dhuhr: "#F5C842",
  Asr: "#FF9A5C",
  Maghrib: "#FF6B8A",
  Isha: "#6C8EF5",
};
const P_ICO = {
  Fajr: Star,
  Dhuhr: Zap,
  Asr: Flame,
  Maghrib: Heart,
  Isha: Shield,
};
const NEON = "#D4AF37";
const BG = "#080814";

// Theme-aware helpers
function useThemeColors() {
  const { settings } = useSettings();
  const w = settings.whiteTheme === true;
  return {
    isWhite: w,
    bg: w ? "#F9F6F0" : BG,
    pageBg: w ? "rgba(249,246,240,0.88)" : "rgba(8,8,20,0.65)",
    card: w ? "rgba(254,253,251,0.9)" : "rgba(255,255,255,0.06)",
    cardBorder: w ? "rgba(139,90,43,0.10)" : "rgba(255,255,255,0.06)",
    cardGrad: w
      ? ["rgba(254,253,251,0.85)", "rgba(248,244,236,0.65)"]
      : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.015)"],
    text: w ? "#1A1409" : "#FAFAFA",
    textSub: w ? "rgba(26,20,9,0.55)" : "rgba(255,255,255,0.50)",
    textMuted: w ? "rgba(26,20,9,0.35)" : "rgba(255,255,255,0.28)",
    textFaint: w ? "rgba(26,20,9,0.18)" : "rgba(255,255,255,0.15)",
    textDim: w ? "rgba(26,20,9,0.12)" : "rgba(255,255,255,0.06)",
    textHalf: w ? "rgba(26,20,9,0.45)" : "rgba(255,255,255,0.38)",
    border: w ? "rgba(139,90,43,0.08)" : "rgba(255,255,255,0.04)",
    borderSub: w ? "rgba(139,90,43,0.05)" : "rgba(255,255,255,0.025)",
    shimmerOp: w ? 0.03 : 0.05,
    statusBar: w ? "dark" : "light",
  };
}

/* ═══════════════════════════════════════════
   AMBIENT EFFECTS
   ═══════════════════════════════════════════ */
function Orb({ color, size, x, y, d, dur = 8000 }) {
  const o = useSharedValue(0.02);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  useEffect(() => {
    o.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.14, { duration: dur, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.02, { duration: dur, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    tx.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(20, {
            duration: dur * 1.3,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(-20, {
            duration: dur * 1.3,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
    ty.value = withDelay(
      d + 800,
      withRepeat(
        withSequence(
          withTiming(14, { duration: dur, easing: Easing.inOut(Easing.sin) }),
          withTiming(-14, { duration: dur, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, []);
  const s = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        s,
      ]}
    >
      <LinearGradient
        colors={[color, `${color}33`, "transparent"]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: size / 2 }}
      />
    </Animated.View>
  );
}

function Particle({ x, size, color, d }) {
  const o = useSharedValue(0);
  const ty = useSharedValue(0);
  useEffect(() => {
    o.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: 2500 }),
          withTiming(0, { duration: 2500 }),
        ),
        -1,
        true,
      ),
    );
    ty.value = withDelay(
      d,
      withRepeat(
        withTiming(-SH * 0.25, {
          duration: 8000 + Math.random() * 4000,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
  }, []);
  const s = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateY: ty.value }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          bottom: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        s,
      ]}
    />
  );
}

function Ambient() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Orb
        color="#D4AF37"
        size={SW * 0.85}
        x={-SW * 0.25}
        y={-SH * 0.12}
        d={0}
        dur={9000}
      />
      <Orb
        color="#6C8EF5"
        size={SW * 0.65}
        x={SW * 0.45}
        y={SH * 0.35}
        d={2500}
        dur={11000}
      />
    </View>
  );
}

function Shimmer({ color = "#D4AF37", delay: sd = 2000 }) {
  const tx = useSharedValue(-SW);
  useEffect(() => {
    tx.value = withDelay(
      sd,
      withRepeat(
        withSequence(
          withTiming(SW * 1.2, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withDelay(7000, withTiming(-SW, { duration: 0 })),
        ),
        3,
        false,
      ),
    );
  }, []);
  const s = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));
  return (
    <Animated.View
      style={[
        { position: "absolute", top: 0, bottom: 0, width: 60, opacity: 0.05 },
        s,
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={["transparent", color, "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   COMPLETION RING — Double ring + sparkle burst
   ═══════════════════════════════════════════ */
function CompletionRing({ percentage }) {
  const T = useThemeColors();
  const SIZE = 160;
  const SW2 = 10;
  const r = (SIZE - SW2) / 2;
  const circ = 2 * Math.PI * r;
  const rInner = r - 18;
  const circInner = 2 * Math.PI * rInner;
  const prog = useSharedValue(0);
  const glow = useSharedValue(0.08);
  const sparkRot = useSharedValue(0);
  const breathe = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      prog.value = 0;
      prog.value = withDelay(
        400,
        withTiming(percentage / 100, {
          duration: 1800,
          easing: Easing.out(Easing.cubic),
        }),
      );
      glow.value = withDelay(
        2200,
        withRepeat(
          withSequence(
            withTiming(0.4, {
              duration: 2200,
              easing: Easing.inOut(Easing.sin),
            }),
            withTiming(0.08, {
              duration: 2200,
              easing: Easing.inOut(Easing.sin),
            }),
          ),
          -1,
          true,
        ),
      );
      sparkRot.value = withRepeat(
        withTiming(360, { duration: 20000, easing: Easing.linear }),
        -1,
        false,
      );
      breathe.value = withRepeat(
        withSequence(
          withTiming(1.04, {
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    }, [percentage]),
  );

  const outerProps = useAnimatedProps(() => ({
    strokeDashoffset: circ * (1 - prog.value),
  }));
  const innerProps = useAnimatedProps(() => ({
    strokeDashoffset: circInner * (1 - prog.value * 0.85),
  }));
  const glowS = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: breathe.value }],
  }));
  const sparkS = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkRot.value}deg` }],
  }));

  const emoji =
    percentage >= 90
      ? "⭐"
      : percentage >= 70
        ? "🔥"
        : percentage >= 40
          ? "💪"
          : percentage >= 15
            ? "🌱"
            : "🤲";
  const label =
    percentage >= 90
      ? "EXCELLENT"
      : percentage >= 70
        ? "GREAT"
        : percentage >= 40
          ? "GOOD"
          : "KEEP GOING";

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: SIZE + 50,
        height: SIZE + 50,
      }}
    >
      {/* Outer glow pulse */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SIZE + 44,
            height: SIZE + 44,
            borderRadius: (SIZE + 44) / 2,
            backgroundColor: "rgba(212,175,55,0.05)",
          },
          glowS,
        ]}
      />
      {/* Second glow layer */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SIZE + 28,
            height: SIZE + 28,
            borderRadius: (SIZE + 28) / 2,
            borderWidth: 1,
            borderColor: "rgba(212,175,55,0.06)",
          },
          glowS,
        ]}
      />

      {/* Rotating sparkle dots */}
      <Animated.View
        style={[
          { position: "absolute", width: SIZE + 36, height: SIZE + 36 },
          sparkS,
        ]}
      >
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: NEON,
              opacity: 0.3 + (i % 2) * 0.2,
              left:
                (SIZE + 36) / 2 +
                Math.cos((deg * Math.PI) / 180) * ((SIZE + 36) / 2) -
                2,
              top:
                (SIZE + 36) / 2 +
                Math.sin((deg * Math.PI) / 180) * ((SIZE + 36) / 2) -
                2,
            }}
          />
        ))}
      </Animated.View>

      <Svg
        width={SIZE}
        height={SIZE}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Defs>
          <SvgGradient id="rg1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#D4AF37" />
            <Stop offset="0.5" stopColor="#B8860B" />
            <Stop offset="1" stopColor="#8B6914" />
          </SvgGradient>
          <SvgGradient id="rg2" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="rgba(212,175,55,0.3)" />
            <Stop offset="1" stopColor="rgba(139,105,20,0.15)" />
          </SvgGradient>
        </Defs>
        {/* Track rings */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={r}
          stroke={T.isWhite ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)"}
          strokeWidth={SW2}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={rInner}
          stroke={T.isWhite ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.02)"}
          strokeWidth={6}
          fill="none"
        />
        {/* Animated rings */}
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={r}
          stroke="url(#rg1)"
          strokeWidth={SW2}
          fill="none"
          strokeDasharray={circ}
          animatedProps={outerProps}
          strokeLinecap="round"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={rInner}
          stroke="url(#rg2)"
          strokeWidth={6}
          fill="none"
          strokeDasharray={circInner}
          animatedProps={innerProps}
          strokeLinecap="round"
        />
      </Svg>

      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{ fontSize: 24, marginBottom: 2 }}>{emoji}</Text>
        <Text
          style={{
            fontFamily: "Montserrat_700Bold",
            fontSize: 34,
            color: T.text,
          }}
        >
          {percentage}%
        </Text>
        <Text
          style={{
            fontFamily: "Montserrat_300Light",
            fontSize: 8,
            color: T.textHalf,
            letterSpacing: 2.5,
            marginTop: 3,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   STREAK CARD — Breathing fire + animated dots
   ═══════════════════════════════════════════ */
function StreakCard({ data }) {
  const T = useThemeColors();
  const fireO = useSharedValue(0.08);
  const fireScale = useSharedValue(1);
  useEffect(() => {
    fireO.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.06, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    fireScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);
  const fireS = useAnimatedStyle(() => ({
    opacity: fireO.value,
    transform: [{ scale: fireScale.value }],
  }));

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  const today = new Date().getDay();
  const labels = [];
  for (let i = 6; i >= 0; i--) labels.push(dayNames[(today - i + 7) % 7]);

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
      <View
        style={{
          borderRadius: 26,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: T.cardBorder,
          ...getShadow(T.isWhite, "card"),
        }}
      >
        <LinearGradient colors={T.cardGrad} style={{ padding: 22 }}>
          <Shimmer color="#FF9A5C" delay={3000} />

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <View style={{ position: "relative" }}>
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: "#FF9A5C",
                    left: -5,
                    top: -5,
                  },
                  fireS,
                ]}
              />
              <Flame size={28} color="#FF9A5C" fill="rgba(255,154,92,0.4)" />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 12,
                  color: T.textSub,
                  letterSpacing: 2.5,
                }}
              >
                PRAYER STREAK
              </Text>
            </View>
          </View>

          {/* Numbers */}
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: "Montserrat_700Bold",
                  fontSize: 42,
                  color: T.text,
                  lineHeight: 48,
                }}
              >
                {data.currentStreak}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#FF9A5C",
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 10,
                    color: T.textHalf,
                    letterSpacing: 1.5,
                  }}
                >
                  CURRENT
                </Text>
              </View>
            </View>
            <View style={{ width: 1, marginHorizontal: 16 }}>
              <LinearGradient
                colors={[
                  "transparent",
                  T.isWhite ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)",
                  "transparent",
                ]}
                style={{ flex: 1 }}
              />
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <View
                style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}
              >
                <Trophy
                  size={22}
                  color="#F5C842"
                  fill="rgba(245,200,66,0.25)"
                />
                <Text
                  style={{
                    fontFamily: "Montserrat_700Bold",
                    fontSize: 42,
                    color: T.text,
                    lineHeight: 48,
                  }}
                >
                  {data.bestStreak}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#F5C842",
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 10,
                    color: T.textHalf,
                    letterSpacing: 1.5,
                  }}
                >
                  BEST
                </Text>
              </View>
            </View>
          </View>

          {/* 7-day streak dots with labels */}
          <View
            style={{
              borderTopWidth: 0.5,
              borderTopColor: T.border,
              paddingTop: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 8,
              }}
            >
              {data.streakDays.map((done, i) => (
                <View key={i} style={{ alignItems: "center", gap: 6 }}>
                  <View
                    style={{
                      width: done ? 14 : 10,
                      height: done ? 14 : 10,
                      borderRadius: 7,
                      backgroundColor: done
                        ? "#00FFAA"
                        : T.isWhite
                          ? "rgba(0,0,0,0.05)"
                          : "rgba(255,255,255,0.05)",
                      borderWidth: done ? 0 : 0.5,
                      borderColor: T.isWhite
                        ? "rgba(0,0,0,0.08)"
                        : "rgba(255,255,255,0.08)",
                      ...(done ? SHADOWS.glow("rgba(0,255,170,0.5)") : {}),
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: "Montserrat_300Light",
                      fontSize: 8,
                      color: T.isWhite ? WHITE_THEME.textMuted : T.textMuted,
                    }}
                  >
                    {labels[i]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   TODAY'S PRAYERS — Animated prayer rows
   ═══════════════════════════════════════════ */
function TodayCard({ todayData }) {
  const T = useThemeColors();
  const cnt = PRAYERS.filter((p) => todayData[p]).length;
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
      <View
        style={{
          borderRadius: 26,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: T.cardBorder,
          ...getShadow(T.isWhite, "card"),
        }}
      >
        <LinearGradient colors={T.cardGrad} style={{ padding: 22 }}>
          <Shimmer delay={2500} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Sparkles size={18} color={NEON} />
              <Text
                style={{
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 12,
                  color: T.textSub,
                  letterSpacing: 2.5,
                }}
              >
                TODAY'S PRAYERS
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor:
                  cnt === 5 ? "rgba(0,255,170,0.1)" : "rgba(212,175,55,0.08)",
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 14,
                borderWidth: 0.5,
                borderColor:
                  cnt === 5 ? "rgba(0,255,170,0.25)" : "rgba(212,175,55,0.2)",
              }}
            >
              {cnt === 5 && <Check size={11} color="#00FFAA" strokeWidth={3} />}
              <Text
                style={{
                  fontFamily: "Montserrat_700Bold",
                  fontSize: 13,
                  color: cnt === 5 ? "#00FFAA" : NEON,
                }}
              >
                {cnt}/5
              </Text>
            </View>
          </View>

          {/* Mini progress bar */}
          <View
            style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: T.isWhite
                ? "rgba(0,0,0,0.04)"
                : "rgba(255,255,255,0.03)",
              marginBottom: 18,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={cnt === 5 ? ["#00FFAA", "#00CC88"] : [NEON, "#8B6914"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 4,
                borderRadius: 2,
                width: `${(cnt / 5) * 100}%`,
              }}
            />
          </View>

          {PRAYERS.map((p, i) => {
            const done = todayData[p] === true;
            const c = P_CLR[p];
            const Ico = P_ICO[p];
            return (
              <View
                key={p}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 13,
                  borderBottomWidth: i < 4 ? 0.5 : 0,
                  borderBottomColor: T.borderSub,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: done
                      ? `${c}15`
                      : T.isWhite
                        ? "rgba(0,0,0,0.02)"
                        : "rgba(255,255,255,0.02)",
                    borderWidth: 1,
                    borderColor: done ? `${c}35` : T.border,
                    ...(done ? SHADOWS.glow(`${c}25`) : {}),
                  }}
                >
                  <Ico
                    size={18}
                    color={done ? c : T.textFaint}
                    strokeWidth={done ? 2 : 1.5}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text
                    style={{
                      fontFamily: done
                        ? "Montserrat_600SemiBold"
                        : "Montserrat_400Regular",
                      fontSize: 15,
                      color: done
                        ? T.text
                        : T.isWhite
                          ? WHITE_THEME.textSub
                          : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {p}
                  </Text>
                  {done && (
                    <Text
                      style={{
                        fontFamily: "Montserrat_300Light",
                        fontSize: 10,
                        color: `${c}80`,
                        marginTop: 2,
                      }}
                    >
                      Alhamdulillah
                    </Text>
                  )}
                </View>

                {done ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      backgroundColor: "rgba(0,255,170,0.06)",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 14,
                      borderWidth: 0.5,
                      borderColor: "rgba(0,255,170,0.15)",
                    }}
                  >
                    <Check size={12} color="#00FFAA" strokeWidth={3} />
                    <Text
                      style={{
                        fontFamily: "Montserrat_700Bold",
                        fontSize: 10,
                        color: "#00FFAA",
                        letterSpacing: 1,
                      }}
                    >
                      PRAYED
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      backgroundColor: T.isWhite
                        ? "rgba(0,0,0,0.02)"
                        : "rgba(255,255,255,0.02)",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 14,
                      borderWidth: 0.5,
                      borderColor: T.border,
                    }}
                  >
                    <Clock size={12} color={T.textFaint} strokeWidth={1.5} />
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 10,
                        color: T.textFaint,
                        letterSpacing: 1,
                      }}
                    >
                      PENDING
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   WEEKLY CHART — Animated gradient bars
   ═══════════════════════════════════════════ */
function WeekChart({ days }) {
  const T = useThemeColors();
  const dayN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const td = new Date().getDay();
  const lbl = [];
  for (let i = 6; i >= 0; i--) lbl.push(dayN[(td - i + 7) % 7]);
  const total = days.reduce((a, b) => a + b, 0);
  const pct = Math.round((total / 35) * 100);

  return (
    <Animated.View entering={FadeInDown.delay(350).duration(600).springify()}>
      <View
        style={{
          borderRadius: 26,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: T.cardBorder,
          ...getShadow(T.isWhite, "card"),
        }}
      >
        <LinearGradient colors={T.cardGrad} style={{ padding: 22 }}>
          <Shimmer color="#6C8EF5" delay={4000} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 22,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <TrendingUp size={18} color="#6C8EF5" />
              <Text
                style={{
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 12,
                  color: T.textSub,
                  letterSpacing: 2.5,
                }}
              >
                LAST 7 DAYS
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text
                style={{
                  fontFamily: "Montserrat_300Light",
                  fontSize: 11,
                  color: T.isWhite
                    ? WHITE_THEME.textSub
                    : "rgba(255,255,255,0.25)",
                }}
              >
                {total}/35
              </Text>
              <View
                style={{
                  backgroundColor: "rgba(108,142,245,0.1)",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  borderWidth: 0.5,
                  borderColor: "rgba(108,142,245,0.2)",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Montserrat_700Bold",
                    fontSize: 12,
                    color: "#6C8EF5",
                  }}
                >
                  {pct}%
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: 130,
            }}
          >
            {days.map((c, i) => {
              const h = c > 0 ? 20 + (c / 5) * 88 : 6;
              const r = c / 5;
              const bc =
                r >= 0.8
                  ? ["#00FFAA", "#00CC88"]
                  : r >= 0.4
                    ? ["#F5C842", "#D4A017"]
                    : r > 0
                      ? ["#FF6B8A", "#C0392B"]
                      : [
                        T.border,
                        T.isWhite
                          ? "rgba(0,0,0,0.02)"
                          : "rgba(255,255,255,0.02)",
                      ];
              const isT = i === 6;
              return (
                <View key={i} style={{ alignItems: "center", flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Montserrat_700Bold",
                      fontSize: 11,
                      color:
                        c > 0
                          ? bc[0]
                          : T.isWhite
                            ? WHITE_THEME.textSub
                            : "rgba(255,255,255,0.1)",
                      marginBottom: 8,
                    }}
                  >
                    {c > 0 ? c : "·"}
                  </Text>
                  <View style={{ position: "relative" }}>
                    {isT && c > 0 && (
                      <View
                        style={{
                          position: "absolute",
                          width: 32,
                          height: h + 10,
                          borderRadius: 16,
                          backgroundColor: bc[0],
                          opacity: 0.06,
                          left: -4,
                          top: -5,
                        }}
                      />
                    )}
                    <LinearGradient
                      colors={bc}
                      style={{ width: 24, height: h, borderRadius: 12 }}
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: isT
                        ? "Montserrat_700Bold"
                        : "Montserrat_300Light",
                      fontSize: 9,
                      color: isT ? NEON : T.textMuted,
                      marginTop: 8,
                      letterSpacing: 0.5,
                    }}
                  >
                    {lbl[i]}
                  </Text>
                  {isT && (
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: NEON,
                        marginTop: 4,
                        ...SHADOWS.glow(NEON),
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   PRAYER BREAKDOWN — Animated bars + icons
   ═══════════════════════════════════════════ */
function BreakdownCard({ breakdown }) {
  const T = useThemeColors();
  if (!breakdown?.length) return null;
  return (
    <Animated.View entering={FadeInDown.delay(500).duration(600).springify()}>
      <View
        style={{
          borderRadius: 26,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: T.cardBorder,
          ...getShadow(T.isWhite, "card"),
        }}
      >
        <LinearGradient colors={T.cardGrad} style={{ padding: 22 }}>
          <Shimmer color="#C9A0DC" delay={5000} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <Target size={18} color="#C9A0DC" />
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 12,
                color: T.textSub,
                letterSpacing: 2.5,
              }}
            >
              PRAYER BREAKDOWN
            </Text>
          </View>

          {breakdown.map((item, idx) => {
            const c = P_CLR[item.name] || NEON;
            const Ico = P_ICO[item.name] || Target;
            const isLast = idx === breakdown.length - 1;
            return (
              <View key={item.name} style={{ marginBottom: isLast ? 0 : 18 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: `${c}12`,
                        borderWidth: 0.5,
                        borderColor: `${c}25`,
                      }}
                    >
                      <Ico size={15} color={c} strokeWidth={2} />
                    </View>
                    <View>
                      <Text
                        style={{
                          fontFamily: "Montserrat_600SemiBold",
                          fontSize: 14,
                          color: T.text,
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Montserrat_300Light",
                          fontSize: 10,
                          color: T.textMuted,
                          marginTop: 1,
                        }}
                      >
                        {item.count} prayed · {item.total - item.count} missed
                      </Text>
                    </View>
                    {item.isMissed && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 3,
                          backgroundColor: "rgba(255,76,110,0.08)",
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 10,
                          borderWidth: 0.5,
                          borderColor: "rgba(255,76,110,0.15)",
                        }}
                      >
                        <AlertTriangle size={8} color="#FF4C6E" />
                        <Text
                          style={{
                            fontFamily: "Montserrat_700Bold",
                            fontSize: 7,
                            color: "#FF4C6E",
                            letterSpacing: 0.5,
                          }}
                        >
                          FOCUS
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: "Montserrat_700Bold",
                      fontSize: 16,
                      color: c,
                    }}
                  >
                    {item.percentage}%
                  </Text>
                </View>

                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: T.borderSub,
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={[c, `${c}55`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: 8,
                      borderRadius: 4,
                      width: `${Math.max(item.percentage, 3)}%`,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   MONTHLY SUMMARY — Premium 3-stat
   ═══════════════════════════════════════════ */
function MonthSummary({ stats }) {
  const T = useThemeColors();
  const pct =
    stats.totalPossible > 0
      ? Math.round((stats.totalCompleted / stats.totalPossible) * 100)
      : 0;
  const missed = stats.totalPossible - stats.totalCompleted;
  const mn = new Date().toLocaleString("en", { month: "long" }).toUpperCase();

  const items = [
    {
      val: stats.totalCompleted,
      label: "PRAYED",
      color: "#00FFAA",
      icon: Check,
      bg: "rgba(0,255,170,0.06)",
      bc: "rgba(0,255,170,0.15)",
    },
    {
      val: missed,
      label: "MISSED",
      color: "#FF4C6E",
      icon: XIcon,
      bg: "rgba(255,76,110,0.06)",
      bc: "rgba(255,76,110,0.15)",
    },
    {
      val: `${pct}%`,
      label: "OVERALL",
      color: NEON,
      icon: TrendingUp,
      bg: "rgba(212,175,55,0.06)",
      bc: "rgba(212,175,55,0.15)",
    },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(650).duration(600).springify()}>
      <View
        style={{
          borderRadius: 26,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: T.cardBorder,
          ...getShadow(T.isWhite, "card"),
        }}
      >
        <LinearGradient colors={T.cardGrad} style={{ padding: 22 }}>
          <Shimmer color="#D4AF37" delay={6000} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <Award size={18} color="#D4AF37" />
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 12,
                color: T.textSub,
                letterSpacing: 2.5,
              }}
            >
              {mn} SUMMARY
            </Text>
          </View>

          <View style={{ flexDirection: "row" }}>
            {items.map((it, i) => {
              const Ico = it.icon;
              return (
                <View key={i} style={{ flex: 1, alignItems: "center" }}>
                  {i > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 1,
                      }}
                    >
                      <LinearGradient
                        colors={["transparent", T.cardBorder, "transparent"]}
                        style={{ flex: 1 }}
                      />
                    </View>
                  )}
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: it.bg,
                      borderWidth: 0.5,
                      borderColor: it.bc,
                      marginBottom: 10,
                    }}
                  >
                    <Ico size={22} color={it.color} strokeWidth={2.5} />
                  </View>
                  <Text
                    style={{
                      fontFamily: "Montserrat_700Bold",
                      fontSize: 24,
                      color: it.color,
                    }}
                  >
                    {it.val}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Montserrat_300Light",
                      fontSize: 8,
                      color: T.isWhite
                        ? WHITE_THEME.textSub
                        : "rgba(255,255,255,0.25)",
                      letterSpacing: 2,
                      marginTop: 4,
                    }}
                  >
                    {it.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   PAGE TABS — Premium pill selector
   ═══════════════════════════════════════════ */
function Tabs({ active, onSwitch, sRef }) {
  const T = useThemeColors();
  const press = useCallback(
    (i) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      sRef.current?.scrollTo({ x: i * SW, animated: true });
      onSwitch(i);
    },
    [onSwitch, sRef],
  );

  const tabs = [
    { label: "Your Progress", icon: Target, c: NEON },
    { label: "Squad Today", icon: Users, c: "#C9A0DC" },
  ];

  return (
    <Animated.View
      entering={FadeIn.delay(50).duration(400)}
      style={{
        flexDirection: "row",
        marginHorizontal: 20,
        marginBottom: 10,
        backgroundColor: T.borderSub,
        borderRadius: 18,
        padding: 4,
        borderWidth: 0.5,
        borderColor: T.isWhite ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
      }}
    >
      {tabs.map((t, i) => {
        const on = active === i;
        const Ico = t.icon;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => press(i)}
            activeOpacity={0.8}
            style={{ flex: 1 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                paddingVertical: 11,
                borderRadius: 14,
                backgroundColor: on ? `${t.c}15` : "transparent",
                borderWidth: on ? 0.5 : 0,
                borderColor: on ? `${t.c}25` : "transparent",
              }}
            >
              <Ico
                size={14}
                color={
                  on
                    ? t.c
                    : T.isWhite
                      ? "rgba(5,5,16,0.18)"
                      : "rgba(255,255,255,0.18)"
                }
                strokeWidth={on ? 2 : 1.5}
              />
              <Text
                style={{
                  fontFamily: on
                    ? "Montserrat_600SemiBold"
                    : "Montserrat_400Regular",
                  fontSize: 12,
                  color: on ? t.c : T.textMuted,
                  letterSpacing: 0.5,
                }}
              >
                {t.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   SQUAD — Leader card with crown
   ═══════════════════════════════════════════ */
function LeaderCard({ squad }) {
  const T = useThemeColors();
  const sorted = useMemo(
    () =>
      squad.length
        ? [...squad].sort((a, b) => {
            const ac = Object.values(a.prayers).filter(Boolean).length;
            const bc = Object.values(b.prayers).filter(Boolean).length;
            return bc - ac || b.streak - a.streak;
          })
        : [],
    [squad],
  );
  if (!squad.length) return null;
  const ld = sorted[0];
  const lc = Object.values(ld.prayers).filter(Boolean).length;

  const crownGlow = useSharedValue(0.1);
  useEffect(() => {
    crownGlow.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.08, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);
  const crownS = useAnimatedStyle(() => ({ opacity: crownGlow.value }));

  return (
    <Animated.View entering={FadeInDown.delay(80).duration(600).springify()}>
      <View
        style={{
          borderRadius: 26,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: "rgba(212,175,55,0.15)",
          ...getShadow(T.isWhite, "card"),
        }}
      >
        <LinearGradient
          colors={["rgba(212,175,55,0.07)", "rgba(212,175,55,0.015)"]}
          style={{ padding: 22 }}
        >
          <Shimmer color="#D4AF37" delay={1500} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <View style={{ position: "relative" }}>
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: "#D4AF37",
                    left: -5,
                    top: -5,
                  },
                  crownS,
                ]}
              />
              <Crown size={24} color="#D4AF37" fill="rgba(212,175,55,0.35)" />
            </View>
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 12,
                color: T.textSub,
                letterSpacing: 2.5,
              }}
            >
              TODAY'S LEADER
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "rgba(212,175,55,0.35)",
                backgroundColor: "rgba(212,175,55,0.06)",
                ...SHADOWS.glow("rgba(212,175,55,0.25)"),
              }}
            >
              <Text
                style={{
                  fontFamily: "Montserrat_700Bold",
                  fontSize: 18,
                  color: "#D4AF37",
                }}
              >
                {ld.ini}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text
                style={{
                  fontFamily: "Montserrat_700Bold",
                  fontSize: 18,
                  color: T.text,
                }}
              >
                {ld.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 12,
                    color: "rgba(212,175,55,0.5)",
                  }}
                >
                  {lc}/5 prayers
                </Text>
                <View
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: "rgba(212,175,55,0.3)",
                  }}
                />
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                >
                  <Flame size={10} color="#FF9A5C" />
                  <Text
                    style={{
                      fontFamily: "Montserrat_300Light",
                      fontSize: 12,
                      color: "rgba(255,154,92,0.5)",
                    }}
                  >
                    {ld.streak} days
                  </Text>
                </View>
              </View>
            </View>
            <Text style={{ fontSize: 28 }}>👑</Text>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   SQUAD FRIEND CARD — Rank badge + animated prayer dots
   ═══════════════════════════════════════════ */
function FriendCard({ friend, index, rank }) {
  const T = useThemeColors();
  const pc = Object.values(friend.prayers).filter(Boolean).length;
  const hot = pc >= 4;
  const sc = hot
    ? "#00FFAA"
    : pc >= 2
      ? NEON
      : T.isWhite
        ? "rgba(5,5,16,0.15)"
        : "rgba(255,255,255,0.15)";
  const tag = hot
    ? "On Fire 🔥"
    : pc >= 3
      ? "Strong 💪"
      : pc >= 1
        ? "Started"
        : "Sleeping 😴";

  const avatarPulse = useSharedValue(1);
  useEffect(() => {
    if (hot) {
      avatarPulse.value = withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        ),
        3,
        true,
      );
    }
  }, [hot]);
  const avatarS = useAnimatedStyle(() => ({
    transform: [{ scale: avatarPulse.value }],
  }));

  const rankColors = ["#D4AF37", "#C0C0C0", "#CD7F32"];
  const rankBg =
    rank < 3
      ? `${rankColors[rank]}15`
      : T.isWhite
        ? "rgba(0,0,0,0.03)"
        : "rgba(255,255,255,0.03)";
  const rankBc =
    rank < 3
      ? `${rankColors[rank]}30`
      : T.isWhite
        ? "rgba(0,0,0,0.04)"
        : "rgba(255,255,255,0.05)";

  return (
    <Animated.View
      entering={FadeInDown.delay(180 + index * 70)
        .duration(500)
        .springify()}
    >
      <View
        style={{
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: hot
            ? "rgba(0,255,170,0.1)"
            : rank < 3
              ? `${rankColors[rank]}15`
              : T.cardBorder,
          marginBottom: 14,
          ...getShadow(T.isWhite, "card"),
        }}
      >
        <LinearGradient
          colors={
            hot ? ["rgba(0,255,170,0.05)", "rgba(0,255,170,0.01)"] : T.cardGrad
          }
          style={{ padding: 18 }}
        >
          {hot && <Shimmer color="#00FFAA" delay={index * 500} />}

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Rank badge */}
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: rankBg,
                borderWidth: 0.5,
                borderColor: rankBc,
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: "Montserrat_700Bold",
                  fontSize: 10,
                  color: rank < 3 ? rankColors[rank] : T.textMuted,
                }}
              >
                {rank + 1}
              </Text>
            </View>

            {/* Avatar */}
            <Animated.View style={avatarS}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1.5,
                  borderColor: `${sc}40`,
                  backgroundColor: `${sc}08`,
                  ...(hot ? SHADOWS.glow("rgba(0,255,170,0.2)") : {}),
                }}
              >
                <Text
                  style={{
                    fontFamily: "Montserrat_700Bold",
                    fontSize: 15,
                    color: sc,
                  }}
                >
                  {friend.ini}
                </Text>
              </View>
            </Animated.View>

            {/* Info */}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text
                  style={{
                    fontFamily: "Montserrat_600SemiBold",
                    fontSize: 15,
                    color: T.text,
                  }}
                >
                  {friend.name}
                </Text>
                {friend.streak >= 7 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                      backgroundColor: "rgba(255,154,92,0.08)",
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: 8,
                      borderWidth: 0.5,
                      borderColor: "rgba(255,154,92,0.15)",
                    }}
                  >
                    <Flame size={8} color="#FF9A5C" />
                    <Text
                      style={{
                        fontFamily: "Montserrat_700Bold",
                        fontSize: 8,
                        color: "#FF9A5C",
                      }}
                    >
                      {friend.streak}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontFamily: "Montserrat_300Light",
                  fontSize: 11,
                  color: sc,
                  marginTop: 3,
                }}
              >
                {tag}
              </Text>
            </View>

            {/* Score */}
            <View
              style={{
                backgroundColor: `${sc}10`,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 12,
                borderWidth: 0.5,
                borderColor: `${sc}20`,
              }}
            >
              <Text
                style={{
                  fontFamily: "Montserrat_700Bold",
                  fontSize: 14,
                  color: sc,
                }}
              >
                {pc}/5
              </Text>
            </View>
          </View>

          {/* Prayer row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
              paddingTop: 16,
              borderTopWidth: 0.5,
              borderTopColor: T.borderSub,
            }}
          >
            {PRAYERS.map((p, pi) => {
              const done = friend.prayers[p];
              const pc2 = P_CLR[p];
              return (
                <View key={p} style={{ alignItems: "center", flex: 1 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: done
                        ? `${pc2}12`
                        : T.isWhite
                          ? "rgba(0,0,0,0.015)"
                          : "rgba(255,255,255,0.015)",
                      borderWidth: 1,
                      borderColor: done
                        ? `${pc2}35`
                        : T.isWhite
                          ? "rgba(0,0,0,0.03)"
                          : "rgba(255,255,255,0.03)",
                      ...(done ? SHADOWS.glow(`${pc2}25`) : {}),
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Montserrat_700Bold",
                        fontSize: 14,
                        color: done
                          ? pc2
                          : T.isWhite
                            ? "rgba(0,0,0,0.06)"
                            : "rgba(255,255,255,0.08)",
                      }}
                    >
                      {P_SHORT[pi]}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Montserrat_300Light",
                      fontSize: 8,
                      color: done
                        ? `${pc2}80`
                        : T.isWhite
                          ? "rgba(0,0,0,0.06)"
                          : "rgba(255,255,255,0.08)",
                      marginTop: 5,
                      letterSpacing: 0.5,
                    }}
                  >
                    {p}
                  </Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   SQUAD TODAY PAGE — Real backend sync
   ═══════════════════════════════════════════ */
function SquadPage() {
  const T = useThemeColors();
  const { settings } = useSettings();
  const { completedPrayers, streakData } = usePrayerStorage();

  // Display name — prefer settings name, fallback to "Anonymous"
  const displayName =
    settings.userName?.trim() ||
    settings.userEmail?.split("@")[0] ||
    "Anonymous";

  // Real squad hook
  const {
    myCode,
    squadData: squad,
    loading,
    syncing,
    isConfigured,
    addFriend,
    removeFriend,
    refresh,
  } = useSquad({
    displayName,
    myPrayers: completedPrayers,
    myStreak: streakData.currentStreak,
  });

  // UI state
  const [copied, setCopied] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const copyScale = useSharedValue(1);
  const linkPulse = useSharedValue(1);
  const addBtnScale = useSharedValue(1);

  // Formatted invite code display (e.g. "ABC123" → "ABC 123")
  const displayCode = myCode
    ? myCode.slice(0, 3) + " " + myCode.slice(3)
    : "------";
  const shareMsg = `Join my prayer squad on Iqama! 🤲\n\nEnter my squad code in the app:\n\n  ${myCode ?? ""}\n\nWe keep each other accountable for Salah. Barak Allahu feekum!`;

  useEffect(() => {
    linkPulse.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  // Refresh on tab focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const linkBoxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: linkPulse.value }],
  }));
  const copyBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: copyScale.value }],
  }));
  const addBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addBtnScale.value }],
  }));

  const handleCopy = useCallback(async () => {
    if (!myCode) return;
    await Clipboard.setStringAsync(myCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    copyScale.value = withTiming(0.92, { duration: 100 });
    setTimeout(() => {
      copyScale.value = withTiming(1, { duration: 200 });
    }, 120);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }, [myCode]);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await RNShare.share({ message: shareMsg });
    } catch { }
  }, [shareMsg]);

  const handleAddFriend = useCallback(async () => {
    if (!codeInput.trim()) return;
    setAddError("");
    setAddSuccess("");
    setAddLoading(true);
    addBtnScale.value = withTiming(0.94, { duration: 80 });
    setTimeout(() => {
      addBtnScale.value = withTiming(1, { duration: 150 });
    }, 100);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await addFriend(codeInput);
    setAddLoading(false);
    if (result.error) {
      setAddError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setAddSuccess(`${result.name} squad mein aa gaya! 🎉`);
      setCodeInput("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setAddSuccess(""), 4000);
    }
  }, [codeInput, addFriend]);

  const handleRemoveFriend = useCallback(
    (friend) => {
      Alert.alert("Remove Friend", `Remove ${friend.name} from your squad?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            removeFriend(friend.code);
          },
        },
      ]);
    },
    [removeFriend],
  );

  const sorted = useMemo(
    () =>
      [...squad].sort((a, b) => {
        const ac = Object.values(a.prayers).filter(Boolean).length;
        const bc = Object.values(b.prayers).filter(Boolean).length;
        return bc - ac || b.streak - a.streak;
      }),
    [squad],
  );

  const total = squad.reduce(
    (s, f) => s + Object.values(f.prayers).filter(Boolean).length,
    0,
  );
  const pct =
    squad.length > 0 ? Math.round((total / (squad.length * 5)) * 100) : 0;

  return (
    <ScrollView
      style={{ flex: 1, width: SW }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 160 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────── */}
      <Animated.View
        entering={FadeIn.delay(50).duration(500)}
        style={{ marginBottom: 20 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: "PlayfairDisplay_700Bold",
                fontSize: 22,
                color: T.text,
              }}
            >
              Squad's Daily Hustle
            </Text>
            <Text
              style={{
                fontFamily: "Montserrat_300Light",
                fontSize: 12,
                color: T.textMuted,
                marginTop: 4,
              }}
            >
              {squad.length > 0
                ? syncing
                  ? "Syncing…"
                  : "Live prayer status"
                : "Add friends to track together"}
            </Text>
          </View>
          {squad.length > 0 && (
            <View
              style={{
                backgroundColor: "rgba(212,175,55,0.06)",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 18,
                borderWidth: 0.5,
                borderColor: "rgba(212,175,55,0.15)",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Montserrat_700Bold",
                  fontSize: 18,
                  color: NEON,
                }}
              >
                {pct}%
              </Text>
              <Text
                style={{
                  fontFamily: "Montserrat_300Light",
                  fontSize: 7,
                  color: "rgba(212,175,55,0.4)",
                  letterSpacing: 1.5,
                }}
              >
                SQUAD
              </Text>
            </View>
          )}
        </View>
        <LinearGradient
          colors={["rgba(212,175,55,0.25)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 1, marginTop: 16 }}
        />
      </Animated.View>

      {/* ── Supabase not configured warning ────────── */}
      {!isConfigured && (
        <Animated.View
          entering={FadeInDown.delay(60).duration(400)}
          style={{ marginBottom: 16 }}
        >
          <View
            style={{
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 0.5,
              borderColor: "rgba(255,200,0,0.2)",
            }}
          >
            <LinearGradient
              colors={["rgba(255,200,0,0.07)", "rgba(255,200,0,0.02)"]}
              style={{
                padding: 14,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <AlertTriangle
                size={16}
                color="#F5C842"
                style={{ marginTop: 1 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Montserrat_600SemiBold",
                    fontSize: 12,
                    color: "#F5C842",
                    marginBottom: 3,
                  }}
                >
                  Squad backend not configured
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 11,
                    color: T.textMuted,
                    lineHeight: 17,
                  }}
                >
                  Add your Supabase keys to enable live squad sync. See the
                  setup guide in{" "}
                  <Text style={{ color: "#F5C842" }}>
                    apps/mobile/.env.example
                  </Text>{" "}
                  for details.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      )}

      {/* ── My Squad Code Card ──────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(80).duration(500)}
        style={{ marginBottom: 18 }}
      >
        <Animated.View style={linkBoxStyle}>
          <View
            style={{
              borderRadius: 22,
              overflow: "hidden",
              borderWidth: 0.5,
              borderColor: "rgba(212,175,55,0.15)",
              ...getShadow(T.isWhite, "soft"),
            }}
          >
            <LinearGradient
              colors={["rgba(212,175,55,0.06)", "rgba(212,175,55,0.015)"]}
              style={{ padding: 20 }}
            >
              <Shimmer delay={1000} />

              {/* Header label */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <Link size={14} color="rgba(212,175,55,0.5)" />
                <Text
                  style={{
                    fontFamily: "Montserrat_600SemiBold",
                    fontSize: 11,
                    color: T.textSub,
                    letterSpacing: 2,
                  }}
                >
                  MY SQUAD CODE
                </Text>
              </View>

              {/* Big code display */}
              <View
                style={{
                  backgroundColor: T.isWhite
                    ? "rgba(0,0,0,0.04)"
                    : "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderWidth: 0.5,
                  borderColor: "rgba(212,175,55,0.15)",
                  marginBottom: 14,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Montserrat_700Bold",
                    fontSize: 32,
                    color: NEON,
                    letterSpacing: 10,
                  }}
                >
                  {displayCode}
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 10,
                    color: T.textMuted,
                    marginTop: 6,
                  }}
                >
                  Share this code with friends
                </Text>
              </View>

              {/* Copy + Share buttons */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={handleCopy}
                  activeOpacity={0.85}
                  style={{ flex: 1 }}
                >
                  <Animated.View
                    style={[
                      {
                        height: 46,
                        borderRadius: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        backgroundColor: copied
                          ? "rgba(0,255,200,0.08)"
                          : T.isWhite
                            ? "rgba(0,0,0,0.03)"
                            : "rgba(255,255,255,0.04)",
                        borderWidth: 1,
                        borderColor: copied
                          ? "rgba(0,255,200,0.25)"
                          : T.cardBorder,
                      },
                      copyBtnStyle,
                    ]}
                  >
                    {copied ? (
                      <Check size={16} color="#00FFC8" strokeWidth={2.5} />
                    ) : (
                      <Copy size={16} color={T.textSub} strokeWidth={1.5} />
                    )}
                    <Text
                      style={{
                        fontFamily: "Montserrat_600SemiBold",
                        fontSize: 13,
                        color: copied ? "#00FFC8" : T.textSub,
                      }}
                    >
                      {copied ? "Copied!" : "Copy Code"}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  activeOpacity={0.85}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={[NEON, "#B8860B"]}
                    style={{
                      height: 46,
                      borderRadius: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      ...SHADOWS.glow("rgba(212,175,55,0.3)"),
                    }}
                  >
                    <Share size={16} color="#FFF" strokeWidth={2} />
                    <Text
                      style={{
                        fontFamily: "Montserrat_600SemiBold",
                        fontSize: 13,
                        color: "#FFF",
                      }}
                    >
                      Share
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── Add Friend by Code ───────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(130).duration(500)}
        style={{ marginBottom: 18 }}
      >
        <View
          style={{
            borderRadius: 22,
            overflow: "hidden",
            borderWidth: 0.5,
            borderColor: "rgba(201,160,220,0.15)",
            ...getShadow(T.isWhite, "soft"),
          }}
        >
          <LinearGradient
            colors={["rgba(201,160,220,0.06)", "rgba(201,160,220,0.015)"]}
            style={{ padding: 20 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <UserPlus size={14} color="rgba(201,160,220,0.6)" />
              <Text
                style={{
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 11,
                  color: T.textSub,
                  letterSpacing: 2,
                }}
              >
                ADD FRIEND BY CODE
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                value={codeInput}
                onChangeText={(t) => {
                  setCodeInput(t.toUpperCase());
                  setAddError("");
                  setAddSuccess("");
                }}
                placeholder="e.g. ABC123"
                placeholderTextColor={T.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: T.cardBorder,
                  backgroundColor: T.isWhite
                    ? "rgba(0,0,0,0.03)"
                    : "rgba(255,255,255,0.04)",
                  color: T.text,
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 18,
                  letterSpacing: 6,
                }}
              />
              <TouchableOpacity
                onPress={handleAddFriend}
                activeOpacity={0.85}
                disabled={addLoading || !codeInput.trim()}
              >
                <Animated.View
                  style={[
                    {
                      height: 46,
                      paddingHorizontal: 20,
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: addLoading
                        ? "rgba(201,160,220,0.08)"
                        : "rgba(201,160,220,0.15)",
                      borderWidth: 1,
                      borderColor: "rgba(201,160,220,0.25)",
                    },
                    addBtnStyle,
                  ]}
                >
                  {addLoading ? (
                    <ActivityIndicator size="small" color="#C9A0DC" />
                  ) : (
                    <Text
                      style={{
                        fontFamily: "Montserrat_700Bold",
                        fontSize: 14,
                        color: "#C9A0DC",
                      }}
                    >
                      Add
                    </Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Error / Success messages */}
            {!!addError && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 10,
                }}
              >
                <AlertTriangle size={12} color="#FF6B8A" />
                <Text
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 12,
                    color: "#FF6B8A",
                  }}
                >
                  {addError}
                </Text>
              </View>
            )}
            {!!addSuccess && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 10,
                }}
              >
                <Check size={12} color="#00FFAA" strokeWidth={2.5} />
                <Text
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 12,
                    color: "#00FFAA",
                  }}
                >
                  {addSuccess}
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>
      </Animated.View>

      {/* ── Loading state ────────────────────────────── */}
      {loading && (
        <View style={{ alignItems: "center", paddingVertical: 30 }}>
          <ActivityIndicator size="large" color={NEON} />
          <Text
            style={{
              fontFamily: "Montserrat_300Light",
              fontSize: 12,
              color: T.textMuted,
              marginTop: 12,
            }}
          >
            Loading squad…
          </Text>
        </View>
      )}

      {/* ── Empty state ──────────────────────────────── */}
      {!loading && squad.length === 0 && (
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={{ alignItems: "center", paddingVertical: 40 }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(212,175,55,0.04)",
              borderWidth: 1,
              borderColor: "rgba(212,175,55,0.1)",
              marginBottom: 20,
            }}
          >
            <Users size={32} color="rgba(212,175,55,0.25)" />
          </View>
          <Text
            style={{
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 16,
              color: T.textSub,
              marginBottom: 8,
            }}
          >
            No Friends Yet
          </Text>
          <Text
            style={{
              fontFamily: "Montserrat_300Light",
              fontSize: 13,
              color: T.textMuted,
              textAlign: "center",
              lineHeight: 20,
              paddingHorizontal: 30,
            }}
          >
            {isConfigured
              ? "Share your code OR enter a friend's code above to get started"
              : "Configure Supabase first, then share your code with friends"}
          </Text>
        </Animated.View>
      )}

      {/* ── Stats row ────────────────────────────────── */}
      {!loading && squad.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={{ marginBottom: 16 }}
        >
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View
              style={{
                flex: 1,
                borderRadius: 18,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: "rgba(0,255,170,0.1)",
              }}
            >
              <LinearGradient
                colors={["rgba(0,255,170,0.06)", "rgba(0,255,170,0.01)"]}
                style={{ padding: 14, alignItems: "center" }}
              >
                <Text
                  style={{
                    fontFamily: "Montserrat_700Bold",
                    fontSize: 20,
                    color: "#00FFAA",
                  }}
                >
                  {total}
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 8,
                    color: "rgba(0,255,170,0.4)",
                    letterSpacing: 1.5,
                    marginTop: 3,
                  }}
                >
                  TOTAL PRAYED
                </Text>
              </LinearGradient>
            </View>
            <View
              style={{
                flex: 1,
                borderRadius: 18,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: "rgba(255,154,92,0.1)",
              }}
            >
              <LinearGradient
                colors={["rgba(255,154,92,0.06)", "rgba(255,154,92,0.01)"]}
                style={{ padding: 14, alignItems: "center" }}
              >
                <Text
                  style={{
                    fontFamily: "Montserrat_700Bold",
                    fontSize: 20,
                    color: "#FF9A5C",
                  }}
                >
                  {squad.length}
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 8,
                    color: "rgba(255,154,92,0.4)",
                    letterSpacing: 1.5,
                    marginTop: 3,
                  }}
                >
                  MEMBERS
                </Text>
              </LinearGradient>
            </View>
            <View
              style={{
                flex: 1,
                borderRadius: 18,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: "rgba(108,142,245,0.1)",
              }}
            >
              <LinearGradient
                colors={["rgba(108,142,245,0.06)", "rgba(108,142,245,0.01)"]}
                style={{ padding: 14, alignItems: "center" }}
              >
                <Text
                  style={{
                    fontFamily: "Montserrat_700Bold",
                    fontSize: 20,
                    color: "#6C8EF5",
                  }}
                >
                  {Math.max(...squad.map((f) => f.streak))}
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 8,
                    color: "rgba(108,142,245,0.4)",
                    letterSpacing: 1.5,
                    marginTop: 3,
                  }}
                >
                  TOP STREAK
                </Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── Leader card ──────────────────────────────── */}
      {!loading && squad.length >= 2 && (
        <View style={{ marginBottom: 16 }}>
          <LeaderCard squad={squad} />
        </View>
      )}

      {/* ── Friends list ─────────────────────────────── */}
      {!loading &&
        sorted.map((f, i) => (
          <TouchableOpacity
            key={f.code}
            activeOpacity={0.9}
            onLongPress={() => handleRemoveFriend(f)}
          >
            <FriendCard friend={f} index={i} rank={i} />
          </TouchableOpacity>
        ))}

      {/* ── Hints ────────────────────────────────────── */}
      {!loading && squad.length > 0 && (
        <Animated.View
          entering={FadeInUp.delay(500).duration(400)}
          style={{ marginTop: 4, marginBottom: 20 }}
        >
          <Text
            style={{
              fontFamily: "Montserrat_300Light",
              fontSize: 11,
              color: T.textFaint,
              textAlign: "center",
            }}
          >
            Long press a friend to remove • Updates every 60s
          </Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}

/* ═══════════════════════════════════════════
   MAIN TRACKER SCREEN
   ═══════════════════════════════════════════ */
export default function TrackerScreen() {
  const insets = useSafeAreaInsets();
  const skipInitialEntering = useSkipInitialEntering();
  const sRef = useRef(null);
  const [page, setPage] = useState(0);
  const { settings } = useSettings();
  const isWhite = settings.whiteTheme === true;

  const [todayData, setTodayData] = useState({});
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    bestStreak: 0,
    streakDays: Array(7).fill(false),
  });
  const [recentDays, setRecentDays] = useState(Array(7).fill(0));
  const [breakdown, setBreakdown] = useState([]);
  const [mStats, setMStats] = useState({ totalCompleted: 0, totalPossible: 0 });
  const [mPct, setMPct] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let dead = false;
      (async () => {
        try {
          const now = new Date();
          const [streak, stats, bd] = await Promise.all([
            calculateStreak(),
            getMonthlyStats(now.getFullYear(), now.getMonth()),
            getPrayerBreakdown(now.getFullYear(), now.getMonth()),
          ]);

          const stored = await AsyncStorage.getItem(
            `${STORAGE_KEYS.COMPLETED_PREFIX}${getTodayKey()}`,
          );
          const td = stored ? JSON.parse(stored) : {};

          const keys = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            keys.push(
              `${STORAGE_KEYS.COMPLETED_PREFIX}${d.toISOString().split("T")[0]}`,
            );
          }
          const res = await AsyncStorage.multiGet(keys);
          const recent = res.map(([, v]) =>
            v ? Object.values(JSON.parse(v)).filter(Boolean).length : 0,
          );

          if (!dead) {
            setStreakData(streak);
            setMStats(stats);
            setBreakdown(bd);
            setTodayData(td);
            setRecentDays(recent);
            setMPct(
              stats.totalPossible > 0
                ? Math.round((stats.totalCompleted / stats.totalPossible) * 100)
                : 0,
            );
          }
        } catch (e) {
          console.error("Tracker:", e);
        }
      })();
      return () => {
        dead = true;
      };
    }, []),
  );

  const onScroll = useCallback(
    (e) => {
      const p = Math.round(e.nativeEvent.contentOffset.x / SW);
      if (p !== page) {
        setPage(p);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [page],
  );

  return (
    <LayoutAnimationConfig skipEntering={skipInitialEntering}>
      <View
        style={{
          flex: 1,
          backgroundColor: isWhite
            ? "#F9F6F0"
            : "#050510",
        }}
      >
      <StatusBar style={isWhite ? "dark" : "light"} />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 6, paddingBottom: 2 }}>
        <Animated.View entering={FadeIn.duration(500)}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Montserrat_300Light",
                  fontSize: 10,
                  color: isWhite ? "rgba(5,5,16,0.3)" : "rgba(255,255,255,0.2)",
                  letterSpacing: 3,
                  marginBottom: 4,
                }}
              >
                {page === 0 ? "PERSONAL" : "COMMUNITY"}
              </Text>
              <Text
                style={{
                  fontFamily: "PlayfairDisplay_700Bold",
                  fontSize: 24,
                  color: isWhite ? "#050510" : "#FAFAFA",
                }}
              >
                {page === 0 ? "Your Progress" : "Squad Today"}
              </Text>
            </View>
            {page === 0 ? (
              <TrendingUp size={22} color={NEON} />
            ) : (
              <Users size={22} color="#C9A0DC" />
            )}
          </View>
          <Tabs active={page} onSwitch={setPage} sRef={sRef} />
        </Animated.View>
      </View>

      {/* Pager */}
      <ScrollView
        ref={sRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {/* Page 1 */}
        <ScrollView
          style={{ width: SW }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 160,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.delay(50).duration(500)}
            style={{ alignItems: "center", marginVertical: 4 }}
          >
            <CompletionRing percentage={mPct} />
          </Animated.View>
          <StreakCard data={streakData} />
          <TodayCard todayData={todayData} />
          <WeekChart days={recentDays} />
          <BreakdownCard breakdown={breakdown} />
          <MonthSummary stats={mStats} />
        </ScrollView>

        {/* Page 2 */}
        <SquadPage />
      </ScrollView>
      </View>
    </LayoutAnimationConfig>
  );
}
