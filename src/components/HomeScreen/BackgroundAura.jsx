import { useEffect, memo } from "react";
import { Dimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const { width: SW, height: SH } = Dimensions.get("window");

function SmoothOrb({ color, size, style, animStyle }) {
  return (
    <Animated.View style={[{
      position: "absolute", width: size, height: size,
    }, style, animStyle]}>
      <LinearGradient
        colors={[`${color}`, `${color}80`, `${color}30`, `${color}08`, "transparent"]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    </Animated.View>
  );
}

// Tiny twinkling star
function TwinkleStar({ top, left, delay, size = 2 }) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withSequence(
      withTiming(0.6, { duration: 1500 + Math.random() * 1000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: 1500 + Math.random() * 1000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
  }, [delay]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[{
      position: "absolute", top, left,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: "rgba(255,255,255,0.8)",
      shadowColor: "#fff", shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5, shadowRadius: 3,
    }, style]} />
  );
}

export const BackgroundAura = memo(function BackgroundAura({ aura }) {
  // 7 orbs + drift animations
  const o1 = useSharedValue(0.4);
  const o2 = useSharedValue(0.25);
  const o3 = useSharedValue(0.3);
  const o4 = useSharedValue(0.15);
  const o5 = useSharedValue(0.1);
  const o6 = useSharedValue(0.08);
  const o7 = useSharedValue(0.12);
  const dx1 = useSharedValue(0);
  const dy1 = useSharedValue(0);
  const dx2 = useSharedValue(0);
  const dy2 = useSharedValue(0);
  const dx3 = useSharedValue(0);
  const dy3 = useSharedValue(0);
  const dx4 = useSharedValue(0);
  const dy4 = useSharedValue(0);
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);

  useEffect(() => {
    // Orb 1 — primary, large, top — refined subtlety
    o1.value = withRepeat(withSequence(
      withTiming(0.45, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.18, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);
    dx1.value = withRepeat(withSequence(
      withTiming(30, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      withTiming(-30, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);
    dy1.value = withRepeat(withSequence(
      withTiming(-20, { duration: 16000, easing: Easing.inOut(Easing.sin) }),
      withTiming(20, { duration: 16000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);
    scale1.value = withRepeat(withSequence(
      withTiming(1.08, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.94, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);

    // Orb 2 — secondary, right side
    o2.value = withDelay(2000, withRepeat(withSequence(
      withTiming(0.32, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.10, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    dx2.value = withDelay(1500, withRepeat(withSequence(
      withTiming(-25, { duration: 13000, easing: Easing.inOut(Easing.sin) }),
      withTiming(25, { duration: 13000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    dy2.value = withDelay(2500, withRepeat(withSequence(
      withTiming(18, { duration: 15000, easing: Easing.inOut(Easing.sin) }),
      withTiming(-18, { duration: 15000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    scale2.value = withDelay(1000, withRepeat(withSequence(
      withTiming(1.06, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.92, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));

    // Orb 3 — tertiary, bottom-left
    o3.value = withDelay(3500, withRepeat(withSequence(
      withTiming(0.28, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.08, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    dx3.value = withDelay(3000, withRepeat(withSequence(
      withTiming(30, { duration: 15000, easing: Easing.inOut(Easing.sin) }),
      withTiming(-30, { duration: 15000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    dy3.value = withDelay(4000, withRepeat(withSequence(
      withTiming(-22, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      withTiming(22, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    scale3.value = withDelay(2000, withRepeat(withSequence(
      withTiming(1.1, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.92, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));

    // Orb 4 — accent shimmer, center-top
    o4.value = withDelay(5000, withRepeat(withSequence(
      withTiming(0.20, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.04, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    dx4.value = withDelay(4000, withRepeat(withSequence(
      withTiming(15, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      withTiming(-15, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    dy4.value = withDelay(3000, withRepeat(withSequence(
      withTiming(-10, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      withTiming(10, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));

    // Orb 5 — deep ambient glow
    o5.value = withDelay(2000, withRepeat(withSequence(
      withTiming(0.14, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.03, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));

    // Orb 6 — mid-screen accent
    o6.value = withDelay(6000, withRepeat(withSequence(
      withTiming(0.12, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.02, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));

    // Orb 7 — bottom ambient
    o7.value = withDelay(4000, withRepeat(withSequence(
      withTiming(0.16, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.03, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
  }, [aura]);

  const s1 = useAnimatedStyle(() => ({
    opacity: o1.value,
    transform: [{ translateX: dx1.value }, { translateY: dy1.value }, { scale: scale1.value }],
  }));
  const s2 = useAnimatedStyle(() => ({
    opacity: o2.value,
    transform: [{ translateX: dx2.value }, { translateY: dy2.value }, { scale: scale2.value }],
  }));
  const s3 = useAnimatedStyle(() => ({
    opacity: o3.value,
    transform: [{ translateX: dx3.value }, { translateY: dy3.value }, { scale: scale3.value }],
  }));
  const s4 = useAnimatedStyle(() => ({
    opacity: o4.value,
    transform: [{ translateX: dx4.value }, { translateY: dy4.value }],
  }));
  const s5 = useAnimatedStyle(() => ({ opacity: o5.value }));
  const s6 = useAnimatedStyle(() => ({ opacity: o6.value }));
  const s7 = useAnimatedStyle(() => ({ opacity: o7.value }));

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Orb 1 — primary, large top */}
      <SmoothOrb color={aura.primary} size={SW * 1.3} style={{ top: -SW * 0.55, left: -SW * 0.25 }} animStyle={s1} />
      {/* Orb 2 — secondary, right-mid */}
      <SmoothOrb color={aura.secondary} size={SW * 0.95} style={{ top: SH * 0.1, right: -SW * 0.35 }} animStyle={s2} />
      {/* Orb 3 — tertiary, bottom-left */}
      <SmoothOrb color={aura.tertiary || aura.secondary} size={SW * 0.85} style={{ top: SH * 0.42, left: -SW * 0.3 }} animStyle={s3} />
      {/* Orb 4 — accent shimmer, center-top */}
      <SmoothOrb color={aura.accent || aura.primary} size={SW * 0.55} style={{ top: SH * 0.05, left: SW * 0.2 }} animStyle={s4} />
      {/* Orb 5 — deep ambient glow, bottom-right */}
      <SmoothOrb color={aura.primary} size={SW * 0.65} style={{ top: SH * 0.62, right: -SW * 0.12 }} animStyle={s5} />
      {/* Orb 6 — mid accent */}
      <SmoothOrb color={aura.secondary} size={SW * 0.4} style={{ top: SH * 0.3, left: SW * 0.4 }} animStyle={s6} />
      {/* Orb 7 — bottom ambient */}
      <SmoothOrb color={aura.tertiary || aura.primary} size={SW * 0.7} style={{ top: SH * 0.75, left: -SW * 0.15 }} animStyle={s7} />

      {/* Twinkling stars */}
      <TwinkleStar top={SH * 0.08} left={SW * 0.15} delay={0} size={1.5} />
      <TwinkleStar top={SH * 0.12} left={SW * 0.75} delay={800} size={2} />
      <TwinkleStar top={SH * 0.25} left={SW * 0.55} delay={1600} size={1.5} />
      <TwinkleStar top={SH * 0.35} left={SW * 0.1} delay={2400} size={2} />
      <TwinkleStar top={SH * 0.48} left={SW * 0.85} delay={3200} size={1.5} />
      <TwinkleStar top={SH * 0.55} left={SW * 0.35} delay={4000} size={1} />
      <TwinkleStar top={SH * 0.68} left={SW * 0.65} delay={4800} size={2} />
      <TwinkleStar top={SH * 0.78} left={SW * 0.2} delay={5600} size={1.5} />
      <TwinkleStar top={SH * 0.18} left={SW * 0.42} delay={6400} size={1} />
      <TwinkleStar top={SH * 0.88} left={SW * 0.5} delay={7200} size={1.5} />
    </View>
  );
});
