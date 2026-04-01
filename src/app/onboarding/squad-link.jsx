import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share as RNShare,
  Dimensions,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Copy, Share, Check, UserPlus, ArrowRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
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
  withSpring,
  Easing,
} from "react-native-reanimated";
import GoldGradientButton from "@/components/GoldGradientButton";
import { SHADOWS } from "@/utils/iqamaTheme";
import { getMySquadCode } from "@/utils/useSquadSync";

const { width: SW, height: SH } = Dimensions.get("window");

/* ─── Background Orbs (4 orbs) ─── */
function BackgroundOrbs() {
  const o1 = useSharedValue(0.05);
  const o2 = useSharedValue(0.04);
  const o3 = useSharedValue(0.03);
  const o4 = useSharedValue(0.02);
  const dx1 = useSharedValue(0);
  const dy2 = useSharedValue(0);
  const dx3 = useSharedValue(0);
  const dy4 = useSharedValue(0);
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
          withTiming(16, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-16, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    o3.value = withDelay(
      3500,
      withRepeat(
        withSequence(
          withTiming(0.09, {
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
    o4.value = withDelay(
      5000,
      withRepeat(
        withSequence(
          withTiming(0.06, {
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.01, {
            duration: 9000,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
    dy4.value = withDelay(
      3500,
      withRepeat(
        withSequence(
          withTiming(12, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-12, {
            duration: 12000,
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
  const a4 = useAnimatedStyle(() => ({
    opacity: o4.value,
    transform: [{ translateY: dy4.value }],
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
            left: -SW * 0.2,
          },
          a1,
        ]}
      >
        <LinearGradient
          colors={["#D4AF37", "rgba(212,175,55,0.3)", "transparent"]}
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
            bottom: SW * 0.2,
            right: -SW * 0.15,
          },
          a2,
        ]}
      >
        <LinearGradient
          colors={["#C9A0DC", "rgba(201,160,220,0.2)", "transparent"]}
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
            top: SH * 0.45,
            left: -SW * 0.12,
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
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SW * 0.4,
            height: SW * 0.4,
            borderRadius: SW * 0.2,
            top: SH * 0.12,
            right: SW * 0.05,
          },
          a4,
        ]}
      >
        <LinearGradient
          colors={["#D4AF37", "rgba(212,175,55,0.15)", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: SW * 0.2 }}
        />
      </Animated.View>
    </View>
  );
}

/* ─── Twinkling Stars ─── */
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

/* ─── Floating Particle ─── */
function FloatingParticle({ delay: d, x, size, color }) {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(0);
  const tx = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.35, { duration: 2500 }),
          withTiming(0, { duration: 2500 }),
        ),
        -1,
        true,
      ),
    );
    ty.value = withDelay(
      d,
      withRepeat(
        withTiming(-SH * 0.3, {
          duration: 10000 + Math.random() * 5000,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
    tx.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(Math.random() * 20 - 10, {
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, []);
  const s = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }, { translateX: tx.value }],
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
          backgroundColor: color,
        },
        s,
      ]}
    />
  );
}

/* ─── Diamond Accent ─── */
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

/* ─── Shimmer Sweep ─── */
function ShimmerSweep({ color }) {
  const tx = useSharedValue(-SW);
  useEffect(() => {
    tx.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(SW, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withDelay(5500, withTiming(-SW, { duration: 0 })),
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
        { position: "absolute", top: 0, bottom: 0, width: 60, opacity: 0.06 },
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

/* ─── Progress Dots ─── */
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

/* ─── Enhanced Friend Slot with glow ─── */
function FriendSlot({ index, label }) {
  const iconPulse = useSharedValue(1);
  const glowO = useSharedValue(0.05);
  useEffect(() => {
    iconPulse.value = withDelay(
      index * 200,
      withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    glowO.value = withDelay(
      index * 200,
      withRepeat(
        withSequence(
          withTiming(0.2, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.03, {
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
  }, []);
  const iconS = useAnimatedStyle(() => ({
    transform: [{ scale: iconPulse.value }],
  }));
  const glowS = useAnimatedStyle(() => ({ opacity: glowO.value }));

  return (
    <Animated.View
      entering={FadeInDown.delay(700 + index * 120)
        .duration(500)
        .springify()}
    >
      <View
        style={{
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: "rgba(212,175,55,0.1)",
          ...SHADOWS.soft,
        }}
      >
        <BlurView
          intensity={15}
          tint="dark"
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            backgroundColor: "rgba(10,10,20,0.2)",
          }}
        >
          <ShimmerSweep color="#D4AF37" />
          <View style={{ position: "relative", marginRight: 14 }}>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  left: -6,
                  top: -6,
                  backgroundColor: "#D4AF37",
                },
                glowS,
              ]}
            />
            <Animated.View
              style={[
                {
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(212,175,55,0.06)",
                  borderWidth: 1,
                  borderColor: "rgba(212,175,55,0.15)",
                },
                iconS,
              ]}
            >
              <UserPlus
                size={18}
                color="rgba(212,175,55,0.5)"
                strokeWidth={1.5}
              />
            </Animated.View>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 15,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              {label}
            </Text>
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                marginTop: 2,
              }}
            >
              Waiting for invite...
            </Text>
          </View>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          />
        </BlurView>
      </View>
    </Animated.View>
  );
}

/* ─── MAIN SCREEN ─── */
export default function SquadLinkScreen() {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  const linkPulse = useSharedValue(1);
  const copyScale = useSharedValue(1);

  const stars = useMemo(
    () =>
      Array.from({ length: 10 }, () => ({
        x: Math.random() * SW,
        y: Math.random() * SH,
        size: 1 + Math.random() * 1.5,
        delay: Math.random() * 4000,
      })),
    [],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, () => ({
        x: Math.random() * SW,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 5000,
        color: Math.random() > 0.5 ? "#D4AF37" : "#C9A0DC",
      })),
    [],
  );

  // Persistent squad code — same code every time, never changes
  const [myCode, setMyCode] = useState(null);
  useEffect(() => {
    getMySquadCode().then(({ code }) => setMyCode(code));
  }, []);

  // Formatted display: "ABC123" → "ABC 123"
  const displayCode = myCode
    ? myCode.slice(0, 3) + " " + myCode.slice(3)
    : "------";

  const shareMsg = `Join my prayer squad on Iqama! 🤲\n\nEnter my squad code in the app:\n\n  ${myCode ?? ""}\n\nWe keep each other accountable for Salah. Barak Allahu feekum!`;

  useEffect(() => {
    linkPulse.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const linkBoxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: linkPulse.value }],
  }));
  const copyBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: copyScale.value }],
  }));

  const handleCopy = useCallback(async () => {
    if (!myCode) return;
    await Clipboard.setStringAsync(myCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    copyScale.value = withSpring(0.9, { damping: 10 });
    setTimeout(() => {
      copyScale.value = withSpring(1, { damping: 12 });
    }, 150);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }, [myCode]);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await RNShare.share({ message: shareMsg });
    } catch {}
  }, [shareMsg]);

  return (
    <View style={{ flex: 1, backgroundColor: "#080814" }}>
      <StatusBar style="light" />
      <BackgroundOrbs />

      {stars.map((st, i) => (
        <TwinklingStar
          key={`s${i}`}
          x={st.x}
          y={st.y}
          size={st.size}
          delay={st.delay}
        />
      ))}
      {particles.map((p, i) => (
        <FloatingParticle
          key={`p${i}`}
          x={p.x}
          size={p.size}
          delay={p.delay}
          color={p.color}
        />
      ))}

      <DiamondAccent x={SW * 0.1} y={SH * 0.18} delay={0} size={5} />
      <DiamondAccent x={SW * 0.85} y={SH * 0.28} delay={1500} size={4} />
      <DiamondAccent x={SW * 0.08} y={SH * 0.8} delay={3000} size={5} />

      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          marginBottom: 24,
        }}
      >
        <ProgressDots current={8} total={9} />
      </View>

      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={{ alignItems: "flex-start", marginBottom: 4 }}
        >
          <Text
            style={{
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 12,
              color: "rgba(255,255,255,0.65)",
              letterSpacing: 2.5,
            }}
          >
            FINAL STEP
          </Text>
        </Animated.View>
        <Animated.Text
          entering={FadeInDown.delay(150).duration(600)}
          style={{
            fontFamily: "PlayfairDisplay_700Bold",
            fontSize: 28,
            color: "#FFFFFF",
            lineHeight: 38,
            marginBottom: 4,
          }}
        >
          Invite Your Squad
        </Animated.Text>
        <Animated.View
          entering={FadeIn.delay(350).duration(600)}
          style={{ width: 50, height: 1, marginBottom: 8, overflow: "hidden" }}
        >
          <LinearGradient
            colors={["transparent", "rgba(212,175,55,0.6)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
        <Animated.Text
          entering={FadeInDown.delay(300).duration(500)}
          style={{
            fontFamily: "Montserrat_400Regular",
            fontSize: 14,
            color: "rgba(255,255,255,0.60)",
            lineHeight: 22,
          }}
        >
          Add 3 close friends who will keep you motivated for prayer
        </Animated.Text>
      </View>

      {/* Invite Link Card */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(600).springify()}
        style={{ paddingHorizontal: 24, marginBottom: 24 }}
      >
        <Animated.View style={linkBoxStyle}>
          <View
            style={{
              borderRadius: 22,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "rgba(212,175,55,0.15)",
              ...SHADOWS.soft,
            }}
          >
            <BlurView
              intensity={20}
              tint="dark"
              style={{ padding: 20, backgroundColor: "rgba(10,10,20,0.3)" }}
            >
              <ShimmerSweep color="#D4AF37" />
              <Text
                style={{
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: 2,
                  marginBottom: 10,
                }}
              >
                YOUR SQUAD LINK
              </Text>
              <Text
                style={{
                  fontFamily: "Montserrat_600SemiBold",
                  fontSize: 17,
                  color: "#D4AF37",
                  marginBottom: 20,
                  letterSpacing: 0.5,
                }}
              >
                {displayCode}
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={handleCopy}
                  activeOpacity={0.85}
                  style={{ flex: 1 }}
                >
                  <Animated.View
                    style={[
                      {
                        height: 56,
                        borderRadius: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        backgroundColor: copied
                          ? "rgba(0,255,200,0.08)"
                          : "rgba(255,255,255,0.04)",
                        borderWidth: 1,
                        borderColor: copied
                          ? "rgba(0,255,200,0.25)"
                          : "rgba(255,255,255,0.06)",
                      },
                      copyBtnStyle,
                    ]}
                  >
                    {copied ? (
                      <Check size={18} color="#00FFC8" strokeWidth={2} />
                    ) : (
                      <Copy
                        size={18}
                        color="rgba(255,255,255,0.7)"
                        strokeWidth={1.5}
                      />
                    )}
                    <Text
                      style={{
                        fontFamily: "Montserrat_600SemiBold",
                        fontSize: 14,
                        color: copied ? "#00FFC8" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  activeOpacity={0.85}
                  style={{ flex: 1 }}
                >
                  <View
                    style={{
                      height: 56,
                      borderRadius: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      backgroundColor: "rgba(212,175,55,0.06)",
                      borderWidth: 1,
                      borderColor: "rgba(212,175,55,0.18)",
                    }}
                  >
                    <Share size={18} color="#D4AF37" strokeWidth={1.5} />
                    <Text
                      style={{
                        fontFamily: "Montserrat_600SemiBold",
                        fontSize: 14,
                        color: "#D4AF37",
                      }}
                    >
                      Share
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Animated.View>
      </Animated.View>

      <View style={{ flex: 1, paddingHorizontal: 24, gap: 10 }}>
        <FriendSlot index={0} label="Friend 1" />
        <FriendSlot index={1} label="Friend 2" />
        <FriendSlot index={2} label="Friend 3" />
      </View>

      <Animated.View
        entering={FadeInUp.delay(1100).duration(500)}
        style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 28 }}
      >
        <GoldGradientButton
          title="Enter Iqama"
          icon={ArrowRight}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace("/(tabs)");
          }}
        />
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          style={{ alignItems: "center", marginTop: 14 }}
        >
          <Text
            style={{
              fontFamily: "Montserrat_400Regular",
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            I'll invite friends later
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
