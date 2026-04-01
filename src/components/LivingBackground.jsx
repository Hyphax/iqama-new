import { useEffect, memo } from "react";
import { View, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, G, Ellipse } from "react-native-svg";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay,
  Easing,
} from "react-native-reanimated";

const { width: SW, height: SH } = Dimensions.get("window");
const SIN = Easing.inOut(Easing.sin);
const CUBIC_OUT = Easing.out(Easing.cubic);

/* ─── Color Palettes ─── */
const GOLD = {
  rich: "#B8960F",      // deep royal gold
  warm: "#C5A84D",      // warm gold
  bright: "#D4AF37",    // bright gold
  muted: "#9E8520",     // muted antique
  pale: "#D4C68A",      // pale champagne
  glow: "rgba(212,175,55,",  // for alpha variants
};
const CYAN = {
  main: "rgba(212,175,55,",
  solid: "#D4AF37",
};


/* ═══════════════════════════════════════════════════════
   ORNATE MINARET — Ultra-detailed with jali + muqarnas
   ═══════════════════════════════════════════════════════ */
function OrnateMinaret({ x, scale = 1, flip = false, delay = 0, isWhite }) {
  const w = 80 * scale;
  const h = 360 * scale;
  const c1 = isWhite ? GOLD.rich : `${CYAN.main}0.35)`;
  const c2 = isWhite ? GOLD.muted : `${CYAN.main}0.2)`;
  const c3 = isWhite ? GOLD.warm : `${CYAN.main}0.12)`;
  const c4 = isWhite ? GOLD.pale : `${CYAN.main}0.08)`;

  const ty = useSharedValue(0);
  const tx = useSharedValue(0);
  const opac = useSharedValue(0);

  useEffect(() => {
    opac.value = withDelay(delay, withTiming(1, { duration: 2000, easing: CUBIC_OUT }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opac.value,
    transform: [{ translateY: ty.value }, { translateX: tx.value }],
  }));

  return (
    <Animated.View style={[{
      position: "absolute", bottom: -15, left: x,
      width: w, height: h, transform: [{ scaleX: flip ? -1 : 1 }],
    }, animStyle]}>
      {/* Warm glow behind */}
      {isWhite && <View style={{
        position: "absolute", bottom: 40, left: w / 2 - 45, width: 90, height: 200,
        borderRadius: 45, backgroundColor: `${GOLD.glow}0.08)`,
      }} />}
      <Svg width={w} height={h} viewBox="0 0 80 360">
        {/* ── Spire + Ornate Crescent ── */}
        <Path d="M40 2 L40 18" stroke={c1} strokeWidth={0.9} />
        <Path d="M37 10 L40 2 L43 10" stroke={c1} strokeWidth={0.6} fill="none" />
        {/* Detailed crescent with star */}
        <Path d="M36 14 C36 8 44 8 44 14 C42 10 38 10 36 14" stroke={c1} strokeWidth={0.7} fill="none" />
        <Path d="M39 9 L40 7 L41 9 L39 8.2 L41 8.2Z" stroke={c1} strokeWidth={0.3} fill={isWhite ? `${GOLD.glow}0.4)` : "none"} />

        {/* ── Grand Dome with muqarnas ── */}
        <Path d="M40 18 C40 18 24 36 24 50 C24 58 31 62 40 62 C49 62 56 58 56 50 C56 36 40 18 40 18Z"
          stroke={c1} strokeWidth={1} fill="none" />
        <Path d="M40 24 C40 24 29 38 29 48 C29 54 34 57 40 57 C46 57 51 54 51 48 C51 38 40 24 40 24Z"
          stroke={c3} strokeWidth={0.4} fill="none" />
        {/* Muqarnas tiers under dome */}
        <Path d="M28 52 C30 49 33 49 35 52 C37 49 39 49 41 52 C43 49 45 49 47 52 C49 49 51 49 53 52"
          stroke={c2} strokeWidth={0.35} fill="none" />
        <Path d="M26 56 C29 53 32 53 35 56 C38 53 41 53 44 56 C47 53 50 53 53 56"
          stroke={c4} strokeWidth={0.25} fill="none" />
        {/* Dome ornament arcs */}
        <Path d="M33 42 C37 38 43 38 47 42" stroke={c2} strokeWidth={0.3} fill="none" />
        <Path d="M36 36 C38 33 42 33 44 36" stroke={c4} strokeWidth={0.25} fill="none" />

        {/* ── Upper Balcony with railing arches ── */}
        <Path d="M24 62 L24 72 L56 72 L56 62" stroke={c1} strokeWidth={0.8} fill="none" />
        <Path d="M22 72 L58 72" stroke={c1} strokeWidth={1.1} />
        <Path d="M20 72 L20 76 L60 76 L60 72" stroke={c2} strokeWidth={0.5} fill="none" />
        {/* Ornate railing — small arches */}
        <Path d="M28 64 C28 62 32 62 32 64" stroke={c3} strokeWidth={0.3} fill="none" />
        <Path d="M34 64 C34 62 38 62 38 64" stroke={c3} strokeWidth={0.3} fill="none" />
        <Path d="M40 64 C40 62 44 62 44 64" stroke={c3} strokeWidth={0.3} fill="none" />
        <Path d="M46 64 C46 62 50 62 50 64" stroke={c3} strokeWidth={0.3} fill="none" />
        {/* Railing posts */}
        <Path d="M28 62 L28 72 M32 62 L32 72 M36 62 L36 72 M40 62 L40 72 M44 62 L44 72 M48 62 L48 72 M52 62 L52 72"
          stroke={c4} strokeWidth={0.2} />

        {/* ── Upper Tower with jali windows ── */}
        <Path d="M26 76 L24 180" stroke={c1} strokeWidth={0.9} />
        <Path d="M54 76 L56 180" stroke={c1} strokeWidth={0.9} />
        <Path d="M27 76 L25 180" stroke={c4} strokeWidth={0.3} />

        {/* Jali window 1 — ornate arch with geometric fill */}
        <Path d="M34 88 C34 82 46 82 46 88 L46 102 L34 102Z" stroke={c1} strokeWidth={0.5} fill="none" />
        <Path d="M35 89 C35 84 45 84 45 89" stroke={c3} strokeWidth={0.25} fill="none" />
        {/* Jali pattern inside window */}
        <Path d="M37 90 L40 87 L43 90 L40 93Z" stroke={c4} strokeWidth={0.2} fill="none" />
        <Path d="M36 95 L40 92 L44 95 L40 98Z" stroke={c4} strokeWidth={0.2} fill="none" />

        {/* Jali window 2 */}
        <Path d="M34 112 C34 106 46 106 46 112 L46 126 L34 126Z" stroke={c1} strokeWidth={0.5} fill="none" />
        <Path d="M37 114 L40 111 L43 114 L40 117Z" stroke={c4} strokeWidth={0.2} fill="none" />
        <Path d="M36 119 L40 116 L44 119 L40 122Z" stroke={c4} strokeWidth={0.2} fill="none" />

        {/* Jali window 3 */}
        <Path d="M34 136 C34 130 46 130 46 136 L46 150 L34 150Z" stroke={c2} strokeWidth={0.45} fill="none" />
        <Path d="M37 138 L40 135 L43 138 L40 141Z" stroke={c4} strokeWidth={0.2} fill="none" />

        {/* Jali window 4 */}
        <Path d="M34 160 C34 154 46 154 46 160 L46 174 L34 174Z" stroke={c2} strokeWidth={0.4} fill="none" />

        {/* Horizontal ornament bands with zigzag */}
        <Path d="M25 104 L55 104" stroke={c2} strokeWidth={0.35} />
        <Path d="M25 105 L28 107 L31 105 L34 107 L37 105 L40 107 L43 105 L46 107 L49 105 L52 107 L55 105"
          stroke={c4} strokeWidth={0.2} fill="none" />
        <Path d="M25 128 L55 128" stroke={c2} strokeWidth={0.35} />
        <Path d="M25 152 L55 152" stroke={c3} strokeWidth={0.3} />
        <Path d="M25 176 L55 176" stroke={c3} strokeWidth={0.25} />

        {/* Diamond ornaments between windows */}
        <Path d="M40 105 L42 108 L40 111 L38 108Z" stroke={c3} strokeWidth={0.25} fill="none" />
        <Path d="M40 129 L42 132 L40 135 L38 132Z" stroke={c3} strokeWidth={0.25} fill="none" />

        {/* ── Middle Balcony ── */}
        <Path d="M20 180 L60 180" stroke={c1} strokeWidth={1.1} />
        <Path d="M18 180 L18 185 L62 185 L62 180" stroke={c2} strokeWidth={0.5} fill="none" />
        <Path d="M22 180 L22 185 M28 180 L28 185 M34 180 L34 185 M40 180 L40 185 M46 180 L46 185 M52 180 L52 185 M58 180 L58 185"
          stroke={c4} strokeWidth={0.2} />

        {/* ── Lower Tower ── */}
        <Path d="M22 185 L20 300" stroke={c1} strokeWidth={1} />
        <Path d="M58 185 L60 300" stroke={c1} strokeWidth={1} />
        <Path d="M23 185 L21 300" stroke={c4} strokeWidth={0.3} />

        {/* Lower jali windows */}
        <Path d="M32 198 C32 191 48 191 48 198 L48 216 L32 216Z" stroke={c1} strokeWidth={0.5} fill="none" />
        <Path d="M35 200 L40 196 L45 200 L40 204Z" stroke={c4} strokeWidth={0.2} fill="none" />
        <Path d="M34 207 L40 203 L46 207 L40 211Z" stroke={c4} strokeWidth={0.2} fill="none" />

        <Path d="M32 228 C32 221 48 221 48 228 L48 246 L32 246Z" stroke={c2} strokeWidth={0.45} fill="none" />
        <Path d="M35 230 L40 226 L45 230 L40 234Z" stroke={c4} strokeWidth={0.2} fill="none" />

        <Path d="M32 258 C32 251 48 251 48 258 L48 276 L32 276Z" stroke={c2} strokeWidth={0.4} fill="none" />

        {/* Bands */}
        <Path d="M21 218 L59 218" stroke={c3} strokeWidth={0.3} />
        <Path d="M21 248 L59 248" stroke={c3} strokeWidth={0.25} />
        <Path d="M21 278 L59 278" stroke={c4} strokeWidth={0.2} />

        {/* ── Grand Base Arch ── */}
        <Path d="M28 280 C28 265 52 265 52 280 L52 320 L28 320Z" stroke={c1} strokeWidth={0.6} fill="none" />
        <Path d="M30 282 C30 269 50 269 50 282 L50 318 L30 318Z" stroke={c3} strokeWidth={0.3} fill="none" />
        {/* Arch keystone */}
        <Path d="M38 268 L40 264 L42 268" stroke={c2} strokeWidth={0.3} fill="none" />

        {/* ── Foundation with steps ── */}
        <Path d="M16 300 L64 300" stroke={c1} strokeWidth={1.3} />
        <Path d="M14 300 L14 310 L66 310 L66 300" stroke={c2} strokeWidth={0.6} fill="none" />
        <Path d="M12 310 L68 310" stroke={c1} strokeWidth={1.1} />
        <Path d="M10 310 L10 320 L70 320 L70 310" stroke={c3} strokeWidth={0.4} fill="none" />
        <Path d="M8 320 L72 320" stroke={c2} strokeWidth={0.8} />
        <Path d="M6 325 L74 325" stroke={c4} strokeWidth={0.5} />
      </Svg>
    </Animated.View>
  );
}


/* ═══════════════════════════════════════════════════════
   GRAND MOSQUE — Full-width with intricate detail
   ═══════════════════════════════════════════════════════ */
function GrandMosque({ isWhite, delay = 0 }) {
  const c1 = isWhite ? GOLD.rich : `${CYAN.main}0.25)`;
  const c2 = isWhite ? GOLD.muted : `${CYAN.main}0.15)`;
  const c3 = isWhite ? GOLD.warm : `${CYAN.main}0.08)`;
  const c4 = isWhite ? GOLD.pale : `${CYAN.main}0.05)`;
  const fill = isWhite ? `${GOLD.glow}0.025)` : `${CYAN.main}0.015)`;
  const h = 280;

  const ty = useSharedValue(0);
  const opac = useSharedValue(0);

  useEffect(() => {
    opac.value = withDelay(delay, withTiming(1, { duration: 3000, easing: CUBIC_OUT }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opac.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View style={[{
      position: "absolute", bottom: 45, left: 0, right: 0, height: h,
    }, animStyle]}>
      <Svg width={SW} height={h} viewBox="0 0 420 280" preserveAspectRatio="xMidYMax meet">
        {/* ── Grand Central Dome ── */}
        <Path d="M140 120 C140 42 280 42 280 120" stroke={c1} strokeWidth={1.3} fill={fill} />
        <Path d="M148 120 C148 50 272 50 272 120" stroke={c2} strokeWidth={0.5} fill="none" />
        <Path d="M156 120 C156 58 264 58 264 120" stroke={c3} strokeWidth={0.35} fill="none" />
        <Path d="M164 120 C164 66 256 66 256 120" stroke={c4} strokeWidth={0.25} fill="none" />
        {/* Dome finial + crescent */}
        <Path d="M210 42 L210 22" stroke={c1} strokeWidth={1} />
        <Path d="M207 30 L210 22 L213 30" stroke={c1} strokeWidth={0.7} fill="none" />
        <Path d="M206 26 C206 20 214 20 214 26 C212 22 208 22 206 26" stroke={c1} strokeWidth={0.7} fill="none" />
        <Path d="M209 22 L210 20 L211 22 L209 21.3 L211 21.3Z" stroke={c1} strokeWidth={0.25} fill={isWhite ? `${GOLD.glow}0.3)` : "none"} />
        {/* Dome ornament arcs */}
        <Path d="M175 90 C190 78 230 78 245 90" stroke={c2} strokeWidth={0.35} fill="none" />
        <Path d="M165 100 C185 86 235 86 255 100" stroke={c3} strokeWidth={0.3} fill="none" />
        <Path d="M185 78 C195 70 225 70 235 78" stroke={c4} strokeWidth={0.25} fill="none" />
        {/* Muqarnas under central dome */}
        <Path d="M148 115 C152 111 156 111 160 115 C164 111 168 111 172 115 C176 111 180 111 184 115 C188 111 192 111 196 115 C200 111 204 111 208 115 C212 111 216 111 220 115 C224 111 228 111 232 115 C236 111 240 111 244 115 C248 111 252 111 256 115 C260 111 264 111 268 115"
          stroke={c3} strokeWidth={0.3} fill="none" />

        {/* ── Left Medium Dome ── */}
        <Path d="M78 135 C78 102 142 102 142 135" stroke={c1} strokeWidth={0.9} fill={fill} />
        <Path d="M84 135 C84 108 136 108 136 135" stroke={c3} strokeWidth={0.3} fill="none" />
        <Path d="M110 102 L110 92" stroke={c1} strokeWidth={0.7} />
        <Path d="M108 96 C108 93 112 93 112 96 C111 94 109 94 108 96" stroke={c1} strokeWidth={0.45} fill="none" />
        {/* Muqarnas */}
        <Path d="M84 131 C88 128 92 128 96 131 C100 128 104 128 108 131 C112 128 116 128 120 131 C124 128 128 128 132 131"
          stroke={c4} strokeWidth={0.25} fill="none" />

        {/* ── Right Medium Dome ── */}
        <Path d="M278 135 C278 102 342 102 342 135" stroke={c1} strokeWidth={0.9} fill={fill} />
        <Path d="M284 135 C284 108 336 108 336 135" stroke={c3} strokeWidth={0.3} fill="none" />
        <Path d="M310 102 L310 92" stroke={c1} strokeWidth={0.7} />
        <Path d="M308 96 C308 93 312 93 312 96 C311 94 309 94 308 96" stroke={c1} strokeWidth={0.45} fill="none" />
        <Path d="M284 131 C288 128 292 128 296 131 C300 128 304 128 308 131 C312 128 316 128 320 131 C324 128 328 128 332 131"
          stroke={c4} strokeWidth={0.25} fill="none" />

        {/* ── Small Domes ── */}
        <Path d="M48 150 C48 130 86 130 86 150" stroke={c2} strokeWidth={0.7} fill={fill} />
        <Path d="M67 130 L67 124" stroke={c2} strokeWidth={0.5} />
        <Path d="M334 150 C334 130 372 130 372 150" stroke={c2} strokeWidth={0.7} fill={fill} />
        <Path d="M353 130 L353 124" stroke={c2} strokeWidth={0.5} />

        {/* ── Left Minaret ── */}
        <Path d="M26 78 C26 68 48 68 48 78" stroke={c1} strokeWidth={0.7} fill="none" />
        <Path d="M37 68 L37 52" stroke={c1} strokeWidth={0.7} />
        <Path d="M34 58 L37 52 L40 58" stroke={c1} strokeWidth={0.5} fill="none" />
        <Path d="M35 56 C35 53 39 53 39 56 C38 54 36 54 35 56" stroke={c1} strokeWidth={0.35} fill="none" />
        <Path d="M23 78 L23 220" stroke={c1} strokeWidth={0.8} />
        <Path d="M51 78 L51 220" stroke={c1} strokeWidth={0.8} />
        <Path d="M24 78 L24 220" stroke={c4} strokeWidth={0.25} />
        {/* Windows with jali */}
        <Path d="M31 88 C31 84 43 84 43 88 L43 100 L31 100Z" stroke={c2} strokeWidth={0.35} fill="none" />
        <Path d="M34 90 L37 87 L40 90 L37 93Z" stroke={c4} strokeWidth={0.18} fill="none" />
        <Path d="M31 110 C31 106 43 106 43 110 L43 122 L31 122Z" stroke={c2} strokeWidth={0.35} fill="none" />
        <Path d="M31 132 C31 128 43 128 43 132 L43 144 L31 132Z" stroke={c3} strokeWidth={0.3} fill="none" />
        <Path d="M31 154 C31 150 43 150 43 154 L43 166 L31 166Z" stroke={c3} strokeWidth={0.25} fill="none" />
        <Path d="M31 176 C31 172 43 172 43 176 L43 188 L31 188Z" stroke={c4} strokeWidth={0.2} fill="none" />
        <Path d="M24 102 L50 102 M24 124 L50 124 M24 146 L50 146 M24 168 L50 168 M24 190 L50 190" stroke={c4} strokeWidth={0.18} />
        <Path d="M20 220 L54 220" stroke={c1} strokeWidth={1} />

        {/* ── Right Minaret ── */}
        <Path d="M372 78 C372 68 394 68 394 78" stroke={c1} strokeWidth={0.7} fill="none" />
        <Path d="M383 68 L383 52" stroke={c1} strokeWidth={0.7} />
        <Path d="M380 58 L383 52 L386 58" stroke={c1} strokeWidth={0.5} fill="none" />
        <Path d="M381 56 C381 53 385 53 385 56 C384 54 382 54 381 56" stroke={c1} strokeWidth={0.35} fill="none" />
        <Path d="M369 78 L369 220" stroke={c1} strokeWidth={0.8} />
        <Path d="M397 78 L397 220" stroke={c1} strokeWidth={0.8} />
        <Path d="M370 78 L370 220" stroke={c4} strokeWidth={0.25} />
        <Path d="M377 88 C377 84 389 84 389 88 L389 100 L377 100Z" stroke={c2} strokeWidth={0.35} fill="none" />
        <Path d="M380 90 L383 87 L386 90 L383 93Z" stroke={c4} strokeWidth={0.18} fill="none" />
        <Path d="M377 110 C377 106 389 106 389 110 L389 122 L377 122Z" stroke={c2} strokeWidth={0.35} fill="none" />
        <Path d="M377 132 C377 128 389 128 389 132 L389 144 L377 144Z" stroke={c3} strokeWidth={0.3} fill="none" />
        <Path d="M377 154 C377 150 389 150 389 154 L389 166 L377 166Z" stroke={c3} strokeWidth={0.25} fill="none" />
        <Path d="M377 176 C377 172 389 172 389 176 L389 188 L377 188Z" stroke={c4} strokeWidth={0.2} fill="none" />
        <Path d="M370 102 L396 102 M370 124 L396 124 M370 146 L396 146 M370 168 L396 168 M370 190 L396 190" stroke={c4} strokeWidth={0.18} />
        <Path d="M366 220 L400 220" stroke={c1} strokeWidth={1} />

        {/* ── Main Body ── */}
        <Path d="M55 150 L55 230 L365 230 L365 150" stroke={c1} strokeWidth={0.9} fill={fill} />

        {/* ── Central Grand Arch with nested arches ── */}
        <Path d="M175 230 L175 152 C175 132 245 132 245 152 L245 230" stroke={c1} strokeWidth={0.8} fill="none" />
        <Path d="M180 230 L180 155 C180 137 240 137 240 155 L240 230" stroke={c2} strokeWidth={0.4} fill="none" />
        <Path d="M185 230 L185 158 C185 142 235 142 235 158 L235 230" stroke={c3} strokeWidth={0.3} fill="none" />
        <Path d="M190 230 L190 161 C190 147 230 147 230 161 L230 230" stroke={c4} strokeWidth={0.2} fill="none" />
        {/* Arch keystone */}
        <Path d="M208 135 L210 130 L212 135" stroke={c2} strokeWidth={0.3} fill="none" />

        {/* ── Side Arches ── */}
        <Path d="M88 230 L88 175 C88 163 132 163 132 175 L132 230" stroke={c2} strokeWidth={0.55} fill="none" />
        <Path d="M93 230 L93 178 C93 168 127 168 127 178 L127 230" stroke={c3} strokeWidth={0.3} fill="none" />
        <Path d="M288 230 L288 175 C288 163 332 163 332 175 L332 230" stroke={c2} strokeWidth={0.55} fill="none" />
        <Path d="M293 230 L293 178 C293 168 327 168 327 178 L327 230" stroke={c3} strokeWidth={0.3} fill="none" />

        {/* ── Smaller Arches ── */}
        <Path d="M63 230 L63 192 C63 184 86 184 86 192 L86 230" stroke={c3} strokeWidth={0.4} fill="none" />
        <Path d="M334 230 L334 192 C334 184 357 184 357 192 L357 230" stroke={c3} strokeWidth={0.4} fill="none" />

        {/* ── Decorative Bands ── */}
        <Path d="M55 170 L365 170" stroke={c3} strokeWidth={0.25} />
        <Path d="M55 190 L365 190" stroke={c4} strokeWidth={0.2} />
        <Path d="M55 210 L365 210" stroke={c4} strokeWidth={0.15} />

        {/* ── Foundation ── */}
        <Path d="M18 230 L402 230" stroke={c1} strokeWidth={1.3} />
        <Path d="M15 230 L15 238 L405 238 L405 230" stroke={c2} strokeWidth={0.5} fill="none" />
        <Path d="M12 238 L408 238" stroke={c3} strokeWidth={0.8} />
      </Svg>
    </Animated.View>
  );
}


/* ═══════════════════════════════════════════════════════
   CRESCENT MOON — Glowing with stars
   ═══════════════════════════════════════════════════════ */
function CrescentMoon({ isWhite }) {
  const glow = useSharedValue(0.25);
  const ty = useSharedValue(0);
  const rot = useSharedValue(-5);

  useEffect(() => {
    glow.value = withTiming(isWhite ? 0.55 : 0.4, { duration: 2500, easing: SIN });
  }, [isWhite]);

  const style = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ translateY: ty.value }, { rotate: `${rot.value}deg` }],
  }));

  const c = isWhite ? GOLD.warm : CYAN.solid;
  const c2 = isWhite ? GOLD.bright : `${CYAN.main}0.5)`;

  return (
    <Animated.View style={[{
      position: "absolute", top: SH * 0.05, right: SW * 0.1, width: 65, height: 65,
    }, style]}>
      {isWhite && <View style={{
        position: "absolute", top: 10, right: 5, width: 40, height: 40,
        borderRadius: 20, backgroundColor: `${GOLD.glow}0.1)`,
        shadowColor: GOLD.bright, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3, shadowRadius: 20,
      }} />}
      <Svg width={65} height={65} viewBox="0 0 65 65">
        <Path d="M32 5 C48 5 58 19 58 32 C58 45 48 58 32 58 C40 52 44 42 44 32 C44 22 40 12 32 5Z"
          stroke={c} strokeWidth={1.1} fill="none" />
        <Path d="M34 10 C46 13 52 22 52 32 C52 42 46 51 34 54 C40 49 43 41 43 32 C43 23 40 15 34 10Z"
          stroke={c2} strokeWidth={0.4} fill="none" />
        <Path d="M19 24 L20.5 19.5 L22 24 L17.5 21 L24.5 21Z" stroke={c} strokeWidth={0.5} fill={isWhite ? `${GOLD.glow}0.25)` : "none"} />
        <Path d="M15 38 L16 35 L17 38 L14 36.5 L18 36.5Z" stroke={c2} strokeWidth={0.4} fill="none" />
        <Path d="M22 48 L23 45.5 L24 48 L21 46.5 L25 46.5Z" stroke={c2} strokeWidth={0.35} fill="none" />
      </Svg>
    </Animated.View>
  );
}


