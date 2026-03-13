import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Line,
  Polygon,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
  Path,
  G,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  FadeInDown,
  FadeIn,
  FadeInLeft,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from "react-native-reanimated";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { Navigation, MapPin, AlertCircle, Compass } from "lucide-react-native";
import { SHADOWS, getShadow } from "@/utils/iqamaTheme";
import { useSettings } from "@/utils/useSettings";
import { WhiteBackgroundArt } from "@/components/HomeScreen/WhiteBackgroundArt";

const { width: SW } = Dimensions.get("window");

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function useThemeColors() {
  const { settings } = useSettings();
  const w = settings.whiteTheme === true;
  return {
    isWhite: w,
    bg: w ? "#F9F6F0" : "#080814",
    text: w ? "#1A1409" : "#FAFAFA",
    textSecondary: w ? "rgba(26,20,9,0.58)" : "rgba(255,255,255,0.55)",
    textTertiary: w ? "rgba(26,20,9,0.38)" : "rgba(255,255,255,0.35)",
    textMuted: w ? "rgba(26,20,9,0.28)" : "rgba(255,255,255,0.28)",
    textFaint: w ? "rgba(26,20,9,0.18)" : "rgba(255,255,255,0.15)",
    cardBg: w ? "rgba(254,253,251,0.88)" : "rgba(12,12,26,0.45)",
    blurTint: w ? "light" : "dark",
    compassBg: w ? "rgba(248,244,236,0.95)" : "rgba(8,8,18,0.90)",
    statusBar: w ? "dark" : "light",
  };
}

