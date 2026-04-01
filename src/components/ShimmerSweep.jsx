import { useEffect, memo } from "react";
import { Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const { width: SW } = Dimensions.get("window");

export const ShimmerSweep = memo(function ShimmerSweep({
  color,
  delay = 1000,
  interval = 4000,
  width = 70,
  opacity = 0.07,
  repeatCount = -1,
}) {
  const translateX = useSharedValue(-SW);

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(SW, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withDelay(interval, withTiming(-SW, { duration: 0 })),
        ),
        repeatCount,
        false,
      ),
    );
  }, [delay, interval, repeatCount]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          bottom: 0,
          width,
          opacity,
        },
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
});
