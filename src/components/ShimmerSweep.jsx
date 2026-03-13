import { useEffect } from "react";
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

/**
 * ShimmerSweep — a shared shimmer overlay that sweeps across its parent.
 * Parent must have `overflow: "hidden"` for proper clipping.
 *
 * @param {string} color — the shimmer light color
 * @param {number} [delay=1000] — initial delay before first sweep
 * @param {number} [interval=4000] — pause between sweeps
 * @param {number} [width=70] — width of the shimmer band
 * @param {number} [opacity=0.07] — peak shimmer opacity
 */
export function ShimmerSweep({
  color,
  delay = 1000,
  interval = 4000,
  width = 70,
  opacity = 0.07,
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
        -1,
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
}
