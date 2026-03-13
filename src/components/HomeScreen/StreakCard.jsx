import { useEffect } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { WHITE_THEME } from "@/utils/iqamaTheme";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { SHADOWS } from "@/utils/iqamaTheme";

// Animated number that counts up
function AnimatedCounter({ value, isWhite }) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 80 }));
    opacity.value = withDelay(300, withTiming(1, { duration: 500 }));
  }, [value]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        {
          fontFamily: "Montserrat_700Bold",
          fontSize: 30,
          color: isWhite ? WHITE_THEME.text : "#FAFAFA",
          textShadowColor: isWhite
            ? "rgba(184,134,11,0.15)"
            : "rgba(255,140,0,0.20)",
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: isWhite ? 0 : 8,
        },
        style,
      ]}
    >
      {value} {value === 1 ? "day" : "days"}
    </Animated.Text>
  );
}

// Celebration burst particles
function CelebrationBurst({ active }) {
  const particles = [0, 1, 2, 3, 4, 5];
  return active ? (
    <View style={{ position: "absolute", top: 10, right: 20 }}>
      {particles.map((i) => (
        <CelebrationParticle key={i} index={i} />
      ))}
    </View>
  ) : null;
}

function CelebrationParticle({ index }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const angle = (index / 6) * Math.PI * 2;
    const dist = 20 + Math.random() * 15;
    opacity.value = withDelay(
      index * 100,
      withSequence(
        withTiming(0.8, { duration: 300 }),
        withTiming(0, { duration: 800 }),
      ),
    );
    translateX.value = withDelay(
      index * 100,
      withTiming(Math.cos(angle) * dist, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    );
    translateY.value = withDelay(
      index * 100,
      withTiming(Math.sin(angle) * dist, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    );
    scale.value = withDelay(
      index * 100,
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 600 }),
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const colors = [
    "#FF8C00",
    "#FFB347",
    "#FFD700",
    "#FF6B35",
    "#FFA500",
    "#FFCC00",
  ];
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors[index % colors.length],
        },
        style,
      ]}
    />
  );
}

export function StreakCard({ currentStreak = 0, streakDays = [], isWhite }) {
  const fireScale = useSharedValue(1);
  const fireRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0.05);
  const progressWidth = useSharedValue(0);
  const cardScale = useSharedValue(0.95);

  const milestones = [7, 30, 100];
  const nextMilestone = milestones.find((m) => m > currentStreak) || 365;
  const progressPct = Math.min((currentStreak / nextMilestone) * 100, 100);
  const isMilestone = milestones.includes(currentStreak) && currentStreak > 0;

  useEffect(() => {
    cardScale.value = withDelay(
      500,
      withSpring(1, { damping: 12, stiffness: 80 }),
    );

    if (currentStreak > 0) {
      fireScale.value = withRepeat(
        withSequence(
          withTiming(1.25, {
            duration: 700,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
      fireRotate.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 500, easing: Easing.inOut(Easing.sin) }),
          withTiming(4, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.25, {
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.03, {
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      );
    }
    progressWidth.value = withDelay(
      600,
      withTiming(progressPct, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [currentStreak]);

  const fireStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fireScale.value },
      { rotate: `${fireRotate.value}deg` },
    ],
  }));
  const bgGlow = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const barStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));
  const cardEntrance = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(600).duration(600).springify().damping(14)}
      style={[{ paddingHorizontal: 20, marginBottom: 28 }, cardEntrance]}
    >
      <View
        style={{
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: isWhite ? 0.8 : 0.5,
          borderColor: isWhite
            ? "rgba(255,140,0,0.18)"
            : "rgba(255,140,0,0.12)",
          ...(isWhite ? WHITE_THEME.cardShadowStrong : SHADOWS.card),
        }}
      >
        {/* ── White theme: ULTRA PREMIUM warm ivory + amber-honey gradient base ── */}
        {isWhite && (
          <LinearGradient
            colors={["#FEFDFB", "#F8F4EC", "rgba(201,162,39,0.06)", "#F5EEE0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
        <BlurView
          intensity={isWhite ? 0 : 20}
          tint={isWhite ? "light" : "dark"}
          style={{
            padding: 22,
            backgroundColor: isWhite ? "transparent" : "rgba(10,10,20,0.50)",
          }}
        >
          {/* Background glow */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: -30,
                right: -30,
                width: 160,
                height: 160,
                borderRadius: 80,
              },
              bgGlow,
            ]}
          >
            <LinearGradient
              colors={["#FF8C00", "rgba(255,140,0,0.3)", "transparent"]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, borderRadius: 80 }}
            />
          </Animated.View>

          {/* Celebration burst at milestones */}
          <CelebrationBurst active={isMilestone} />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Animated.View style={fireStyle}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={[
                    "rgba(255,140,0,0.18)",
                    "rgba(255,140,0,0.06)",
                    "transparent",
                  ]}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "rgba(255,140,0,0.15)",
                  }}
                >
                  <Text style={{ fontSize: 28 }}>🔥</Text>
                </LinearGradient>
              </View>
            </Animated.View>
            <View style={{ flex: 1 }}>
              <AnimatedCounter value={currentStreak} isWhite={isWhite} />
              <Text
                style={{
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 12,
                  color: isWhite
                    ? WHITE_THEME.textSub
                    : "rgba(255,255,255,0.45)",
                  marginTop: 4,
                }}
              >
                {currentStreak > 0
                  ? `${nextMilestone - currentStreak} to ${nextMilestone}-day milestone`
                  : "Start your streak today"}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          {currentStreak > 0 && (
            <View style={{ marginTop: 18 }}>
              <View
                style={{
                  height: 5,
                  backgroundColor: isWhite
                    ? "rgba(0,0,0,0.09)"
                    : "rgba(255,255,255,0.04)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Animated.View
                  style={[{ height: "100%", borderRadius: 3 }, barStyle]}
                >
                  <LinearGradient
                    colors={["#FF8C00", "#FFB347", "#FFD700"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1, borderRadius: 2 }}
                  />
                </Animated.View>
              </View>
              {/* Milestone markers */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 6,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 9,
                    color: isWhite
                      ? WHITE_THEME.textMuted
                      : "rgba(255,255,255,0.22)",
                  }}
                >
                  0
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 9,
                    color: isWhite
                      ? "rgba(180,100,0,0.7)"
                      : "rgba(255,140,0,0.5)",
                  }}
                >
                  {nextMilestone}
                </Text>
              </View>
            </View>
          )}

          {/* Week dots */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 14,
              justifyContent: "center",
            }}
          >
            {["S", "M", "T", "W", "T", "F", "S"].map((label, i) => {
              const done = streakDays[streakDays.length - 7 + i];
              return (
                <Animated.View
                  key={i}
                  entering={FadeInDown.delay(700 + i * 60).duration(300)}
                  style={{ alignItems: "center", gap: 6 }}
                >
                  <Text
                    style={{
                      fontFamily: "Montserrat_400Regular",
                      fontSize: 9,
                      color: isWhite
                        ? WHITE_THEME.textTertiary
                        : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {label}
                  </Text>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    {done ? (
                      <LinearGradient
                        colors={["#FF8C00", "#FFB347"]}
                        style={{
                          flex: 1,
                          borderRadius: 4,
                          shadowColor: "#FF8C00",
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.6,
                          shadowRadius: 4,
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: isWhite
                            ? "rgba(0,0,0,0.11)"
                            : "rgba(255,255,255,0.08)",
                          borderRadius: 4,
                        }}
                      />
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </BlurView>
      </View>
    </Animated.View>
  );
}
