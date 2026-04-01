import { useEffect, memo } from "react";
import { View, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, G, Ellipse } from "react-native-svg";
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

/* ─── Minaret (line-art, fully visible) ─── */
function Minaret({ x, scale = 1, flip = false, color = "#B8960B" }) {
  const w = 64 * scale;
  const h = 210 * scale;
  return (
    <Svg
      width={w}
      height={h}
      viewBox="0 0 64 210"
      style={{
        position: "absolute",
        bottom: 0,
        left: flip ? undefined : x,
        right: flip ? x : undefined,
      }}
    >
      {/* Crescent spire */}
      <Path d="M32 2 L32 10" stroke={color} strokeWidth={1} />
      <Path
        d="M29 5 L32 2 L35 5"
        stroke={color}
        strokeWidth={0.8}
        fill="none"
      />
      {/* Dome */}
      <Path
        d="M32 10 C32 10 22 22 22 30 C22 35 26 39 32 39 C38 39 42 35 42 30 C42 22 32 10 32 10Z"
        stroke={color}
        strokeWidth={1.2}
        fill="none"
      />
      <Circle
        cx={32}
        cy={17}
        r={3}
        stroke={color}
        strokeWidth={0.8}
        fill="none"
      />
      {/* Upper platform */}
      <Path
        d="M21 39 L21 48 L43 48 L43 39"
        stroke={color}
        strokeWidth={1}
        fill="none"
      />
      <Path d="M19 48 L45 48" stroke={color} strokeWidth={1.2} />
      <Path
        d="M18 48 L18 51 L46 51 L46 48"
        stroke={color}
        strokeWidth={0.7}
        fill="none"
      />
      {/* Railing */}
      <Path
        d="M24 39 L24 48 M28 39 L28 48 M32 39 L32 48 M36 39 L36 48 M40 39 L40 48"
        stroke={color}
        strokeWidth={0.5}
      />
      {/* Tower shaft */}
      <Path d="M23 51 L21 148" stroke={color} strokeWidth={1} />
      <Path d="M41 51 L43 148" stroke={color} strokeWidth={1} />
      {/* Windows */}
      <Path
        d="M27 64 C27 59 37 59 37 64 L37 74 L27 74Z"
        stroke={color}
        strokeWidth={0.8}
        fill="none"
      />
      <Path
        d="M27 88 C27 83 37 83 37 88 L37 98 L27 98Z"
        stroke={color}
        strokeWidth={0.8}
        fill="none"
      />
      <Path
        d="M27 112 C27 107 37 107 37 112 L37 122 L27 122Z"
        stroke={color}
        strokeWidth={0.8}
        fill="none"
      />
      {/* Mid bands */}
      <Path d="M22 76 L42 76" stroke={color} strokeWidth={0.6} />
      <Path d="M22 100 L42 100" stroke={color} strokeWidth={0.6} />
      <Path d="M22 124 L42 124" stroke={color} strokeWidth={0.6} />
      {/* Lower platform */}
      <Path d="M17 148 L47 148" stroke={color} strokeWidth={1.2} />
      <Path
        d="M16 148 L16 152 L48 152 L48 148"
        stroke={color}
        strokeWidth={0.7}
        fill="none"
      />
      {/* Base tower */}
      <Path d="M19 152 L17 204" stroke={color} strokeWidth={1} />
      <Path d="M45 152 L47 204" stroke={color} strokeWidth={1} />
      {/* Base arch */}
      <Path
        d="M24 176 C24 168 40 168 40 176 L40 204 L24 204Z"
        stroke={color}
        strokeWidth={0.8}
        fill="none"
      />
      {/* Foundation */}
      <Path d="M14 204 L50 204" stroke={color} strokeWidth={1.4} />
      <Path
        d="M13 204 L13 210 L51 210 L51 204"
        stroke={color}
        strokeWidth={0.7}
        fill="none"
      />
    </Svg>
  );
}

