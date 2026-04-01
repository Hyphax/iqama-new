import { useEffect, useMemo, memo } from "react";
import { View, Text, Dimensions } from "react-native";
import Svg, {
  Circle as SvgCircle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
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
import { PRAYER_AURA, SHADOWS } from "@/utils/iqamaTheme";
import { ShimmerSweep } from "@/components/ShimmerSweep";
import { CountdownTimer } from "./CountdownTimer";

const { width: SW } = Dimensions.get("window");
const RING_SIZE = SW * 0.46;
const STROKE = 3.5;
const RADIUS = (RING_SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

// Floating particle dot with more dramatic movement
const FloatingDot = memo(function FloatingDot({
  color,
  delay,
  top,
  left,
  size = 3,
  drift = 15,
  animateOnMount = true,
}) {
  const opacity = useSharedValue(animateOnMount ? 0 : 0.5);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(animateOnMount ? 0.5 : 1);

  useEffect(() => {
    const opacityLoop = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    const translateYLoop = withRepeat(
      withSequence(
        withTiming(-drift, {
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(drift, {
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      true,
    );
    const translateXLoop = withRepeat(
      withSequence(
        withTiming(drift * 0.6, {
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(-drift * 0.6, {
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      true,
    );
    const scaleLoop = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    opacity.value = animateOnMount ? withDelay(delay, opacityLoop) : opacityLoop;
    translateY.value = animateOnMount ? withDelay(delay, translateYLoop) : translateYLoop;
    translateX.value = animateOnMount ? withDelay(delay + 500, translateXLoop) : translateXLoop;
    scale.value = animateOnMount ? withDelay(delay, scaleLoop) : scaleLoop;
  }, [animateOnMount, delay, drift]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: size * 2,
        },
        style,
      ]}
    />
  );
});

export const NextPrayerCard = memo(function NextPrayerCard({
  prayerName,
  prayerTime,
  nextPrayerObj,
  totalInterval,
  rakats,
  isWhite,
  animateOnMount = true,
}) {
  const pulse = useSharedValue(1);
  const innerGlow = useSharedValue(0.15);
  const borderGlow = useSharedValue(0.06);
  const ringRotate = useSharedValue(0);
  const outerRingScale = useSharedValue(1);
  const outerRing2Scale = useSharedValue(1);
  const labelOpacity = useSharedValue(animateOnMount ? 0.5 : 0.9);
  const progressAnim = useSharedValue(CIRCUMFERENCE);
  const urgencyPulse = useSharedValue(0);
  const cardScale = useSharedValue(animateOnMount ? 0.95 : 1);
  const nameScale = useSharedValue(animateOnMount ? 0.8 : 1);

  const aura = PRAYER_AURA[prayerName] || PRAYER_AURA.Asr;

  // Calculate real progress based on time remaining
  useEffect(() => {
    const updateProgress = () => {
      if (!nextPrayerObj) return;
      const now = new Date();
      const ts = nextPrayerObj.time || "00:00 AM";
      const [time, period] = ts.split(" ");
      const [th, tm] = time.split(":").map(Number);
      let hrs = th;
      if (period === "PM" && th !== 12) hrs += 12;
      if (period === "AM" && th === 12) hrs = 0;
      const target = new Date();
      target.setHours(hrs, tm, 0, 0);
      if (target < now) target.setDate(target.getDate() + 1);
      const diff = target - now;
      const totalMs = totalInterval || 6 * 60 * 60 * 1000;
      const pct = Math.max(0, Math.min(1, 1 - diff / totalMs));
      const offset = CIRCUMFERENCE * (1 - pct);
      progressAnim.value = withTiming(offset, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });

      // Urgency mode when < 15 min
      const minutesLeft = diff / 60000;
      if (minutesLeft < 15) {
        urgencyPulse.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 500, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 500, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        );
      } else {
        urgencyPulse.value = withTiming(0, { duration: 300 });
      }
    };
    updateProgress();
    const i = setInterval(updateProgress, 30000);
    return () => clearInterval(i);
  }, [nextPrayerObj, totalInterval]);

  useEffect(() => {
    if (animateOnMount) {
      cardScale.value = withSpring(1, { damping: 12, stiffness: 80 });
      nameScale.value = withDelay(
        300,
        withSpring(1, { damping: 10, stiffness: 90 }),
      );
    } else {
      cardScale.value = 1;
      nameScale.value = 1;
    }

    // Gentle pulse on the ring
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    // Inner glow breathe
    innerGlow.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    // Border glow breathe
    const borderLoop = withRepeat(
      withSequence(
        withTiming(0.25, {
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0.04, {
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      true,
    );
    borderGlow.value = animateOnMount ? withDelay(500, borderLoop) : borderLoop;
    // Slow ring rotation
    ringRotate.value = withRepeat(
      withTiming(360, { duration: 50000, easing: Easing.linear }),
      -1,
      false,
    );
    // Outer ring breathe
    outerRingScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.96, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    // Second outer ring — offset phase
    const outerRing2Loop = withRepeat(
      withSequence(
        withTiming(1.08, {
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0.94, {
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      true,
    );
    outerRing2Scale.value = animateOnMount
      ? withDelay(2000, outerRing2Loop)
      : outerRing2Loop;
    // Label shimmer
    labelOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [animateOnMount]);

  const cardEntrance = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: innerGlow.value }));
  const borderStyle = useAnimatedStyle(() => ({ opacity: borderGlow.value }));
  const ringRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotate.value}deg` }],
  }));
  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: outerRingScale.value }],
    opacity: 0.25,
  }));
  const outerRing2Style = useAnimatedStyle(() => ({
    transform: [{ scale: outerRing2Scale.value }],
    opacity: 0.12,
  }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: labelOpacity.value }));
  const nameEntrance = useAnimatedStyle(() => ({
    transform: [{ scale: nameScale.value }],
  }));
  const urgencyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(urgencyPulse.value, [0, 1], [0, 0.3]),
    transform: [{ scale: interpolate(urgencyPulse.value, [0, 1], [1, 1.15]) }],
  }));

  const progressProps = useAnimatedProps(() => ({
    strokeDashoffset: progressAnim.value,
  }));

  const prayerRakats = rakats || {};
  const fard = prayerRakats.fard || 0;
  const sunnah = (prayerRakats.sunnah || 0) + (prayerRakats.sunnahAfter || 0);

  return (
    <Animated.View
      style={[{ paddingHorizontal: 20, marginBottom: 20 }, cardEntrance]}
    >
      {/* Main glassmorphic card */}
      <View
        style={{ borderRadius: 32, overflow: "hidden", ...SHADOWS.elevated }}
      >
        {/* Animated border glow */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: -1,
              left: -1,
              right: -1,
              bottom: -1,
              borderRadius: 33,
              borderWidth: 1.5,
              borderColor: aura.primary,
            },
            borderStyle,
          ]}
        />

        {/* ── White theme: ULTRA PREMIUM warm ivory gradient base ── */}
        {isWhite && (
          <LinearGradient
            colors={["#FEFDFB", "#F8F4EC", `${aura.primary}10`, "#F5EEE0"]}
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
          intensity={isWhite ? 0 : 25}
          tint={isWhite ? "light" : "dark"}
          style={{
            padding: 22,
            paddingTop: 18,
            paddingBottom: 22,
            alignItems: "center",
            backgroundColor: isWhite ? "transparent" : "rgba(8,8,20,0.88)",
          }}
        >
          {/* Shimmer sweep */}
          <ShimmerSweep color={aura.primary} />

          {/* Inner glow — smooth gradient orb */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: -60,
                left: -20,
                width: SW * 0.7,
                height: SW * 0.7,
                borderRadius: SW * 0.35,
              },
              glowStyle,
            ]}
          >
            <LinearGradient
              colors={[`${aura.primary}50`, `${aura.primary}20`, "transparent"]}
              start={{ x: 0.5, y: 0.3 }}
              end={{ x: 0.5, y: 1 }}
              style={{ flex: 1, borderRadius: SW * 0.35 }}
            />
          </Animated.View>

          {/* Second glow orb — bottom right */}
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: -40,
                right: -30,
                width: SW * 0.5,
                height: SW * 0.5,
                borderRadius: SW * 0.25,
              },
              glowStyle,
            ]}
          >
            <LinearGradient
              colors={[
                `${aura.secondary}30`,
                `${aura.secondary}10`,
                "transparent",
              ]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 0.5, y: 0 }}
              style={{ flex: 1, borderRadius: SW * 0.25 }}
            />
          </Animated.View>

          {/* Urgency pulse ring */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 32,
                borderWidth: 2,
                borderColor: "#FF4C6E",
              },
              urgencyStyle,
            ]}
          />

          {/* Floating particles */}
          <FloatingDot
            color={aura.primary}
            delay={0}
            top={15}
            left={25}
            size={3}
            drift={18}
            animateOnMount={animateOnMount}
          />
          <FloatingDot
            color={aura.accent || aura.primary}
            delay={800}
            top={55}
            left={SW * 0.68}
            size={2.5}
            drift={12}
            animateOnMount={animateOnMount}
          />
          <FloatingDot
            color={aura.secondary}
            delay={1600}
            top={95}
            left={40}
            size={2}
            drift={20}
            animateOnMount={animateOnMount}
          />
          <FloatingDot
            color={aura.primary}
            delay={2400}
            top={125}
            left={SW * 0.35}
            size={2.5}
            drift={14}
            animateOnMount={animateOnMount}
          />

          {/* "NEXT PRAYER" label with shimmer */}
          <Animated.Text
            style={[
              {
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 10,
                color: isWhite
                  ? aura.primary
                  : aura.accent || "rgba(255,255,255,0.6)",
                letterSpacing: 5,
                marginBottom: 14,
                opacity: isWhite ? 0.95 : 0.85,
              },
              labelStyle,
            ]}
          >
            ✦ NEXT PRAYER ✦
          </Animated.Text>

          {/* Circular countdown ring */}
          <Animated.View style={[{ marginBottom: 14 }, pulseStyle]}>
            <View
              style={{
                width: RING_SIZE + 40,
                height: RING_SIZE + 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Third outer breathing ring */}
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: RING_SIZE + 38,
                    height: RING_SIZE + 38,
                    borderRadius: (RING_SIZE + 38) / 2,
                    borderWidth: 0.5,
                    borderColor: `${aura.primary}08`,
                  },
                  outerRing2Style,
                ]}
              />

              {/* Outer breathing ring */}
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: RING_SIZE + 28,
                    height: RING_SIZE + 28,
                    borderRadius: (RING_SIZE + 28) / 2,
                    borderWidth: 1,
                    borderColor: `${aura.primary}18`,
                  },
                  outerRingStyle,
                ]}
              />

              {/* Second outer ring */}
              <View
                style={{
                  position: "absolute",
                  width: RING_SIZE + 14,
                  height: RING_SIZE + 14,
                  borderRadius: (RING_SIZE + 14) / 2,
                  borderWidth: 0.5,
                  borderColor: `${aura.primary}0C`,
                }}
              />

              {/* Rotating gradient ring with REAL progress */}
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: RING_SIZE,
                    height: RING_SIZE,
                  },
                  ringRotateStyle,
                ]}
              >
                <Svg
                  width={RING_SIZE}
                  height={RING_SIZE}
                  style={{
                    transform: [{ rotate: "-90deg" }],
                  }}
                >
                  <Defs>
                    <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                      <Stop
                        offset="0"
                        stopColor={aura.ringColors?.[0] || aura.primary}
                        stopOpacity="1"
                      />
                      <Stop
                        offset="0.5"
                        stopColor={aura.ringColors?.[1] || aura.secondary}
                        stopOpacity="0.7"
                      />
                      <Stop
                        offset="1"
                        stopColor={aura.ringColors?.[0] || aura.primary}
                        stopOpacity="0.3"
                      />
                    </SvgGradient>
                    <SvgGradient id="trackGrad" x1="0" y1="0" x2="1" y2="1">
                      <Stop
                        offset="0"
                        stopColor={
                          isWhite
                            ? "rgba(0,0,0,0.08)"
                            : "rgba(255,255,255,0.06)"
                        }
                        stopOpacity="1"
                      />
                      <Stop
                        offset="1"
                        stopColor={
                          isWhite
                            ? "rgba(0,0,0,0.03)"
                            : "rgba(255,255,255,0.02)"
                        }
                        stopOpacity="1"
                      />
                    </SvgGradient>
                  </Defs>
                  {/* Track */}
                  <SvgCircle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    stroke="url(#trackGrad)"
                    strokeWidth={STROKE}
                    fill="none"
                  />
                  {/* Animated progress arc */}
                  <AnimatedCircle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    stroke="url(#ringGrad)"
                    strokeWidth={STROKE}
                    fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    animatedProps={progressProps}
                    strokeLinecap="round"
                  />
                </Svg>
              </Animated.View>

              {/* Center content */}
              <Animated.View style={[{ alignItems: "center" }, nameEntrance]}>
                <Text
                  style={{
                    fontFamily: "PlayfairDisplay_700Bold",
                    fontSize: 38,
                    color: isWhite ? "#1C1308" : "#FAFAFA",
                    marginBottom: 4,
                    letterSpacing: -0.5,
                  }}
                >
                  {prayerName}
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 16,
                    color: isWhite
                      ? "rgba(5,5,16,0.85)"
                      : "rgba(255,255,255,0.80)",
                    letterSpacing: 2,
                  }}
                >
                  {prayerTime}
                </Text>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Countdown */}
          <CountdownTimer
            nextPrayerObj={nextPrayerObj}
            accentColor={aura.primary}
            isWhite={isWhite}
          />

          {/* Gradient divider */}
          <LinearGradient
            colors={[
              `${aura.primary}00`,
              `${aura.primary}35`,
              `${aura.primary}00`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: "70%", height: 1, marginVertical: 14 }}
          />

          {/* Rakat info */}
          {fard > 0 && (
            <Animated.View
              entering={animateOnMount ? FadeInDown.delay(600).duration(500).springify() : undefined}
              style={{
                flexDirection: "row",
                gap: 28,
                justifyContent: "center",
              }}
            >
              {sunnah > 0 && (
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontFamily: "Montserrat_700Bold",
                      fontSize: 22,
                      color: isWhite
                        ? "#1A1409"
                        : "rgba(255,255,255,0.85)",
                    }}
                  >
                    {sunnah}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Montserrat_300Light",
                      fontSize: 8,
                      color: isWhite
                        ? "rgba(5,5,16,0.65)"
                        : "rgba(255,255,255,0.25)",
                      letterSpacing: 3,
                      marginTop: 3,
                    }}
                  >
                    SUNNAH
                  </Text>
                </View>
              )}
              {sunnah > 0 && (
                <View style={{ width: 1, height: 36, overflow: "hidden" }}>
                  <LinearGradient
                    colors={["transparent", `${aura.primary}20`, "transparent"]}
                    style={{ flex: 1 }}
                  />
                </View>
              )}
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Montserrat_700Bold",
                    fontSize: 22,
                    color: aura.primary,
                    textShadowColor: `${aura.primary}20`,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 4,
                  }}
                >
                  {fard}
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 8,
                    color: `${aura.primary}80`,
                    letterSpacing: 3,
                    marginTop: 3,
                  }}
                >
                  FARD
                </Text>
              </View>
              {(prayerRakats.witr || 0) > 0 && (
                <>
                  <View style={{ width: 1, height: 36, overflow: "hidden" }}>
                    <LinearGradient
                      colors={[
                        "transparent",
                        `${aura.primary}20`,
                        "transparent",
                      ]}
                      style={{ flex: 1 }}
                    />
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontFamily: "Montserrat_700Bold",
                        fontSize: 22,
                        color: isWhite
                          ? "#1A1409"
                          : "rgba(255,255,255,0.85)",
                      }}
                    >
                      {prayerRakats.witr}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Montserrat_300Light",
                        fontSize: 8,
                        color: isWhite
                          ? "rgba(5,5,16,0.65)"
                          : "rgba(255,255,255,0.25)",
                        letterSpacing: 3,
                        marginTop: 3,
                      }}
                    >
                      WITR
                    </Text>
                  </View>
                </>
              )}
            </Animated.View>
          )}
        </BlurView>
      </View>
    </Animated.View>
  );
});
