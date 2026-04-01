import { useEffect, useState, memo } from "react";
import { View, Text, Pressable } from "react-native";
import { MapPin, Moon, Sun, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  FadeInLeft,
  FadeInRight,
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
import { WHITE_THEME } from "@/utils/iqamaTheme";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return { text: "Tahajjud Time", icon: "moon", emoji: "🌙" };
  if (h < 7) return { text: "Fajr Mubarak", icon: "sparkle", emoji: "✨" };
  if (h < 12) return { text: "Good Morning", icon: "sparkle", emoji: "☀️" };
  if (h < 16) return { text: "Good Afternoon", icon: null, emoji: "🌤" };
  if (h < 19) return { text: "Good Evening", icon: "moon", emoji: "🌅" };
  return { text: "Good Night", icon: "moon", emoji: "🌙" };
}

// Decorative geometric diamond
function GeometricAccent({ color, delay, animateOnMount = true }) {
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(animateOnMount ? 0 : 1);

  useEffect(() => {
    const rotation = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    );

    opacity.value = animateOnMount
      ? withDelay(delay, withTiming(1, { duration: 800 }))
      : withTiming(1, { duration: 0 });
    rotate.value = animateOnMount ? withDelay(delay, rotation) : rotation;
  }, [animateOnMount, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 6,
          height: 6,
          borderWidth: 0.8,
          borderColor: color,
          transform: [{ rotate: "45deg" }],
        },
        style,
      ]}
    />
  );
}