/* ─── Floral corner ornament ─── */
function FloralCorner({ x, bottom, flip = false, color = "#B8960B" }) {
  return (
    <Svg
      width={160}
      height={160}
      viewBox="0 0 160 160"
      style={{
        position: "absolute",
        bottom,
        left: flip ? undefined : x,
        right: flip ? x : undefined,
        transform: [{ scaleX: flip ? -1 : 1 }],
      }}
    >
      {/* Main vine */}
      <Path
        d="M0 160 C20 135 35 110 50 85 C62 62 68 40 82 22"
        stroke={color}
        strokeWidth={1}
        fill="none"
      />
      {/* Branch 1 */}
      <Path
        d="M22 132 C34 126 40 114 34 102"
        stroke={color}
        strokeWidth={0.7}
        fill="none"
      />
      {/* Branch 2 */}
      <Path
        d="M48 86 C64 82 70 68 64 56"
        stroke={color}
        strokeWidth={0.7}
        fill="none"
      />
      {/* Branch 3 */}
      <Path
        d="M68 52 C78 46 82 34 76 24"
        stroke={color}
        strokeWidth={0.6}
        fill="none"
      />

      {/* Flower 1 — 6 petals */}
      <G transform="translate(22,127)">
        {[0, 60, 120, 180, 240, 300].map((r, i) => (
          <Path
            key={i}
            d="M0 0 C4 -8 -4 -8 0 0"
            stroke={color}
            strokeWidth={0.7}
            fill="none"
            transform={`rotate(${r})`}
          />
        ))}
        <Circle
          cx={0}
          cy={0}
          r={2}
          stroke={color}
          strokeWidth={0.6}
          fill="none"
        />
      </G>
      {/* Flower 2 */}
      <G transform="translate(52,82)">
        {[0, 72, 144, 216, 288].map((r, i) => (
          <Path
            key={i}
            d="M0 0 C3.5 -7 -3.5 -7 0 0"
            stroke={color}
            strokeWidth={0.7}
            fill="none"
            transform={`rotate(${r})`}
          />
        ))}
        <Circle
          cx={0}
          cy={0}
          r={1.6}
          stroke={color}
          strokeWidth={0.5}
          fill="none"
        />
      </G>
      {/* Flower 3 */}
      <G transform="translate(70,48)">
        {[0, 90, 180, 270].map((r, i) => (
          <Path
            key={i}
            d="M0 0 C2.5 -5 -2.5 -5 0 0"
            stroke={color}
            strokeWidth={0.6}
            fill="none"
            transform={`rotate(${r})`}
          />
        ))}
        <Circle
          cx={0}
          cy={0}
          r={1.2}
          stroke={color}
          strokeWidth={0.5}
          fill="none"
        />
      </G>
      {/* Small buds */}
      <Circle
        cx={12}
        cy={143}
        r={1.5}
        stroke={color}
        strokeWidth={0.6}
        fill="none"
      />
      <Circle
        cx={36}
        cy={108}
        r={1.2}
        stroke={color}
        strokeWidth={0.5}
        fill="none"
      />
      <Circle
        cx={60}
        cy={64}
        r={1.2}
        stroke={color}
        strokeWidth={0.5}
        fill="none"
      />
      {/* Leaves */}
      <Path
        d="M10 150 C16 144 13 136 8 140"
        stroke={color}
        strokeWidth={0.6}
        fill="none"
      />
      <Path
        d="M32 116 C38 110 35 102 30 106"
        stroke={color}
        strokeWidth={0.6}
        fill="none"
      />
      <Path
        d="M58 72 C64 66 61 58 56 62"
        stroke={color}
        strokeWidth={0.5}
        fill="none"
      />
      {/* Spiral tendril */}
      <Path
        d="M76 26 C80 23 83 28 79 31 C75 34 72 29 76 26"
        stroke={color}
        strokeWidth={0.5}
        fill="none"
      />
    </Svg>
  );
}

/* ─── Geometric Islamic star motif ─── */
function StarMotif({ cx, cy, r = 18, color = "#B8960B", opacity = 0.25 }) {
  const points = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4 - Math.PI / 8;
    const ir = r * 0.42;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + ir * Math.cos(angle + Math.PI / 8);
    const y2 = cy + ir * Math.sin(angle + Math.PI / 8);
    return `${x1},${y1} ${x2},${y2}`;
  }).join(" ");

  return (
    <Svg
      width={r * 2 + 4}
      height={r * 2 + 4}
      viewBox={`${cx - r - 2} ${cy - r - 2} ${r * 2 + 4} ${r * 2 + 4}`}
      style={{ position: "absolute", opacity }}
    >
      <Path d={`M ${points}`} stroke={color} strokeWidth={0.7} fill="none" />
      <Circle
        cx={cx}
        cy={cy}
        r={r * 0.2}
        stroke={color}
        strokeWidth={0.5}
        fill="none"
      />
      <Circle
        cx={cx}
        cy={cy}
        r={r * 0.55}
        stroke={color}
        strokeWidth={0.4}
        fill="none"
      />
    </Svg>
  );
}

