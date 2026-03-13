import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, AppState, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  Eye,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle as SvgCircle } from "react-native-svg";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { PRAYER_AURA, SHADOWS, WHITE_THEME } from "@/utils/iqamaTheme";
import GoldGradientButton from "@/components/GoldGradientButton";
import SecondaryButton from "@/components/SecondaryButton";
import { usePrayerStorage } from "@/utils/usePrayerStorage";
import { useSettings } from "@/utils/useSettings";
import { WhiteBackgroundArt } from "@/components/HomeScreen/WhiteBackgroundArt";

const { width: SCREEN_W } = Dimensions.get("window");
const FOCUS_DURATION_SECONDS = 5 * 60; // 5 min prayer session
const PENALTY_SECONDS = 15;

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

// Focus states
const STATE_IDLE = "idle";
const STATE_FOCUSING = "focusing";
const STATE_WARNING = "warning";
const STATE_BROKEN = "broken";
const STATE_COMPLETED = "completed";

export default function FocusModeScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const prayerName = params.prayer || "Asr";
  const { markPrayerComplete, streakData } = usePrayerStorage();
  const { settings } = useSettings();
  const isWhite = settings.whiteTheme === true;

  // Core state
  const [focusState, setFocusState] = useState(STATE_IDLE);
  // Focus time refs
  const focusEndRef = useRef(null);
  const [penaltyTimeLeft, setPenaltyTimeLeft] = useState(PENALTY_SECONDS);

  // Refs for timers
  const focusTimerRef = useRef(null);
  const penaltyTimerRef = useRef(null);
  const backgroundTimestampRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const focusStateRef = useRef(focusState);

  // Animation values
  const breathe = useSharedValue(0.04);
  const ringProgress = useSharedValue(0);
  const warningPulse = useSharedValue(1);
  const warningOpacity = useSharedValue(0);

  // Keep ref in sync
  useEffect(() => {
    focusStateRef.current = focusState;
  }, [focusState]);

  // Ambient breathing glow
  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(0.16, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.04, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  // Warning pulse animation
  useEffect(() => {
    if (focusState === STATE_WARNING) {
      warningOpacity.value = withTiming(1, { duration: 300 });
      warningPulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600 }),
          withTiming(1, { duration: 600 }),
        ),
        -1,
        true,
      );
    } else {
      warningOpacity.value = withTiming(0, { duration: 300 });
      warningPulse.value = 1;
    }
  }, [focusState]);

  // ========== AppState Monitoring ==========
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const currentFocusState = focusStateRef.current;

      // User LEFT the app while focusing
      if (
        appStateRef.current === "active" &&
        (nextAppState === "background" || nextAppState === "inactive") &&
        currentFocusState === STATE_FOCUSING
      ) {
        backgroundTimestampRef.current = Date.now();
        startPenaltyTimer();
        setFocusState(STATE_WARNING);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      // User CAME BACK to the app
      if (
        nextAppState === "active" &&
        (appStateRef.current === "background" ||
          appStateRef.current === "inactive")
      ) {
        const currentState = focusStateRef.current;

        if (currentState === STATE_WARNING) {
          if (penaltyStartRef.current) {
            const elapsed = Math.floor((Date.now() - penaltyStartRef.current) / 1000);
            if (elapsed >= PENALTY_SECONDS) {
              breakStreak();
              appStateRef.current = nextAppState;
              return;
            }
          }

          // Resumed focus successfully
          clearPenaltyTimer();
          setPenaltyTimeLeft(PENALTY_SECONDS);
          setFocusState(STATE_FOCUSING);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // Give penalty time back to focus end time so user doesn't lose seconds while warned
          if (backgroundTimestampRef.current && focusEndRef.current) {
            const timeInBackground = Date.now() - backgroundTimestampRef.current;
            focusEndRef.current += timeInBackground;
          }
        }
      }

      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  // ========== Focus Timer ==========
  const [focusTimeLeft, setFocusTimeLeft] = useState(FOCUS_DURATION_SECONDS);

  const clearFocusTimer = useCallback(() => {
    if (focusTimerRef.current) {
      clearInterval(focusTimerRef.current);
      focusTimerRef.current = null;
    }
  }, []);

  // ========== Penalty Timer (timestamp-based for iOS background reliability) ==========
  const penaltyStartRef = useRef(null);

  const clearPenaltyTimer = useCallback(() => {
    if (penaltyTimerRef.current) {
      clearInterval(penaltyTimerRef.current);
      penaltyTimerRef.current = null;
    }
    penaltyStartRef.current = null;
  }, []);

  const completeFocus = useCallback(() => {
    clearFocusTimer();
    clearPenaltyTimer();
    setFocusState(STATE_COMPLETED);
    markPrayerComplete(prayerName);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [clearFocusTimer, clearPenaltyTimer, markPrayerComplete, prayerName]);

  // Use ref so setInterval callback always has latest completeFocus
  const completeFocusRef = useRef(completeFocus);
  useEffect(() => {
    completeFocusRef.current = completeFocus;
  }, [completeFocus]);

  const startFocusTimer = useCallback(() => {
    clearFocusTimer();
    setFocusTimeLeft(FOCUS_DURATION_SECONDS);
    focusEndRef.current = Date.now() + FOCUS_DURATION_SECONDS * 1000;

    setFocusState(STATE_FOCUSING);
    ringProgress.value = withTiming(1, {
      duration: FOCUS_DURATION_SECONDS * 1000,
      easing: Easing.linear,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    focusTimerRef.current = setInterval(() => {
      if (!focusEndRef.current) return;
      const remainingMS = focusEndRef.current - Date.now();
      const remainingSecs = Math.max(0, Math.ceil(remainingMS / 1000));

      setFocusTimeLeft(remainingSecs);

      if (remainingSecs <= 0) {
        completeFocusRef.current();
      }
    }, 1000);
  }, [clearFocusTimer]);

  const breakStreak = useCallback(() => {
    clearPenaltyTimer();
    clearFocusTimer();
    setFocusState(STATE_BROKEN);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [clearPenaltyTimer, clearFocusTimer]);

  // Use ref so setInterval callback always has latest breakStreak
  const breakStreakRef = useRef(breakStreak);
  useEffect(() => {
    breakStreakRef.current = breakStreak;
  }, [breakStreak]);

  const startPenaltyTimer = useCallback(() => {
    clearPenaltyTimer();
    penaltyStartRef.current = Date.now();
    setPenaltyTimeLeft(PENALTY_SECONDS);

    penaltyTimerRef.current = setInterval(() => {
      if (!penaltyStartRef.current) return;
      const elapsed = Math.floor((Date.now() - penaltyStartRef.current) / 1000);
      const remaining = PENALTY_SECONDS - elapsed;

      if (remaining <= 0) {
        breakStreakRef.current();
      } else {
        setPenaltyTimeLeft(remaining);
      }
    }, 1000);
  }, [clearPenaltyTimer]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearFocusTimer();
      clearPenaltyTimer();
    };
  }, []);

  // ========== Animated Styles ==========
  const breatheStyle = useAnimatedStyle(() => ({ opacity: breathe.value }));
  const warningPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: warningPulse.value }],
    opacity: warningOpacity.value,
  }));

  const pad = (n) => String(n).padStart(2, "0");
  const focusMinutes = Math.floor(focusTimeLeft / 60);
  const focusSeconds = focusTimeLeft % 60;

  // Ring calculations
  const RING_SIZE = 260;
  const RING_STROKE = 4;
  const RING_RADIUS = (RING_SIZE - RING_STROKE * 2) / 2;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const progressRatio = 1 - focusTimeLeft / FOCUS_DURATION_SECONDS;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progressRatio);

  // ========== RENDER ==========
  return (
    <View style={{ flex: 1, backgroundColor: isWhite ? WHITE_THEME.background : "#080814" }}>
      <StatusBar style={isWhite ? "dark" : "light"} />

      {/* Light mode — full premium background art (minarets, florals, orbs) */}
      {isWhite && <WhiteBackgroundArt />}

      {/* Dark mode — ambient glow orb */}
      {!isWhite && (() => {
        const glowColor = focusState === STATE_BROKEN ? "#FF4C6E"
          : focusState === STATE_WARNING ? "#FF8C00"
          : focusState === STATE_COMPLETED ? "#00FFC8"
          : "#D4AF37";
        return (
          <Animated.View
            style={[{
              position: "absolute", top: -100,
              left: SCREEN_W / 2 - 220,
              width: 440, height: 440, borderRadius: 220,
            }, breatheStyle]}
          >
            <LinearGradient
              colors={[glowColor, `${glowColor}40`, "transparent"]}
              start={{ x: 0.5, y: 0.3 }}
              end={{ x: 0.5, y: 1 }}
              style={{ flex: 1, borderRadius: 220 }}
            />
          </Animated.View>
        );
      })()}

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 28,
        }}
      >
        {/* === IDLE STATE — Start Screen === */}
        {focusState === STATE_IDLE && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            <Animated.View entering={ZoomIn.duration(600).springify()}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: isWhite ? "rgba(201,162,39,0.08)" : "rgba(212,175,55,0.08)",
                  borderWidth: 1,
                  borderColor: isWhite ? "rgba(184,134,11,0.20)" : "rgba(212,175,55,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 36,
                  ...(isWhite && WHITE_THEME.cardShadow),
                }}
              >
                <Eye size={40} color={isWhite ? WHITE_THEME.gold : "#D4AF37"} strokeWidth={1.5} />
              </View>
            </Animated.View>

            <Animated.Text
              entering={FadeInDown.delay(200).duration(600)}
              style={{
                fontFamily: "PlayfairDisplay_700Bold",
                fontSize: 34,
                color: isWhite ? WHITE_THEME.text : "#FAFAFA",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {prayerName} Prayer
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(350).duration(500)}
              style={{
                fontFamily: "Montserrat_300Light",
                fontSize: 15,
                color: isWhite ? WHITE_THEME.textTertiary : "rgba(255,255,255,0.4)",
                textAlign: "center",
                marginBottom: 12,
                lineHeight: 24,
              }}
            >
              {pad(focusMinutes)}:{pad(focusSeconds)} of focused prayer
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(450).duration(500)}
              style={{
                fontFamily: "Montserrat_300Light",
                fontSize: 13,
                color: isWhite ? WHITE_THEME.textMuted : "rgba(255,255,255,0.2)",
                textAlign: "center",
                marginBottom: 48,
                lineHeight: 20,
                paddingHorizontal: 16,
              }}
            >
              Leave the app and your squad gets notified.{"\n"}Stay focused.
              Stay connected.
            </Animated.Text>

            <Animated.View
              entering={FadeInUp.delay(500).duration(500)}
              style={{ width: "100%" }}
            >
              <GoldGradientButton
                title="Start Focus"
                onPress={startFocusTimer}
                isWhite={isWhite}
              />
              <SecondaryButton
                title="Not Now"
                onPress={() => router.back()}
                style={{ marginTop: 14 }}
                isWhite={isWhite}
              />
            </Animated.View>
          </View>
        )}

        {/* === FOCUSING STATE — Active Session === */}
        {focusState === STATE_FOCUSING && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            {/* Progress Ring */}
            <Animated.View entering={FadeIn.duration(600)}>
              <View
                style={{
                  width: RING_SIZE,
                  height: RING_SIZE,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 40,
                }}
              >
                <Svg
                  width={RING_SIZE}
                  height={RING_SIZE}
                  style={{
                    position: "absolute",
                    transform: [{ rotate: "-90deg" }],
                  }}
                >
                  <SvgCircle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    stroke={isWhite ? "rgba(139,105,20,0.08)" : "rgba(255,255,255,0.05)"}
                    strokeWidth={RING_STROKE}
                    fill="none"
                  />
                  <SvgCircle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    stroke={isWhite ? WHITE_THEME.gold : "#D4AF37"}
                    strokeWidth={RING_STROKE}
                    fill="none"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    opacity={0.8}
                  />
                </Svg>

                {/* Time */}
                <Text
                  style={{
                    fontFamily: "Montserrat_600SemiBold",
                    fontSize: 64,
                    color: isWhite ? WHITE_THEME.text : "#FAFAFA",
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {pad(focusMinutes)}
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 18,
                    color: isWhite ? WHITE_THEME.textTertiary : "rgba(212,175,55,0.6)",
                    fontVariant: ["tabular-nums"],
                    marginTop: -4,
                  }}
                >
                  {pad(focusSeconds)}
                </Text>
              </View>
            </Animated.View>

            <Text
              style={{
                fontFamily: "PlayfairDisplay_700Bold",
                fontSize: 28,
                color: isWhite ? WHITE_THEME.text : "#FAFAFA",
                marginBottom: 8,
              }}
            >
              Stay Present
            </Text>
            <Text
              style={{
                fontFamily: "Montserrat_300Light",
                fontSize: 14,
                color: isWhite ? WHITE_THEME.textTertiary : "rgba(255,255,255,0.35)",
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 48,
              }}
            >
              Focus on your {prayerName} prayer.{"\n"}Leaving the app starts a
              15s countdown.
            </Text>

            <View style={{ width: "100%" }}>
              <GoldGradientButton
                title="I've Finished Praying ✓"
                onPress={completeFocus}
                isWhite={isWhite}
              />
            </View>
          </View>
        )}

        {/* === WARNING STATE — User Left the App === */}
        {focusState === STATE_WARNING && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            {/* Pulsing warning ring */}
            <Animated.View style={warningPulseStyle}>
              <View
                style={{
                  position: "absolute",
                  width: 180,
                  height: 180,
                  borderRadius: 90,
                  borderWidth: 2,
                  borderColor: isWhite ? "rgba(194,120,3,0.25)" : "rgba(255,140,0,0.3)",
                  top: -90,
                  left: -90,
                }}
              />
            </Animated.View>

            <Animated.View entering={ZoomIn.duration(500).springify()}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: isWhite ? "rgba(194,120,3,0.08)" : "rgba(255,140,0,0.1)",
                  borderWidth: 2,
                  borderColor: isWhite ? "rgba(194,120,3,0.30)" : "rgba(255,140,0,0.4)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 32,
                  ...(isWhite && WHITE_THEME.cardShadow),
                }}
              >
                <ShieldAlert size={48} color={isWhite ? "#C27803" : "#FF8C00"} strokeWidth={1.5} />
              </View>
            </Animated.View>

            <Text
              style={{
                fontFamily: "PlayfairDisplay_700Bold",
                fontSize: 30,
                color: isWhite ? "#C27803" : "#FF8C00",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Come Back!
            </Text>

            {/* Penalty countdown */}
            <Text
              style={{
                fontFamily: "Montserrat_600SemiBold",
                fontSize: 72,
                color: isWhite ? WHITE_THEME.text : "#FAFAFA",
                fontVariant: ["tabular-nums"],
                marginBottom: 12,
              }}
            >
              {penaltyTimeLeft}
            </Text>

            <Text
              style={{
                fontFamily: "Montserrat_300Light",
                fontSize: 14,
                color: isWhite ? WHITE_THEME.textTertiary : "rgba(255,255,255,0.4)",
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 32,
              }}
            >
              seconds before your streak breaks{"\n"}and your squad is notified
            </Text>

            <View style={{ width: "100%" }}>
              <GoldGradientButton
                title="I'm Back — Resume Focus"
                isWhite={isWhite}
                onPress={() => {
                  clearPenaltyTimer();
                  setPenaltyTimeLeft(PENALTY_SECONDS);
                  setFocusState(STATE_FOCUSING);
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );
                }}
              />
            </View>
          </View>
        )}

        {/* === BROKEN STATE — Streak Lost === */}
        {focusState === STATE_BROKEN && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            <Animated.View entering={ZoomIn.duration(600).springify()}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: isWhite ? WHITE_THEME.missedBg : "rgba(255,76,110,0.1)",
                  borderWidth: 2,
                  borderColor: isWhite ? WHITE_THEME.missedBorder : "rgba(255,76,110,0.4)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 32,
                  ...(isWhite && WHITE_THEME.cardShadow),
                }}
              >
                <AlertTriangle size={48} color={isWhite ? WHITE_THEME.missed : "#FF4C6E"} strokeWidth={1.5} />
              </View>
            </Animated.View>

            <Animated.Text
              entering={FadeInDown.delay(200).duration(500)}
              style={{
                fontFamily: "PlayfairDisplay_700Bold",
                fontSize: 28,
                color: isWhite ? WHITE_THEME.missed : "#FF4C6E",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Focus Broken
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(350).duration(500)}
              style={{
                fontFamily: "Montserrat_300Light",
                fontSize: 15,
                color: isWhite ? WHITE_THEME.textTertiary : "rgba(255,255,255,0.4)",
                textAlign: "center",
                lineHeight: 24,
                marginBottom: 12,
              }}
            >
              Your daily streak has been reset.
            </Animated.Text>

            {/* Squad notification card */}
            <Animated.View
              entering={FadeInDown.delay(500).duration(600).springify()}
              style={{ width: "100%", marginBottom: 40 }}
            >
              <View
                style={{
                  backgroundColor: isWhite ? WHITE_THEME.missedBg : "rgba(255,76,110,0.06)",
                  borderRadius: 20,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: isWhite ? WHITE_THEME.missedBorder : "rgba(255,76,110,0.15)",
                  ...(isWhite && WHITE_THEME.cardShadow),
                }}
              >
                <Text
                  style={{
                    fontFamily: "Montserrat_600SemiBold",
                    fontSize: 11,
                    color: isWhite ? WHITE_THEME.missed : "#FF4C6E",
                    letterSpacing: 1,
                    marginBottom: 10,
                  }}
                >
                  SQUAD NOTIFIED
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 14,
                    color: isWhite ? WHITE_THEME.textSub : "rgba(255,255,255,0.6)",
                    lineHeight: 22,
                    fontStyle: "italic",
                  }}
                >
                  "Your squad member is losing their focus! Send them a message to help them
                  stay on track 🤲"
                </Text>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(700).duration(500)}
              style={{ width: "100%" }}
            >
              <GoldGradientButton
                title="Try Again"
                isWhite={isWhite}
                onPress={() => {
                  setFocusState(STATE_IDLE);
                  setFocusTimeLeft(FOCUS_DURATION_SECONDS);
                  setPenaltyTimeLeft(PENALTY_SECONDS);
                  ringProgress.value = 0;
                }}
                style={{ marginBottom: 14 }}
              />
              <SecondaryButton title="Go Home" onPress={() => router.back()} isWhite={isWhite} />
            </Animated.View>
          </View>
        )}

        {/* === COMPLETED STATE — Prayer Done === */}
        {focusState === STATE_COMPLETED && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            <Animated.View entering={ZoomIn.duration(700).springify()}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: isWhite ? WHITE_THEME.successBg : "rgba(0,255,200,0.1)",
                  borderWidth: 2,
                  borderColor: isWhite ? WHITE_THEME.successBorder : "rgba(0,255,200,0.4)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 32,
                  ...(isWhite && WHITE_THEME.cardShadow),
                }}
              >
                <CheckCircle size={48} color={isWhite ? WHITE_THEME.success : "#00FFC8"} strokeWidth={1.5} />
              </View>
            </Animated.View>

            <Animated.Text
              entering={FadeInDown.delay(200).duration(600)}
              style={{
                fontFamily: "PlayfairDisplay_700Bold",
                fontSize: 30,
                color: isWhite ? WHITE_THEME.success : "#00FFC8",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              MashaAllah!
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(400).duration(500)}
              style={{
                fontFamily: "Montserrat_300Light",
                fontSize: 15,
                color: isWhite ? WHITE_THEME.textSub : "rgba(255,255,255,0.45)",
                textAlign: "center",
                lineHeight: 24,
                marginBottom: 16,
              }}
            >
              {prayerName} prayer completed.{"\n"}Your streak continues. 🔥
            </Animated.Text>

            {/* Streak card */}
            <Animated.View
              entering={FadeInDown.delay(600).duration(600).springify()}
              style={{ width: "100%", marginBottom: 40 }}
            >
              <View
                style={{
                  backgroundColor: isWhite ? WHITE_THEME.successBg : "rgba(0,255,200,0.04)",
                  borderRadius: 20,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: isWhite ? WHITE_THEME.successBorder : "rgba(0,255,200,0.12)",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  ...(isWhite && WHITE_THEME.cardShadow),
                }}
              >
                <Text style={{ fontSize: 32 }}>🔥</Text>
                <View>
                  <Text
                    style={{
                      fontFamily: "Montserrat_600SemiBold",
                      fontSize: 28,
                      color: isWhite ? WHITE_THEME.text : "#FAFAFA",
                    }}
                  >
                    {streakData.currentStreak} {streakData.currentStreak === 1 ? "Day" : "Days"}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Montserrat_300Light",
                      fontSize: 12,
                      color: isWhite ? WHITE_THEME.textMuted : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {streakData.currentStreak > 0 ? "Streak growing" : "Start your streak"}
                  </Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(800).duration(500)}
              style={{ width: "100%" }}
            >
              <GoldGradientButton title="Done" onPress={() => router.back()} isWhite={isWhite} />
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  );
}
