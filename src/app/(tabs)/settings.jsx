import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  Linking,
  Share as RNShare,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  ChevronRight,
  X,
  Check,
  Settings,
  Crown,
  Star,
  Share2,
  Shield,
  Info,
  LogOut,
  Clock,
  BookOpen,
  Flame,
  Calculator,
  Moon,
  Sun,
} from "lucide-react-native";

import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as StoreReview from "expo-store-review";
import Animated, {
  FadeInDown,
  FadeIn,
  FadeInLeft,
  LayoutAnimationConfig,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useSettings } from "@/utils/useSettings";
import { useUser } from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";
import { SHADOWS, getShadow } from "@/utils/iqamaTheme";
import { useSkipInitialEntering } from "@/utils/useSkipInitialEntering";

const { width: SW } = Dimensions.get("window");

const CALCULATION_METHODS = [
  { key: "ISNA", label: "ISNA" },
  { key: "MWL", label: "Muslim World League" },
  { key: "Egypt", label: "Egyptian Authority" },
  { key: "Makkah", label: "Umm Al-Qura" },
  { key: "Karachi", label: "Karachi" },
];
const MADHABS = [
  { key: "Hanafi", label: "Hanafi" },
  { key: "Shafi", label: "Shafi'i / Maliki / Hanbali" },
];
const REMINDER_OPTIONS = [
  { key: 5, label: "5 min before" },
  { key: 10, label: "10 min before" },
  { key: 15, label: "15 min before" },
  { key: 30, label: "30 min before" },
];
const HIJRI_ADJUSTMENTS = [
  { key: -2, label: "-2 Days" },
  { key: -1, label: "-1 Day" },
  { key: 0, label: "None (Standard)" },
  { key: 1, label: "+1 Day" },
  { key: 2, label: "+2 Days" },
];

function useThemeColors() {
  const { settings } = useSettings();
  const w = settings.whiteTheme === true;
  return {
    isWhite: w,
    bg: w ? "#F9F6F0" : "#080814",
    text: w ? "#1A1409" : "#FAFAFA",
    textSecondary: w ? "rgba(26,20,9,0.58)" : "rgba(255,255,255,0.55)",
    textTertiary: w ? "rgba(26,20,9,0.38)" : "rgba(255,255,255,0.32)",
    textMuted: w ? "rgba(26,20,9,0.28)" : "rgba(255,255,255,0.22)",
    textFaint: w ? "rgba(26,20,9,0.15)" : "rgba(255,255,255,0.14)",
    cardBg: w ? "rgba(254,253,251,0.88)" : "rgba(12,12,26,0.55)",
    cardBorder: w ? "rgba(139,90,43,0.08)" : "rgba(255,255,255,0.06)",
    blurTint: w ? "light" : "dark",
    rowBorder: w ? "rgba(26,20,9,0.06)" : "rgba(255,255,255,0.06)",
    switchTrackFalse: w ? "rgba(139,90,43,0.10)" : "rgba(255,255,255,0.10)",
    modalBg: w ? "rgba(254,253,251,0.96)" : "rgba(12,12,26,0.92)",
    modalOverlay: w ? "rgba(26,20,9,0.42)" : "rgba(0,0,0,0.85)",
    modalBorder: w ? "rgba(139,90,43,0.10)" : "rgba(255,255,255,0.08)",
    inputBg: w ? "rgba(139,90,43,0.04)" : "rgba(255,255,255,0.03)",
    inputBorder: w ? "rgba(139,90,43,0.10)" : "rgba(255,255,255,0.08)",
    inputText: w ? "#1A1409" : "#FAFAFA",
    inputPlaceholder: w ? "rgba(26,20,9,0.28)" : "rgba(255,255,255,0.18)",
    chevron: w ? "rgba(139,105,20,0.18)" : "rgba(255,255,255,0.15)",
    closeBtnBg: w ? "rgba(26,20,9,0.06)" : "rgba(255,255,255,0.06)",
    closeBtnIcon: w ? "rgba(26,20,9,0.55)" : "rgba(255,255,255,0.45)",
    cancelText: w ? "rgba(26,20,9,0.65)" : "rgba(255,255,255,0.45)",
    statusBar: w ? "dark" : "light",
  };
}