/* ─── Soft ambient glow orb ─── */
function WarmOrb({ top, left, size, color, animStyle }) {
  return (
    <Animated.View
      style={[
        { position: "absolute", top, left, width: size, height: size },
        animStyle,
      ]}
    >
      <LinearGradient
        colors={[color, `${color}50`, "transparent"]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    </Animated.View>
  );
}

/* ─── Main exported component ─── */
export const WhiteBackgroundArt = memo(function WhiteBackgroundArt() {
  // Fade in on mount
  const fadeIn = useSharedValue(0);
  // Subtle art breathing
  const artOpacity = useSharedValue(0.32);
  // Warm orb animations
  const orb1 = useSharedValue(0.55);
  const orb2 = useSharedValue(0.35);
  const orb3 = useSharedValue(0.25);
  const orbDx1 = useSharedValue(0);
  const orbDy1 = useSharedValue(0);
  const orbDx2 = useSharedValue(0);
  const orbDy2 = useSharedValue(0);

  useEffect(() => {
    // Container fade in
    fadeIn.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    // Art layer gentle breathing
    artOpacity.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    // Warm orbs
    orb1.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    orb2.value = withDelay(
      3000,
      withRepeat(
        withSequence(
          withTiming(0.55, {
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.22, {
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
    orb3.value = withDelay(
      5000,
      withRepeat(
        withSequence(
          withTiming(0.42, {
            duration: 11000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.15, {
            duration: 11000,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );

    // Orb drift
    orbDx1.value = withRepeat(
      withSequence(
        withTiming(28, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-28, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    orbDy1.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        withTiming(20, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    orbDx2.value = withDelay(
      4000,
      withRepeat(
        withSequence(
          withTiming(-24, {
            duration: 13000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(24, { duration: 13000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    orbDy2.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(18, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-18, {
            duration: 10000,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));
  const artStyle = useAnimatedStyle(() => ({ opacity: artOpacity.value }));
  const orb1Style = useAnimatedStyle(() => ({
    opacity: orb1.value,
    transform: [{ translateX: orbDx1.value }, { translateY: orbDy1.value }],
  }));
  const orb2Style = useAnimatedStyle(() => ({
    opacity: orb2.value,
    transform: [{ translateX: orbDx2.value }, { translateY: orbDy2.value }],
  }));
  const orb3Style = useAnimatedStyle(() => ({ opacity: orb3.value }));

  return (
    <Animated.View
      style={[
        { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
        containerStyle,
      ]}
    >
      {/* ── Base warm ivory canvas ── */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#F7F2E8",
        }}
      />

      {/* ── Layered warm cream gradients ── */}
      <LinearGradient
        colors={["#FBF6EC", "#F7F2E6", "#F2EBD8"]}
        locations={[0, 0.5, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* ── Top golden light wash ── */}
      <LinearGradient
        colors={[
          "rgba(212,160,23,0.13)",
          "rgba(212,160,23,0.04)",
          "transparent",
        ]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: SH * 0.38,
        }}
      />

      {/* ── Bottom warm glow ── */}
      <LinearGradient
        colors={[
          "transparent",
          "rgba(200,140,20,0.06)",
          "rgba(184,120,11,0.10)",
        ]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: SH * 0.35,
        }}
      />

      {/* ── Side vignettes ── */}
      <LinearGradient
        colors={["rgba(180,130,10,0.07)", "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: SW * 0.4,
        }}
      />
      <LinearGradient
        colors={["transparent", "rgba(180,130,10,0.06)"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: SW * 0.4,
        }}
      />

      {/* ── Warm ambient glow orbs ── */}
      <WarmOrb
        top={-SW * 0.25}
        left={-SW * 0.15}
        size={SW * 0.9}
        color="rgba(212,160,30,0.22)"
        animStyle={orb1Style}
      />
      <WarmOrb
        top={SH * 0.32}
        left={SW * 0.45}
        size={SW * 0.7}
        color="rgba(200,140,20,0.16)"
        animStyle={orb2Style}
      />
      <WarmOrb
        top={SH * 0.62}
        left={-SW * 0.1}
        size={SW * 0.65}
        color="rgba(180,120,10,0.12)"
        animStyle={orb3Style}
      />

      {/* ── Decorative Islamic art layer ── */}
      <Animated.View
        style={[
          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
          artStyle,
        ]}
      >
        {/* Left minaret */}
        <Minaret x={-6} scale={1.0} color="#A07818" />
        {/* Right minaret */}
        <Minaret x={0} flip scale={0.9} color="#907010" />

        {/* Bottom-left floral */}
        <FloralCorner x={0} bottom={0} color="#B8960B" />
        {/* Bottom-right floral */}
        <FloralCorner x={0} bottom={0} flip color="#9E8010" />

        {/* Mid-left smaller floral */}
        <FloralCorner x={-24} bottom={SH * 0.18} color="#C8A830" />

        {/* Top-right tiny floral accent */}
        <FloralCorner x={-10} bottom={SH * 0.72} flip color="#B09020" />
      </Animated.View>

      {/* ── Subtle horizontal rule near top ── */}
      <LinearGradient
        colors={["transparent", "rgba(184,134,11,0.15)", "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: "absolute",
          top: SH * 0.08,
          left: 0,
          right: 0,
          height: 0.8,
        }}
      />
    </Animated.View>
  );
});
