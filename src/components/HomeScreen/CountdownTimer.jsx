import { useState, useEffect, memo, useRef } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from "react-native-reanimated";

function AnimatedDigitBlock({ value, label, accentColor, isUrgent, isWhite }) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      scale.value = withSequence(
        withTiming(1.12, { duration: 80, easing: Easing.out(Easing.quad) }),
        withTiming(0.95, { duration: 80, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) }),
      );
      // Flash glow on change
      glowOpacity.value = withSequence(
        withTiming(0.4, { duration: 100 }),
        withTiming(0, { duration: 400 }),
      );
      prevValue.current = value;
    }
  }, [value]);

  useEffect(() => {
    if (isUrgent) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.05, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    }
  }, [isUrgent]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  const ac = isUrgent ? "#FF4C6E" : accentColor || "#D4AF37";

  return (
    <View style={{ alignItems: "center" }}>
      <Animated.View
        style={[
          {
            borderRadius: 16,
            overflow: "hidden",
            minWidth: 58,
            alignItems: "center",
            borderWidth: 0.5,
            borderColor: isWhite ? "rgba(0,0,0,0.10)" : `${ac}15`,
          },
          animStyle,
        ]}
      >
        {/* Glow behind on change */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: -10,
              left: -10,
              right: -10,
              bottom: -10,
              borderRadius: 20,
              backgroundColor: ac,
            },
            glowStyle,
          ]}
        />
        <LinearGradient
          colors={
            isWhite
              ? ["rgba(0,0,0,0.04)", "rgba(0,0,0,0.03)", "rgba(0,0,0,0.02)"]
              : [`${ac}0C`, `${ac}04`, "rgba(255,255,255,0.02)"]
          }
          style={{
            paddingHorizontal: 14,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Montserrat_700Bold",
              fontSize: 24,
              color: isUrgent ? "#FF4C6E" : isWhite ? "#1C1308" : "#FAFAFA",
              fontVariant: ["tabular-nums"],
              textShadowColor: isUrgent
                ? "rgba(255,76,110,0.4)"
                : isWhite ? "transparent" : `${ac}30`,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: isUrgent ? 10 : 8,
            }}
          >
            {String(value).padStart(2, "0")}
          </Text>
        </LinearGradient>
      </Animated.View>
      <Text
        style={{
          fontFamily: "Montserrat_600SemiBold",
          fontSize: 8,
          color: isUrgent
            ? "rgba(255,76,110,0.6)"
            : isWhite
              ? "rgba(28,19,8,0.45)"
              : `${ac}60`,
          letterSpacing: 2.5,
          marginTop: 5,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function AnimatedSeparator({ accentColor, isUrgent }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Pure Reanimated loop — no JS thread setInterval needed
    opacity.value = withRepeat(
      withSequence(
        withTiming(isUrgent ? 1 : 0.8, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(isUrgent ? 0.3 : 0.15, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [isUrgent]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ justifyContent: "center", paddingBottom: 16 }, style]}
    >
      <Text
        style={{
          fontFamily: "Montserrat_300Light",
          fontSize: 22,
          color: isUrgent ? "#FF4C6E" : accentColor || "rgba(255,255,255,0.3)",
        }}
      >
        :
      </Text>
    </Animated.View>
  );
}

export const CountdownTimer = memo(
  ({ nextPrayerObj, accentColor, isWhite }) => {
    const [t, setT] = useState({ h: 0, m: 0, s: 0 });
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
      if (!nextPrayerObj) return;
      const calc = () => {
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
        const d = target - now;
        if (d > 0) {
          setT({
            h: Math.floor(d / 3600000),
            m: Math.floor((d % 3600000) / 60000),
            s: Math.floor((d % 60000) / 1000),
          });
          setIsUrgent(d < 15 * 60 * 1000); // < 15 min
        }
      };
      calc();
      const i = setInterval(calc, 1000);
      return () => clearInterval(i);
    }, [nextPrayerObj]);

    return (
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
        <AnimatedDigitBlock
          value={t.h}
          label="HRS"
          accentColor={accentColor}
          isUrgent={isUrgent}
          isWhite={isWhite}
        />
        <AnimatedSeparator accentColor={accentColor} isUrgent={isUrgent} />
        <AnimatedDigitBlock
          value={t.m}
          label="MIN"
          accentColor={accentColor}
          isUrgent={isUrgent}
          isWhite={isWhite}
        />
        <AnimatedSeparator accentColor={accentColor} isUrgent={isUrgent} />
        <AnimatedDigitBlock
          value={t.s}
          label="SEC"
          accentColor={accentColor}
          isUrgent={isUrgent}
          isWhite={isWhite}
        />
      </View>
    );
  },
);
