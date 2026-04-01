import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowRight,
  Zap,
  Leaf,
  TrendingUp,
  HelpCircle,
  Heart,
} from "lucide-react-native";
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
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GoldGradientButton from "@/components/GoldGradientButton";
import { SHADOWS } from "@/utils/iqamaTheme";
import { useSupabaseUser } from "@/utils/useSupabaseUser";

const { width: SW, height: SH } = Dimensions.get("window");

const MOODS = [
  {
    key: "stressed",
    label: "Stressed",
    subtitle: "Feeling overwhelmed",
    icon: Zap,
    color: "#FF6B8A",
  },
  {
    key: "peaceful",
    label: "Peaceful",
    subtitle: "Calm & content",
    icon: Leaf,
    color: "#00FFC8",
  },
  {
    key: "seeking_success",
    label: "Seeking Success",
    subtitle: "Driven & ambitious",
    icon: TrendingUp,
    color: "#F5C842",
  },
  {
    key: "lost",
    label: "Lost / Confused",
    subtitle: "Need direction",
    icon: HelpCircle,
    color: "#6C8EF5",
  },
];

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
        withTiming(25, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-25, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    o2.value = withDelay(
      2500,
      withRepeat(
        withSequence(
          withTiming(0.12, {
            duration: 7000,
            easing: Easing.inOut(Easing.sin),
          }),
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
      4000,
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
      3000,
      withRepeat(
        withSequence(
          withTiming(-18, {
            duration: 10000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(18, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
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
            top: -SW * 0.35,
            left: -SW * 0.25,
          },
          a1,
        ]}
      >
        <LinearGradient
          colors={["#6C8EF5", "rgba(108,142,245,0.3)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW / 2 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 0.65,
            height: SW * 0.65,
            borderRadius: SW * 0.325,
            bottom: SW * 0.15,
            right: -SW * 0.15,
          },
          a2,
        ]}
      >
        <LinearGradient
          colors={["#C9A0DC", "rgba(201,160,220,0.25)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.325 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 0.5,
            height: SW * 0.5,
            borderRadius: SW * 0.25,
            top: SH * 0.4,
            left: -SW * 0.1,
          },
          a3,
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

function TwinklingStar({ x, y, size, delay: d }) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1500 + Math.random() * 1500 }),
          withTiming(0, { duration: 1500 + Math.random() * 1500 }),
        ),
        -1,
        true,
      ),
    );
  }, []);
  const s = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#FFFFFF",
        },
        s,
      ]}
    />
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

