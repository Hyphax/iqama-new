import { useState, useEffect, useMemo } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowRight, AlertTriangle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GoldGradientButton from "@/components/GoldGradientButton";
import { SHADOWS } from "@/utils/iqamaTheme";

const { width: SW, height: SH } = Dimensions.get("window");

function BackgroundOrbs() {
  const o1 = useSharedValue(0.05);
  const o2 = useSharedValue(0.03);
  const dx1 = useSharedValue(0);
  const dy2 = useSharedValue(0);
  useEffect(() => {
    o1.value = withRepeat(
      withSequence(
        withTiming(0.18, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.04, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    dx1.value = withRepeat(
      withSequence(
        withTiming(22, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-22, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    o2.value = withDelay(
      2500,
      withRepeat(
        withSequence(
          withTiming(0.1, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.02, {
            duration: 7000,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
    dy2.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(15, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-15, {
            duration: 10000,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
  }, []);
  const a1 = useAnimatedStyle(() => ({
    opacity: o1.value,
    transform: [{ translateX: dx1.value }],
  }));
  const a2 = useAnimatedStyle(() => ({
    opacity: o2.value,
    transform: [{ translateY: dy2.value }],
  }));
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 1.1,
            height: SW * 1.1,
            borderRadius: SW * 0.55,
            top: -SW * 0.3,
            left: -SW * 0.2,
          },
          a1,
        ]}
      >
        <LinearGradient
          colors={["#FF4C6E", "rgba(255,76,110,0.35)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.55 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 0.6,
            height: SW * 0.6,
            borderRadius: SW * 0.3,
            bottom: SW * 0.1,
            right: -SW * 0.15,
          },
          a2,
        ]}
      >
        <LinearGradient
          colors={["#FF9A5C", "rgba(255,154,92,0.2)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.3 }}
        />
      </Animated.View>
    </View>
  );
}

function RedParticle({ x, delay: d, size }) {
  const o = useSharedValue(0);
  const ty = useSharedValue(0);
  useEffect(() => {
    o.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 2000 }),
          withTiming(0, { duration: 2000 }),
        ),
        -1,
        true,
      ),
    );
    ty.value = withDelay(
      d,
      withRepeat(
        withTiming(-SH * 0.3, {
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
          backgroundColor: "#FF4C6E",
        },
        s,
      ]}
    />
  );
}

function ShimmerSweep({ color }) {
  const tx = useSharedValue(-SW);
  useEffect(() => {
    tx.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(SW, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withDelay(5000, withTiming(-SW, { duration: 0 })),
        ),
        -1,
        false,
      ),
    );
  }, []);
  const s = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));
  return (
    <Animated.View
      style={[
        { position: "absolute", top: 0, bottom: 0, width: 60, opacity: 0.06 },
        s,
      ]}
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

function ProgressDots({ current, total }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 28 : 8,
            height: 6,
            borderRadius: 3,
            backgroundColor: i <= current ? "#D4AF37" : "rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </View>
  );
}

function AnimatedNumber({ target }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = 45;
    const interval = setInterval(() => {
      frame++;
      setDisplay(Math.round((1 - Math.pow(1 - frame / total, 3)) * target));
      if (frame >= total) clearInterval(interval);
    }, 28);
    return () => clearInterval(interval);
  }, [target]);
  return (
    <Text
      style={{
        fontFamily: "PlayfairDisplay_700Bold",
        fontSize: 76,
        color: "#FF4C6E",
        textShadowColor: "rgba(255,76,110,0.5)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 35,
      }}
    >
      {display}
    </Text>
  );
}

export default function ShockingMathScreen() {
  const insets = useSafeAreaInsets();
  const [hours, setHours] = useState(4);
  const [showResult, setShowResult] = useState(false);
  const pulseScale = useSharedValue(1);
  const warningGlow = useSharedValue(0);
  const warningShake = useSharedValue(0);

  const totalHoursYear = hours * 365;
  const daysPerYear = Math.round(totalHoursYear / 24);

  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, () => ({
        x: Math.random() * SW,
        size: 1.5 + Math.random() * 2,
        delay: Math.random() * 4000,
      })),
    [],
  );

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("iqama_scroll_hours");
      if (stored) setHours(parseInt(stored, 10));
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResult(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      warningShake.value = withSequence(
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(-2, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }, 1200);
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    warningGlow.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    return () => clearTimeout(timer);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: warningGlow.value }));
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: warningShake.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#080814" }}>
      <StatusBar style="light" />
      <BackgroundOrbs />
      {particles.map((p, i) => (
        <RedParticle key={i} x={p.x} size={p.size} delay={p.delay} />
      ))}

      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 24 }}>
        <ProgressDots current={4} total={9} />
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={{ alignItems: "center", marginBottom: 16 }}
        >
          <Text
            style={{
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 12,
              color: "rgba(255,255,255,0.65)",
              letterSpacing: 2.5,
              marginBottom: 18,
            }}
          >
            THE MATH
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 30,
                color: "#FFFFFF",
              }}
            >
              {hours}h
            </Text>
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 22,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              ×
            </Text>
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 30,
                color: "#FFFFFF",
              }}
            >
              365
            </Text>
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              days
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "Montserrat_400Regular",
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            = {totalHoursYear.toLocaleString()} hours / year
          </Text>
        </Animated.View>

        {showResult && (
          <>
            <Animated.View
              entering={FadeIn.duration(800)}
              style={{
                width: SW * 0.6,
                height: 1,
                marginVertical: 24,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["transparent", "rgba(255,76,110,0.5)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(200).duration(800).springify()}
              style={[{ alignItems: "center" }, shakeStyle]}
            >
              <Animated.View style={pulseStyle}>
                <View
                  style={{
                    borderRadius: 32,
                    overflow: "hidden",
                    borderWidth: 0.5,
                    borderColor: "rgba(255,76,110,0.25)",
                    ...SHADOWS.card,
                  }}
                >
                  <BlurView
                    intensity={22}
                    tint="dark"
                    style={{
                      paddingHorizontal: 52,
                      paddingVertical: 34,
                      alignItems: "center",
                      backgroundColor: "rgba(10,10,20,0.3)",
                    }}
                  >
                    <ShimmerSweep color="#FF4C6E" />
                    <Animated.View
                      style={[
                        {
                          position: "absolute",
                          top: -20,
                          left: -20,
                          right: -20,
                          bottom: -20,
                          borderRadius: 40,
                        },
                        glowStyle,
                      ]}
                    >
                      <LinearGradient
                        colors={["rgba(255,76,110,0.2)", "transparent"]}
                        style={{ flex: 1, borderRadius: 40 }}
                      />
                    </Animated.View>
                    <AnimatedNumber target={daysPerYear} />
                    <Text
                      style={{
                        fontFamily: "Montserrat_600SemiBold",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.65)",
                        letterSpacing: 2.5,
                        marginTop: 6,
                      }}
                    >
                      DAYS / YEAR
                    </Text>
                  </BlurView>
                </View>
              </Animated.View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(600).duration(600)}
              style={{ marginTop: 32, alignItems: "center" }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <AlertTriangle size={16} color="#FF4C6E" strokeWidth={1.5} />
                <Text
                  style={{
                    fontFamily: "Montserrat_600SemiBold",
                    fontSize: 12,
                    color: "#FF4C6E",
                    letterSpacing: 1.5,
                  }}
                >
                  WAKE UP CALL
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 15,
                  color: "rgba(255,255,255,0.7)",
                  textAlign: "center",
                  lineHeight: 24,
                  paddingHorizontal: 12,
                }}
              >
                You're wasting{" "}
                <Text
                  style={{
                    color: "#FF4C6E",
                    fontFamily: "Montserrat_600SemiBold",
                  }}
                >
                  {daysPerYear} days
                </Text>{" "}
                every year just staring at a screen.{"\n\n"}
                <Text
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  Is this really worth it for your Akhirah?
                </Text>
              </Text>
            </Animated.View>
          </>
        )}
      </View>

      <Animated.View
        entering={FadeInUp.delay(2000).duration(500)}
        style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
      >
        <GoldGradientButton
          title="Show Me The Way"
          icon={ArrowRight}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/onboarding/solution");
          }}
        />
      </Animated.View>
    </View>
  );
}