function calculateQiblaBearing(userLat, userLng) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const lat1 = toRad(userLat);
  const lat2 = toRad(KAABA_LAT);
  const dLng = toRad(KAABA_LNG - userLng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

function calculateDistance(userLat, userLng) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(KAABA_LAT - userLat);
  const dLng = toRad(KAABA_LNG - userLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(userLat)) *
      Math.cos(toRad(KAABA_LAT)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCompassDirection(bearing) {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return dirs[Math.round(bearing / 22.5) % 16];
}

// Background orbs
function BackgroundOrbs({ isFacingQibla }) {
  const o1 = useSharedValue(0.06);
  const o2 = useSharedValue(0.04);
  const o3 = useSharedValue(0.03);
  const dx1 = useSharedValue(0);
  const dy1 = useSharedValue(0);
  const scale1 = useSharedValue(1);
  const dx2 = useSharedValue(0);

  useEffect(() => {
    o1.value = withRepeat(
      withSequence(
        withTiming(0.16, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.04, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    dx1.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-30, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    dy1.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
        withTiming(20, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    scale1.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.92, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
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
          withTiming(0.03, {
            duration: 7000,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
    dx2.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(-25, {
            duration: 11000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(25, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    o3.value = withDelay(
      4000,
      withRepeat(
        withSequence(
          withTiming(0.1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.02, {
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const s1 = useAnimatedStyle(() => ({
    opacity: o1.value,
    transform: [
      { translateX: dx1.value },
      { translateY: dy1.value },
      { scale: scale1.value },
    ],
  }));
  const s2 = useAnimatedStyle(() => ({
    opacity: o2.value,
    transform: [{ translateX: dx2.value }],
  }));
  const s3 = useAnimatedStyle(() => ({ opacity: o3.value }));

  const c1 = isFacingQibla ? "#00FFAA" : "#D4AF37";
  const c2 = isFacingQibla ? "#D4AF37" : "#B8860B";

  return (
    <View
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 1.1,
            height: SW * 1.1,
            borderRadius: SW * 0.55,
            top: -SW * 0.5,
            left: -SW * 0.2,
          },
          s1,
        ]}
      >
        <LinearGradient
          colors={[c1, `${c1}40`, `${c1}10`, "transparent"]}
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
            bottom: SW * 0.1,
            right: -SW * 0.2,
          },
          s2,
        ]}
      >
        <LinearGradient
          colors={[c2, `${c2}30`, "transparent"]}
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
            top: SW * 0.5,
            left: SW * 0.3,
          },
          s3,
        ]}
      >
        <LinearGradient
          colors={["#D4AF37", "rgba(212,175,55,0.2)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.25 }}
        />
      </Animated.View>
    </View>
  );
}

// Shimmer sweep
function ShimmerSweep({ color }) {
  const translateX = useSharedValue(-SW);
  useEffect(() => {
    translateX.value = withDelay(
      2000,
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
    transform: [{ translateX: translateX.value }],
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

// Memoized static compass SVG
const COMPASS_SIZE = SW - 64;
const C_CENTER = COMPASS_SIZE / 2;
const C_OUTER = C_CENTER - 8;
const C_INNER = C_OUTER - 24;
const C_TICK = C_INNER - 4;

const StaticCompassSvg = React.memo(function StaticCompassSvg({
  qiblaBearing,
  isWhite,
}) {
  const ticks = [];
  for (let i = 0; i < 360; i += 5) {
    const isMajor = i % 30 === 0;
    const isMid = i % 15 === 0 && !isMajor;
    const len = isMajor ? 16 : isMid ? 10 : 5;
    const a = (i * Math.PI) / 180;
    const r1 = C_TICK;
    const r2 = C_TICK - len;
    ticks.push(
      <Line
        key={`t${i}`}
        x1={C_CENTER + r1 * Math.sin(a)}
        y1={C_CENTER - r1 * Math.cos(a)}
        x2={C_CENTER + r2 * Math.sin(a)}
        y2={C_CENTER - r2 * Math.cos(a)}
        stroke={
          isMajor
            ? isWhite
              ? "rgba(139,105,20,0.55)"
              : "rgba(212,175,55,0.5)"
            : isMid
              ? isWhite
                ? "rgba(0,0,0,0.18)"
                : "rgba(255,255,255,0.12)"
              : isWhite
                ? "rgba(0,0,0,0.08)"
                : "rgba(255,255,255,0.05)"
        }
        strokeWidth={isMajor ? "1.8" : isMid ? "1" : "0.5"}
      />,
    );
  }

  const cardinals = [
    { l: "N", a: 0, c: isWhite ? "#8B6914" : "#D4AF37", s: 18 },
    {
      l: "E",
      a: 90,
      c: isWhite ? "rgba(28,19,8,0.55)" : "rgba(255,255,255,0.4)",
      s: 15,
    },
    {
      l: "S",
      a: 180,
      c: isWhite ? "rgba(28,19,8,0.55)" : "rgba(255,255,255,0.4)",
      s: 15,
    },
    {
      l: "W",
      a: 270,
      c: isWhite ? "rgba(28,19,8,0.55)" : "rgba(255,255,255,0.4)",
      s: 15,
    },
  ];
  const cardinalLabels = cardinals.map((cd) => {
    const ang = (cd.a * Math.PI) / 180;
    const r = C_TICK - 30;
    return (
      <SvgText
        key={cd.l}
        x={C_CENTER + r * Math.sin(ang)}
        y={C_CENTER - r * Math.cos(ang) + cd.s / 3}
        fill={cd.c}
        fontSize={cd.s}
        fontWeight={cd.a === 0 ? "800" : "500"}
        textAnchor="middle"
      >
        {cd.l}
      </SvgText>
    );
  });

  const degLabels = [];
  for (let i = 30; i < 360; i += 30) {
    if (i === 90 || i === 180 || i === 270) continue;
    const ang = (i * Math.PI) / 180;
    const r = C_TICK - 28;
    degLabels.push(
      <SvgText
        key={`d${i}`}
        x={C_CENTER + r * Math.sin(ang)}
        y={C_CENTER - r * Math.cos(ang) + 4}
        fill={isWhite ? "rgba(28,19,8,0.30)" : "rgba(255,255,255,0.18)"}
        fontSize="11"
        fontWeight="400"
        textAnchor="middle"
      >
        {i}°
      </SvgText>,
    );
  }

  // Qibla needle
  const qA = (qiblaBearing * Math.PI) / 180;
  const nLen = C_TICK - 50;
  const tipX = C_CENTER + nLen * Math.sin(qA);
  const tipY = C_CENTER - nLen * Math.cos(qA);
  const nW = 10;
  const pA = qA + Math.PI / 2;
  const bX1 = C_CENTER + nW * Math.sin(pA);
  const bY1 = C_CENTER - nW * Math.cos(pA);
  const bX2 = C_CENTER - nW * Math.sin(pA);
  const bY2 = C_CENTER + nW * Math.cos(pA);
  const tLen = 35;
  const tX = C_CENTER - tLen * Math.sin(qA);
  const tY = C_CENTER + tLen * Math.cos(qA);
  const tW = 6;
  const tX1 = C_CENTER + tW * Math.sin(pA);
  const tY1 = C_CENTER - tW * Math.cos(pA);
  const tX2 = C_CENTER - tW * Math.sin(pA);
  const tY2 = C_CENTER + tW * Math.cos(pA);

  // Kaaba marker
  const kR = C_TICK + 2;
  const kX = C_CENTER + kR * Math.sin(qA);
  const kY = C_CENTER - kR * Math.cos(qA);

  return (
    <Svg width={COMPASS_SIZE} height={COMPASS_SIZE}>
      <Defs>
        <RadialGradient id="cBg" cx="50%" cy="50%" r="50%">
          <Stop
            offset="0%"
            stopColor={
              isWhite ? "rgba(139,105,20,0.06)" : "rgba(212,175,55,0.04)"
            }
          />
          <Stop offset="100%" stopColor="transparent" />
        </RadialGradient>
        <SvgLinearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop
            offset="0"
            stopColor={isWhite ? "#00693A" : "#00FFAA"}
            stopOpacity="1"
          />
          <Stop
            offset="1"
            stopColor={isWhite ? "#00693A" : "#00FFAA"}
            stopOpacity="0.6"
          />
        </SvgLinearGradient>
      </Defs>
      <Circle cx={C_CENTER} cy={C_CENTER} r={C_OUTER} fill="url(#cBg)" />
      <Circle
        cx={C_CENTER}
        cy={C_CENTER}
        r={C_OUTER}
        stroke={isWhite ? "rgba(0,0,0,0.07)" : "rgba(212,175,55,0.08)"}
        strokeWidth="1"
        fill="none"
      />
      <Circle
        cx={C_CENTER}
        cy={C_CENTER}
        r={C_INNER}
        stroke={isWhite ? "rgba(0,0,0,0.11)" : "rgba(212,175,55,0.15)"}
        strokeWidth="1.5"
        fill="none"
      />
      <Circle
        cx={C_CENTER}
        cy={C_CENTER}
        r={C_INNER - 50}
        stroke={isWhite ? "rgba(0,0,0,0.04)" : "rgba(212,175,55,0.05)"}
        strokeWidth="0.8"
        fill="none"
      />
      {ticks}
      {cardinalLabels}
      {degLabels}
      <Polygon
        points={`${tipX},${tipY} ${bX1},${bY1} ${bX2},${bY2}`}
        fill="url(#needleGrad)"
        opacity="0.9"
      />
      <Polygon
        points={`${tX},${tY} ${tX1},${tY1} ${tX2},${tY2}`}
        fill="rgba(0,102,255,0.35)"
      />
      <Circle
        cx={C_CENTER}
        cy={C_CENTER}
        r="8"
        fill={isWhite ? "rgba(139,105,20,0.18)" : "rgba(212,175,55,0.15)"}
        opacity={isWhite ? "1" : "0.15"}
      />
      <Circle
        cx={C_CENTER}
        cy={C_CENTER}
        r="5"
        fill={isWhite ? "#8B6914" : "#D4AF37"}
        opacity={isWhite ? "1" : "0.6"}
      />
      <Circle cx={C_CENTER} cy={C_CENTER} r="2.5" fill="#050505" />
      <G transform={`translate(${kX - 10}, ${kY - 10})`}>
        <Circle
          cx="10"
          cy="10"
          r="10"
          fill={isWhite ? "rgba(0,105,58,0.22)" : "rgba(0,255,170,0.25)"}
        />
        <Path
          d="M6 6 L14 6 L14 14 L6 14 Z"
          fill={isWhite ? "#00693A" : "#00FFAA"}
          stroke="#050505"
          strokeWidth="0.5"
        />
        <Path
          d="M8.5 10 L8.5 14 L11.5 14 L11.5 10 Z"
          fill="#050505"
          opacity="0.6"
        />
      </G>
    </Svg>
  );
});

export default function QiblaScreen() {
  const insets = useSafeAreaInsets();
  const C = useThemeColors();
  const [locationStatus, setLocationStatus] = useState("loading");
  const [userLocation, setUserLocation] = useState(null);
  const [cityName, setCityName] = useState("");
  const [qiblaBearing, setQiblaBearing] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isFacingQibla, setIsFacingQibla] = useState(false);
  const [displayHeading, setDisplayHeading] = useState(0);
  const [headingAccuracy, setHeadingAccuracy] = useState(-1);

  const headingSubRef = useRef(null);
  const lastTextUpdateRef = useRef(0);
  const lastFacingRef = useRef(false);

  const compassRotation = useSharedValue(0);
  const qiblaGlow = useSharedValue(0);
  const facingScale = useSharedValue(1);
  const compassOpacity = useSharedValue(0);
  const headerLineWidth = useSharedValue(0);
  const headerGlow = useSharedValue(0);
  const bearingScale = useSharedValue(0.8);
  const iconPulse = useSharedValue(1);

  // Header animations
  useEffect(() => {
    headerLineWidth.value = withDelay(
      300,
      withSpring(28, { damping: 12, stiffness: 80 }),
    );
    headerGlow.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0.12, {
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    iconPulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  // Facing qibla effects
  useEffect(() => {
    if (isFacingQibla) {
      qiblaGlow.value = withRepeat(
        withSequence(
          withTiming(0.35, { duration: 1200 }),
          withTiming(0.12, { duration: 1200 }),
        ),
        -1,
        true,
      );
      facingScale.value = withSpring(1.05, { damping: 8 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      qiblaGlow.value = withTiming(0, { duration: 500 });
      facingScale.value = withSpring(1, { damping: 12 });
    }
  }, [isFacingQibla]);

  // Location + heading init
  useEffect(() => {
    let isMounted = true;
    let bearingVal = 0;

    async function init() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (isMounted) setLocationStatus("denied");
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (!isMounted) return;

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        bearingVal = calculateQiblaBearing(lat, lng);
        setQiblaBearing(bearingVal);
        setDistance(calculateDistance(lat, lng));

        try {
          const addresses = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lng,
          });
          if (addresses?.length > 0 && isMounted) {
            const addr = addresses[0];
            setCityName(
              `${addr.city || addr.subregion || addr.region || "Unknown"}, ${addr.country || ""}`,
            );
          }
        } catch {
          if (isMounted) setCityName("Location found");
        }

        headingSubRef.current = await Location.watchHeadingAsync(
          (headingData) => {
            if (!isMounted) return;
            const trueHeading =
              headingData.trueHeading >= 0
                ? headingData.trueHeading
                : headingData.magHeading;
            const accuracy = headingData.accuracy ?? -1;

            compassRotation.value = withTiming(-trueHeading, {
              duration: 120,
              easing: Easing.out(Easing.quad),
            });

            const now = Date.now();
            if (now - lastTextUpdateRef.current > 100) {
              lastTextUpdateRef.current = now;
              setDisplayHeading(Math.round(trueHeading));
              if (accuracy !== undefined) setHeadingAccuracy(accuracy);
            }

            let diff = Math.abs(bearingVal - trueHeading);
            if (diff > 180) diff = 360 - diff;
            const facing = diff <= 8;
            if (facing !== lastFacingRef.current) {
              lastFacingRef.current = facing;
              setIsFacingQibla(facing);
            }
          },
        );

        compassOpacity.value = withTiming(1, { duration: 800 });
        bearingScale.value = withDelay(
          500,
          withSpring(1, { damping: 10, stiffness: 80 }),
        );
        if (isMounted) setLocationStatus("ready");
      } catch (err) {
        console.error("Qibla init error:", err);
        if (isMounted) setLocationStatus("error");
      }
    }

    init();
    return () => {
      isMounted = false;
      if (headingSubRef.current) headingSubRef.current.remove();
    };
  }, []);

  const lineStyle = useAnimatedStyle(() => ({ width: headerLineWidth.value }));
  const headerGlowStyle = useAnimatedStyle(() => ({
    opacity: headerGlow.value,
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconPulse.value }],
  }));
  const qiblaGlowStyle = useAnimatedStyle(() => ({ opacity: qiblaGlow.value }));
  const facingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: facingScale.value }],
  }));
  const compassFadeStyle = useAnimatedStyle(() => ({
    opacity: compassOpacity.value,
  }));
  const compassRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${compassRotation.value}deg` }],
  }));
  const bearingEntrance = useAnimatedStyle(() => ({
    transform: [{ scale: bearingScale.value }],
  }));

  const compassSvg = useMemo(
    () => <StaticCompassSvg qiblaBearing={qiblaBearing} isWhite={C.isWhite} />,
    [qiblaBearing, C.isWhite],
  );

  const accentColor = isFacingQibla ? "#00FFAA" : "#D4AF37";

  // Loading state
  const renderLoading = () => (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#D4AF37" />
      <Text
        style={{
          fontFamily: "Montserrat_300Light",
          fontSize: 14,
          color: C.textSecondary,
          marginTop: 16,
        }}
      >
        Finding your location...
      </Text>
    </View>
  );

  // Denied state
  const renderDenied = () => (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <LinearGradient
          colors={[
            "rgba(255,76,110,0.15)",
            "rgba(255,76,110,0.05)",
            "transparent",
          ]}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,76,110,0.15)",
          }}
        >
          <AlertCircle size={36} color="#FF4C6E" strokeWidth={1.5} />
        </LinearGradient>
      </View>
      <Text
        style={{
          fontFamily: "PlayfairDisplay_700Bold",
          fontSize: 20,
          color: C.text,
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        Location Permission Needed
      </Text>
      <Text
        style={{
          fontFamily: "Montserrat_300Light",
          fontSize: 14,
          color: C.textSecondary,
          textAlign: "center",
          lineHeight: 22,
          marginBottom: 28,
        }}
      >
        Qibla direction requires your location to accurately calculate the
        direction to the Holy Ka'bah.
      </Text>
      <TouchableOpacity
        onPress={() => Linking.openSettings()}
        style={{ borderRadius: 20, overflow: "hidden" }}
      >
        <LinearGradient
          colors={["#D4AF37", "#B8860B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 14,
              color: "#050510",
            }}
          >
            Open Settings
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Error state
  const renderError = () => (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <LinearGradient
          colors={["rgba(255,76,110,0.15)", "transparent"]}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,76,110,0.15)",
          }}
        >
          <AlertCircle size={36} color="#FF4C6E" strokeWidth={1.5} />
        </LinearGradient>
      </View>
      <Text
        style={{
          fontFamily: "PlayfairDisplay_700Bold",
          fontSize: 20,
          color: C.text,
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        Something went wrong
      </Text>
      <Text
        style={{
          fontFamily: "Montserrat_300Light",
          fontSize: 14,
          color: C.textSecondary,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        Could not get your location. Please make sure location services are
        enabled and try again.
      </Text>
    </View>
  );

  const renderCompass = () => (
    <>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        {!C.isWhite && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: -10,
                left: 0,
                right: 0,
                height: 60,
              },
              headerGlowStyle,
            ]}
          >
            <LinearGradient
              colors={[`${accentColor}12`, "transparent"]}
              style={{ flex: 1 }}
            />
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
        >
          <Animated.View style={iconStyle}>
            <Compass size={22} color={`${accentColor}80`} strokeWidth={1.5} />
          </Animated.View>
          <Text
            style={{
              fontFamily: "PlayfairDisplay_700Bold",
              fontSize: 30,
              color: C.text,
              letterSpacing: -0.5,
              textShadowColor: C.isWhite ? "transparent" : `${accentColor}08`,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: C.isWhite ? 0 : 6,
            }}
          >
            Qibla Direction
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginTop: 8,
          }}
        >
          <Animated.View style={[{ height: 1, overflow: "hidden" }, lineStyle]}>
            <LinearGradient
              colors={[`${accentColor}60`, `${accentColor}00`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
          <MapPin size={11} color={`${accentColor}70`} strokeWidth={2} />
          <Text
            style={{
              fontFamily: "Montserrat_300Light",
              fontSize: 12,
              color: C.textTertiary,
            }}
          >
            {cityName || "Locating..."}
          </Text>
        </Animated.View>
      </View>

      {/* Facing status badge */}
      <Animated.View
        entering={FadeIn.delay(200).duration(400)}
        style={{ alignItems: "center", marginBottom: 14 }}
      >
        {headingAccuracy >= 0 && headingAccuracy < 2 && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["rgba(255,140,0,0.1)", "rgba(255,140,0,0.03)"]}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 14,
                borderWidth: 0.5,
                borderColor: "rgba(255,140,0,0.2)",
              }}
            >
              <AlertCircle size={14} color="#FF8C00" />
              <Text
                style={{
                  fontFamily: "Montserrat_300Light",
                  fontSize: 11,
                  color: "#FF8C00",
                }}
              >
                Move your phone in a figure-8 to calibrate
              </Text>
            </LinearGradient>
          </Animated.View>
        )}
        <Animated.View
          style={[
            {
              borderRadius: 22,
              overflow: "hidden",
              borderWidth: 0.5,
              borderColor: isFacingQibla
                ? "rgba(0,255,170,0.25)"
                : C.isWhite
                  ? "rgba(0,0,0,0.06)"
                  : "rgba(255,255,255,0.06)",
            },
            facingStyle,
          ]}
        >
          <BlurView
            intensity={15}
            tint={C.blurTint}
            style={{
              paddingHorizontal: 22,
              paddingVertical: 9,
              backgroundColor: C.isWhite
                ? "rgba(255,255,255,0.6)"
                : "transparent",
            }}
          >
            {isFacingQibla && (
              <LinearGradient
                colors={["rgba(0,255,170,0.1)", "transparent"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
            )}
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 12,
                letterSpacing: 2,
                color: isFacingQibla ? "#00FFAA" : C.textTertiary,
                textShadowColor: isFacingQibla
                  ? "rgba(0,255,170,0.4)"
                  : "transparent",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: isFacingQibla ? 8 : 0,
              }}
            >
              {isFacingQibla ? "✦ FACING QIBLA ✦" : "ALIGN TO QIBLA"}
            </Text>
          </BlurView>
        </Animated.View>
      </Animated.View>

      {/* Compass */}
      <Animated.View
        entering={FadeIn.delay(300).duration(800)}
        style={[
          { alignItems: "center", paddingHorizontal: 32 },
          compassFadeStyle,
        ]}
      >
        {/* Fixed direction arrow */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 10,
            borderRightWidth: 10,
            borderBottomWidth: 14,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: accentColor,
            marginBottom: 6,
          }}
        />

        {/* Compass ring with glassmorphic border */}
        <View
          style={{
            borderRadius: COMPASS_SIZE / 2,
            overflow: "hidden",
            borderWidth: 1.5,
            borderColor: isFacingQibla
              ? "rgba(0,255,170,0.25)"
              : "rgba(212,175,55,0.1)",
            ...(C.isWhite ? getShadow(true, "elevated") : SHADOWS.glow(accentColor)),
          }}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: COMPASS_SIZE / 2,
                backgroundColor: "#00FFAA",
              },
              qiblaGlowStyle,
            ]}
          />
          <View
            style={{
              width: COMPASS_SIZE,
              height: COMPASS_SIZE,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: C.compassBg,
            }}
          >
            <Animated.View style={compassRotateStyle}>
              {compassSvg}
            </Animated.View>
          </View>
        </View>
      </Animated.View>

      {/* Info below compass */}
      <Animated.View
        entering={FadeInDown.delay(600).duration(500)}
        style={[
          { alignItems: "center", marginTop: 24, paddingHorizontal: 20 },
          bearingEntrance,
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text
            style={{
              fontFamily: "Montserrat_700Bold",
              fontSize: 50,
              color: accentColor,
              textShadowColor: C.isWhite ? "transparent" : `${accentColor}20`,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: C.isWhite ? 0 : 6,
            }}
          >
            {Math.round(qiblaBearing)}°
          </Text>
          <Text
            style={{
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 22,
              marginLeft: 6,
              color: `${accentColor}80`,
            }}
          >
            {getCompassDirection(qiblaBearing)}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: "Montserrat_300Light",
            fontSize: 13,
            color: C.textTertiary,
            marginTop: 4,
          }}
        >
          Direction to the Holy Ka'bah
        </Text>

        {/* Distance + Heading cards */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginTop: 24,
            width: "100%",
          }}
        >
          <Animated.View
            entering={FadeInLeft.delay(700).duration(500).springify()}
            style={{ flex: 1 }}
          >
            <View
              style={{
                borderRadius: 22,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: C.isWhite
                  ? `${accentColor}20`
                  : `${accentColor}12`,
                ...getShadow(C.isWhite, "soft"),
              }}
            >
              <BlurView
                intensity={15}
                tint={C.blurTint}
                style={{
                  padding: 18,
                  alignItems: "center",
                  backgroundColor: C.cardBg,
                }}
              >
                {!C.isWhite && <ShimmerSweep color={accentColor} />}
                {!C.isWhite && (
                  <LinearGradient
                    colors={[`${accentColor}08`, "transparent"]}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                )}
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    marginBottom: 10,
                  }}
                >
                  <LinearGradient
                    colors={[
                      `${accentColor}18`,
                      `${accentColor}06`,
                      "transparent",
                    ]}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 0.5,
                      borderColor: `${accentColor}15`,
                    }}
                  >
                    <Navigation
                      size={16}
                      color={`${accentColor}80`}
                      strokeWidth={1.5}
                    />
                  </LinearGradient>
                </View>
                <Text
                  style={{
                    fontFamily: "Montserrat_700Bold",
                    fontSize: 20,
                    color: C.text,
                    marginBottom: 3,
                    textShadowColor: C.isWhite
                      ? "transparent"
                      : `${accentColor}30`,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: C.isWhite ? 0 : 4,
                  }}
                >
                  {distance < 1000
                    ? `${Math.round(distance)} km`
                    : `${(distance / 1000).toFixed(1)}k km`}
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 11,
                    color: C.textMuted,
                  }}
                >
                  to Makkah
                </Text>
              </BlurView>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInRight.delay(800).duration(500).springify()}
            style={{ flex: 1 }}
          >
            <View
              style={{
                borderRadius: 22,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: C.isWhite
                  ? `${accentColor}20`
                  : `${accentColor}12`,
                ...getShadow(C.isWhite, "soft"),
              }}
            >
              <BlurView
                intensity={15}
                tint={C.blurTint}
                style={{
                  padding: 18,
                  alignItems: "center",
                  backgroundColor: C.cardBg,
                }}
              >
                {!C.isWhite && <ShimmerSweep color={accentColor} />}
                {!C.isWhite && (
                  <LinearGradient
                    colors={[`${accentColor}08`, "transparent"]}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                )}
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    marginBottom: 10,
                  }}
                >
                  <LinearGradient
                    colors={[
                      `${accentColor}18`,
                      `${accentColor}06`,
                      "transparent",
                    ]}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 0.5,
                      borderColor: `${accentColor}15`,
                    }}
                  >
                    <View
                      style={{
                        width: 0,
                        height: 0,
                        borderLeftWidth: 5,
                        borderRightWidth: 5,
                        borderBottomWidth: 9,
                        borderLeftColor: "transparent",
                        borderRightColor: "transparent",
                        borderBottomColor: `${accentColor}80`,
                      }}
                    />
                  </LinearGradient>
                </View>
                <Text
                  style={{
                    fontFamily: "Montserrat_700Bold",
                    fontSize: 20,
                    color: C.text,
                    marginBottom: 3,
                    textShadowColor: C.isWhite
                      ? "transparent"
                      : `${accentColor}30`,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: C.isWhite ? 0 : 4,
                  }}
                >
                  {displayHeading}°
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 11,
                    color: C.textMuted,
                  }}
                >
                  Your Heading
                </Text>
              </BlurView>
            </View>
          </Animated.View>
        </View>

        {/* Coordinates */}
        <Animated.View
          entering={FadeIn.delay(900).duration(400)}
          style={{ marginTop: 18, alignItems: "center" }}
        >
          <LinearGradient
            colors={[
              `${accentColor}00`,
              `${accentColor}15`,
              `${accentColor}00`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: 60, height: 1, marginBottom: 10 }}
          />
          <Text
            style={{
              fontFamily: "Montserrat_300Light",
              fontSize: 10,
              color: C.textFaint,
              letterSpacing: 0.5,
            }}
          >
            {userLocation
              ? `${userLocation.lat.toFixed(4)}°N, ${userLocation.lng.toFixed(4)}°${userLocation.lng >= 0 ? "E" : "W"} → ${KAABA_LAT}°N, ${KAABA_LNG}°E`
              : ""}
          </Text>
        </Animated.View>
      </Animated.View>
    </>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.isWhite
          ? "#F9F6F0"
          : "rgba(5,5,16,0.55)",
      }}
    >
      <StatusBar style={C.statusBar} />

      {/* White theme background */}
      {C.isWhite && <WhiteBackgroundArt />}

      <ScrollView
        style={{ flex: 1, paddingTop: insets.top + 16 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {locationStatus === "loading" && renderLoading()}
        {locationStatus === "denied" && renderDenied()}
        {locationStatus === "error" && renderError()}
        {locationStatus === "ready" && renderCompass()}
      </ScrollView>
    </View>
  );
}
