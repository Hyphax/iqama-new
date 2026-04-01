import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  InputAccessoryView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowRight, User, Calendar, Sparkles } from "lucide-react-native";
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
import { useSettings } from "@/utils/useSettings";
import { useSupabaseUser } from "@/utils/useSupabaseUser";
import { SHADOWS } from "@/utils/iqamaTheme";

const { width: SW, height: SH } = Dimensions.get("window");

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
          withTiming(18, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-18, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
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
            right: -SW * 0.3,
          },
          a1,
        ]}
      >
        <LinearGradient
          colors={["#C9A0DC", "rgba(201,160,220,0.3)", "transparent"]}
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
            bottom: SW * 0.05,
            left: -SW * 0.15,
          },
          a2,
        ]}
      >
        <LinearGradient
          colors={["#D4AF37", "rgba(212,175,55,0.25)", "transparent"]}
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
            top: SH * 0.35,
            left: SW * 0.55,
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

function GenderButton({ label, emoji, selected, onPress, color }) {
  const scale = useSharedValue(1);
  const glowO = useSharedValue(0);
  const s = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const g = useAnimatedStyle(() => ({ opacity: glowO.value }));

  useEffect(() => {
    glowO.value = withTiming(selected ? 0.12 : 0, { duration: 300 });
  }, [selected]);

  return (
    <Animated.View style={[{ flex: 1 }, s]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={() => {
          scale.value = withSpring(0.94, { damping: 15 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12 });
        }}
        onPress={onPress}
        style={{
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: selected ? `${color}60` : "rgba(255,255,255,0.06)",
        }}
      >
        <BlurView
          intensity={20}
          tint="dark"
          style={{
            height: 64,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: selected ? `${color}06` : "rgba(10,10,20,0.3)",
          }}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                top: -10,
                left: -10,
                right: -10,
                bottom: -10,
                borderRadius: 24,
              },
              g,
            ]}
          >
            <LinearGradient
              colors={[color, "transparent"]}
              style={{ flex: 1, borderRadius: 24 }}
            />
          </Animated.View>
          <Text style={{ fontSize: 20, marginBottom: 2 }}>{emoji}</Text>
          <Text
            style={{
              fontFamily: selected
                ? "Montserrat_600SemiBold"
                : "Montserrat_400Regular",
              fontSize: 14,
              color: selected ? color : "rgba(255,255,255,0.60)",
            }}
          >
            {label}
          </Text>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const AGE_ACCESSORY_ID = "iqama-age-done-btn";