// Shimmer sweep
function ShimmerSweep({ color }) {
  const translateX = useSharedValue(-SW);
  useEffect(() => {
    translateX.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(SW, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withDelay(6000, withTiming(-SW, { duration: 0 })),
        ),
        3,
        false,
      ),
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  return (
    <Animated.View
      style={[
        { position: "absolute", top: 0, bottom: 0, width: 60, opacity: 0.05 },
        style,
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

// Setting row with icon
function SettingRow({
  title,
  value,
  onPress,
  icon: Icon,
  iconColor = "rgba(255,255,255,0.25)",
}) {
  const C = useThemeColors();
  const pressScale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <Animated.View style={scaleStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => {
          pressScale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, { damping: 12, stiffness: 200 });
        }}
        activeOpacity={1}
        accessibilityLabel={`${title}: ${value || "tap to change"}`}
        accessibilityRole="button"
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 16,
          borderBottomWidth: 0.5,
          borderBottomColor: C.rowBorder,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {Icon && (
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: `${iconColor}08`,
                borderWidth: 0.5,
                borderColor: `${iconColor}15`,
              }}
            >
              <Icon size={14} color={iconColor} strokeWidth={1.5} />
            </View>
          )}
          <Text
            style={{
              fontFamily: "Montserrat_400Regular",
              fontSize: 15,
              color: C.text,
            }}
          >
            {title}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {value && (
            <Text
              style={{
                fontFamily: "Montserrat_300Light",
                fontSize: 13,
                color: C.isWhite ? "rgba(26,20,9,0.45)" : C.textTertiary,
              }}
            >
              {value}
            </Text>
          )}
          <ChevronRight size={16} color={C.chevron} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Toggle row with icon
function ToggleRow({
  title,
  value,
  onValueChange,
  icon: Icon,
  iconColor = "rgba(255,255,255,0.25)",
}) {
  const C = useThemeColors();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: C.rowBorder,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {Icon && (
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${iconColor}08`,
              borderWidth: 0.5,
              borderColor: `${iconColor}15`,
            }}
          >
            <Icon size={14} color={iconColor} strokeWidth={1.5} />
          </View>
        )}
        <Text
          style={{
            fontFamily: "Montserrat_400Regular",
            fontSize: 15,
            color: C.text,
          }}
        >
          {title}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={(v) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onValueChange(v);
        }}
        trackColor={{ false: C.switchTrackFalse, true: "#D4AF37" }}
        thumbColor="#FFFFFF"
        accessibilityLabel={`${title} toggle`}
      />
    </View>
  );
}

// Section header with animated line
function SectionHeader({ title, delay = 0, color = "rgba(212,175,55,0.5)" }) {
  const lineWidth = useSharedValue(0);
  useEffect(() => {
    lineWidth.value = withDelay(
      delay,
      withSpring(16, { damping: 12, stiffness: 80 }),
    );
  }, []);
  const lineStyle = useAnimatedStyle(() => ({ width: lineWidth.value }));

  return (
    <Animated.View
      entering={FadeInLeft.delay(delay).duration(400)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 28,
        marginBottom: 14,
      }}
    >
      <Animated.View style={[{ height: 1, overflow: "hidden" }, lineStyle]}>
        <LinearGradient
          colors={[color, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      <Text
        style={{
          fontFamily: "Montserrat_600SemiBold",
          fontSize: 10,
          color,
          letterSpacing: 3,
        }}
      >
        {title}
      </Text>
    </Animated.View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSetting } = useSettings();
  const skipInitialEntering = useSkipInitialEntering();
  const C = useThemeColors();
  const { user } = useUser();
  const { signOut, isAuthenticated } = useAuth();
  const [pickerModal, setPickerModal] = useState(null);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const headerLineWidth = useSharedValue(0);
  const headerGlow = useSharedValue(0);
  const iconPulse = useSharedValue(1);
  const profileGlow = useSharedValue(0.03);
  const avatarScale = useSharedValue(0.8);

  useEffect(() => {
    headerLineWidth.value = withDelay(
      300,
      withSpring(28, { damping: 12, stiffness: 80 }),
    );
    headerGlow.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0.1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        ),
        3,
        true,
      ),
    );
    iconPulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      3,
      true,
    );
    profileGlow.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.02, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      3,
      true,
    );
    avatarScale.value = withDelay(
      300,
      withSpring(1, { damping: 10, stiffness: 80 }),
    );
  }, []);

  const lineStyle = useAnimatedStyle(() => ({ width: headerLineWidth.value }));
  const headerGlowStyle = useAnimatedStyle(() => ({
    opacity: headerGlow.value,
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconPulse.value }],
  }));
  const profileGlowStyle = useAnimatedStyle(() => ({
    opacity: profileGlow.value,
  }));
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const displayName = user?.name || settings.userName || "Set your name";
  const displayEmail = user?.email || settings.userEmail || "Set your email";

  const openPicker = useCallback((type, options, current) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPickerModal({ type, options, current });
  }, []);
  const selectOption = useCallback(
    (key) => {
      if (!pickerModal) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      updateSetting(pickerModal.type, key);
      setPickerModal(null);
    },
    [pickerModal, updateSetting],
  );
  const handleEditProfile = useCallback(() => {
    setEditName(settings.userName || "");
    setEditEmail(settings.userEmail || "");
    setEditProfileModal(true);
  }, [settings.userName, settings.userEmail]);
  const saveProfile = useCallback(() => {
    updateSetting("userName", editName.trim());
    updateSetting("userEmail", editEmail.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditProfileModal(false);
  }, [editName, editEmail, updateSetting]);
  const handleRate = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (await StoreReview.hasAction()) await StoreReview.requestReview();
      else Alert.alert("Thank You", "Thanks for wanting to rate Iqama!");
    } catch {
      Alert.alert("Thank You", "Thanks for your support!");
    }
  }, []);
  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await RNShare.share({
        message:
          "Check out Iqama — a beautiful prayer app 🤲\n\nhttps://iqama.app",
      });
    } catch { }
  }, []);
  const handlePrivacy = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL("https://iqama.app/privacy");
  }, []);
  const handleAbout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "About Iqama",
      "Iqama v1.0\n\nA prayer companion designed for the Ummah.\n\nDeveloped by mdshoeb",
      [{ text: "JazakAllah Khair" }],
    );
  }, []);
  const handleSubscription = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Subscription", "Premium features coming soon, InshaAllah!", [
      { text: "OK" },
    ]);
  }, []);

  return (
    <LayoutAnimationConfig skipEntering={skipInitialEntering}>
      <View
        style={{
          flex: 1,
          backgroundColor: C.isWhite
            ? "#F9F6F0"
            : "#080814",
        }}
      >
      <StatusBar style={C.statusBar} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
          {/* Header */}
          {!C.isWhite && (
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: insets.top - 10,
                  left: 0,
                  right: 0,
                  height: 60,
                },
                headerGlowStyle,
              ]}
            >
              <LinearGradient
                colors={["rgba(108,142,245,0.1)", "transparent"]}
                style={{ flex: 1 }}
              />
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInDown.delay(80).duration(600).springify()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <Animated.View style={iconStyle}>
              <Settings
                size={22}
                color="rgba(108,142,245,0.5)"
                strokeWidth={1.5}
              />
            </Animated.View>
            <Text
              style={{
                fontFamily: "PlayfairDisplay_700Bold",
                fontSize: 34,
                color: C.text,
                letterSpacing: -0.5,
                textShadowColor: C.isWhite
                  ? "transparent"
                  : "rgba(108,142,245,0.08)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: C.isWhite ? 0 : 6,
              }}
            >
              Settings
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(120).duration(400)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <Animated.View
              style={[{ height: 1, overflow: "hidden" }, lineStyle]}
            >
              <LinearGradient
                colors={["rgba(108,142,245,0.5)", "rgba(108,142,245,0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
            <Text
              style={{
                fontFamily: "Montserrat_300Light",
                fontSize: 12,
                color: C.textMuted,
              }}
            >
              Customize your experience
            </Text>
          </Animated.View>

          {/* Profile Card */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(600).springify()}
          >
            <View
              style={{
                borderRadius: 28,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: C.isWhite
                  ? "rgba(212,175,55,0.18)"
                  : "rgba(212,175,55,0.12)",
                ...getShadow(C.isWhite, "card"),
              }}
            >
              <View style={{
                  padding: 28,
                  alignItems: "center",
                  backgroundColor: C.cardBg,
                }}
              >
                {!C.isWhite && <ShimmerSweep color="#D4AF37" />}
                {/* Glow orb */}
                {!C.isWhite && (
                  <Animated.View
                    style={[
                      {
                        position: "absolute",
                        top: -20,
                        right: -20,
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                      },
                      profileGlowStyle,
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        "#D4AF37",
                        "rgba(212,175,55,0.3)",
                        "transparent",
                      ]}
                      start={{ x: 0.5, y: 0.5 }}
                      end={{ x: 1, y: 1 }}
                      style={{ flex: 1, borderRadius: 60 }}
                    />
                  </Animated.View>
                )}

                <Animated.View
                  style={[
                    {
                      width: 82,
                      height: 82,
                      borderRadius: 41,
                      marginBottom: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    },
                    avatarStyle,
                  ]}
                >
                  <LinearGradient
                    colors={[
                      "rgba(212,175,55,0.1)",
                      "rgba(212,175,55,0.03)",
                      "transparent",
                    ]}
                    style={{
                      width: 82,
                      height: 82,
                      borderRadius: 41,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1.5,
                      borderColor: "rgba(212,175,55,0.15)",
                    }}
                  >
                    <User size={34} color="rgba(212,175,55,0.5)" />
                  </LinearGradient>
                </Animated.View>

                <Text
                  style={{
                    fontFamily: "Montserrat_600SemiBold",
                    fontSize: 20,
                    color: C.text,
                    marginBottom: 4,
                    textShadowColor: C.isWhite
                      ? "transparent"
                      : "rgba(212,175,55,0.06)",
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: C.isWhite ? 0 : 4,
                  }}
                >
                  {displayName}
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 14,
                    color: C.textTertiary,
                    marginBottom: 18,
                  }}
                >
                  {displayEmail}
                </Text>

                <TouchableOpacity
                  onPress={handleEditProfile}
                  accessibilityLabel="Edit profile"
                  style={{ borderRadius: 14, overflow: "hidden" }}
                >
                  <LinearGradient
                    colors={["rgba(212,175,55,0.12)", "rgba(212,175,55,0.04)"]}
                    style={{
                      paddingHorizontal: 22,
                      paddingVertical: 9,
                      borderRadius: 14,
                      borderWidth: 0.5,
                      borderColor: "rgba(212,175,55,0.18)",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Montserrat_600SemiBold",
                        fontSize: 13,
                        color: "#D4AF37",
                      }}
                    >
                      Edit Profile
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Prayer Settings */}
          <SectionHeader
            title="PRAYER SETTINGS"
            delay={250}
            color={C.isWhite ? "rgba(140,100,10,0.75)" : "rgba(212,175,55,0.5)"}
          />
          <Animated.View
            entering={FadeInDown.delay(280).duration(500).springify()}
          >
            <View
              style={{
                borderRadius: 24,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: C.cardBorder,
                ...getShadow(C.isWhite, "soft"),
              }}
            >
              <View style={{ paddingHorizontal: 20, backgroundColor: C.cardBg }}
              >
                {!C.isWhite && <ShimmerSweep color="#6C8EF5" />}
                <SettingRow
                  title="Calculation Method"
                  value={settings.calculationMethod}
                  icon={Calculator}
                  iconColor="#6C8EF5"
                  onPress={() =>
                    openPicker(
                      "calculationMethod",
                      CALCULATION_METHODS,
                      settings.calculationMethod,
                    )
                  }
                />
                <SettingRow
                  title="Madhab"
                  value={settings.madhab}
                  icon={BookOpen}
                  iconColor="#C9A0DC"
                  onPress={() => openPicker("madhab", MADHABS, settings.madhab)}
                />
                <SettingRow
                  title="Reminder Time"
                  value={`${settings.reminderMinutes} min`}
                  icon={Clock}
                  iconColor="#FF9A5C"
                  onPress={() =>
                    openPicker(
                      "reminderMinutes",
                      REMINDER_OPTIONS,
                      settings.reminderMinutes,
                    )
                  }
                />
                <SettingRow
                  title="Hijri Adjustment"
                  value={
                    settings.hijriAdjustment === 0
                      ? "None"
                      : `${settings.hijriAdjustment > 0 ? "+" : ""}${settings.hijriAdjustment}`
                  }
                  icon={Moon}
                  iconColor="#F5C842"
                  onPress={() =>
                    openPicker(
                      "hijriAdjustment",
                      HIJRI_ADJUSTMENTS,
                      settings.hijriAdjustment,
                    )
                  }
                />
              </View>
            </View>
          </Animated.View>

          {/* Features */}
          <SectionHeader
            title="FEATURES"
            delay={350}
            color={C.isWhite ? "rgba(139,105,20,0.75)" : "rgba(212,175,55,0.5)"}
          />
          <Animated.View
            entering={FadeInDown.delay(380).duration(500).springify()}
          >
            <View
              style={{
                borderRadius: 24,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: C.cardBorder,
                ...getShadow(C.isWhite, "soft"),
              }}
            >
              <View style={{ paddingHorizontal: 20, backgroundColor: C.cardBg }}
              >
                {!C.isWhite && <ShimmerSweep color="#D4AF37" />}
                <ToggleRow
                  title="Prayer Focus Mode"
                  value={settings.focusModeEnabled}
                  icon={Settings}
                  iconColor="#D4AF37"
                  onValueChange={(v) => updateSetting("focusModeEnabled", v)}
                />
                <ToggleRow
                  title="Daily Dua Notification"
                  value={settings.duaNotification}
                  icon={BookOpen}
                  iconColor="#D4AF37"
                  onValueChange={(v) => updateSetting("duaNotification", v)}
                />
                <ToggleRow
                  title="Streak Reminders"
                  value={settings.streakReminders}
                  icon={Flame}
                  iconColor="#FF8C00"
                  onValueChange={(v) => updateSetting("streakReminders", v)}
                />

              </View>
            </View>
          </Animated.View>

          {/* General */}
          <SectionHeader
            title="GENERAL"
            delay={450}
            color={C.isWhite ? "rgba(90,50,140,0.75)" : "rgba(201,160,220,0.5)"}
          />
          <Animated.View
            entering={FadeInDown.delay(480).duration(500).springify()}
          >
            <View
              style={{
                borderRadius: 24,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: C.cardBorder,
                ...getShadow(C.isWhite, "soft"),
              }}
            >
              <View style={{ paddingHorizontal: 20, backgroundColor: C.cardBg }}
              >
                {!C.isWhite && <ShimmerSweep color="#C9A0DC" />}
                <SettingRow
                  title="Manage Subscription"
                  icon={Crown}
                  iconColor="#D4AF37"
                  onPress={handleSubscription}
                />
                <SettingRow
                  title="Rate Iqama"
                  icon={Star}
                  iconColor="#F5C842"
                  onPress={handleRate}
                />
                <SettingRow
                  title="Share Iqama"
                  icon={Share2}
                  iconColor="#D4AF37"
                  onPress={handleShare}
                />
                <SettingRow
                  title="Privacy Policy"
                  icon={Shield}
                  iconColor="#6C8EF5"
                  onPress={handlePrivacy}
                />
                <SettingRow
                  title="About"
                  icon={Info}
                  iconColor={
                    C.isWhite ? "rgba(26,26,46,0.35)" : "rgba(255,255,255,0.35)"
                  }
                  onPress={handleAbout}
                />
              </View>
            </View>
          </Animated.View>

          {/* Sign Out */}
          {isAuthenticated && (
            <Animated.View
              entering={FadeInDown.delay(550).duration(500).springify()}
            >
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  signOut();
                }}
                style={{ marginTop: 28, borderRadius: 16, overflow: "hidden" }}
                accessibilityLabel="Sign out"
              >
                <View
                  style={{
                    borderRadius: 16,
                    borderWidth: 0.5,
                    borderColor: "rgba(255,76,110,0.12)",
                    overflow: "hidden",
                  }}
                >
                  <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      paddingVertical: 16,
                      backgroundColor: "transparent",
                    }}
                  >
                    <LinearGradient
                      colors={["rgba(255,76,110,0.06)", "transparent"]}
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
                    <LogOut size={16} color="#FF4C6E" strokeWidth={1.5} />
                    <Text
                      style={{
                        fontFamily: "Montserrat_600SemiBold",
                        fontSize: 14,
                        color: "#FF4C6E",
                      }}
                    >
                      Sign Out
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Version */}
          <Animated.View
            entering={FadeIn.delay(600).duration(400)}
            style={{ alignItems: "center", marginTop: 28 }}
          >
            <LinearGradient
              colors={[
                "rgba(108,142,245,0)",
                "rgba(108,142,245,0.12)",
                "rgba(108,142,245,0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: 60, height: 1, marginBottom: 12 }}
            />
            <Text
              style={{
                fontFamily: "Montserrat_300Light",
                fontSize: 11,
                color: C.textFaint,
                letterSpacing: 1,
              }}
            >
              IQAMA v1.0
            </Text>
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 10,
                color: C.textFaint,
                letterSpacing: 0.5,
                marginTop: 6,
              }}
            >
              Developed by mdshoeb
            </Text>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Picker Modal — glassmorphic */}
      <Modal visible={!!pickerModal} transparent animationType="fade">
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: C.modalOverlay,
            justifyContent: "flex-end",
          }}
          activeOpacity={1}
          onPress={() => setPickerModal(null)}
        >
          <View
            style={{
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              overflow: "hidden",
              borderWidth: 0.5,
              borderColor: C.modalBorder,
            }}
          >
            <View style={{ paddingBottom: 40, backgroundColor: C.modalBg }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 20,
                  borderBottomWidth: 0.5,
                  borderBottomColor: C.rowBorder,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Montserrat_600SemiBold",
                    fontSize: 16,
                    color: C.text,
                  }}
                >
                  Select Option
                </Text>
                <TouchableOpacity
                  onPress={() => setPickerModal(null)}
                  accessibilityLabel="Close"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: C.closeBtnBg,
                  }}
                >
                  <X size={18} color={C.closeBtnIcon} />
                </TouchableOpacity>
              </View>
              {pickerModal?.options?.map((opt, i) => (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => selectOption(opt.key)}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    borderBottomWidth: 0.5,
                    borderBottomColor: C.rowBorder,
                    backgroundColor:
                      pickerModal.current === opt.key
                        ? "rgba(212,175,55,0.04)"
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontFamily:
                        pickerModal.current === opt.key
                          ? "Montserrat_600SemiBold"
                          : "Montserrat_400Regular",
                      fontSize: 15,
                      color:
                        pickerModal.current === opt.key ? "#D4AF37" : C.text,
                    }}
                  >
                    {opt.label}
                  </Text>
                  {pickerModal.current === opt.key && (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(212,175,55,0.12)",
                      }}
                    >
                      <Check size={14} color="#D4AF37" strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Profile Modal — glassmorphic */}
      <Modal visible={editProfileModal} transparent animationType="fade">
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: C.modalOverlay,
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
          activeOpacity={1}
          onPress={() => setEditProfileModal(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              style={{
                borderRadius: 28,
                overflow: "hidden",
                borderWidth: 0.5,
                borderColor: C.modalBorder,
              }}
            >
              <View style={{ padding: 24, backgroundColor: C.modalBg }}
              >
                <Text
                  style={{
                    fontFamily: "PlayfairDisplay_700Bold",
                    fontSize: 20,
                    color: C.text,
                    marginBottom: 24,
                  }}
                >
                  Edit Profile
                </Text>

                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 11,
                    color: C.textTertiary,
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  NAME
                </Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your name"
                  placeholderTextColor={C.inputPlaceholder}
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 16,
                    color: C.inputText,
                    borderWidth: 0.5,
                    borderColor: C.inputBorder,
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 18,
                    backgroundColor: C.inputBg,
                  }}
                  accessibilityLabel="Name input"
                />

                <Text
                  style={{
                    fontFamily: "Montserrat_300Light",
                    fontSize: 11,
                    color: C.textTertiary,
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  EMAIL
                </Text>
                <TextInput
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={C.inputPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    fontFamily: "Montserrat_400Regular",
                    fontSize: 16,
                    color: C.inputText,
                    borderWidth: 0.5,
                    borderColor: C.inputBorder,
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 24,
                    backgroundColor: C.inputBg,
                  }}
                  accessibilityLabel="Email input"
                />

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setEditProfileModal(false)}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 14,
                      overflow: "hidden",
                      borderWidth: 0.5,
                      borderColor: C.inputBorder,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Montserrat_600SemiBold",
                        fontSize: 14,
                        color: C.cancelText,
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={saveProfile}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 14,
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={["#D4AF37", "#B8860B"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 14,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Montserrat_600SemiBold",
                          fontSize: 14,
                          color: "#050510",
                        }}
                      >
                        Save
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      </View>
    </LayoutAnimationConfig>
  );
}
