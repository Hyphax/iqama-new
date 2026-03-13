import { useEffect } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowRight, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withDelay,
  Easing, FadeIn, FadeInDown, FadeInUp,
} from "react-native-reanimated";
import GoldGradientButton from "@/components/GoldGradientButton";
import { SHADOWS } from "@/utils/iqamaTheme";

const { width: SW, height: SH } = Dimensions.get("window");

function Orb({ size, color, top, left, delay, driftX, driftY, durO, durD }) {
  const o = useSharedValue(0.02);
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  useEffect(() => {
    o.value = withDelay(delay, withRepeat(withSequence(
      withTiming(0.16, { duration: durO, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.02, { duration: durO, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    dx.value = withDelay(delay, withRepeat(withSequence(
      withTiming(driftX, { duration: durD, easing: Easing.inOut(Easing.sin) }),
      withTiming(-driftX, { duration: durD, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    dy.value = withDelay(delay + 500, withRepeat(withSequence(
      withTiming(driftY, { duration: durD + 2000, easing: Easing.inOut(Easing.sin) }),
      withTiming(-driftY, { duration: durD + 2000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
  }, []);
  const a = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateX: dx.value }, { translateY: dy.value }] }));
  return (
    <Animated.View style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, top, left }, a]}>
      <LinearGradient colors={[color, color + "40", "transparent"]} start={{ x: 0.5, y: 0.5 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: size / 2 }} />
    </Animated.View>
  );
}

function Star({ x, y, d, sz }) {
  const o = useSharedValue(0);
  const s = useSharedValue(0.2);
  useEffect(() => {
    o.value = withDelay(d, withRepeat(withSequence(
      withTiming(0.9, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    s.value = withDelay(d, withRepeat(withSequence(
      withTiming(1.2, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.2, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
  }, []);
  const a = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ scale: s.value }] }));
  return <Animated.View style={[{ position: "absolute", left: x, top: y, width: sz || 3, height: sz || 3, borderRadius: (sz || 3) / 2, backgroundColor: "#FFF" }, a]} />;
}

function Particle({ x, startY, d, color, sz }) {
  const ty = useSharedValue(0);
  const o = useSharedValue(0);
  const tx = useSharedValue(0);
  useEffect(() => {
    ty.value = withDelay(d, withRepeat(withTiming(-SH * 0.5, { duration: 12000, easing: Easing.linear }), -1, false));
    o.value = withDelay(d, withRepeat(withSequence(withTiming(0.7, { duration: 2500 }), withTiming(0, { duration: 3500 })), -1, false));
    tx.value = withDelay(d, withRepeat(withSequence(
      withTiming(15, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      withTiming(-15, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
  }, []);
  const a = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: ty.value }, { translateX: tx.value }] }));
  return <Animated.View style={[{ position: "absolute", left: x, top: startY, width: sz, height: sz, borderRadius: sz / 2, backgroundColor: color }, a]} />;
}


function NebulaRing({ size, top, left, d, color }) {
  const rot = useSharedValue(0);
  const o = useSharedValue(0.03);
  useEffect(() => {
    rot.value = withDelay(d, withRepeat(withTiming(360, { duration: 40000, easing: Easing.linear }), -1, false));
    o.value = withDelay(d, withRepeat(withSequence(
      withTiming(0.08, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.02, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
  }, []);
  const a = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ rotate: rot.value + "deg" }] }));
  return (
    <Animated.View style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, top, left, borderWidth: 1, borderColor: color }, a]} />
  );
}

function IqamaTitle() {
  const shimmerX = useSharedValue(-SW);
  const glowO = useSharedValue(0.15);
  const hb = useSharedValue(1);
  const outerGlow = useSharedValue(0.05);
  useEffect(() => {
    shimmerX.value = withDelay(800, withRepeat(withSequence(
      withTiming(SW, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      withDelay(4000, withTiming(-SW, { duration: 0 })),
    ), -1, false));
    glowO.value = withRepeat(withSequence(
      withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.08, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);
    hb.value = withDelay(500, withRepeat(withSequence(
      withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.97, { duration: 600, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    outerGlow.value = withRepeat(withSequence(
      withTiming(0.12, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.03, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);
  }, []);
  const shimS = useAnimatedStyle(() => ({ transform: [{ translateX: shimmerX.value }] }));
  const glowS = useAnimatedStyle(() => ({ opacity: glowO.value }));
  const scaleS = useAnimatedStyle(() => ({ transform: [{ scale: hb.value }] }));
  const outerS = useAnimatedStyle(() => ({ opacity: outerGlow.value }));
  return (
    <Animated.View style={[{ alignItems: "center" }, scaleS]}>
      <Animated.View style={[{ position: "absolute", width: 340, height: 160, borderRadius: 80, top: -40 }, outerS]}>
        <LinearGradient colors={["transparent", "rgba(212,175,55,0.08)", "rgba(184,134,11,0.06)", "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1, borderRadius: 80 }} />
      </Animated.View>
      <Animated.View style={[{ position: "absolute", width: 280, height: 110, borderRadius: 55, top: -15 }, glowS]}>
        <LinearGradient colors={["transparent", "rgba(212,175,55,0.3)", "rgba(184,134,11,0.18)", "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1, borderRadius: 55 }} />
      </Animated.View>
      <Text style={{ fontFamily: "Amiri_400Regular", fontSize: 22, color: "rgba(212,175,55,0.5)", marginBottom: 4, letterSpacing: 2 }}>
        {"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650"}
      </Text>
      <View style={{ overflow: "hidden", borderRadius: 8 }}>
        <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 72, color: "#FFFFFF", letterSpacing: 18, textShadowColor: "rgba(212,175,55,0.35)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 35 }}>IQAMA</Text>
        <Animated.View style={[{ position: "absolute", top: 0, bottom: 0, width: 90 }, shimS]}>
          <LinearGradient colors={["transparent", "rgba(255,255,255,0.22)", "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1 }} />
        </Animated.View>
      </View>
      <LinearGradient colors={["transparent", "rgba(212,175,55,0.35)", "rgba(184,134,11,0.25)", "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ width: 220, height: 2, borderRadius: 1, marginTop: 8 }} />
    </Animated.View>
  );
}

function SubWord({ text, d }) {
  return (
    <Animated.Text entering={FadeInDown.delay(d).duration(600).springify()}
      style={{ fontFamily: "Montserrat_300Light", fontSize: 14, color: "rgba(255,255,255,0.7)", letterSpacing: 4 }}>
      {text}
    </Animated.Text>
  );
}

function Dots() {
  return (
    <View style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} style={{ width: i === 0 ? 28 : 8, height: 6, borderRadius: 3, backgroundColor: i === 0 ? "#D4AF37" : "rgba(255,255,255,0.08)" }} />
      ))}
    </View>
  );
}

function AuroraWave({ color, bottom, d }) {
  const o = useSharedValue(0.03);
  const tx = useSharedValue(0);
  useEffect(() => {
    o.value = withDelay(d, withRepeat(withSequence(
      withTiming(0.08, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.02, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    tx.value = withDelay(d, withRepeat(withSequence(
      withTiming(30, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      withTiming(-30, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
  }, []);
  const a = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateX: tx.value }] }));
  return (
    <Animated.View style={[{ position: "absolute", bottom, left: -SW * 0.2, width: SW * 1.4, height: 120, borderRadius: 60 }, a]}>
      <LinearGradient colors={["transparent", color, "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: 60 }} />
    </Animated.View>
  );
}

const STARS = [
  { x: SW * 0.08, y: SH * 0.07, d: 0, sz: 2 }, { x: SW * 0.88, y: SH * 0.1, d: 400, sz: 3 },
  { x: SW * 0.42, y: SH * 0.05, d: 800, sz: 2.5 }, { x: SW * 0.18, y: SH * 0.26, d: 600, sz: 3.5 },
  { x: SW * 0.92, y: SH * 0.33, d: 200, sz: 2.5 }, { x: SW * 0.62, y: SH * 0.6, d: 900, sz: 3 },
  { x: SW * 0.82, y: SH * 0.73, d: 300, sz: 2.5 }, { x: SW * 0.5, y: SH * 0.88, d: 1500, sz: 2.5 },
];
const PARTICLES = [
  { x: SW * 0.12, startY: SH * 0.92, d: 0, color: "rgba(212,175,55,0.5)", sz: 2.5 },
  { x: SW * 0.38, startY: SH * 0.96, d: 2000, color: "rgba(212,175,55,0.4)", sz: 2 },
  { x: SW * 0.62, startY: SH * 0.9, d: 4000, color: "rgba(184,134,11,0.4)", sz: 3 },
  { x: SW * 0.88, startY: SH * 0.94, d: 6000, color: "rgba(212,175,55,0.35)", sz: 2 },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: "#080814" }}>
      <StatusBar style="light" />
      <LinearGradient colors={["#080814", "#080820", "#0A0A2E", "#0D0D28", "#080814"]} locations={[0, 0.2, 0.45, 0.7, 1]} style={StyleSheet.absoluteFill} />
      <AuroraWave color="rgba(212,175,55,0.06)" bottom={SH * 0.15} d={0} />
      <NebulaRing size={SW * 1.2} top={SH * 0.25} left={-SW * 0.1} d={0} color="rgba(212,175,55,0.04)" />
      <NebulaRing size={SW * 0.8} top={SH * 0.35} left={SW * 0.1} d={2000} color="rgba(201,160,220,0.03)" />
      <NebulaRing size={SW * 0.5} top={SH * 0.3} left={SW * 0.25} d={4000} color="rgba(212,175,55,0.03)" />
      <Orb size={SW * 0.95} color="#C9A0DC" top={-SW * 0.35} left={-SW * 0.25} delay={0} driftX={22} driftY={16} durO={6000} durD={10000} />
      <Orb size={SW * 0.65} color="#D4AF37" top={SH * 0.55} left={-SW * 0.18} delay={2000} driftX={16} driftY={22} durO={7000} durD={9000} />
      <Orb size={SW * 0.55} color="#6C8EF5" top={SH * 0.28} left={SW * 0.52} delay={4000} driftX={-20} driftY={14} durO={8000} durD={11000} />
      <Orb size={SW * 0.4} color="#D4AF37" top={SH * 0.12} left={SW * 0.28} delay={1000} driftX={12} driftY={-12} durO={5000} durD={8000} />
      <Orb size={SW * 0.3} color="#FF6B8A" top={SH * 0.7} left={SW * 0.65} delay={5000} driftX={-10} driftY={8} durO={9000} durD={12000} />
      {STARS.map((s, i) => <Star key={"s" + i} x={s.x} y={s.y} d={s.d} sz={s.sz} />)}
      {PARTICLES.map((p, i) => <Particle key={"p" + i} x={p.x} startY={p.startY} d={p.d} color={p.color} sz={p.sz} />)}
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <Animated.View entering={FadeIn.delay(200).duration(800)} style={{ paddingTop: insets.top + 20, paddingHorizontal: 20 }}>
          <Dots />
        </Animated.View>
        <Animated.View entering={FadeIn.delay(400).duration(1000)} style={{ alignItems: "center" }}>
          <IqamaTitle />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 22 }}>
            <SubWord text="YOUR" d={800} />
            <SubWord text="PRAYER" d={950} />
            <SubWord text="COMPANION" d={1100} />
          </View>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(600).duration(700)} style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}>
          <View style={{ borderRadius: 22, overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.06)", marginBottom: 24, ...SHADOWS.soft }}>
            <LinearGradient colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]} style={{ paddingVertical: 20, paddingHorizontal: 22, alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Sparkles size={14} color="rgba(212,175,55,0.5)" strokeWidth={1.5} />
                <Text style={{ fontFamily: "Montserrat_600SemiBold", fontSize: 11, color: "rgba(212,175,55,0.5)", letterSpacing: 3 }}>PREMIUM EXPERIENCE</Text>
                <Sparkles size={14} color="rgba(212,175,55,0.5)" strokeWidth={1.5} />
              </View>
              <Text style={{ fontFamily: "Montserrat_400Regular", fontSize: 14, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 22 }}>
                Build a consistent prayer habit with{"\n"}beautiful tracking and gentle reminders
              </Text>
            </LinearGradient>
          </View>
          <GoldGradientButton title="Begin Your Journey" icon={ArrowRight} onPress={() => router.push("/onboarding/identity")} />
        </Animated.View>
      </View>
    </View>
  );
}