function MoodCard({ mood, selected, onPress, index }) {
  const scale = useSharedValue(1);
  const glowO = useSharedValue(0);
  const Icon = mood.icon;

  useEffect(() => {
    glowO.value = withTiming(selected ? 0.15 : 0, { duration: 300 });
  }, [selected]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowO.value }));

  return (
    <Animated.View
      entering={FadeInDown.delay(400 + index * 100)
        .duration(500)
        .springify()}
      style={cardStyle}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 15 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12 });
        }}
        onPress={onPress}
      >
        <View
          style={{
            borderRadius: 22,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: selected
              ? `${mood.color}50`
              : "rgba(255,255,255,0.06)",
            ...SHADOWS.soft,
          }}
        >
          <BlurView
            intensity={20}
            tint="dark"
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 20,
              backgroundColor: selected
                ? `${mood.color}06`
                : "rgba(10,10,20,0.3)",
            }}
          >
            <ShimmerSweep color={mood.color} />
            {/* Glow orb */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  left: -20,
                  top: -20,
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                },
                glowStyle,
              ]}
            >
              <LinearGradient
                colors={[mood.color, "transparent"]}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, borderRadius: 50 }}
              />
            </Animated.View>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                marginRight: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: selected
                  ? `${mood.color}12`
                  : "rgba(255,255,255,0.04)",
                borderWidth: 1,
                borderColor: selected
                  ? `${mood.color}30`
                  : "rgba(255,255,255,0.06)",
              }}
            >
              <Icon
                size={24}
                color={selected ? mood.color : "rgba(255,255,255,0.3)"}
                strokeWidth={1.5}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: selected
                    ? "Montserrat_600SemiBold"
                    : "Montserrat_400Regular",
                  fontSize: 17,
                  color: selected ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                  marginBottom: 3,
                }}
              >
                {mood.label}
              </Text>
              <Text
                style={{
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 13,
                  color: selected
                    ? "rgba(255,255,255,0.60)"
                    : "rgba(255,255,255,0.55)",
                }}
              >
                {mood.subtitle}
              </Text>
            </View>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selected ? mood.color : "rgba(255,255,255,0.1)",
                backgroundColor: selected ? mood.color : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selected && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#050510",
                  }}
                />
              )}
            </View>
          </BlurView>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MoodScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useSupabaseUser();
  const [selected, setSelected] = useState(null);
  const headerLineW = useSharedValue(0);
  const heartPulse = useSharedValue(1);

  useEffect(() => {
    headerLineW.value = withDelay(
      200,
      withSpring(20, { damping: 12, stiffness: 80 }),
    );
    heartPulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const lineStyle = useAnimatedStyle(() => ({ width: headerLineW.value }));
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartPulse.value }],
  }));

  const stars = useMemo(
    () =>
      Array.from({ length: 8 }, () => ({
        x: Math.random() * SW,
        y: Math.random() * SH,
        size: 1 + Math.random() * 1.5,
        delay: Math.random() * 4000,
      })),
    [],
  );

  const handleContinue = useCallback(async () => {
    if (!selected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem("iqama_user_mood", selected);

    // Sync to Supabase
    await updateProfile({ mood: selected });

    router.push("/onboarding/addiction");
  }, [selected, updateProfile]);

  return (
    <View style={{ flex: 1, backgroundColor: "#080814" }}>
      <StatusBar style="light" />
      <BackgroundOrbs />
      {stars.map((st, i) => (
        <TwinklingStar
          key={i}
          x={st.x}
          y={st.y}
          size={st.size}
          delay={st.delay}
        />
      ))}

      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 24 }}>
        <ProgressDots current={2} total={9} />
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 28, marginBottom: 4 }}>
        <Animated.View
          entering={FadeInDown.delay(80).duration(600).springify()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <Animated.View style={heartStyle}>
            <Heart size={20} color="rgba(212,175,55,0.5)" strokeWidth={1.5} />
          </Animated.View>
          <Text
            style={{
              fontFamily: "PlayfairDisplay_700Bold",
              fontSize: 28,
              color: "#FFFFFF",
              lineHeight: 38,
              textShadowColor: "rgba(212,175,55,0.12)",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 20,
            }}
          >
            How are you feeling{"\n"}today?
          </Text>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(120).duration(400)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <Animated.View style={[{ height: 1, overflow: "hidden" }, lineStyle]}>
            <LinearGradient
              colors={["rgba(212,175,55,0.5)", "transparent"]}
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
            This helps us personalize your spiritual journey
          </Text>
        </Animated.View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8, gap: 12 }}>
        {MOODS.map((mood, i) => (
          <MoodCard
            key={mood.key}
            mood={mood}
            index={i}
            selected={selected === mood.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setSelected(mood.key);
            }}
          />
        ))}
      </View>

      <Animated.View
        entering={FadeInUp.delay(900).duration(500)}
        style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
      >
        <GoldGradientButton
          title="Continue"
          icon={ArrowRight}
          onPress={handleContinue}
        />
        {!selected && (
          <Text
            style={{
              fontFamily: "Montserrat_400Regular",
              fontSize: 13,
              color: "rgba(255,255,255,0.50)",
              textAlign: "center",
              marginTop: 12,
            }}
          >
            Select how you're feeling
          </Text>
        )}
      </Animated.View>
    </View>
  );
}
