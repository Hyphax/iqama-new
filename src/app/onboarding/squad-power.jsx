import { useEffect, useMemo } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowRight, Users, Bell, ShieldCheck } from "lucide-react-native";
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
import Svg, { Circle as SvgCircle, Line } from "react-native-svg";
import GoldGradientButton from "@/components/GoldGradientButton";
import { SHADOWS } from "@/utils/iqamaTheme";

const { width: SW, height: SH } = Dimensions.get("window");

/* ─── Background Orbs (4 orbs, premium drift) ─── */
function BackgroundOrbs() {
  const o1 = useSharedValue(0.05);
  const o2 = useSharedValue(0.04);
  const o3 = useSharedValue(0.03);
  const o4 = useSharedValue(0.02);
  const dx1 = useSharedValue(0);
  const dy2 = useSharedValue(0);
  const dx3 = useSharedValue(0);
  const dy4 = useSharedValue(0);
  useEffect(() => {
    o1.value = withRepeat(
      withSequence(
        withTiming(0.18, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.04, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    dx1.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-25, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    o2.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(0.12, {
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
          withTiming(18, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-18, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    o3.value = withDelay(
      3500,
      withRepeat(
        withSequence(
          withTiming(0.09, {
            duration: 8000,
            easing: Easing.inOut(Easing.sin),
          }),
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
      2500,
      withRepeat(
        withSequence(
          withTiming(-18, {
            duration: 11000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(18, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    o4.value = withDelay(
      5000,
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
    dy4.value = withDelay(
      3500,
      withRepeat(
        withSequence(
          withTiming(12, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-12, {
            duration: 12000,
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
  const a3 = useAnimatedStyle(() => ({
    opacity: o3.value,
    transform: [{ translateX: dx3.value }],
  }));
  const a4 = useAnimatedStyle(() => ({
    opacity: o4.value,
    transform: [{ translateY: dy4.value }],
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
            top: -SW * 0.35,
            right: -SW * 0.25,
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
            bottom: SW * 0.15,
            left: -SW * 0.15,
          },
          a2,
        ]}
      >
        <LinearGradient
          colors={["#6C8EF5", "rgba(108,142,245,0.25)", "transparent"]}
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
            top: SH * 0.4,
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
            width: SW * 0.45,
            height: SW * 0.45,
            borderRadius: SW * 0.225,
            top: SH * 0.15,
            left: SW * 0.55,
          },
          a4,
        ]}
      >
        <LinearGradient
          colors={["#D4AF37", "rgba(212,175,55,0.2)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.225 }}
        />
      </Animated.View>
    </View>
  );
}

/* ─── Twinkling Stars ─── */
function TwinklingStar({ x, y, size, delay: d }) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 1500 + Math.random() * 1500 }),
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

/* ─── Shimmer Sweep ─── */
function ShimmerSweep({ color }) {
  const tx = useSharedValue(-SW);
  useEffect(() => {
    tx.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(SW, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withDelay(6000, withTiming(-SW, { duration: 0 })),
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
        { position: "absolute", top: 0, bottom: 0, width: 60, opacity: 0.05 },
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

/* ─── Diamond Accent ─── */
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
          withTiming(0.3, { duration: 2000 }),
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

/* ─── Floating Particle ─── */
function FloatingParticle({ delay: d, x, size, color }) {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(0);
  const tx = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.35, { duration: 2500 }),
          withTiming(0, { duration: 2500 }),
        ),
        -1,
        true,
      ),
    );
    ty.value = withDelay(
      d,
      withRepeat(
        withTiming(-SH * 0.3, {
          duration: 10000 + Math.random() * 5000,
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
          withTiming(Math.random() * 25 - 12, {
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, []);
  const s = useAnimatedStyle(() => ({
    opacity: opacity.value,
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
          backgroundColor: color,
        },
        s,
      ]}
    />
  );
}

/* ─── Progress Dots ─── */
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

/* ─── Orbiting Nodes SVG Illustration ─── */
function OrbitIllustration() {
  const rot = useSharedValue(0);
  const ping1 = useSharedValue(0);
  const ping2 = useSharedValue(0);
  const ping3 = useSharedValue(0);
  const centerGlow = useSharedValue(0.05);

  useEffect(() => {
    rot.value = withRepeat(
      withTiming(360, { duration: 25000, easing: Easing.linear }),
      -1,
    );
    ping1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 }),
      ),
      -1,
      true,
    );
    ping2.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 }),
        ),
        -1,
        true,
      ),
    );
    ping3.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 }),
        ),
        -1,
        true,
      ),
    );
    centerGlow.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.05, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));
  const p1 = useAnimatedStyle(() => ({
    opacity: ping1.value,
    transform: [{ scale: 1 + ping1.value * 0.6 }],
  }));
  const p2 = useAnimatedStyle(() => ({
    opacity: ping2.value,
    transform: [{ scale: 1 + ping2.value * 0.6 }],
  }));
  const p3 = useAnimatedStyle(() => ({
    opacity: ping3.value,
    transform: [{ scale: 1 + ping3.value * 0.6 }],
  }));
  const glowS = useAnimatedStyle(() => ({ opacity: centerGlow.value }));

  const SIZE = 200;
  const CX = SIZE / 2;
  const R = 72;
  const nodes = [
    { angle: 0, color: "#D4AF37", icon: Bell, pingStyle: p1 },
    { angle: 120, color: "#00FFC8", icon: Users, pingStyle: p2 },
    { angle: 240, color: "#C9A0DC", icon: ShieldCheck, pingStyle: p3 },
  ];

  return (
    <View
      style={{
        width: SIZE,
        height: SIZE,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Center glow */}
      <Animated.View
        style={[
          { position: "absolute", width: 120, height: 120, borderRadius: 60 },
          glowS,
        ]}
      >
        <LinearGradient
          colors={["#D4AF37", "rgba(212,175,55,0.2)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: 60 }}
        />
      </Animated.View>

      {/* Center node */}
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(212,175,55,0.08)",
          borderWidth: 1,
          borderColor: "rgba(212,175,55,0.2)",
          zIndex: 10,
        }}
      >
        <Users size={22} color="#D4AF37" strokeWidth={1.5} />
      </View>

      {/* Orbit ring + nodes */}
      <Animated.View
        style={[
          { position: "absolute", width: SIZE, height: SIZE },
          orbitStyle,
        ]}
      >
        <Svg width={SIZE} height={SIZE}>
          <SvgCircle
            cx={CX}
            cy={CX}
            r={R}
            stroke="rgba(212,175,55,0.08)"
            strokeWidth="0.8"
            fill="none"
            strokeDasharray="4,6"
          />
        </Svg>
        {nodes.map((n, i) => {
          const rad = (n.angle * Math.PI) / 180;
          const nx = CX + R * Math.cos(rad) - 18;
          const ny = CX + R * Math.sin(rad) - 18;
          const Icon = n.icon;
          return (
            <View
              key={i}
              style={{
                position: "absolute",
                left: nx,
                top: ny,
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: n.color,
                  },
                  n.pingStyle,
                ]}
              />
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: `${n.color}15`,
                  borderWidth: 0.8,
                  borderColor: `${n.color}40`,
                }}
              >
                <Icon size={15} color={n.color} strokeWidth={1.5} />
              </View>
            </View>
          );
        })}
      </Animated.View>

      {/* Connection lines (static, behind orbit) */}
      <View style={{ position: "absolute", width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          {nodes.map((n, i) => {
            const rad = (n.angle * Math.PI) / 180;
            return (
              <Line
                key={i}
                x1={CX}
                y1={CX}
                x2={CX + R * Math.cos(rad)}
                y2={CX + R * Math.sin(rad)}
                stroke="rgba(212,175,55,0.06)"
                strokeWidth="0.5"
              />
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

/* ─── Feature Step with shimmer ─── */
function FeatureStep({ icon: Icon, color, title, desc, index }) {
  const iconPulse = useSharedValue(1);
  const glowO = useSharedValue(0.05);
  useEffect(() => {
    iconPulse.value = withDelay(
      index * 300,
      withRepeat(
        withSequence(
          withTiming(1.12, {
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    glowO.value = withDelay(
      index * 300,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.05, {
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
  }, []);
  const iconS = useAnimatedStyle(() => ({
    transform: [{ scale: iconPulse.value }],
  }));
  const glowS = useAnimatedStyle(() => ({ opacity: glowO.value }));

  return (
    <Animated.View
      entering={FadeInDown.delay(800 + index * 150)
        .duration(500)
        .springify()}
    >
      <View
        style={{
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: `${color}18`,
          marginBottom: 12,
          ...SHADOWS.soft,
        }}
      >
        <BlurView
          intensity={18}
          tint="dark"
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 18,
            backgroundColor: "rgba(10,10,20,0.25)",
          }}
        >
          <ShimmerSweep color={color} />
          <View style={{ position: "relative", marginRight: 16 }}>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  left: -6,
                  top: -6,
                  backgroundColor: color,
                },
                glowS,
              ]}
            />
            <Animated.View
              style={[
                {
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: `${color}10`,
                  borderWidth: 0.8,
                  borderColor: `${color}30`,
                },
                iconS,
              ]}
            >
              <Icon size={18} color={color} strokeWidth={1.5} />
            </Animated.View>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 15,
                color: "#FFFFFF",
                marginBottom: 3,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 12,
                color: "rgba(255,255,255,0.60)",
                lineHeight: 18,
              }}
            >
              {desc}
            </Text>
          </View>
        </BlurView>
      </View>
    </Animated.View>
  );
}

/* ─── MAIN SCREEN ─── */
export default function SquadPowerScreen() {
  const insets = useSafeAreaInsets();

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

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, () => ({
        x: Math.random() * SW,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 5000,
        color: Math.random() > 0.5 ? "#D4AF37" : "#6C8EF5",
      })),
    [],
  );

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
      {particles.map((p, i) => (
        <FloatingParticle
          key={`p${i}`}
          x={p.x}
          size={p.size}
          delay={p.delay}
          color={p.color}
        />
      ))}

      <DiamondAccent x={SW * 0.12} y={SH * 0.2} delay={0} size={5} />
      <DiamondAccent x={SW * 0.85} y={SH * 0.3} delay={1500} size={4} />
      <DiamondAccent x={SW * 0.08} y={SH * 0.75} delay={3000} size={5} />

      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 24 }}>
        <ProgressDots current={6} total={9} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={{ alignItems: "center", marginTop: 24, marginBottom: 8 }}
        >
          <Text
            style={{
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 12,
              color: "rgba(255,255,255,0.65)",
              letterSpacing: 2.5,
              marginBottom: 10,
            }}
          >
            SOCIAL ACCOUNTABILITY
          </Text>
          <Text
            style={{
              fontFamily: "PlayfairDisplay_700Bold",
              fontSize: 28,
              color: "#FFFFFF",
              textAlign: "center",
              lineHeight: 38,
            }}
          >
            Your Squad Has{"\n"}Your Back
          </Text>
          <Animated.View
            entering={FadeIn.delay(600).duration(800)}
            style={{ width: 50, height: 1, marginTop: 14, overflow: "hidden" }}
          >
            <LinearGradient
              colors={["transparent", "rgba(212,175,55,0.6)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </Animated.View>

        {/* Orbit illustration */}
        <Animated.View
          entering={FadeIn.delay(400).duration(1000)}
          style={{ alignItems: "center", marginVertical: 20 }}
        >
          <OrbitIllustration />
        </Animated.View>

        {/* Feature steps */}
        <FeatureStep
          icon={Bell}
          color="#D4AF37"
          title="Real-Time Alerts"
          desc="Your squad gets notified if you're scrolling during prayer time"
          index={0}
        />
        <FeatureStep
          icon={Users}
          color="#00FFC8"
          title="Brotherhood Bond"
          desc="Build a circle of friends who hold each other accountable"
          index={1}
        />
        <FeatureStep
          icon={ShieldCheck}
          color="#C9A0DC"
          title="Privacy Shield"
          desc="Only prayer status is shared — your data stays private"
          index={2}
        />
      </View>

      <Animated.View
        entering={FadeInUp.delay(1400).duration(500)}
        style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 28 }}
      >
        <GoldGradientButton
          title="Unlock Squad Power"
          icon={ArrowRight}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/onboarding/paywall");
          }}
        />
      </Animated.View>
    </View>
  );
}