export const HeaderSection = memo(function HeaderSection({
  userName,
  location,
  date,
  insets,
  isWhite,
  onToggleTheme,
  animateOnMount = true,
}) {
  const [greeting, setGreeting] = useState(getGreeting);

  useEffect(() => {
    const id = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // ── Dark theme colors ──────────────────────────────────────────────────────
  const tc = isWhite ? WHITE_THEME.text : "#FAFAFA";
  const ts = isWhite ? WHITE_THEME.textSub : "rgba(255,255,255,0.65)";
  const tm = isWhite ? WHITE_THEME.textTertiary : "rgba(255,255,255,0.55)";
  const tl = isWhite ? WHITE_THEME.textSub : "rgba(255,255,255,0.65)";
  const bc = isWhite ? WHITE_THEME.cardBorder : "rgba(255,255,255,0.06)";

  // Gold accent shades — richer in white mode
  const gc = isWhite ? WHITE_THEME.gold : "rgba(212,175,55,0.6)";
  const gca = isWhite ? WHITE_THEME.goldBright : "rgba(212,175,55,0.7)";
  const gcd = isWhite ? WHITE_THEME.gold : "rgba(212,175,55,0.4)";
  const gcd2 = isWhite ? "rgba(184,134,11,0.5)" : "rgba(212,175,55,0.3)";
  const glowC = isWhite ? "rgba(184,134,11,0.10)" : "rgba(212,175,55,0.15)";

  // Location pill background
  const pillBg1 = isWhite ? "rgba(184,134,11,0.08)" : "rgba(212,175,55,0.08)";
  const pillBg2 = isWhite ? "rgba(184,134,11,0.03)" : "rgba(255,255,255,0.03)";

  const iconPulse = useSharedValue(1);
  const lineWidth = useSharedValue(animateOnMount ? 0 : 32);
  const nameOpacity = useSharedValue(animateOnMount ? 0 : 1);
  const nameTranslateY = useSharedValue(animateOnMount ? 20 : 0);
  const greetingGlow = useSharedValue(0);

  useEffect(() => {
    if (greeting.icon) {
      iconPulse.value = withRepeat(
        withSequence(
          withTiming(1.25, {
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    }
    const glowLoop = withRepeat(
      withSequence(
        withTiming(isWhite ? 0.2 : 0.15, {
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    if (animateOnMount) {
      lineWidth.value = withDelay(
        400,
        withSpring(32, { damping: 12, stiffness: 80 }),
      );
      nameOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
      nameTranslateY.value = withDelay(
        200,
        withSpring(0, { damping: 14, stiffness: 90 }),
      );
      greetingGlow.value = withDelay(600, glowLoop);
      return;
    }

    lineWidth.value = 32;
    nameOpacity.value = 1;
    nameTranslateY.value = 0;
    greetingGlow.value = glowLoop;
  }, [animateOnMount, greeting.icon, isWhite]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconPulse.value }],
  }));
  const lineStyle = useAnimatedStyle(() => ({ width: lineWidth.value }));
  const nameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    transform: [{ translateY: nameTranslateY.value }],
  }));
  const glowBg = useAnimatedStyle(() => ({ opacity: greetingGlow.value }));

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 24,
        paddingBottom: 4,
      }}
    >
      {/* Glow behind header */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: insets.top - 20,
            left: 0,
            right: 0,
            height: 140,
          },
          glowBg,
        ]}
      >
        <LinearGradient colors={[glowC, "transparent"]} style={{ flex: 1 }} />
      </Animated.View>

      {/* ── Top row: Location pill + Theme toggle ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        {/* Location pill */}
        <Animated.View
          entering={animateOnMount ? FadeInLeft.delay(100).duration(500).springify() : undefined}
          style={{
            flexDirection: "row",
            alignItems: "center",
            overflow: "hidden",
            borderRadius: 20,
            borderWidth: isWhite ? 0.8 : 0.5,
            borderColor: isWhite ? WHITE_THEME.goldBorder : bc,
            ...(isWhite && {
              backgroundColor: "#FEFDFB",
              shadowColor: "#8B6914",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.12,
              shadowRadius: 10,
            }),
          }}
        >
          <LinearGradient
            colors={[pillBg1, pillBg2, "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 7,
            }}
          >
            <MapPin size={11} color={gca} strokeWidth={2} />
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 11,
                color: tl,
                letterSpacing: 0.3,
              }}
            >
              {location}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Theme toggle */}
        {onToggleTheme && (
          <Animated.View entering={animateOnMount ? FadeInRight.delay(200).duration(500).springify() : undefined}>
            <Pressable
              onPress={onToggleTheme}
              hitSlop={12}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isWhite
                  ? "rgba(184,134,11,0.08)"
                  : "rgba(212,175,55,0.08)",
                borderWidth: 0.5,
                borderColor: isWhite
                  ? WHITE_THEME.goldBorder
                  : "rgba(212,175,55,0.15)",
              }}
            >
              {isWhite ? (
                <Moon size={18} color={WHITE_THEME.gold} strokeWidth={1.8} />
              ) : (
                <Sun size={18} color="rgba(212,175,55,0.7)" strokeWidth={1.8} />
              )}
            </Pressable>
          </Animated.View>
        )}
      </View>

      {/* ── Greeting row ── */}
      <Animated.View
        entering={animateOnMount ? FadeInDown.delay(100).duration(500) : undefined}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <GeometricAccent color={gcd} delay={800} animateOnMount={animateOnMount} />

        {greeting.icon === "moon" && (
          <Animated.View style={iconStyle}>
            <Moon size={14} color={gc} />
          </Animated.View>
        )}
        {greeting.icon === "sparkle" && (
          <Animated.View style={iconStyle}>
            <Sparkles size={14} color={gc} />
          </Animated.View>
        )}

        <Text
          style={{
            fontFamily: "Montserrat_400Regular",
            fontSize: 13,
            color: ts,
            letterSpacing: 0.5,
          }}
        >
          {greeting.text}
        </Text>

        <GeometricAccent color={gcd2} delay={1200} animateOnMount={animateOnMount} />
      </Animated.View>

      {/* ── User name ── */}
      <Animated.View style={nameStyle}>
        <Text
          style={{
            fontFamily: "PlayfairDisplay_700Bold",
            fontSize: 34,
            color: tc,
            marginBottom: 10,
            letterSpacing: -0.5,
            textShadowColor: isWhite
              ? "rgba(184,134,11,0.10)"
              : "rgba(212,175,55,0.08)",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: isWhite ? 12 : 6,
          }}
        >
          {userName}
        </Text>
      </Animated.View>

      {/* ── Date row ── */}
      <Animated.View
        entering={animateOnMount ? FadeIn.delay(350).duration(500) : undefined}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {/* Gold accent line */}
        <Animated.View
          style={[
            { height: 1.5, overflow: "hidden", borderRadius: 1 },
            lineStyle,
          ]}
        >
          <LinearGradient
            colors={[gca, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>

        {date?.includes("Ramadan") && (
          <Animated.View
            entering={animateOnMount ? FadeInUp.delay(500).duration(400).springify() : undefined}
          >
            <Moon size={12} color={WHITE_THEME.gold} fill={WHITE_THEME.gold} />
          </Animated.View>
        )}

        <Text
          style={{
            fontFamily: "Montserrat_300Light",
            fontSize: 11,
            color: tm,
            letterSpacing: 0.3,
          }}
        >
          {date}
        </Text>

        {/* Trailing decorative dot */}
        {isWhite && (
          <View
            style={{
              width: 3,
              height: 3,
              borderRadius: 2,
              backgroundColor: WHITE_THEME.goldDim,
              marginLeft: 2,
            }}
          />
        )}
      </Animated.View>
    </View>
  );
});
