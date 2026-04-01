import { useEffect, memo } from "react";
import { View, Text } from "react-native";
import { BookOpen, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { WHITE_THEME } from "@/utils/iqamaTheme";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { PRAYER_AURA, SHADOWS } from "@/utils/iqamaTheme";

const CONTENT = {
  Fajr: {
    arabic:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
    translation:
      "O Allah, I ask You for beneficial knowledge, goodly provision and acceptable deeds.",
    ref: "Ibn Majah",
  },
  Dhuhr: {
    arabic:
      "اَللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    translation:
      "O Allah, help me to remember You, to thank You, and to worship You in an excellent manner.",
    ref: "Abu Dawud",
  },
  Asr: {
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ",
    translation:
      "Glory be to Allah and His is the praise. Glory be to Allah the Almighty.",
    ref: "Bukhari",
  },
  Maghrib: {
    arabic: "اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ",
    translation: "O Allah, protect me from the Fire. (7x)",
    ref: "Abu Dawud",
  },
  Isha: {
    arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    translation: "Ayat al-Kursi — a gateway to Paradise after every prayer.",
    ref: "An-Nasa'i",
  },
};

export const AfterPrayerDuaCard = memo(function AfterPrayerDuaCard({
  currentPrayerName,
  isWhite,
  animateOnMount = true,
}) {
  const dua = CONTENT[currentPrayerName] || CONTENT.Dhuhr;
  const aura = PRAYER_AURA[currentPrayerName] || PRAYER_AURA.Dhuhr;
  const iconPulse = useSharedValue(1);
  const glowOpacity = useSharedValue(0.05);
  const arabicOpacity = useSharedValue(animateOnMount ? 0 : 1);
  const arabicTranslateY = useSharedValue(animateOnMount ? 10 : 0);
  const translationOpacity = useSharedValue(animateOnMount ? 0 : 1);
  const cardScale = useSharedValue(animateOnMount ? 0.95 : 1);
  const sparkleRotate = useSharedValue(0);

  useEffect(() => {
    if (animateOnMount) {
      cardScale.value = withDelay(
        400,
        withSpring(1, { damping: 14, stiffness: 80 }),
      );
    } else {
      cardScale.value = 1;
    }
    iconPulse.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.02, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    if (animateOnMount) {
      arabicOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
      arabicTranslateY.value = withDelay(
        600,
        withSpring(0, { damping: 14, stiffness: 90 }),
      );
      translationOpacity.value = withDelay(
        1000,
        withTiming(1, { duration: 600 }),
      );
    } else {
      arabicOpacity.value = 1;
      arabicTranslateY.value = 0;
      translationOpacity.value = 1;
    }
    // Sparkle rotation
    sparkleRotate.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [animateOnMount, currentPrayerName]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconPulse.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const arabicStyle = useAnimatedStyle(() => ({
    opacity: arabicOpacity.value,
    transform: [{ translateY: arabicTranslateY.value }],
  }));
  const translationStyle = useAnimatedStyle(() => ({
    opacity: translationOpacity.value,
  }));
  const cardEntrance = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));
  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotate.value}deg` }],
  }));

  return (
    <Animated.View
      style={[{ paddingHorizontal: 20, marginBottom: 28 }, cardEntrance]}
    >
      <View
        style={{
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: isWhite ? 0.8 : 0.5,
          borderColor: isWhite ? `${aura.primary}35` : `${aura.primary}15`,
          ...(isWhite ? WHITE_THEME.cardShadowStrong : SHADOWS.card),
        }}
      >
        {/* ── White theme: ULTRA PREMIUM warm ivory gradient base ── */}
        {isWhite && (
          <LinearGradient
            colors={["#FEFDFB", "#F8F4EC", `${aura.primary}10`, "#F5EEE0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
        <BlurView
          intensity={isWhite ? 0 : 18}
          tint={isWhite ? "light" : "dark"}
          style={{
            padding: 24,
            backgroundColor: isWhite ? "transparent" : "rgba(10,10,20,0.55)",
          }}
        >
          {/* Background glow */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: -20,
                right: -20,
                width: 140,
                height: 140,
                borderRadius: 70,
              },
              glowStyle,
            ]}
          >
            <LinearGradient
              colors={[aura.primary, `${aura.primary}40`, "transparent"]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, borderRadius: 70 }}
            />
          </Animated.View>

          {/* Second glow — bottom left */}
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: -15,
                left: -15,
                width: 100,
                height: 100,
                borderRadius: 50,
              },
              glowStyle,
            ]}
          >
            <LinearGradient
              colors={[`${aura.secondary}30`, "transparent"]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, borderRadius: 50 }}
            />
          </Animated.View>

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <Animated.View style={iconStyle}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LinearGradient
                  colors={[
                    `${aura.primary}20`,
                    `${aura.primary}08`,
                    "transparent",
                  ]}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 0.5,
                    borderColor: `${aura.primary}20`,
                  }}
                >
                  <BookOpen
                    size={16}
                    color={`${aura.primary}CC`}
                    strokeWidth={1.5}
                  />
                </LinearGradient>
              </View>
            </Animated.View>
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 10,
                color: `${aura.primary}90`,
                letterSpacing: 2,
                flex: 1,
              }}
            >
              AFTER {currentPrayerName?.toUpperCase()}
            </Text>
            <Animated.View style={sparkleStyle}>
              <Sparkles size={12} color={`${aura.primary}40`} />
            </Animated.View>
          </View>

          {/* Arabic text with reveal animation */}
          <Animated.View style={arabicStyle}>
            <Text
              style={{
                fontFamily: "Amiri_400Regular",
                fontSize: 26,
                color: isWhite ? WHITE_THEME.text : "rgba(255,255,255,0.9)",
                lineHeight: 46,
                textAlign: "right",
                marginBottom: 18,
                textShadowColor: isWhite ? "transparent" : `${aura.primary}10`,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: isWhite ? 0 : 4,
              }}
            >
              {dua.arabic}
            </Text>
          </Animated.View>

          {/* Gradient divider */}
          <LinearGradient
            colors={[
              `${aura.primary}00`,
              `${aura.primary}30`,
              `${aura.primary}00`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 1, marginBottom: 16 }}
          />

          {/* Translation with reveal */}
          <Animated.View style={translationStyle}>
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 13,
                color: isWhite ? WHITE_THEME.textSub : "rgba(255,255,255,0.55)",
                lineHeight: 22,
                marginBottom: 14,
              }}
            >
              {dua.translation}
            </Text>
          </Animated.View>

          {/* Reference */}
          <Animated.View entering={animateOnMount ? FadeIn.delay(1200).duration(400) : undefined}>
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 11,
                color: isWhite
                  ? WHITE_THEME.textTertiary
                  : "rgba(255,255,255,0.25)",
              }}
            >
              — {dua.ref}
            </Text>
          </Animated.View>
        </BlurView>
      </View>
    </Animated.View>
  );
});
