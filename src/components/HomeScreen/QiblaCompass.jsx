import React from "react";
import { View, Text } from "react-native";
import { BlurView } from "expo-blur";
import Svg, { Circle, Line, Polygon, Text as SvgText } from "react-native-svg";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
} from "react-native-reanimated";

/**
 * QiblaCompass displays a compass rotated so the needle points toward the Qibla.
 * @param {number} qiblaDirection - Bearing from the user's location to Makkah in degrees (0-360).
 * @param {number} heading - Current device compass heading in degrees (0-360).
 * @param {boolean} isWhite - Theme toggle.
 */
export function QiblaCompass({ qiblaDirection = 0, heading = 0, isWhite = false }) {
  const compassSize = 200;
  const center = compassSize / 2;
  const radius = center - 16;

  // Rotate the compass so the Qibla needle points in the correct direction
  // relative to the device heading.
  const rotation = qiblaDirection - heading;

  const compassStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation}deg` }],
  }));

  // Format the bearing label (e.g. "58 NE")
  const formatBearing = (deg) => {
    const normalized = ((deg % 360) + 360) % 360;
    const rounded = Math.round(normalized) % 360;
    let cardinal = "";
    if (rounded >= 337.5 || rounded < 22.5) cardinal = "N";
    else if (rounded < 67.5) cardinal = "NE";
    else if (rounded < 112.5) cardinal = "E";
    else if (rounded < 157.5) cardinal = "SE";
    else if (rounded < 202.5) cardinal = "S";
    else if (rounded < 247.5) cardinal = "SW";
    else if (rounded < 292.5) cardinal = "W";
    else cardinal = "NW";
    return `${rounded}\u00B0 ${cardinal}`;
  };

  // Theme-aware color tokens
  const majorTickColor = isWhite
    ? "rgba(139,105,20,0.45)"
    : "rgba(212,175,55,0.4)";
  const minorTickColor = isWhite ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.1)";
  const outerRingStroke = isWhite ? "rgba(0,0,0,0.10)" : "rgba(212,175,55,0.15)";
  const innerRingStroke = isWhite ? "rgba(0,0,0,0.06)" : "rgba(212,175,55,0.06)";
  const northColor = isWhite ? "#8B6914" : "#D4AF37";
  const cardinalColor = isWhite
    ? "rgba(28,19,8,0.50)"
    : "rgba(255,255,255,0.4)";
  const needleTopColor = isWhite ? "#8B6914" : "#D4AF37";
  const needleBottomColor = isWhite
    ? "rgba(0,60,200,0.45)"
    : "rgba(0,102,255,0.5)";
  const centerDotColor = isWhite ? "#8B6914" : "#D4AF37";
  const containerBorderColor = isWhite
    ? "rgba(0,0,0,0.07)"
    : "rgba(255,255,255,0.06)";
  const blurTint = isWhite ? "light" : "dark";
  const blurBg = isWhite ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.02)";
  const labelColor = isWhite ? "#8B6914" : "#D4AF37";
  const degreeColor = isWhite ? "rgba(5,5,16,0.75)" : "#FAFAFA";
  const subTextColor = isWhite ? "rgba(28,19,8,0.42)" : "rgba(255,255,255,0.40)";

  const tickMarks = Array.from({ length: 36 }, (_, i) => {
    const isMajor = i % 3 === 0;
    const a = (i * 10 * Math.PI) / 180;
    const innerR = isMajor ? radius - 12 : radius - 6;
    return (
      <Line
        key={i}
        x1={center + innerR * Math.sin(a)}
        y1={center - innerR * Math.cos(a)}
        x2={center + radius * Math.sin(a)}
        y2={center - radius * Math.cos(a)}
        stroke={isMajor ? majorTickColor : minorTickColor}
        strokeWidth={isMajor ? "1.5" : "0.5"}
      />
    );
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(700).duration(600)}
      style={{ paddingHorizontal: 20, marginBottom: 24 }}
    >
      <View
        style={{
          borderRadius: 28,
          overflow: "hidden",
          borderWidth: isWhite ? 0.8 : 1,
          borderColor: containerBorderColor,
          ...(isWhite && {
            shadowColor: "#8B7040",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 4,
          }),
        }}
      >
        <BlurView
          intensity={isWhite ? 40 : 30}
          tint={blurTint}
          style={{
            padding: 24,
            alignItems: "center",
            backgroundColor: blurBg,
          }}
        >
          <Text
            style={{
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 11,
              color: labelColor,
              letterSpacing: 2,
              marginBottom: 20,
            }}
          >
            QIBLA
          </Text>

          <Animated.View style={compassStyle}>
            <Svg width={compassSize} height={compassSize}>
              {/* Outer ring */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={outerRingStroke}
                strokeWidth="1.5"
                fill="none"
              />
              {/* Inner decorative ring */}
              <Circle
                cx={center}
                cy={center}
                r={radius - 20}
                stroke={innerRingStroke}
                strokeWidth="0.8"
                fill="none"
              />

              {tickMarks}

              {/* Cardinal labels */}
              <SvgText
                x={center}
                y={30}
                fill={northColor}
                fontSize="14"
                fontWeight="800"
                textAnchor="middle"
              >
                N
              </SvgText>
              <SvgText
                x={compassSize - 12}
                y={center + 5}
                fill={cardinalColor}
                fontSize="12"
                fontWeight="500"
                textAnchor="middle"
              >
                E
              </SvgText>
              <SvgText
                x={center}
                y={compassSize - 14}
                fill={cardinalColor}
                fontSize="12"
                fontWeight="500"
                textAnchor="middle"
              >
                S
              </SvgText>
              <SvgText
                x={14}
                y={center + 5}
                fill={cardinalColor}
                fontSize="12"
                fontWeight="500"
                textAnchor="middle"
              >
                W
              </SvgText>

              {/* Needle -- north pointer */}
              <Polygon
                points={`${center},${center - 70} ${center - 6},${center} ${center + 6},${center}`}
                fill={needleTopColor}
                opacity="0.85"
              />
              {/* Needle -- south tail */}
              <Polygon
                points={`${center},${center + 70} ${center - 6},${center} ${center + 6},${center}`}
                fill={needleBottomColor}
              />

              {/* Center pivot halo */}
              <Circle
                cx={center}
                cy={center}
                r="7"
                fill={isWhite ? "rgba(139,105,20,0.15)" : "rgba(212,175,55,0.15)"}
              />
              {/* Center pivot dot */}
              <Circle
                cx={center}
                cy={center}
                r="4"
                fill={centerDotColor}
                opacity={isWhite ? "0.9" : "0.8"}
              />
              {/* Center core */}
              <Circle
                cx={center}
                cy={center}
                r="2"
                fill={isWhite ? "#FDFBF7" : "#050505"}
              />
            </Svg>
          </Animated.View>

          {/* Bearing label */}
          <Text
            style={{
              fontFamily: "Montserrat_600SemiBold",
              fontSize: 18,
              color: degreeColor,
              marginTop: 16,
            }}
          >
            {formatBearing(qiblaDirection)}
          </Text>
          <Text
            style={{
              fontFamily: "Montserrat_300Light",
              fontSize: 12,
              color: subTextColor,
              marginTop: 4,
            }}
          >
            Direction to Makkah
          </Text>
        </BlurView>
      </View>
    </Animated.View>
  );
}
