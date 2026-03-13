import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Crown,
  Check,
  Shield,
  Zap,
  Users,
  Sparkles,
} from "lucide-react-native";
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
  Easing,
} from "react-native-reanimated";
import { SHADOWS } from "@/utils/iqamaTheme";

const { width: SW, height: SH } = Dimensions.get("window");

const FEATURES = [
  { icon: Shield, label: "Squad Accountability System", color: "#D4AF37" },
  { icon: Zap, label: "Smart Focus Mode", color: "#F5C842" },
  { icon: Users, label: "Unlimited Squad Members", color: "#00FFC8" },
  { icon: Crown, label: "Premium Duas & Insights", color: "#D4AF37" },
];

/* ─── Background Orbs (4 orbs) ─── */
function BackgroundOrbs() {
  const o1 = useSharedValue(0.04);
  const o2 = useSharedValue(0.03);
  const o3 = useSharedValue(0.03);
  const o4 = useSharedValue(0.02);
  const dx1 = useSharedValue(0);
  const dy1 = useSharedValue(0);
  const dy2 = useSharedValue(0);
  const dx3 = useSharedValue(0);
  useEffect(() => {
    o1.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.04, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    dx1.value = withRepeat(
      withSequence(
        withTiming(28, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-28, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    dy1.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        withTiming(18, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    o2.value = withDelay(
      2500,
      withRepeat(
        withSequence(
          withTiming(0.14, {
            duration: 7000,
            easing: Easing.inOut(Easing.sin),
          }),
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
          withTiming(15, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-15, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    o3.value = withDelay(
      4000,
      withRepeat(
        withSequence(
          withTiming(0.1, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.02, {
            duration: 8000,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
    dx3.value = withDelay(
      3000,
      withRepeat(
        withSequence(
          withTiming(-20, {
            duration: 11000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(20, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    o4.value = withDelay(
      5500,
      withRepeat(
        withSequence(
          withTiming(0.07, {
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.01, {
            duration: 9000,
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
    transform: [{ translateX: dx1.value }, { translateY: dy1.value }],
  }));
  const a2 = useAnimatedStyle(() => ({
    opacity: o2.value,
    transform: [{ translateY: dy2.value }],
  }));
  const a3 = useAnimatedStyle(() => ({
    opacity: o3.value,
    transform: [{ translateX: dx3.value }],
  }));
  const a4 = useAnimatedStyle(() => ({ opacity: o4.value }));
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 1.1,
            height: SW * 1.1,
            borderRadius: SW * 0.55,
            top: -SW * 0.4,
            left: -SW * 0.2,
          },
          a1,
        ]}
      >
        <LinearGradient
          colors={["#D4AF37", "rgba(212,175,55,0.3)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.55 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 0.7,
            height: SW * 0.7,
            borderRadius: SW * 0.35,
            top: SH * 0.5,
            right: -SW * 0.2,
          },
          a2,
        ]}
      >
        <LinearGradient
          colors={["#D4AF37", "rgba(212,175,55,0.2)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.35 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 0.5,
            height: SW * 0.5,
            borderRadius: SW * 0.25,
            bottom: -SW * 0.1,
            left: -SW * 0.1,
          },
          a3,
        ]}
      >
        <LinearGradient
          colors={["#C9A0DC", "rgba(201,160,220,0.2)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.25 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 0.4,
            height: SW * 0.4,
            borderRadius: SW * 0.2,
            top: SH * 0.25,
            right: SW * 0.1,
          },
          a4,
        ]}
      >
        <LinearGradient
          colors={["#F5C842", "rgba(245,200,66,0.15)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.2 }}
        />
      </Animated.View>
    </View>
  );
}

function TwinklingStar({ x, y, size, delay: d }) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1500 + Math.random() * 1500 }),
          withTiming(0, { duration: 1500 + Math.random() * 1500 }),
        ),
        -1,
        true,
      ),
    );
  }, []);
  const s = useAnimatedStyle(() => ({ opacity: o.value }));
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
          backgroundColor: "#FFFFFF",
        },
        s,
      ]}
    />
  );
}

function GoldParticle({ x, delay: d, size }) {
  const o = useSharedValue(0);
  const ty = useSharedValue(0);
  const tx = useSharedValue(0);
  useEffect(() => {
    o.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.45, { duration: 2500 }),
          withTiming(0, { duration: 2500 }),
        ),
        -1,
        true,
      ),
    );
    ty.value = withDelay(
      d,
      withRepeat(
        withTiming(-SH * 0.35, {
          duration: 9000 + Math.random() * 5000,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
    tx.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(Math.random() * 20 - 10, {
            duration: 3500,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, []);
  const s = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateY: ty.value }, { translateX: tx.value }],
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
          backgroundColor: "#D4AF37",
        },
        s,
      ]}
    />
  );
}

function DiamondAccent({ x, y, delay: d, size = 6 }) {
  const rot = useSharedValue(0);
  const o = useSharedValue(0);
  useEffect(() => {
    rot.value = withDelay(
      d,
      withRepeat(
        withTiming(360, { duration: 8000, easing: Easing.linear }),
        -1,
      ),
    );
    o.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.35, { duration: 2000 }),
          withTiming(0.05, { duration: 2000 }),
        ),
        -1,
        true,
      ),
    );
  }, []);
  const s = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
    opacity: o.value,
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
          backgroundColor: "#D4AF37",
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
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));
  return (
    <Animated.View
      style={[
        { position: "absolute", top: 0, bottom: 0, width: 60, opacity: 0.06 },
        style,
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

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const crownPulse = useSharedValue(1);
  const crownGlow = useSharedValue(0.05);
  const crownGlow2 = useSharedValue(0.03);
  const btnPulse = useSharedValue(1);
  const badgeGlow = useSharedValue(0.3);

  const stars = useMemo(
    () =>
      Array.from({ length: 10 }, () => ({
        x: Math.random() * SW,
        y: Math.random() * SH,
        size: 1 + Math.random() * 1.5,
        delay: Math.random() * 4000,
      })),
    [],
  );
  const goldParticles = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        x: Math.random() * SW,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 5000,
      })),
    [],
  );

  useEffect(() => {
    crownPulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    crownGlow.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    crownGlow2.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(0.2, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.03, {
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
    btnPulse.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    badgeGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const crownStyle = useAnimatedStyle(() => ({
    transform: [{ scale: crownPulse.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: crownGlow.value }));
  const glow2Style = useAnimatedStyle(() => ({ opacity: crownGlow2.value }));
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnPulse.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeGlow.value,
    transform: [{ scale: 0.9 + badgeGlow.value * 0.1 }],
  }));
  const isYearly = selectedPlan === "yearly";

  return (
    <View style={{ flex: 1, backgroundColor: "#080814" }}>
      <StatusBar style="light" />
      <BackgroundOrbs />
      {stars.map((st, i) => (
        <TwinklingStar
          key={`s${i}`}
          x={st.x}
          y={st.y}
          size={st.size}
          delay={st.delay}
        />
      ))}
      {goldParticles.map((p, i) => (
        <GoldParticle key={`g${i}`} x={p.x} size={p.size} delay={p.delay} />
      ))}
      <DiamondAccent x={SW * 0.1} y={SH * 0.15} delay={0} size={5} />
      <DiamondAccent x={SW * 0.88} y={SH * 0.22} delay={1200} size={4} />
      <DiamondAccent x={SW * 0.75} y={SH * 0.78} delay={2400} size={6} />
      <DiamondAccent x={SW * 0.05} y={SH * 0.82} delay={3600} size={4} />

      {/* Fixed header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 12,
        }}
      >
        <ProgressDots current={7} total={9} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
      >
        {/* Crown icon */}
        <Animated.View
          entering={FadeIn.delay(200).duration(800)}
          style={{ alignItems: "center", marginBottom: 20, marginTop: 8 }}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 150,
                height: 150,
                borderRadius: 75,
              },
              glow2Style,
            ]}
          >
            <LinearGradient
              colors={["#F5C842", "rgba(245,200,66,0.15)", "transparent"]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, borderRadius: 75 }}
            />
          </Animated.View>
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 110,
                height: 110,
                borderRadius: 55,
              },
              glowStyle,
            ]}
          >
            <LinearGradient
              colors={["#D4AF37", "rgba(212,175,55,0.3)", "transparent"]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, borderRadius: 55 }}
            />
          </Animated.View>
          <Animated.View
            style={[
              {
                width: 68,
                height: 68,
                borderRadius: 34,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(212,175,55,0.08)",
                borderWidth: 1.5,
                borderColor: "rgba(212,175,55,0.25)",
              },
              crownStyle,
            ]}
          >
            <Crown size={30} color="#D4AF37" strokeWidth={1.5} />
          </Animated.View>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(400).duration(600)}
          style={{
            fontFamily: "PlayfairDisplay_700Bold",
            fontSize: 26,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 36,
            marginBottom: 4,
          }}
        >
          Unlock Your Full{"\n"}Spiritual Journey
        </Animated.Text>
        <Animated.View
          entering={FadeIn.delay(550).duration(600)}
          style={{
            width: 50,
            height: 1,
            alignSelf: "center",
            marginBottom: 4,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={["transparent", "rgba(212,175,55,0.6)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
        <Animated.Text
          entering={FadeInDown.delay(500).duration(500)}
          style={{
            fontFamily: "Montserrat_400Regular",
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Premium features to strengthen your connection
        </Animated.Text>

        {/* Features list */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(600).springify()}
          style={{ marginBottom: 20 }}
        >
          <View
            style={{
              borderRadius: 20,
              overflow: "hidden",
              borderWidth: 0.5,
              borderColor: "rgba(212,175,55,0.12)",
              ...SHADOWS.card,
            }}
          >
            <BlurView
              intensity={18}
              tint="dark"
              style={{ padding: 16, backgroundColor: "rgba(10,10,20,0.3)" }}
            >
              <ShimmerSweep color="#D4AF37" />
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: i < FEATURES.length - 1 ? 12 : 0,
                    }}
                  >
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: `${f.color}10`,
                        borderWidth: 0.5,
                        borderColor: `${f.color}25`,
                      }}
                    >
                      <Icon size={13} color={f.color} strokeWidth={1.5} />
                    </View>
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 13,
                        color: "#FFFFFF",
                        flex: 1,
                      }}
                    >
                      {f.label}
                    </Text>
                    <Check size={13} color="#00FFC8" strokeWidth={2} />
                  </View>
                );
              })}
            </BlurView>
          </View>
        </Animated.View>

        {/* Trial badge — prominent placement above pricing */}
        <Animated.View
          entering={FadeIn.delay(850).duration(500)}
          style={{ alignItems: "center", marginBottom: 14 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 14,
              backgroundColor: "rgba(212,175,55,0.10)",
              borderWidth: 1,
              borderColor: "rgba(212,175,55,0.30)",
            }}
          >
            <Sparkles size={13} color="#D4AF37" strokeWidth={1.5} />
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 12,
                color: "#D4AF37",
                letterSpacing: 0.8,
              }}
            >
              3-DAY FREE TRIAL INCLUDED
            </Text>
          </View>
        </Animated.View>

        {/* ═══ PRICING PLANS — Side by Side ═══ */}
        <Animated.View
          entering={FadeInDown.delay(900).duration(600).springify()}
          style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}
        >
          {/* YEARLY (Big, Highlighted) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPlan("yearly");
            }}
            style={{ flex: 1.5 }}
          >
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: isYearly ? 1.5 : 0.5,
                borderColor: isYearly
                  ? "rgba(212,175,55,0.5)"
                  : "rgba(255,255,255,0.06)",
                ...(isYearly ? SHADOWS.glow("#D4AF37") : {}),
              }}
            >
              <LinearGradient
                colors={
                  isYearly
                    ? ["rgba(212,175,55,0.12)", "rgba(212,175,55,0.03)"]
                    : ["rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"]
                }
                style={{
                  padding: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isYearly && <ShimmerSweep color="#D4AF37" />}
                <Animated.View
                  style={[
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 10,
                      marginBottom: 10,
                      backgroundColor: "rgba(212,175,55,0.12)",
                      borderWidth: 0.8,
                      borderColor: "rgba(212,175,55,0.35)",
                    },
                    badgeStyle,
                  ]}
                >
                  <Sparkles size={10} color="#D4AF37" strokeWidth={1.5} />
                  <Text
                    style={{
                      fontFamily: "Montserrat_600SemiBold",
                      fontSize: 9,
                      color: "#D4AF37",
                      letterSpacing: 0.8,
                    }}
                  >
                    BEST VALUE
                  </Text>
                </Animated.View>
                <Text
                  style={{
                    fontFamily: "PlayfairDisplay_700Bold",
                    fontSize: 30,
                    color: isYearly ? "#D4AF37" : "rgba(255,255,255,0.5)",
                  }}
                >
                  $49.99
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                    marginTop: 2,
                  }}
                >
                  /year
                </Text>
                <View
                  style={{
                    width: 36,
                    height: 1,
                    marginVertical: 8,
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={[
                      "transparent",
                      isYearly
                        ? "rgba(212,175,55,0.4)"
                        : "rgba(255,255,255,0.08)",
                      "transparent",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                  />
                </View>
                <Text
                  style={{
                    fontFamily: "Montserrat_600SemiBold",
                    fontSize: 11,
                    color: isYearly ? "#00FFC8" : "rgba(255,255,255,0.7)",
                  }}
                >
                  65% OFF
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.7)",
                    marginTop: 2,
                  }}
                >
                  $0.96/week
                </Text>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    marginTop: 10,
                    borderWidth: 1.5,
                    borderColor: isYearly ? "#D4AF37" : "rgba(255,255,255,0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isYearly
                      ? "rgba(212,175,55,0.15)"
                      : "transparent",
                  }}
                >
                  {isYearly && (
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 4.5,
                        backgroundColor: "#D4AF37",
                      }}
                    />
                  )}
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>

          {/* WEEKLY (Compact) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPlan("weekly");
            }}
            style={{ flex: 0.6, alignSelf: "stretch" }}
          >
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                flex: 1,
                borderWidth: !isYearly ? 1.5 : 0.5,
                borderColor: !isYearly
                  ? "rgba(184,134,11,0.35)"
                  : "rgba(255,255,255,0.06)",
                ...(!isYearly ? SHADOWS.glow("#B8860B") : {}),
              }}
            >
              <View
                style={{
                  flex: 1,
                  padding: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: !isYearly
                    ? "rgba(184,134,11,0.04)"
                    : "rgba(255,255,255,0.02)",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Montserrat_600SemiBold",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.65)",
                    letterSpacing: 1.5,
                    marginBottom: 10,
                  }}
                >
                  WEEKLY
                </Text>
                <Text
                  style={{
                    fontFamily: "PlayfairDisplay_700Bold",
                    fontSize: 24,
                    color: !isYearly ? "#B8860B" : "rgba(255,255,255,0.7)",
                  }}
                >
                  $2.99
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                    marginTop: 2,
                  }}
                >
                  /week
                </Text>
                <View
                  style={{
                    width: 28,
                    height: 1,
                    marginVertical: 8,
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={[
                      "transparent",
                      !isYearly
                        ? "rgba(184,134,11,0.3)"
                        : "rgba(255,255,255,0.06)",
                      "transparent",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                  />
                </View>
                <Text
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  $155/yr
                </Text>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    marginTop: 10,
                    borderWidth: 1.5,
                    borderColor: !isYearly
                      ? "#B8860B"
                      : "rgba(255,255,255,0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: !isYearly
                      ? "rgba(184,134,11,0.15)"
                      : "transparent",
                  }}
                >
                  {!isYearly && (
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 4.5,
                        backgroundColor: "#B8860B",
                      }}
                    />
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* Fixed bottom CTA */}
      <Animated.View
        entering={FadeInUp.delay(1300).duration(500)}
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 16,
          paddingTop: 8,
        }}
      >
        <Animated.View style={btnStyle}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              router.push("/onboarding/squad-link");
            }}
            style={{
              borderRadius: 18,
              overflow: "hidden",
              ...SHADOWS.glow(isYearly ? "#D4AF37" : "#B8860B"),
            }}
          >
            <LinearGradient
              colors={
                isYearly ? ["#D4AF37", "#B8860B"] : ["#B8860B", "#8B6914"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 56,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 14,
                  color: isYearly ? "#050510" : "#FFFFFF",
                  letterSpacing: 0.3,
                }}
              >
                {isYearly
                  ? "Start My Yearly Spiritual Journey"
                  : "Start Weekly Plan"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity
          onPress={() => router.push("/onboarding/squad-link")}
          style={{ alignItems: "center", marginTop: 12 }}
        >
          <Text
            style={{
              fontFamily: "Montserrat_400Regular",
              fontSize: 13,
              color: "rgba(255,255,255,0.50)",
            }}
          >
            Maybe later
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: "Montserrat_400Regular",
            fontSize: 10,
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Cancel anytime. No commitment required.
        </Text>
      </Animated.View>
    </View>
  );
}
