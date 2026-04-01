import { useState, useEffect, useCallback } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowRight, Smartphone } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Animated, {
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
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GoldGradientButton from "@/components/GoldGradientButton";
import { SHADOWS } from "@/utils/iqamaTheme";
import { useSupabaseUser } from "@/utils/useSupabaseUser";

const { width: SW, height: SH } = Dimensions.get("window");
const SLIDER_W = SW - 80;
const THUMB_SIZE = 34;
const MIN_HOURS = 1;
const MAX_HOURS = 12;

function BackgroundOrbs() {
  const o1 = useSharedValue(0.05);
  const o2 = useSharedValue(0.04);
  const o3 = useSharedValue(0.03);
  const dx1 = useSharedValue(0);
  const dy2 = useSharedValue(0);
  const dx3 = useSharedValue(0);
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
        withTiming(22, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-22, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    o2.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(0.1, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
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
          withTiming(15, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-15, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    o3.value = withDelay(
      3500,
      withRepeat(
        withSequence(
          withTiming(0.08, {
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
          withTiming(-15, {
            duration: 11000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(15, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
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
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW,
            height: SW,
            borderRadius: SW / 2,
            top: -SW * 0.4,
            left: -SW * 0.2,
          },
          a1,
        ]}
      >
        <LinearGradient
          colors={["#FF6B8A", "rgba(255,107,138,0.3)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW / 2 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 0.6,
            height: SW * 0.6,
            borderRadius: SW * 0.3,
            bottom: SW * 0.15,
            right: -SW * 0.15,
          },
          a2,
        ]}
      >
        <LinearGradient
          colors={["#6C8EF5", "rgba(108,142,245,0.2)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.3 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 0.45,
            height: SW * 0.45,
            borderRadius: SW * 0.225,
            top: SH * 0.3,
            left: SW * 0.6,
          },
          a3,
        ]}
      >
        <LinearGradient
          colors={["#C9A0DC", "rgba(201,160,220,0.2)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.225 }}
        />
      </Animated.View>
    </View>
  );
}

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

export default function AddictionScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useSupabaseUser();
  const [hours, setHours] = useState(4);
  const thumbX = useSharedValue(
    ((4 - MIN_HOURS) / (MAX_HOURS - MIN_HOURS)) * (SLIDER_W - THUMB_SIZE),
  );
  const thumbScale = useSharedValue(1);
  const startX = useSharedValue(0);
  const phonePulse = useSharedValue(1);
  const phoneGlow = useSharedValue(0.05);
  const headerLineW = useSharedValue(0);

  useEffect(() => {
    phonePulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    phoneGlow.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.05, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    headerLineW.value = withDelay(
      200,
      withSpring(20, { damping: 12, stiffness: 80 }),
    );
  }, []);

  const phoneStyle = useAnimatedStyle(() => ({
    transform: [{ scale: phonePulse.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: phoneGlow.value }));
  const lineStyle = useAnimatedStyle(() => ({ width: headerLineW.value }));

  const updateHours = useCallback((h) => {
    setHours(h);
  }, []);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = thumbX.value;
      thumbScale.value = withSpring(1.3, { damping: 12 });
    })
    .onUpdate((e) => {
      const newX = Math.max(
        0,
        Math.min(startX.value + e.translationX, SLIDER_W - THUMB_SIZE),
      );
      thumbX.value = newX;
      const h = Math.round(
        MIN_HOURS + (newX / (SLIDER_W - THUMB_SIZE)) * (MAX_HOURS - MIN_HOURS),
      );
      runOnJS(updateHours)(h);
    })
    .onEnd(() => {
      thumbScale.value = withSpring(1, { damping: 15 });
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }, { scale: thumbScale.value }],
  }));
  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value + THUMB_SIZE / 2,
  }));

  const getColor = () => {
    if (hours <= 3) return "#00FFC8";
    if (hours <= 6) return "#F5C842";
    if (hours <= 9) return "#FF9A5C";
    return "#FF4C6E";
  };

  const handleContinue = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem("iqama_scroll_hours", String(hours));

    // Sync to Supabase
    await updateProfile({ scroll_hours: hours });

    router.push("/onboarding/shocking-math");
  }, [hours, updateProfile]);

  return (
    <View style={{ flex: 1, backgroundColor: "#080814" }}>
      <StatusBar style="light" />
      <BackgroundOrbs />

      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 24 }}>
        <ProgressDots current={3} total={9} />
      </View>

      <View
        style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center" }}
      >
        {/* Pulsing phone icon with glow */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={{ alignItems: "center", marginBottom: 20 }}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 110,
                height: 110,
                borderRadius: 55,
              },
              glowStyle,
            ]}
          >
            <LinearGradient
              colors={["#FF6B8A", "rgba(255,107,138,0.3)", "transparent"]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, borderRadius: 55 }}
            />
          </Animated.View>
          <Animated.View
            style={[
              {
                width: 72,
                height: 72,
                borderRadius: 36,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,107,138,0.08)",
                borderWidth: 1,
                borderColor: "rgba(255,107,138,0.18)",
              },
              phoneStyle,
            ]}
          >
            <Smartphone size={32} color="#FF6B8A" strokeWidth={1.5} />
          </Animated.View>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(200).duration(600)}
          style={{
            fontFamily: "PlayfairDisplay_700Bold",
            fontSize: 26,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 36,
            marginBottom: 6,
          }}
        >
          How many hours do{"\n"}you scroll daily?
        </Animated.Text>
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 40,
          }}
        >
          <Animated.View style={[{ height: 1, overflow: "hidden" }, lineStyle]}>
            <LinearGradient
              colors={["transparent", "rgba(255,107,138,0.4)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
          <Text
            style={{
              fontFamily: "Montserrat_400Regular",
              fontSize: 13,
              color: "rgba(255,255,255,0.60)",
            }}
          >
            Be honest — this is between you and Allah
          </Text>
          <Animated.View style={[{ height: 1, overflow: "hidden" }, lineStyle]}>
            <LinearGradient
              colors={["rgba(255,107,138,0.4)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </Animated.View>

        {/* Big number display */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(600).springify()}
          style={{ alignItems: "center", marginBottom: 40 }}
        >
          <View
            style={{
              borderRadius: 28,
              overflow: "hidden",
              borderWidth: 0.5,
              borderColor: "rgba(255,255,255,0.06)",
              ...SHADOWS.card,
            }}
          >
            <BlurView
              intensity={20}
              tint="dark"
              style={{
                paddingHorizontal: 52,
                paddingVertical: 28,
                alignItems: "center",
                backgroundColor: "rgba(10,10,20,0.3)",
              }}
            >
              <ShimmerSweep color={getColor()} />
              <Text
                style={{
                  fontFamily: "PlayfairDisplay_700Bold",
                  fontSize: 68,
                  color: getColor(),
                  textShadowColor: `${getColor()}40`,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 25,
                }}
              >
                {hours}
              </Text>
              <Text
                style={{
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: 2.5,
                  marginTop: 4,
                }}
              >
                HOURS / DAY
              </Text>
            </BlurView>
          </View>
        </Animated.View>

        {/* Custom slider */}
        <Animated.View
          entering={FadeInDown.delay(450).duration(500)}
          style={{ alignItems: "center", paddingHorizontal: 16 }}
        >
          <View
            style={{
              width: SLIDER_W,
              height: THUMB_SIZE,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                position: "absolute",
                width: SLIDER_W,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
            />
            <Animated.View
              style={[
                {
                  position: "absolute",
                  height: 5,
                  borderRadius: 2.5,
                  overflow: "hidden",
                },
                fillStyle,
              ]}
            >
              <LinearGradient
                colors={["#D4AF37", getColor()]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
            <GestureDetector gesture={panGesture}>
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: THUMB_SIZE,
                    height: THUMB_SIZE,
                    borderRadius: THUMB_SIZE / 2,
                    backgroundColor: "#FFFFFF",
                    borderWidth: 2,
                    borderColor: getColor(),
                    ...SHADOWS.glow(getColor()),
                  },
                  thumbStyle,
                ]}
              />
            </GestureDetector>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: SLIDER_W,
              marginTop: 14,
            }}
          >
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 11,
                color: "rgba(255,255,255,0.50)",
              }}
            >
              1h
            </Text>
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 11,
                color: "rgba(255,255,255,0.50)",
              }}
            >
              12h
            </Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInUp.delay(600).duration(500)}
        style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
      >
        <GoldGradientButton
          title="Show Me The Truth"
          icon={ArrowRight}
          onPress={handleContinue}
        />
      </Animated.View>
    </View>
  );
}