/* ═══════════════════════════════════════════════════════
   HANGING LANTERN — Ornate with warm glow
   ═══════════════════════════════════════════════════════ */
function HangingLantern({ x, top, size = 1, delay = 0, isWhite }) {
  const swing = useSharedValue(0);
  const glowOp = useSharedValue(0.2);
  const opac = useSharedValue(0);

  useEffect(() => {
    opac.value = withDelay(delay, withTiming(1, { duration: 2000 }));
    glowOp.value = withDelay(delay, withTiming(0.4, { duration: 2500 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opac.value,
    transform: [{ rotate: `${swing.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOp.value }));

  const c = isWhite ? GOLD.warm : `${CYAN.main}0.4)`;
  const c2 = isWhite ? GOLD.rich : `${CYAN.main}0.25)`;
  const c3 = isWhite ? GOLD.muted : `${CYAN.main}0.15)`;
  const w = 32 * size;
  const h = 60 * size;

  return (
    <Animated.View style={[{
      position: "absolute", top, left: x, width: w, height: h + 25,
      transformOrigin: "top center",
    }, style]}>
      <Animated.View style={[{
        position: "absolute", bottom: 0, left: w / 2 - 18, width: 36, height: 36,
        borderRadius: 18, backgroundColor: isWhite ? `${GOLD.glow}0.12)` : `${CYAN.main}0.06)`,
      }, glowStyle]} />
      <Svg width={w} height={h} viewBox="0 0 32 60">
        {/* Chain links */}
        <Path d="M16 0 L16 12" stroke={c2} strokeWidth={0.4} />
        <Ellipse cx={16} cy={3} rx={1.8} ry={1.2} stroke={c3} strokeWidth={0.3} fill="none" />
        <Ellipse cx={16} cy={7} rx={1.8} ry={1.2} stroke={c3} strokeWidth={0.3} fill="none" />
        <Ellipse cx={16} cy={11} rx={1.5} ry={1} stroke={c3} strokeWidth={0.25} fill="none" />
        {/* Top ornate cap */}
        <Path d="M10 12 L22 12 L20 17 L12 17Z" stroke={c} strokeWidth={0.5} fill="none" />
        <Path d="M14 12 L14 17 M18 12 L18 17" stroke={c3} strokeWidth={0.2} />
        {/* Body — ornate bulb shape */}
        <Path d="M12 17 C7 24 7 40 12 48 L20 48 C25 40 25 24 20 17"
          stroke={c} strokeWidth={0.7} fill="none" />
        <Path d="M13 19 C9 26 9 38 13 46" stroke={c2} strokeWidth={0.25} fill="none" />
        <Path d="M19 19 C23 26 23 38 19 46" stroke={c2} strokeWidth={0.25} fill="none" />
        {/* Glass panel dividers */}
        <Path d="M9 25 L23 25 M9 32 L23 32 M9 39 L23 39" stroke={c2} strokeWidth={0.25} />
        {/* Diamond cutouts — ornate */}
        <Path d="M16 19 L18 22 L16 25 L14 22Z" stroke={c} strokeWidth={0.3} fill="none" />
        <Path d="M15 21 L16 20 L17 21 L16 22Z" stroke={c3} strokeWidth={0.15} fill="none" />
        <Path d="M16 26 L18 29 L16 32 L14 29Z" stroke={c} strokeWidth={0.3} fill="none" />
        <Path d="M15 28 L16 27 L17 28 L16 29Z" stroke={c3} strokeWidth={0.15} fill="none" />
        <Path d="M16 33 L18 36 L16 39 L14 36Z" stroke={c} strokeWidth={0.3} fill="none" />
        <Path d="M16 40 L17.5 43 L16 46 L14.5 43Z" stroke={c2} strokeWidth={0.25} fill="none" />
        {/* Bottom finial */}
        <Path d="M12 48 L16 54 L20 48" stroke={c} strokeWidth={0.5} fill="none" />
        <Circle cx={16} cy={55} r={1.2} stroke={c} strokeWidth={0.35} fill="none" />
        <Path d="M16 56 L16 58" stroke={c2} strokeWidth={0.25} />
      </Svg>
    </Animated.View>
  );
}


/* ═══════════════════════════════════════════════════════
   ORNATE FLORAL VINE — Detailed roses + leaves
   ═══════════════════════════════════════════════════════ */
function OrnateFloral({ x, bottom, flip = false, delay = 0, isWhite, size = 1 }) {
  const c1 = isWhite ? GOLD.warm : `${CYAN.main}0.3)`;
  const c2 = isWhite ? GOLD.muted : `${CYAN.main}0.18)`;
  const c3 = isWhite ? GOLD.pale : `${CYAN.main}0.1)`;
  const w = 170 * size;
  const h = 220 * size;

  const sway = useSharedValue(0);
  const bloom = useSharedValue(0.9);
  const opac = useSharedValue(0);

  useEffect(() => {
    opac.value = withDelay(delay, withTiming(1, { duration: 1800 }));
    bloom.value = withDelay(delay, withTiming(1, { duration: 2000 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opac.value,
    transform: [{ rotate: `${sway.value}deg` }, { scale: bloom.value }],
  }));

  return (
    <Animated.View style={[{
      position: "absolute", bottom,
      left: flip ? undefined : x, right: flip ? x : undefined,
      transformOrigin: "bottom center",
    }, animStyle]}>
      <Svg width={w} height={h} viewBox="0 0 170 220"
        style={{ transform: [{ scaleX: flip ? -1 : 1 }] }}>
        {/* Main vine */}
        <Path d="M0 220 C16 198 28 170 38 142 C48 114 55 88 65 65 C75 42 85 25 100 10"
          stroke={c1} strokeWidth={0.9} fill="none" />
        <Path d="M4 216 C20 194 32 166 42 138 C52 110 59 84 69 61"
          stroke={c2} strokeWidth={0.35} fill="none" />

        {/* Branches */}
        <Path d="M16 195 C32 188 38 172 30 160" stroke={c2} strokeWidth={0.5} fill="none" />
        <Path d="M38 142 C58 136 64 118 54 108" stroke={c2} strokeWidth={0.5} fill="none" />
        <Path d="M65 65 C82 58 88 42 78 34" stroke={c2} strokeWidth={0.4} fill="none" />

        {/* ── Rose 1 — 10 outer + 8 inner petals ── */}
        <G transform="translate(16,190)">
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((r, i) => (
            <Path key={`a${i}`} d="M0 0 C4.5 -10 -4.5 -10 0 0"
              stroke={c1} strokeWidth={0.5} fill="none" transform={`rotate(${r})`} />
          ))}
          {[18, 54, 90, 126, 162, 198, 234, 270, 306, 342].map((r, i) => (
            <Path key={`b${i}`} d="M0 0 C3 -7 -3 -7 0 0"
              stroke={c1} strokeWidth={0.35} fill="none" transform={`rotate(${r})`} />
          ))}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((r, i) => (
            <Path key={`c${i}`} d="M0 0 C2 -4.5 -2 -4.5 0 0"
              stroke={c2} strokeWidth={0.25} fill="none" transform={`rotate(${r})`} />
          ))}
          <Circle cx={0} cy={0} r={3} stroke={c1} strokeWidth={0.5} fill="none" />
          <Circle cx={0} cy={0} r={1.5} stroke={c2} strokeWidth={0.3} fill="none" />
          {/* Spiral center */}
          <Path d="M0 0 C1 -1 2 0 1 1 C0 2 -1 1 0 0" stroke={c2} strokeWidth={0.2} fill="none" />
        </G>

        {/* ── Rose 2 ── */}
        <G transform="translate(42,135)">
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((r, i) => (
            <Path key={`d${i}`} d="M0 0 C4 -9 -4 -9 0 0"
              stroke={c1} strokeWidth={0.5} fill="none" transform={`rotate(${r})`} />
          ))}
          {[20, 60, 100, 140, 180, 220, 260, 300, 340].map((r, i) => (
            <Path key={`e${i}`} d="M0 0 C2.5 -6 -2.5 -6 0 0"
              stroke={c2} strokeWidth={0.3} fill="none" transform={`rotate(${r})`} />
          ))}
          <Circle cx={0} cy={0} r={2.5} stroke={c1} strokeWidth={0.45} fill="none" />
          <Circle cx={0} cy={0} r={1} stroke={c2} strokeWidth={0.25} fill="none" />
        </G>

        {/* ── Flower 3 ── */}
        <G transform="translate(70,60)">
          {[0, 51, 102, 153, 204, 255, 306].map((r, i) => (
            <Path key={`f${i}`} d="M0 0 C3 -7 -3 -7 0 0"
              stroke={c1} strokeWidth={0.45} fill="none" transform={`rotate(${r})`} />
          ))}
          <Circle cx={0} cy={0} r={2} stroke={c1} strokeWidth={0.4} fill="none" />
        </G>

        {/* ── Bud 4 ── */}
        <G transform="translate(95,16)">
          {[0, 72, 144, 216, 288].map((r, i) => (
            <Path key={`g${i}`} d="M0 0 C2 -5 -2 -5 0 0"
              stroke={c1} strokeWidth={0.35} fill="none" transform={`rotate(${r})`} />
          ))}
        </G>

        {/* ── Detailed Leaves ── */}
        <Path d="M8 210 C20 202 16 190 8 196" stroke={c2} strokeWidth={0.5} fill="none" />
        <Path d="M10 205 C14 202 13 198 10 200" stroke={c3} strokeWidth={0.2} fill="none" />
        <Path d="M28 168 C40 160 36 148 28 154" stroke={c2} strokeWidth={0.5} fill="none" />
        <Path d="M30 163 C34 160 33 156 30 158" stroke={c3} strokeWidth={0.2} fill="none" />
        <Path d="M50 118 C62 110 58 98 50 104" stroke={c2} strokeWidth={0.45} fill="none" />
        <Path d="M60 82 C72 74 68 62 60 68" stroke={c2} strokeWidth={0.4} fill="none" />
        <Path d="M82 40 C94 32 90 20 82 26" stroke={c3} strokeWidth={0.35} fill="none" />
        {/* Opposite leaves */}
        <Path d="M22 180 C10 174 12 162 22 168" stroke={c3} strokeWidth={0.35} fill="none" />
        <Path d="M46 128 C34 122 36 110 46 116" stroke={c3} strokeWidth={0.35} fill="none" />

        {/* Buds */}
        <Circle cx={30} cy={160} r={1.8} stroke={c2} strokeWidth={0.3} fill="none" />
        <Circle cx={54} cy={108} r={1.5} stroke={c2} strokeWidth={0.25} fill="none" />
        <Circle cx={78} cy={38} r={1.2} stroke={c3} strokeWidth={0.2} fill="none" />

        {/* Tendrils */}
        <Path d="M98 12 C102 9 105 13 102 16 C99 19 96 15 98 12" stroke={c3} strokeWidth={0.3} fill="none" />
        <Path d="M32 152 C36 149 39 153 36 156 C33 159 30 155 32 152" stroke={c3} strokeWidth={0.25} fill="none" />
      </Svg>
    </Animated.View>
  );
}


/* ═══════════════════════════════════════════════════════
   ORNATE CORNER FRAME — Premium border detail
   ═══════════════════════════════════════════════════════ */
function OrnateCorner({ isWhite }) {
  const opac = useSharedValue(0);
  useEffect(() => {
    opac.value = withTiming(isWhite ? 0.18 : 0.06, { duration: 3000 });
  }, [isWhite]);
  const style = useAnimatedStyle(() => ({ opacity: opac.value }));
  const c = isWhite ? GOLD.rich : CYAN.solid;
  const c2 = isWhite ? GOLD.muted : `${CYAN.main}0.3)`;
  const s = 70;

  return (
    <>
      {/* Top-left */}
      <Animated.View style={[{ position: "absolute", top: 50, left: 8, width: s, height: s }, style]}>
        <Svg width={s} height={s} viewBox="0 0 70 70">
          <Path d="M0 70 L0 15 C0 6 6 0 15 0 L70 0" stroke={c} strokeWidth={0.8} fill="none" />
          <Path d="M5 70 L5 18 C5 10 10 5 18 5 L70 5" stroke={c2} strokeWidth={0.35} fill="none" />
          <Path d="M15 0 L15 8 C15 12 12 15 8 15 L0 15" stroke={c} strokeWidth={0.5} fill="none" />
          <Circle cx={15} cy={15} r={2} stroke={c} strokeWidth={0.4} fill="none" />
          <Path d="M22 0 L22 3 M28 0 L28 2 M0 22 L3 22 M0 28 L2 28" stroke={c2} strokeWidth={0.25} />
        </Svg>
      </Animated.View>
      {/* Top-right */}
      <Animated.View style={[{ position: "absolute", top: 50, right: 8, width: s, height: s, transform: [{ scaleX: -1 }] }, style]}>
        <Svg width={s} height={s} viewBox="0 0 70 70">
          <Path d="M0 70 L0 15 C0 6 6 0 15 0 L70 0" stroke={c} strokeWidth={0.8} fill="none" />
          <Path d="M5 70 L5 18 C5 10 10 5 18 5 L70 5" stroke={c2} strokeWidth={0.35} fill="none" />
          <Path d="M15 0 L15 8 C15 12 12 15 8 15 L0 15" stroke={c} strokeWidth={0.5} fill="none" />
          <Circle cx={15} cy={15} r={2} stroke={c} strokeWidth={0.4} fill="none" />
        </Svg>
      </Animated.View>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   FLYING BIRD — Silhouette with wave path
   ═══════════════════════════════════════════════════════ */
function FlyingBird({ startX, y, delay = 0, isWhite, size = 1 }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const opac = useSharedValue(0);

  useEffect(() => {
    opac.value = withDelay(delay, withTiming(isWhite ? 0.18 : 0.12, { duration: 2000 }));
  }, [isWhite]);

  const style = useAnimatedStyle(() => ({
    opacity: opac.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  const c = isWhite ? GOLD.muted : `${CYAN.main}0.25)`;
  const w = 26 * size;
  const h = 12 * size;

  return (
    <Animated.View style={[{ position: "absolute", top: y, left: startX, width: w, height: h }, style]}>
      <Svg width={w} height={h} viewBox="0 0 26 12">
        <Path d="M0 6 C4 0 9 3 13 6 C17 3 22 0 26 6" stroke={c} strokeWidth={0.9} fill="none" />
        <Path d="M5 4 C7 2 10 3 13 6" stroke={c} strokeWidth={0.3} fill="none" />
      </Svg>
    </Animated.View>
  );
}


/* ═══════════════════════════════════════════════════════
   GOLDEN STAR — Sparkle particle
   ═══════════════════════════════════════════════════════ */
function GoldenStar({ top, left, size, delay }) {
  const opac = useSharedValue(0);
  const rot = useSharedValue(0);
  const sc = useSharedValue(0.4);
  const ty = useSharedValue(0);

  useEffect(() => {
    opac.value = withDelay(delay, withTiming(0.7, { duration: 2000, easing: SIN }));
    sc.value = withDelay(delay, withTiming(1, { duration: 2000 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opac.value,
    transform: [{ rotate: `${rot.value}deg` }, { scale: sc.value }, { translateY: ty.value }],
  }));

  return (
    <Animated.View style={[{ position: "absolute", top, left, width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 20 20">
        <Path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8Z"
          stroke={GOLD.warm} strokeWidth={0.5} fill={`${GOLD.glow}0.3)`} />
        <Path d="M10 4 L11 8 L15 10 L11 12 L10 16 L9 12 L5 10 L9 8Z"
          stroke={GOLD.bright} strokeWidth={0.3} fill={`${GOLD.glow}0.15)`} />
      </Svg>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════════════════
   ISLAMIC GEOMETRIC PATTERN — Breathing overlay
   ═══════════════════════════════════════════════════════ */
function IslamicPattern({ isWhite }) {
  const opac = useSharedValue(0);
  useEffect(() => {
    opac.value = withTiming(isWhite ? 0.06 : 0.02, { duration: 3000, easing: SIN });
  }, [isWhite]);
  const style = useAnimatedStyle(() => ({ opacity: opac.value }));
  const c = isWhite ? GOLD.rich : CYAN.solid;

  return (
    <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, style]}>
      <Svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`}>
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => {
            const cx = col * 95 + (row % 2 === 0 ? 48 : 0);
            const cy = row * 115 + 58;
            return (
              <G key={`${row}-${col}`} transform={`translate(${cx},${cy})`}>
                <Path d="M0 -22 L7 -7 L22 0 L7 7 L0 22 L-7 7 L-22 0 L-7 -7Z"
                  stroke={c} strokeWidth={0.3} fill="none" />
                <Path d="M0 -15 L5 -5 L15 0 L5 5 L0 15 L-5 5 L-15 0 L-5 -5Z"
                  stroke={c} strokeWidth={0.2} fill="none" />
                <Circle cx={0} cy={0} r={3} stroke={c} strokeWidth={0.2} fill="none" />
                <Path d="M22 0 L48 0" stroke={c} strokeWidth={0.08} />
                <Path d="M0 22 L0 58" stroke={c} strokeWidth={0.08} />
              </G>
            );
          })
        )}
      </Svg>
    </Animated.View>
  );
}


