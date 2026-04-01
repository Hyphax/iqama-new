import { Tabs } from "expo-router";
import { View, StyleSheet, Pressable } from "react-native";
import { Home, Clock, Compass, BookOpen, User } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  useSharedValue,
  useDerivedValue,
  useAnimatedReaction,
  Easing,
  Extrapolation,
} from "react-native-reanimated";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useSettings } from "@/utils/useSettings";
import { LivingBackground } from "@/components/LivingBackground";

/* ─── Sacred Geometry V5 (Ultimate Pro Max) ─── */
const BAR_H = 76; // Even taller for breathable space
const BAR_MX = 28; // Tighter padding for a real floating island
const BAR_R = 38; // Slightly squarish circle for modern Apple-like look

/* ─── Motion — 60FPS Fluid Dynamics ─── */
const EASE_SACRED = { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }; // Apple easing
const EASE_SWEEP = { duration: 450, easing: Easing.bezier(0.3, 0.1, 0.15, 1) }; // Slow entrance
// Extremely loose and liquid spring for indicator sliding
const SPRING_LIQUID = { damping: 18, stiffness: 120, mass: 1.2 };
// Ultra tight spring for 3D press
const SPRING_3D = { damping: 15, stiffness: 250, mass: 0.8 };

/* ══════════════════════════════════════════════════════════════════
   Sliding Indicator — Fluid Drop with Squash & Stretch
   ══════════════════════════════════════════════════════════════════ */
const SlidingIndicator = memo(function SlidingIndicator({ activeIndex, barWidth, numTabs, isWhite }) {
  const tabWidth = barWidth / numTabs;

  const breath = useSharedValue(0);
  // We use previous active to calculate velocity for stretching
  const prevIndex = useSharedValue(activeIndex.value);

  useAnimatedReaction(
    () => activeIndex.value,
    (current, previous) => {
      if (previous !== null && previous !== undefined) {
        prevIndex.value = previous;
      }
    }
  );

  useEffect(() => {
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  // Use a derived value to figure out how "fast" we are moving
  const stretchFactor = useDerivedValue(() => {
    const diff = Math.abs(activeIndex.value - prevIndex.value);
    // When distance is larger (e.g. moving from 0 to 3), we stretch more
    return interpolate(diff, [0, 1, 4], [1, 1.3, 1.8], Extrapolation.CLAMP);
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: activeIndex.value * tabWidth }
      ],
    };
  });

  const fluidAuraStyle = useAnimatedStyle(() => {
    const isMoving = activeIndex.value % 1 !== 0; // True if between integers

    // Stretch on X, Squash on Y while moving
    const scaleX = isMoving ? stretchFactor.value : interpolate(breath.value, [0, 1], [0.98, 1.05]);
    const scaleY = isMoving ? interpolate(stretchFactor.value, [1, 1.8], [1, 0.6]) : interpolate(breath.value, [0, 1], [0.98, 1.05]);

    return {
      transform: [
        { scaleX: withSpring(scaleX, SPRING_LIQUID) },
        { scaleY: withSpring(scaleY, SPRING_LIQUID) }
      ],
      opacity: isMoving ? 0.4 : interpolate(breath.value, [0, 1], [0.85, 1]), // dimmer while sliding
    };
  });

  const streakStyle = useAnimatedStyle(() => {
    const isMoving = activeIndex.value % 1 !== 0;
    const scaleX = isMoving ? stretchFactor.value * 1.5 : interpolate(breath.value, [0, 1], [1, 1.2]);
    return {
      transform: [{ scaleX: withSpring(scaleX, SPRING_LIQUID) }],
      // Streak fades to clear white/gold head while stretching, returns to normal when rested
      opacity: isMoving ? 0.8 : interpolate(breath.value, [0, 1], [0.7, 1]),
    };
  });

  // Keep dark aura extremely subtle, but tight
  const goldHex = isWhite ? "#9A7B1A" : "#e0b84c";

  return (
    <Animated.View style={[styles.slidingIndicatorContainer, { width: tabWidth }, animatedStyle]}>
      {/* Liquid Aura */}
      <Animated.View style={[styles.noorAura, fluidAuraStyle]}>
        <LinearGradient
          colors={[
            isWhite ? "rgba(154,123,26,0.25)" : "rgba(255,230,120,0.12)",
            isWhite ? "rgba(154,123,26,0.05)" : "rgba(255,230,120,0.01)",
            "transparent",
          ]}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0.2 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.noorGradientFill}
        />
      </Animated.View>

      {/* Stretch Streak */}
      <Animated.View style={[styles.streak, streakStyle]}>
        <LinearGradient
          colors={[`${goldHex}00`, `${goldHex}FF`, `${goldHex}00`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </Animated.View>
  );
});

/* ══════════════════════════════════════════════════════════════════
   Tab Item — Icon Transformations (Ghost Labels / Pure Minimalism)
   ══════════════════════════════════════════════════════════════════ */