export default function IdentityScreen() {
  const insets = useSafeAreaInsets();
  const { updateSettings } = useSettings();
  const { updateProfile } = useSupabaseUser();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(null);
  const headerLineW = useSharedValue(0);
  const sparkleRot = useSharedValue(0);
  const ageRef = useRef(null);

  const parsedAge = parseInt(age, 10);
  const isAgeValid = !isNaN(parsedAge) && Number.isInteger(parsedAge) && parsedAge >= 5 && parsedAge <= 120;
  const isValid = name.trim().length > 0 && isAgeValid && gender;

  useEffect(() => {
    headerLineW.value = withDelay(
      200,
      withSpring(20, { damping: 12, stiffness: 80 }),
    );
    sparkleRot.value = withRepeat(
      withTiming(360, { duration: 6000, easing: Easing.linear }),
      -1,
    );
  }, []);

  const lineStyle = useAnimatedStyle(() => ({ width: headerLineW.value }));
  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRot.value}deg` }],
  }));

  const handleContinue = useCallback(async () => {
    if (!isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateSettings({ userName: name.trim() });
    await AsyncStorage.setItem("iqama_user_age", age.trim());
    await AsyncStorage.setItem("iqama_user_gender", gender);

    // Sync to Supabase
    try {
      await updateProfile({ display_name: name.trim(), age: parseInt(age, 10), gender });
    } catch (e) {
      console.warn("[IdentityScreen] Profile sync failed:", e?.message);
    }

    router.push("/onboarding/mood");
  }, [name, age, gender, isValid, updateSettings, updateProfile]);

  return (
    <View style={{ flex: 1, backgroundColor: "#080814" }}>
      <StatusBar style="light" />
      <BackgroundOrbs />

      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 24 }}>
        <ProgressDots current={1} total={9} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 32,
          }}
        >
          <Animated.View
            entering={FadeInDown.delay(80).duration(600).springify()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <Animated.View style={sparkleStyle}>
              <Sparkles
                size={20}
                color="rgba(201,160,220,0.5)"
                strokeWidth={1.5}
              />
            </Animated.View>
            <Text
              style={{
                fontFamily: "PlayfairDisplay_700Bold",
                fontSize: 30,
                color: "#FFFFFF",
                lineHeight: 40,
                textShadowColor: "rgba(201,160,220,0.12)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 20,
              }}
            >
              Tell us about{"\n"}yourself
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(120).duration(400)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 32,
            }}
          >
            <Animated.View
              style={[{ height: 1, overflow: "hidden" }, lineStyle]}
            >
              <LinearGradient
                colors={["rgba(201,160,220,0.5)", "transparent"]}
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
              We'll personalize your experience
            </Text>
          </Animated.View>

          {/* Name */}
          <Animated.View
            entering={FadeInDown.delay(250).duration(500).springify()}
          >
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 12,
                color: "rgba(255,255,255,0.65)",
                letterSpacing: 2.5,
                marginBottom: 10,
              }}
            >
              YOUR NAME
            </Text>
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: "rgba(201,160,220,0.12)",
                marginBottom: 22,
                ...SHADOWS.soft,
              }}
            >
              <BlurView
                intensity={18}
                tint="dark"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  backgroundColor: "rgba(10,10,20,0.3)",
                }}
              >
                <ShimmerSweep color="#C9A0DC" />
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(201,160,220,0.06)",
                    borderWidth: 0.5,
                    borderColor: "rgba(201,160,220,0.12)",
                  }}
                >
                  <User
                    size={14}
                    color="rgba(201,160,220,0.4)"
                    strokeWidth={1.5}
                  />
                </View>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(255,255,255,0.38)"
                  autoCapitalize="words"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => ageRef.current?.focus()}
                  style={{
                    flex: 1,
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 16,
                    color: "#FFFFFF",
                    paddingVertical: 18,
                    paddingLeft: 12,
                  }}
                  accessibilityLabel="Name input"
                />
              </BlurView>
            </View>
          </Animated.View>

          {/* Age */}
          <Animated.View
            entering={FadeInDown.delay(380).duration(500).springify()}
          >
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 12,
                color: "rgba(255,255,255,0.65)",
                letterSpacing: 2.5,
                marginBottom: 10,
              }}
            >
              YOUR AGE
            </Text>
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: "rgba(212,175,55,0.12)",
                marginBottom: 22,
                ...SHADOWS.soft,
              }}
            >
              <BlurView
                intensity={18}
                tint="dark"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  backgroundColor: "rgba(10,10,20,0.3)",
                }}
              >
                <ShimmerSweep color="#D4AF37" />
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(212,175,55,0.06)",
                    borderWidth: 0.5,
                    borderColor: "rgba(212,175,55,0.12)",
                  }}
                >
                  <Calendar
                    size={14}
                    color="rgba(212,175,55,0.4)"
                    strokeWidth={1.5}
                  />
                </View>
                <TextInput
                  ref={ageRef}
                  value={age}
                  onChangeText={setAge}
                  placeholder="e.g. 22"
                  placeholderTextColor="rgba(255,255,255,0.38)"
                  keyboardType="number-pad"
                  maxLength={3}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                  inputAccessoryViewID={
                    Platform.OS === "ios" ? AGE_ACCESSORY_ID : undefined
                  }
                  style={{
                    flex: 1,
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 16,
                    color: "#FFFFFF",
                    paddingVertical: 18,
                    paddingLeft: 12,
                  }}
                  accessibilityLabel="Age input"
                />
              </BlurView>
            </View>
          </Animated.View>

          {/* Gender */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(500).springify()}
          >
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 12,
                color: "rgba(255,255,255,0.65)",
                letterSpacing: 2.5,
                marginBottom: 10,
              }}
            >
              GENDER
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <GenderButton
                label="Male"
                emoji="👤"
                selected={gender === "M"}
                color="#6C8EF5"
                onPress={() => {
                  Keyboard.dismiss();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setGender("M");
                }}
              />
              <GenderButton
                label="Female"
                emoji="👤"
                selected={gender === "F"}
                color="#C9A0DC"
                onPress={() => {
                  Keyboard.dismiss();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setGender("F");
                }}
              />
            </View>
          </Animated.View>

          {/* Spacer so content isn't hidden behind the Continue button */}
          <View style={{ height: 24 }} />
        </ScrollView>

        <Animated.View
          entering={FadeInUp.delay(650).duration(500)}
          style={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 24,
            paddingTop: 12,
            backgroundColor: "transparent",
          }}
        >
          <GoldGradientButton
            title="Continue"
            icon={ArrowRight}
            onPress={handleContinue}
          />
          {!isValid && (
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                textAlign: "center",
                marginTop: 12,
              }}
            >
              {age.trim().length > 0 && !isAgeValid
                ? "Please enter a valid age (5\u2013120)"
                : "Please fill in all fields"}
            </Text>
          )}
        </Animated.View>
      </KeyboardAvoidingView>

      {/* iOS only: "Done" toolbar above number-pad keyboard for age field */}
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={AGE_ACCESSORY_ID}>
          <View
            style={{
              backgroundColor: "#12122A",
              borderTopWidth: 0.5,
              borderTopColor: "rgba(255,255,255,0.08)",
              paddingHorizontal: 16,
              paddingVertical: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Enter your age
            </Text>
            <TouchableOpacity
              onPress={() => Keyboard.dismiss()}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 12,
                backgroundColor: "rgba(201,160,220,0.12)",
                borderWidth: 0.5,
                borderColor: "rgba(201,160,220,0.30)",
              }}
            >
              <Text
                style={{
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 14,
                  color: "#C9A0DC",
                }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
}