/* ═══════════════════════════════════════════════════════
   DUST PARTICLE — floating glowing dot
   ═══════════════════════════════════════════════════════ */
function DustParticle({ top, left, size, delay, isWhite }) {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(0);
  const tx = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(isWhite ? 0.4 : 0.45, { duration: 2500, easing: SIN }));
  }, [isWhite]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }, { translateX: tx.value }],
  }));

  const bgColor = isWhite ? GOLD.bright : CYAN.solid;

  return (
    <Animated.View style={[{
      position: "absolute", top, left,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: bgColor,
      shadowColor: bgColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isWhite ? 0.6 : 0.8,
      shadowRadius: size * 3,
    }, style]} />
  );
}

/* ═══════════════════════════════════════════════════════
   LIGHT BEAM — diagonal sweeping glow
   ═══════════════════════════════════════════════════════ */
function LightBeam({ top, left, angle, w, h, delay, isWhite }) {
  const opacity = useSharedValue(0);
  const tx = useSharedValue(-50);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(isWhite ? 0.12 : 0.04, { duration: 3000, easing: SIN }));
  }, [isWhite]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }, { rotate: `${angle}deg` }],
  }));

  return (
    <Animated.View style={[{ position: "absolute", top, left, width: w, height: h }, style]}>
      <LinearGradient
        colors={["transparent", isWhite ? GOLD.bright : CYAN.solid, "transparent"]}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════════════════
   AURA ORB — ambient glow
   ═══════════════════════════════════════════════════════ */
function AuraOrb({ top, left, size, color, delay }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.88);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.14, { duration: 3000, easing: SIN }));
    scale.value = withDelay(delay, withTiming(1, { duration: 3000 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[{
      position: "absolute", top, left,
      width: size, height: size, borderRadius: size / 2,
    }, style]}>
      <LinearGradient
        colors={[color, `${color}60`, `${color}20`, "transparent"]}
        start={{ x: 0.5, y: 0.5 }} end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: size / 2 }}
      />
    </Animated.View>
  );
}