const TabItem = memo(function TabItem({ label, icon: Icon, isFocused, onPress, onLongPress, isWhite }) {
  const pressScale = useSharedValue(1);
  const focusVal = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focusVal.value = withTiming(isFocused ? 1 : 0, EASE_SWEEP);
  }, [isFocused]);

  const activeColor = isWhite ? "#8B6914" : "#FCE285";
  // Inactive icons are pure neutral, absorbing background color
  const inactiveColor = isWhite ? "rgba(40,30,15,0.40)" : "rgba(220,225,240,0.50)";

  const animatedIconStyle = useAnimatedStyle(() => {
    // Active floats up significantly (+ label under), Inactive sits dead center (+ label hidden)
    const yOffset = interpolate(focusVal.value, [0, 1], [6, -8]);
    const focusScale = interpolate(focusVal.value, [0, 1], [0.95, 1.1]);

    return {
      transform: [
        { translateY: yOffset },
        { scale: pressScale.value * focusScale },
      ],
    };
  });

  const labelAnim = useAnimatedStyle(() => {
    // V5 Minimalism: Label completely vanishes and shrinks height to 0 when inactive
    return {
      opacity: focusVal.value,
      transform: [
        { translateY: interpolate(focusVal.value, [0, 1], [8, 0]) }, // slides up
        { scale: interpolate(focusVal.value, [0, 1], [0.5, 1]) } // pops into existence
      ],
      // We don't animate height mathematically (bad for perf), but we position it absolutely and animate Y.
    };
  });

  return (
    <Pressable
      onPressIn={() => {
        pressScale.value = withSpring(0.7, SPRING_3D); // Deep press
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, SPRING_3D);
      }}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <View style={styles.staticIconShadow}>
          <Icon
            color={isFocused ? activeColor : inactiveColor}
            size={24}
            strokeWidth={isFocused ? 2.0 : 1.5}
          />
        </View>
      </Animated.View>

      <Animated.View style={[styles.labelAbsoluteWrapper, labelAnim]}>
        <Animated.Text
          style={[
            styles.tabLabel,
            { color: activeColor },
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
});

/* ══════════════════════════════════════════════════════════════════
   Tab Bar Background — Adjusted for Deep Integration
   ══════════════════════════════════════════════════════════════════ */
const TabBarBackground = memo(function TabBarBackground({ isWhite }) {
  return (
    <View style={styles.bgWrap}>
      {/* 
        V5.1: Flawless Dark Theme Sync
        Using the EXACT base color from LivingBackground (#050505) but highly translucent
        so the geometric shapes behind still bleed through slightly, but it matches the general tone perfectly.
      */}
      <LinearGradient
        colors={
          isWhite
            ? ["rgba(255,255,255,0.75)", "rgba(240,235,225,0.90)"]
            : ["rgba(5,5,5,0.85)", "rgba(0,0,0,0.98)"] // Exact #050505 pitch black sync
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ultimate Frosted Glass */}
      <BlurView
        intensity={isWhite ? 85 : 95}
        tint={isWhite ? "light" : "dark"}
        style={StyleSheet.absoluteFillObject}
      />

      <LinearGradient
        colors={
          isWhite
            ? ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.0)", "rgba(255,255,255,0.1)"]
            : ["rgba(255,255,255,0.06)", "rgba(5,5,5,0.0)", "rgba(255,255,255,0.02)"] // Stealthier
        }
        locations={[0, 0.4, 1]}
        start={{ x: -0.2, y: -0.2 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.gradientBorderContainer}>
        <LinearGradient
          colors={
            isWhite
              ? ["rgba(200,160,50,0.4)", "rgba(255,255,255,0.6)", "rgba(200,160,50,0.1)"]
              : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.01)", "rgba(255,255,255,0.03)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.gradientBorderCutout} />
      </View>

      <View
        style={[
          styles.rimHighlight,
          {
            backgroundColor: isWhite
              ? "rgba(255,255,255,0.9)"
              : "rgba(255,255,255,0.12)",
          },
        ]}
      />
    </View>
  );
});

/* ══════════════════════════════════════════════════════════════════
   Custom Tab Bar Component
   ══════════════════════════════════════════════════════════════════ */
