import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Home, Clock, Compass, BookOpen, User } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useSharedValue,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useSettings } from "@/utils/useSettings";
import { LivingBackground } from "@/components/LivingBackground";

const TAB_BAR_H = 72;
const TAB_BAR_MX = 20;
const TAB_BAR_RADIUS = 24;

/* ─── Tab Icon ─── */
function TabIcon({ icon: Icon, color, focused, label, isWhite }) {
  const anim = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    anim.value = withSpring(focused ? 1 : 0, {
      damping: 16,
      stiffness: 160,
      mass: 0.7,
    });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(anim.value, [0, 1], [1, 1.12]) },
      { translateY: interpolate(anim.value, [0, 1], [0, -1]) },
    ],
  }));

  const labelAnim = useAnimatedStyle(() => ({
    opacity: interpolate(anim.value, [0, 1], [0.6, 1]),
  }));

  const dotAnim = useAnimatedStyle(() => ({
    opacity: anim.value,
    transform: [{ scale: interpolate(anim.value, [0, 1], [0, 1]) }],
  }));

  return (
    <View style={styles.iconWrap}>
      <Animated.View style={iconStyle}>
        <Icon
          color={color}
          size={21}
          strokeWidth={focused ? 2.2 : 1.6}
        />
      </Animated.View>
      <Animated.Text
        style={[
          {
            fontFamily: focused
              ? "Montserrat_600SemiBold"
              : "Montserrat_400Regular",
            fontSize: 9.5,
            color,
            letterSpacing: 0.3,
            marginTop: 3,
          },
          labelAnim,
        ]}
      >
        {label}
      </Animated.Text>
      <Animated.View
        style={[
          {
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: isWhite ? "#B8960B" : "#D4AF37",
            marginTop: 2,
          },
          dotAnim,
        ]}
      />
    </View>
  );
}

/* ─── Tab Bar Background ─── */
function TabBarBackground({ isWhite }) {
  return (
    <View style={styles.bgContainer}>
      {isWhite ? (
        /* White theme: solid warm gradient — no blur artifacts */
        <LinearGradient
          colors={["#FEFCF7", "#FAF6ED", "#F6EFE1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        /* Dark theme: rich midnight with warm undertone */
        <LinearGradient
          colors={["#0E0E22", "#0A0A1A", "#08081A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {Platform.OS === "ios" && !isWhite && (
        <BlurView
          intensity={40}
          tint="systemChromeMaterialDark"
          style={[StyleSheet.absoluteFillObject, { opacity: 0.6 }]}
        />
      )}
      {/* Top highlight line */}
      <LinearGradient
        colors={
          isWhite
            ? ["rgba(212,175,55,0.15)", "rgba(212,175,55,0.02)"]
            : ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.01)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bgHighlight}
      />
      {/* Inner border */}
      <View
        style={[
          styles.bgBorder,
          {
            borderColor: isWhite
              ? "rgba(160,125,30,0.18)"
              : "rgba(255,255,255,0.06)",
          },
        ]}
      />
    </View>
  );
}

/* ─── Layout ─── */
export default function TabLayout() {
  const { settings } = useSettings();
  const isWhite = settings.whiteTheme === true;
  const insets = useSafeAreaInsets();

  // Float above iOS home indicator
  const bottomOffset = Platform.OS === "ios"
    ? Math.max(insets.bottom - 8, 12)
    : 12;

  return (
    <View style={{ flex: 1 }}>
      <LivingBackground />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: "transparent" },
          tabBarStyle: {
            position: "absolute",
            bottom: bottomOffset,
            left: TAB_BAR_MX,
            right: TAB_BAR_MX,
            height: TAB_BAR_H,
            borderRadius: TAB_BAR_RADIUS,
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
            overflow: "hidden",
            // Shadow for floating effect
            shadowColor: isWhite ? "#3A2808" : "#000",
            shadowOffset: { width: 0, height: isWhite ? 8 : 16 },
            shadowOpacity: isWhite ? 0.25 : 0.60,
            shadowRadius: isWhite ? 24 : 32,
          },
          tabBarItemStyle: {
            paddingTop: 8,
            paddingBottom: 4,
          },
          tabBarBackground: () => <TabBarBackground isWhite={isWhite} />,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: isWhite ? "#8B6914" : "#D4AF37",
          tabBarInactiveTintColor: isWhite
            ? "rgba(60,50,30,0.40)"
            : "rgba(255,255,255,0.40)",
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={Home} color={color} focused={focused} label="Home" isWhite={isWhite} />
            ),
          }}
          listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
        />
        <Tabs.Screen
          name="tracker"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={Clock} color={color} focused={focused} label="Prayers" isWhite={isWhite} />
            ),
          }}
          listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
        />
        <Tabs.Screen
          name="qibla"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={Compass} color={color} focused={focused} label="Qibla" isWhite={isWhite} />
            ),
          }}
          listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
        />
        <Tabs.Screen
          name="dua"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={BookOpen} color={color} focused={focused} label="Duas" isWhite={isWhite} />
            ),
          }}
          listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={User} color={color} focused={focused} label="Profile" isWhite={isWhite} />
            ),
          }}
          listeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: TAB_BAR_H - 16,
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TAB_BAR_RADIUS,
    overflow: "hidden",
  },
  bgBlur: {
    flex: 1,
  },
  bgHighlight: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    height: 0.5,
  },
  bgBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TAB_BAR_RADIUS,
    borderWidth: 1,
  },
});
