import { useEffect } from "react";
import { Text, TouchableOpacity, View, Dimensions } from "react-native";
import { Eye } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { WHITE_THEME } from "@/utils/iqamaTheme";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { router } from "expo-router";
import { PRAYER_AURA, SHADOWS } from "@/utils/iqamaTheme";

const { width: SW } = Dimensions.get("window");

export function FocusButton({ prayerName, isWhite }) {
  const glowPulse = useSharedValue(0.08);
  const shimmerX = useSharedValue(-100);
  const iconRotate = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const borderGlow = useSharedValue(0.1);
  const aura = PRAYER_AURA[prayerName] || PRAYER_AURA.Asr;

  useEffect(() => {
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    // Shimmer sweep across button
    shimmerX.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(SW, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withDelay(3000, withTiming(-100, { duration: 0 })),
        ),
        -1,
        false,
      ),
    );
    // Subtle icon breathe
    iconRotate.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    // Border glow
    borderGlow.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.08, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowPulse.value }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotate.value}deg` }],
  }));
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));
  const borderStyle = useAnimatedStyle(() => ({ opacity: borderGlow.value }));

  return (
    <Animated.View
      entering={FadeInDown.delay(300).duration(500).springify().damping(14)}
      style={[{ paddingHorizontal: 20, marginBottom: 20 }, scaleStyle]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => {
          pressScale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, { damping: 12, stiffness: 200 });
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({
            pathname: "/focus-mode",
            params: { prayer: prayerName },
          });
        }}
        accessibilityLabel={`Start focus mode for ${prayerName}`}
        accessibilityRole="button"
      >
        <View
          style={{
            borderRadius: 20,
            overflow: "hidden",
            ...(isWhite
              ? WHITE_THEME.cardShadowStrong
              : SHADOWS.glow(aura.primary)),
          }}
        >
          {/* Animated border glow */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 20,
                borderWidth: isWhite ? 1.5 : 1,
                borderColor: aura.primary,
              },
              borderStyle,
            ]}
          />

          <BlurView
            intensity={isWhite ? 0 : 20}
            tint={isWhite ? "light" : "dark"}
            style={{
              height: 66,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: isWhite ? "#FEFDFB" : "transparent",
            }}
          >
            {/* Gradient background tint */}
            <LinearGradient
              colors={
                isWhite
                  ? [`${aura.primary}15`, `${aura.primary}08`, "#FEFDFB"]
                  : [`${aura.primary}14`, `${aura.primary}06`, "transparent"]
              }
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

            {/* Shimmer sweep — only on dark */}
            {!isWhite && (
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: 60,
                    opacity: 0.12,
                  },
                  shimmerStyle,
                ]}
              >
                <LinearGradient
                  colors={["transparent", aura.primary, "transparent"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            )}

            {/* Animated glow — only on dark */}
            {!isWhite && (
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: 160,
                    height: 56,
                    borderRadius: 28,
                  },
                  glowStyle,
                ]}
              >
                <LinearGradient
                  colors={[
                    `${aura.primary}40`,
                    `${aura.primary}18`,
                    "transparent",
                  ]}
                  start={{ x: 0.5, y: 0.5 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, borderRadius: 28 }}
                />
              </Animated.View>
            )}

            {/* Icon */}
            <Animated.View style={iconStyle}>
              <Eye
                size={22}
                color={aura.primary}
                strokeWidth={isWhite ? 2 : 1.8}
              />
            </Animated.View>

            {/* Label */}
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 15,
                color: isWhite ? WHITE_THEME.text : aura.primary,
                letterSpacing: 0.5,
              }}
            >
              Start Focus Mode
            </Text>

            {/* White mode subtle arrow */}
            {isWhite && (
              <Text
                style={{
                  fontFamily: "Montserrat_300Light",
                  fontSize: 16,
                  color: aura.primary,
                  marginLeft: -4,
                }}
              >
                →
              </Text>
            )}
          </BlurView>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