function CustomTabBar({ state, descriptors, navigation, isWhite }) {
  const insets = useSafeAreaInsets();

  const bottomOffset = Math.max(insets.bottom + 12, 28); // Even higher

  const [barWidth, setBarWidth] = useState(0);
  const activeIndex = useSharedValue(state.index);

  // 3D Levitation Values
  const levitationX = useSharedValue(0); // Which direction user pressed

  useEffect(() => {
    activeIndex.value = withSpring(state.index, SPRING_LIQUID);
  }, [state.index]);

  const containerStyle = useAnimatedStyle(() => {
    // Limit rotation to a max of 2 degrees so it feels solid, not broken
    const rotateY = interpolate(levitationX.value, [-1, 1], [-3, 3], Extrapolation.CLAMP);
    const scale = interpolate(levitationX.value, [-1, 0, 1], [0.98, 1, 0.98]);
    return {
      transform: [
        { perspective: 800 },
        { rotateY: `${rotateY}deg` },
        { scale: scale }
      ],
    };
  });

  return (
    <Animated.View
      onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      style={[
        styles.tabBarContainer,
        {
          bottom: bottomOffset,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 25 },
          // Match the shadow closely so it doesn't look like a floating dirty box
          shadowOpacity: isWhite ? 0.15 : 0.8,
          shadowRadius: 40,
        },
        containerStyle
      ]}
    >
      <TabBarBackground isWhite={isWhite} />

      <View style={styles.tabButtonsContainer}>
        {barWidth > 0 && (
          <SlidingIndicator
            activeIndex={activeIndex}
            barWidth={barWidth}
            numTabs={state.routes.length}
            isWhite={isWhite}
          />
        )}

        {state.routes.map((route, index) => {
          const label = route.name === 'index' ? 'Home' :
            route.name === 'tracker' ? 'Prayers' :
              route.name === 'qibla' ? 'Qibla' :
                route.name === 'dua' ? 'Duas' :
                  route.name === 'settings' ? 'Profile' : route.name;

          const isFocused = state.index === index;

          const onPressIn = () => {
            // Calculate a -1 to +1 float based on which tab (left->right) is pressed
            const direction = (index / (state.routes.length - 1)) * 2 - 1;
            levitationX.value = withSpring(direction, SPRING_3D);
          };

          const onPressOut = () => {
            levitationX.value = withSpring(0, SPRING_3D);
          };

          const onPress = () => {
            onPressIn();
            setTimeout(onPressOut, 100);

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true });
            }
            if (!isFocused) {
              // Haptic synced with the 3D press
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          };

          let Icon;
          if (route.name === 'index') Icon = Home;
          else if (route.name === 'tracker') Icon = Clock;
          else if (route.name === 'qibla') Icon = Compass;
          else if (route.name === 'dua') Icon = BookOpen;
          else if (route.name === 'settings') Icon = User;

          return (
            <TabItem
              key={route.key}
              label={label}
              icon={Icon}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              isWhite={isWhite}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Layout
   ══════════════════════════════════════════════════════════════════ */
export default function TabLayout() {
  const { settings } = useSettings();
  const isWhite = settings.whiteTheme === true;
  const tabSceneBackground = isWhite ? "#F9F6F0" : "#050510";

  const renderTabBar = useCallback(
    (props) => <CustomTabBar {...props} isWhite={isWhite} />,
    [isWhite]
  );

  const sceneStyle = useMemo(
    () => ({ backgroundColor: tabSceneBackground }),
    [tabSceneBackground]
  );

  const screenOptions = useMemo(() => ({
    headerShown: false,
    sceneStyle,
    // Keep tabs live so theme/state updates don't flash stale snapshots on iOS.
    freezeOnBlur: false,
    animation: "none",
    // Preload tab routes so users don't see the first mount/animation flash.
    lazy: false,
  }), [sceneStyle]);

  return (
    <View style={{ flex: 1, backgroundColor: tabSceneBackground }}>
      <LivingBackground isWhite={isWhite} />
      <Tabs
        detachInactiveScreens={false}
        tabBar={renderTabBar}
        screenOptions={screenOptions}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="tracker" />
        <Tabs.Screen name="qibla" />
        <Tabs.Screen name="dua" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Styles — "V5 Ultimate Luxury" Aesthetics
   ══════════════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    left: BAR_MX,
    right: BAR_MX,
    height: BAR_H,
    borderRadius: BAR_R,
    backgroundColor: "transparent",
    elevation: 0,
    zIndex: 100,
  },
  tabButtonsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: BAR_H,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  staticIconShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  slidingIndicatorContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
  },
  noorAura: {
    position: "absolute",
    top: 8,
    bottom: 12,
    width: 60,
    borderRadius: 30, // Tighter circle aura
  },
  noorGradientFill: {
    flex: 1,
    borderRadius: 30,
  },

  labelAbsoluteWrapper: {
    position: 'absolute',
    bottom: 14, // Fix to bottom for active tab
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 9.5,
    letterSpacing: 0.8,
    fontFamily: "Montserrat_600SemiBold",
  },

  streak: {
    position: "absolute",
    bottom: 7,
    width: 20, // Tight small center dot/line
    height: 2.5,
    borderRadius: 1.5,
    overflow: "hidden",
  },

  bgWrap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BAR_R,
    overflow: "hidden",
  },

  gradientBorderContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BAR_R,
    padding: 1,
    overflow: "hidden",
  },
  gradientBorderCutout: {
    flex: 1,
    borderRadius: BAR_R - 1,
    backgroundColor: "transparent",
    borderWidth: 0,
  },

  rimHighlight: {
    position: "absolute",
    top: 1,
    left: 40,
    right: 40, // More inset highlight
    height: 0.5,
    borderRadius: 1,
  },
});