/* ═══════════════════════════════════════════════════════
   SHIMMER SWEEP
   ═══════════════════════════════════════════════════════ */
function ShimmerSweep({ isWhite, reverse = false }) {
  const tx = useSharedValue(reverse ? SW * 2 : -SW);

  useEffect(() => {
    // Static — no shimmer sweep animation
  }, [isWhite]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));
  if (!isWhite) return null;

  return (
    <Animated.View style={[{
      position: "absolute", top: 0, bottom: 0,
      width: reverse ? 200 : 140, opacity: reverse ? 0.07 : 0.15,
    }, style]}>
      <LinearGradient
        colors={["transparent", `${GOLD.glow}0.5)`, GOLD.bright, `${GOLD.glow}0.5)`, "transparent"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════════════════
   GOLDEN VIGNETTE — Warm edge glow for white theme
   ═══════════════════════════════════════════════════════ */
function GoldenVignette() {
  const opac = useSharedValue(0);
  useEffect(() => {
    opac.value = withTiming(0.25, { duration: 3000, easing: SIN });
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opac.value }));

  return (
    <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, style]}>
      {/* Top vignette */}
      <LinearGradient
        colors={[`${GOLD.glow}0.08)`, "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: SH * 0.15 }}
      />
      {/* Bottom vignette */}
      <LinearGradient
        colors={["transparent", `${GOLD.glow}0.1)`]}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: SH * 0.15 }}
      />
      {/* Left vignette */}
      <LinearGradient
        colors={[`${GOLD.glow}0.06)`, "transparent"]}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: SW * 0.12 }}
      />
      {/* Right vignette */}
      <LinearGradient
        colors={["transparent", `${GOLD.glow}0.06)`]}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: SW * 0.12 }}
      />
    </Animated.View>
  );
}


