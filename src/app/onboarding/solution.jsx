import { useEffect } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowRight, Heart } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import GoldGradientButton from "@/components/GoldGradientButton";
import { SHADOWS } from "@/utils/iqamaTheme";

const { width: SW, height: SH } = Dimensions.get("window");

function BackgroundOrbs() {
  const o1 = useSharedValue(0.04);
  const o2 = useSharedValue(0.03);
  const o3 = useSharedValue(0.03);
  const dx1 = useSharedValue(0);
  const dy1 = useSharedValue(0);
  const s1 = useSharedValue(1);

  useEffect(() => {
    o1.value = withRepeat(
      withSequence(
        withTiming(0.16, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.04, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    dx1.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-20, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    dy1.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
        withTiming(15, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    s1.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.95, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    o2.value = withDelay(
      3000,
      withRepeat(
        withSequence(
          withTiming(0.12, {
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
    o3.value = withDelay(
      5000,
      withRepeat(
        withSequence(
          withTiming(0.08, {
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
          }),
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

  const a1 = useAnimatedStyle(() => ({
    opacity: o1.value,
    transform: [
      { translateX: dx1.value },
      { translateY: dy1.value },
      { scale: s1.value },
    ],
  }));
  const a2 = useAnimatedStyle(() => ({ opacity: o2.value }));
  const a3 = useAnimatedStyle(() => ({ opacity: o3.value }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 1.1,
            height: SW * 1.1,
            borderRadius: SW * 0.55,
            top: -SW * 0.3,
            left: -SW * 0.25,
          },
          a1,
        ]}
      >
        <LinearGradient
          colors={["#D4AF37", "rgba(212,175,55,0.3)", "transparent"]}
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
            top: SH * 0.45,
            right: -SW * 0.2,
          },
          a2,
        ]}
      >
        <LinearGradient
          colors={["#D4AF37", "rgba(212,175,55,0.2)", "transparent"]}
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
            bottom: -SW * 0.1,
            left: -SW * 0.1,
          },
          a3,
        ]}
      >
        <LinearGradient
          colors={["#6C8EF5", "rgba(108,142,245,0.2)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.25 }}
        />
      </Animated.View>
    </View>
  );
}

function FloatingParticle({ delay: d, x, size }) {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: 3000 }),
          withTiming(0, { duration: 3000 }),
        ),
        -1,
        true,
      ),
    );
    ty.value = withDelay(
      d,
      withRepeat(
        withTiming(-SH * 0.25, {
          duration: 12000 + Math.random() * 5000,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          bottom: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#D4AF37",
        },
        style,
      ]}
    />
  );
}

function ShimmerSweep({ color }) {
  const tx = useSharedValue(-SW);
  useEffect(() => {
    tx.value = withDelay(
      2000,
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

function DiamondAccent({ x, y, delay: d, size = 6 }) {
  const rot = useSharedValue(0);
  const o = useSharedValue(0);
  useEffect(() => {
    rot.value = withDelay(
      d,
      withRepeat(
        withTiming(360, { duration: 8000, easing: Easing.linear }),
        -1,
      ),
    );
    o.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 2000 }),
          withTiming(0.05, { duration: 2000 }),
        ),
        -1,
        true,
      ),
    );
  }, []);
  const s = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
    opacity: o.value,
  }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          backgroundColor: "#D4AF37",
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

export default function SolutionScreen() {
  const insets = useSafeAreaInsets();
  const heartBeat = useSharedValue(1);
  const heartGlow = useSharedValue(0.05);

  useEffect(() => {
    heartBeat.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    heartGlow.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.05, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.2, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.05, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartBeat.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: heartGlow.value }));

  const particles = Array.from({ length: 10 }, (_, i) => ({
    x: Math.random() * SW,
    size: 1.5 + Math.random() * 2,
    delay: Math.random() * 5000,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#080814" }}>
      <StatusBar style="light" />
      <BackgroundOrbs />

      {particles.map((p, i) => (
        <FloatingParticle key={i} x={p.x} size={p.size} delay={p.delay} />
      ))}

      <DiamondAccent x={SW * 0.12} y={SH * 0.2} delay={0} />
      <DiamondAccent x={SW * 0.85} y={SH * 0.3} delay={1500} size={4} />
      <DiamondAccent x={SW * 0.75} y={SH * 0.75} delay={3000} size={5} />

      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 24 }}>
        <ProgressDots current={5} total={9} />
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        {/* Heartbeat icon */}
        <Animated.View
          entering={FadeIn.delay(300).duration(800)}
          style={{ marginBottom: 36 }}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: 60,
                top: -24,
                left: -24,
              },
              glowStyle,
            ]}
          >
            <LinearGradient
              colors={["#D4AF37", "rgba(212,175,55,0.3)", "transparent"]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, borderRadius: 60 }}
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
                backgroundColor: "rgba(212,175,55,0.08)",
                borderWidth: 1,
                borderColor: "rgba(212,175,55,0.2)",
              },
              heartStyle,
            ]}
          >
            <Heart size={32} color="#D4AF37" strokeWidth={1.5} />
          </Animated.View>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(600).duration(800)}
          style={{
            fontFamily: "PlayfairDisplay_700Bold",
            fontSize: 28,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 40,
            marginBottom: 20,
          }}
        >
          Turn wasted time{"\n"}into Ibadat
        </Animated.Text>

        <Animated.View
          entering={FadeIn.delay(900).duration(600)}
          style={{ width: 40, height: 1, marginBottom: 20, overflow: "hidden" }}
        >
          <LinearGradient
            colors={["transparent", "rgba(212,175,55,0.5)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(1000).duration(600)}
          style={{
            fontFamily: "Montserrat_400Regular",
            fontSize: 16,
            color: "rgba(255,255,255,0.75)",
            textAlign: "center",
            lineHeight: 28,
            marginBottom: 24,
          }}
        >
          Prayer takes just{" "}
          <Text
            style={{ color: "#D4AF37", fontFamily: "Montserrat_600SemiBold" }}
          >
            15 minutes
          </Text>{" "}
          of your day.
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(1300).duration(600)}
          style={{
            fontFamily: "Montserrat_400Regular",
            fontSize: 14,
            color: "rgba(255,255,255,0.55)",
            textAlign: "center",
            lineHeight: 24,
            paddingHorizontal: 8,
          }}
        >
          iqama will help you connect with Allah.{"\n"}Every prayer is a step
          closer to Jannah.
        </Animated.Text>

        <Animated.View
          entering={FadeIn.delay(1600).duration(600)}
          style={{ marginTop: 32 }}
        >
          <View
            style={{
              borderRadius: 22,
              overflow: "hidden",
              borderWidth: 0.5,
              borderColor: "rgba(212,175,55,0.12)",
              ...SHADOWS.soft,
            }}
          >
            <BlurView
              intensity={18}
              tint="dark"
              style={{
                padding: 24,
                alignItems: "center",
                backgroundColor: "rgba(10,10,20,0.3)",
              }}
            >
              <ShimmerSweep color="#D4AF37" />
              <Text
                style={{
                  fontFamily: "Amiri_400Regular",
                  fontSize: 22,
                  color: "rgba(212,175,55,0.85)",
                  textAlign: "center",
                  lineHeight: 36,
                }}
              >
                إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا
                مَّوْقُوتًا
              </Text>
              <View
                style={{
                  width: 30,
                  height: 1,
                  marginVertical: 12,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={[
                    "transparent",
                    "rgba(212,175,55,0.4)",
                    "transparent",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </View>
              <Text
                style={{
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  textAlign: "center",
                }}
              >
                "Indeed, prayer has been decreed upon the believers at specified
                times" — 4:103
              </Text>
            </BlurView>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInUp.delay(2000).duration(500)}
        style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
      >
        <GoldGradientButton
          title="I'm Ready"
          icon={ArrowRight}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/onboarding/squad-power");
          }}
        />
      </Animated.View>
    </View>
  );
}
