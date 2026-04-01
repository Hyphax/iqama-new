import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check, Trophy, Lock, Clock, X as XIcon } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { WHITE_THEME } from "@/utils/iqamaTheme";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { PRAYER_AURA, SHADOWS } from "@/utils/iqamaTheme";

// Convert "H:MM AM/PM" to minutes since midnight
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let h = hours;
  if (period === "PM" && hours !== 12) h += 12;
  if (period === "AM" && hours === 12) h = 0;
  return h * 60 + minutes;
}

// Determine prayer states: only CURRENT prayer is tappable
// Past prayers not completed = missed (locked red)
// Future prayers = locked (grey)
function getPrayerStates(prayers) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return prayers.map((prayer) => {
    const prayerMinutes = timeToMinutes(prayer.time);
    const isCurrent = prayer.current;
    const isPast = currentMinutes >= prayerMinutes && !isCurrent;
    const isFuture = currentMinutes < prayerMinutes && !isCurrent;
    // Missed = past prayer that wasn't completed
    const isMissed = isPast && !prayer.completed;
    // Only current prayer is tappable (and only if not already completed)
    const isTappable = isCurrent || prayer.completed;

    return { ...prayer, isCurrent, isPast, isFuture, isMissed, isTappable };
  });
}

const PrayerRow = memo(function PrayerRow({ prayer, index, onToggleComplete, isWhite }) {
  const aura = PRAYER_AURA[prayer.name] || PRAYER_AURA.Asr;
  const isLocked = !prayer.isTappable;
  const glowPulse = useSharedValue(0);
  const dotPulse = useSharedValue(1);
  const checkScale = useSharedValue(prayer.completed ? 1 : 0);
  const pressScale = useSharedValue(1);
  const rowGlow = useSharedValue(0);
  const lockBounce = useSharedValue(0);

  useEffect(() => {
    if (prayer.isCurrent && !prayer.completed) {
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(0.18, {
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.02, {
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      );
      dotPulse.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    }
  }, [prayer.isCurrent, prayer.completed]);

  useEffect(() => {
    checkScale.value = withSpring(prayer.completed ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });
    if (prayer.completed) {
      rowGlow.value = withSequence(
        withTiming(0.4, { duration: 200 }),
        withTiming(0, { duration: 800 }),
      );
    }
  }, [prayer.completed]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowPulse.value }));
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotPulse.value }],
  }));
  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));
  const rowGlowStyle = useAnimatedStyle(() => ({ opacity: rowGlow.value }));
  const lockStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: lockBounce.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (isLocked) return;
    pressScale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  }, [isLocked]);

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, []);

  const handleToggle = useCallback(() => {
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      lockBounce.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleComplete(prayer.name);
  }, [prayer.name, onToggleComplete, isLocked]);

  // ── White theme row styling ──────────────────────────────────────────────
  // Solid white card with colored left accent border & shadow

  const borderColor = isWhite
    ? prayer.completed
      ? `${aura.primary}55`
      : prayer.isCurrent
        ? aura.primary // full-opacity accent border for current
        : prayer.isMissed
          ? "rgba(192,57,43,0.30)"
          : WHITE_THEME.cardBorder
    : prayer.completed
      ? `${aura.primary}20`
      : prayer.isCurrent
        ? `${aura.primary}35`
        : prayer.isMissed
          ? "rgba(255,76,110,0.12)"
          : "rgba(255,255,255,0.02)";

  // Background — ULTRA PREMIUM in white mode
  const bgColors = isWhite
    ? prayer.completed
      ? [`${aura.primary}12`, "#FEFDFB", "#F8F4EC"]
      : prayer.isCurrent
        ? [`${aura.primary}20`, `${aura.primary}10`, "#F5EEE0"]
        : prayer.isMissed
          ? ["rgba(185,28,28,0.10)", "#FEFDFB", "#F8F4EC"]
          : ["#FEFDFB", "#F8F4EC"]
    : prayer.completed
      ? [`${aura.primary}08`, `${aura.primary}03`, "rgba(8,8,20,0.65)"]
      : prayer.isCurrent
        ? [`${aura.primary}10`, `${aura.primary}04`, "rgba(8,8,20,0.75)"]
        : prayer.isMissed
          ? ["rgba(255,76,110,0.04)", "rgba(8,8,20,0.55)"]
          : ["rgba(8,8,20,0.55)", "rgba(8,8,20,0.45)"];

  // White mode shadow — gives cards visual depth on the cream background
  const rowShadow = isWhite
    ? {
      shadowColor: prayer.isCurrent ? aura.primary : "#8B6020",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: prayer.isCurrent ? 0.18 : 0.08,
      shadowRadius: 10,
      elevation: 3,
    }
    : {};

  // Subtitle text
  const subtitle =
    prayer.isCurrent && !prayer.completed
      ? "Tap to mark as prayed"
      : prayer.isMissed
        ? "Missed"
        : prayer.isFuture
          ? "Upcoming"
          : null;

  const subtitleColor = prayer.isCurrent
    ? `${aura.primary}60`
    : prayer.isMissed
      ? "rgba(255,76,110,0.4)"
      : isWhite
        ? WHITE_THEME.textFaint
        : "rgba(255,255,255,0.1)";

  return (
    <Animated.View
      style={scaleStyle}
    >
      <TouchableOpacity
        onPress={handleToggle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={isLocked ? 1 : 0.85}
        style={{ marginBottom: 8 }}
      >
        <View
          style={{
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: isWhite
              ? prayer.isCurrent
                ? 1.5
                : 0.8
              : prayer.isCurrent
                ? 1
                : 0.5,
            borderColor,
            ...rowShadow,
          }}
        >
          <LinearGradient
            colors={bgColors}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              paddingHorizontal: 18,
            }}
          >
            {/* Completion flash glow */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 20,
                },
                rowGlowStyle,
              ]}
            >
              <LinearGradient
                colors={[
                  `${aura.primary}50`,
                  `${aura.primary}15`,
                  "transparent",
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ flex: 1, borderRadius: 20 }}
              />
            </Animated.View>

            {/* Animated glow behind current prayer */}
            {prayer.isCurrent && !prayer.completed && (
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    left: -20,
                    top: -20,
                    bottom: -20,
                    width: 120,
                    borderRadius: 60,
                    backgroundColor: aura.primary,
                  },
                  glowStyle,
                ]}
              />
            )}

            {/* Left accent line */}
            {prayer.isCurrent && (
              <LinearGradient
                colors={[
                  aura.primary,
                  `${aura.primary}40`,
                  `${aura.primary}00`,
                ]}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 6,
                  bottom: 6,
                  width: 3,
                  borderRadius: 2,
                }}
              />
            )}
            {prayer.isMissed && (
              <LinearGradient
                colors={[
                  "rgba(255,76,110,0.5)",
                  "rgba(255,76,110,0.15)",
                  "transparent",
                ]}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 6,
                  bottom: 6,
                  width: 2,
                  borderRadius: 2,
                }}
              />
            )}

            {/* Status circle */}
            <View style={{ width: 36, alignItems: "center" }}>
              {prayer.completed ? (
                <View style={{ position: "relative" }}>
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      left: -4,
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: aura.primary,
                      opacity: 0.15,
                    }}
                  />
                  <Animated.View
                    style={[
                      {
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: aura.primary,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.6,
                        shadowRadius: 12,
                      },
                      checkAnimStyle,
                    ]}
                  >
                    <LinearGradient
                      colors={[aura.primary, aura.secondary]}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={15} color="#050510" strokeWidth={3} />
                    </LinearGradient>
                  </Animated.View>
                </View>
              ) : prayer.isCurrent ? (
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: aura.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Animated.View
                    style={[
                      {
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: aura.primary,
                      },
                      dotStyle,
                    ]}
                  />
                </View>
              ) : prayer.isMissed ? (
                <Animated.View style={lockStyle}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "rgba(255,76,110,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255,76,110,0.06)",
                    }}
                  >
                    <XIcon
                      size={12}
                      color="rgba(255,76,110,0.4)"
                      strokeWidth={2}
                    />
                  </View>
                </Animated.View>
              ) : (
                <Animated.View style={lockStyle}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: isWhite
                        ? "rgba(5,5,16,0.08)"
                        : "rgba(255,255,255,0.06)",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isWhite
                        ? "rgba(5,5,16,0.03)"
                        : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <Lock
                      size={12}
                      color={
                        isWhite ? "rgba(5,5,16,0.15)" : "rgba(255,255,255,0.12)"
                      }
                      strokeWidth={2}
                    />
                  </View>
                </Animated.View>
              )}
            </View>

            {/* Prayer name & status */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text
                style={{
                  fontFamily: prayer.isCurrent
                    ? "Montserrat_600SemiBold"
                    : "Montserrat_400Regular",
                  fontSize: 16,
                  color: isWhite
                    ? prayer.completed
                      ? WHITE_THEME.textMuted // struck-through: faded
                      : prayer.isCurrent
                        ? WHITE_THEME.text // current: full dark
                        : prayer.isMissed
                          ? "#C0392B" // missed: clear red
                          : WHITE_THEME.textSub // future: readable dark
                    : prayer.completed
                      ? "rgba(255,255,255,0.35)"
                      : prayer.isCurrent
                        ? "#FAFAFA"
                        : prayer.isMissed
                          ? "rgba(255,76,110,0.5)"
                          : "rgba(255,255,255,0.32)",
                  textDecorationLine: prayer.completed
                    ? "line-through"
                    : "none",
                  letterSpacing: 0.3,
                }}
              >
                {prayer.name}
              </Text>
              {subtitle && (
                <Text
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 10,
                    color: isWhite
                      ? prayer.isCurrent
                        ? aura.primary
                        : prayer.isMissed
                          ? "#C0392B"
                          : WHITE_THEME.textTertiary
                      : subtitleColor,
                    marginTop: 3,
                    letterSpacing: 0.3,
                  }}
                >
                  {subtitle}
                </Text>
              )}
            </View>

            {/* Time + badge */}
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 14,
                  color: isWhite
                    ? prayer.completed
                      ? WHITE_THEME.textFaint
                      : prayer.isCurrent
                        ? aura.primary
                        : prayer.isMissed
                          ? "#C0392B"
                          : WHITE_THEME.textTertiary
                    : prayer.completed
                      ? "rgba(255,255,255,0.22)"
                      : prayer.isCurrent
                        ? aura.primary
                        : prayer.isMissed
                          ? "rgba(255,76,110,0.35)"
                          : "rgba(255,255,255,0.18)",
                  fontVariant: ["tabular-nums"],
                  letterSpacing: 0.5,
                }}
              >
                {prayer.time}
              </Text>
              {prayer.isCurrent && !prayer.completed && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 3,
                    marginTop: 3,
                  }}
                >
                  <Clock size={8} color={`${aura.primary}50`} strokeWidth={2} />
                  <Text
                    style={{
                      fontFamily: "Montserrat_300Light",
                      fontSize: 8,
                      color: `${aura.primary}50`,
                    }}
                  >
                    NOW
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Celebration banner when all prayers completed
const AllCompleteBanner = memo(function AllCompleteBanner({ isWhite, animateOnMount = true }) {
  const scale = useSharedValue(animateOnMount ? 0.8 : 1);
  const glow = useSharedValue(0);
  const sparkle = useSharedValue(0);

  useEffect(() => {
    if (animateOnMount) {
      scale.value = withSpring(1, { damping: 10, stiffness: 80 });
    } else {
      scale.value = 1;
    }
    glow.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    sparkle.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [animateOnMount]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkle.value,
    transform: [{ scale: 0.8 + sparkle.value * 0.2 }],
  }));

  return (
    <Animated.View
      style={[
        {
          marginBottom: 12,
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: isWhite ? "rgba(0,150,100,0.15)" : "rgba(76,175,80,0.2)",
          ...SHADOWS.glow(
            isWhite ? "rgba(0,150,100,0.08)" : "rgba(76,175,80,0.15)",
          ),
        },
        scaleStyle,
      ]}
    >
      <LinearGradient
        colors={
          isWhite
            ? [
              "rgba(0,180,120,0.07)",
              "rgba(0,160,130,0.04)",
              "rgba(245,250,248,0.9)",
            ]
            : [
              "rgba(76,175,80,0.08)",
              "rgba(212,175,55,0.04)",
              "rgba(8,8,20,0.65)",
            ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical: 16,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <Animated.View
          style={[
            { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
            glowStyle,
          ]}
        >
          <LinearGradient
            colors={
              isWhite
                ? [
                  "rgba(0,180,120,0.12)",
                  "rgba(0,160,130,0.06)",
                  "transparent",
                ]
                : ["rgba(76,175,80,0.2)", "rgba(212,175,55,0.1)", "transparent"]
            }
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
        <Animated.View style={sparkleStyle}>
          <Trophy
            size={18}
            color={isWhite ? "#00A878" : "#4CAF50"}
            strokeWidth={2}
          />
        </Animated.View>
        <Text
          style={{
            fontFamily: "Montserrat_600SemiBold",
            fontSize: 12,
            color: isWhite ? "#00A878" : "#4CAF50",
            letterSpacing: 1.5,
          }}
        >
          ALL PRAYERS COMPLETED
        </Text>
        <Text style={{ fontSize: 16 }}>✨</Text>
      </LinearGradient>
    </Animated.View>
  );
});

export const PrayersList = memo(function PrayersList({
  prayers,
  onToggleComplete,
  isWhite,
  animateOnMount = true,
}) {
  const [minuteTick, setMinuteTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMinuteTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const done = prayers.filter((p) => p.completed).length;
  const allDone = done === prayers.length && prayers.length > 0;
  const prayerStates = useMemo(() => getPrayerStates(prayers), [prayers, minuteTick]);
  const labelC = isWhite ? WHITE_THEME.textSub : "rgba(212,175,55,0.5)";
  const lineC = isWhite ? WHITE_THEME.gold : "rgba(212,175,55,0.5)";
  const countC = isWhite ? WHITE_THEME.textMuted : "rgba(255,255,255,0.2)";

  return (
    <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
      {/* Section header */}
      <Animated.View
        entering={animateOnMount ? FadeInDown.delay(180).duration(400) : undefined}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          paddingHorizontal: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <LinearGradient
            colors={[lineC, "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ height: 1, width: 16 }}
          />
          <Text
            style={{
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 10,
              color: labelC,
              letterSpacing: 3,
            }}
          >
            TODAY'S PRAYERS
          </Text>
          <LinearGradient
            colors={["transparent", lineC]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ height: 1, width: 16 }}
          />
        </View>
        <View
          style={{
            backgroundColor: allDone
              ? isWhite
                ? "rgba(0,168,120,0.10)"
                : "rgba(76,175,80,0.12)"
              : isWhite
                ? "rgba(0,0,0,0.04)"
                : "rgba(255,255,255,0.04)",
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderWidth: allDone ? 0.5 : 0,
            borderColor: allDone
              ? isWhite
                ? "rgba(0,168,120,0.2)"
                : "rgba(76,175,80,0.2)"
              : "transparent",
          }}
        >
          <Text
            style={{
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 11,
              color: allDone ? (isWhite ? "#00A878" : "#4CAF50") : countC,
            }}
          >
            {done}/{prayers.length}
          </Text>
        </View>
      </Animated.View>

      {/* Celebration banner */}
      {allDone && <AllCompleteBanner isWhite={isWhite} animateOnMount={animateOnMount} />}

      {/* Prayer rows */}
      {prayerStates.map((prayer, i) => (
        <PrayerRow
          key={prayer.name}
          prayer={prayer}
          index={i}
          onToggleComplete={onToggleComplete}
          isWhite={isWhite}
        />
      ))}
    </View>
  );
});