/* ═══════════════════════════════════════════════════════
   DATA — pre-computed positions
   ═══════════════════════════════════════════════════════ */
const DUST = [
  { top: SH*0.12, left: SW*0.45, size: 3, delay: 0 },
  { top: SH*0.45, left: SW*0.52, size: 3.5, delay: 3000 },
  { top: SH*0.69, left: SW*0.18, size: 3, delay: 6000 },
  { top: SH*0.88, left: SW*0.55, size: 2.5, delay: 9000 },
];

const STARS = [
  { top: SH*0.08, left: SW*0.72, size: 14, delay: 1800 },
  { top: SH*0.44, left: SW*0.88, size: 16, delay: 5000 },
  { top: SH*0.80, left: SW*0.38, size: 15, delay: 8000 },
];


/* ═══════════════════════════════════════════════════════
   MAIN EXPORT — LivingBackground
   ═══════════════════════════════════════════════════════ */
export const LivingBackground = memo(function LivingBackground({ isWhite }) {

  return (
    <View style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: isWhite ? "#F9F6F0" : "#050505",
    }}>
      {/* ══ DARK MODE ══ */}
      {!isWhite && (
        <>
          <AuraOrb top={-SW*0.4} left={-SW*0.2} size={SW*1.1} color="#D4AF37" delay={0} />
          <AuraOrb top={SH*0.5} left={SW*0.3} size={SW*0.8} color="#B8860B" delay={2000} />
        </>
      )}

      {/* ══ WHITE MODE — Premium layered golden atmosphere ══ */}
      {isWhite && (
        <>
          <LinearGradient
            colors={["#FBF7ED", "#FAF4E2", "#F6EFD5", "#FAF4E2", "#FBF7ED"]}
            locations={[0, 0.25, 0.5, 0.75, 1]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <LinearGradient
            colors={[`${GOLD.glow}0.14)`, `${GOLD.glow}0.06)`, "transparent"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: SH*0.4 }}
          />
          <LinearGradient
            colors={["transparent", `${GOLD.glow}0.08)`, `${GOLD.glow}0.16)`]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: SH*0.4 }}
          />
          <LinearGradient
            colors={[`${GOLD.glow}0.09)`, "transparent"]}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: SW*0.45 }}
          />
          <LinearGradient
            colors={["transparent", `${GOLD.glow}0.09)`]}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: SW*0.45 }}
          />
          <AuraOrb top={-SW*0.3} left={SW*0.05} size={SW*0.95} color="#D4AF37" delay={0} />
          <AuraOrb top={SH*0.5} left={SW*0.3} size={SW*0.7} color="#B8960F" delay={4000} />
        </>
      )}

      {/* ── Islamic Geometric Pattern ── */}
      <IslamicPattern isWhite={isWhite} />

      {/* ── Light Beams ── */}
      <LightBeam top={SH*0.03} left={SW*0.1} angle={25} w={SW*0.65} h={isWhite ? 3.5 : 2} delay={1000} isWhite={isWhite} />
      <LightBeam top={SH*0.50} left={SW*0.05} angle={20} w={SW*0.7} h={isWhite ? 3.5 : 2} delay={9000} isWhite={isWhite} />

      {/* ── Crescent Moon ── */}
      <CrescentMoon isWhite={isWhite} />

      {/* ── Grand Mosque ── */}
      <GrandMosque isWhite={isWhite} delay={200} />

      {/* ── Ornate Minarets ── */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: isWhite ? 0.42 : 0.6 }}>
        <OrnateMinaret x={-14} scale={1.2} delay={100} isWhite={isWhite} />
        <OrnateMinaret x={SW - 82} scale={1.1} flip delay={400} isWhite={isWhite} />
      </View>

      {/* ── Ornate Florals ── */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: isWhite ? 0.38 : 0.5 }}>
        <OrnateFloral x={-12} bottom={0} delay={300} isWhite={isWhite} size={1.1} />
        <OrnateFloral x={-12} bottom={0} flip delay={700} isWhite={isWhite} size={1.05} />
      </View>

      {/* ── Hanging Lanterns ── */}
      {isWhite && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.32 }}>
          <HangingLantern x={SW*0.1} top={SH*0.02} size={1.15} delay={500} isWhite />
          <HangingLantern x={SW*0.84} top={SH*0.03} size={0.95} delay={1500} isWhite />
        </View>
      )}

      {/* ── Flying Birds ── */}
      {isWhite && (
        <>
          <FlyingBird startX={-30} y={SH*0.11} delay={2000} isWhite size={1} />
          <FlyingBird startX={-50} y={SH*0.14} delay={3200} isWhite size={0.8} />
        </>
      )}

      {/* ── Ornate Corner Frame ── */}
      <OrnateCorner isWhite={isWhite} />

      {/* ── Golden Vignette ── */}
      {isWhite && <GoldenVignette />}

      {/* ── Shimmer Sweep ── */}
      <ShimmerSweep isWhite={isWhite} />

      {/* ── Golden Stars ── */}
      {isWhite && STARS.map((s, i) => (
        <GoldenStar key={`s${i}`} top={s.top} left={s.left} size={s.size} delay={s.delay} />
      ))}

      {/* ── Dust Particles ── */}
      {DUST.map((d, i) => (
        <DustParticle key={`d${i}`} top={d.top} left={d.left} size={d.size} delay={d.delay} isWhite={isWhite} />
      ))}
    </View>
  );
});
