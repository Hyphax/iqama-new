import React from "react";
import { View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { getShadow } from "@/utils/iqamaTheme";

/**
 * GlassCard — a premium glassmorphic card that works in both themes.
 *
 * @param {boolean} isWhite — current theme mode
 * @param {string} [accentColor] — optional accent color for border tint
 * @param {string} [level="card"] — shadow level: "soft" | "card" | "elevated" | "ultra"
 * @param {number} [padding=22] — inner padding
 * @param {number} [borderRadius=26] — corner radius
 */
export function GlassCard({
  children,
  style,
  isWhite = false,
  accentColor,
  borderColor,
  level = "card",
  padding = 22,
  borderRadius = 26,
}) {
  const resolvedBorder = borderColor
    || (isWhite
        ? accentColor ? `${accentColor}25` : "rgba(139,90,43,0.08)"
        : accentColor ? `${accentColor}15` : "rgba(255,255,255,0.06)");

  return (
    <View
      style={[
        {
          borderRadius,
          overflow: "hidden",
          borderWidth: isWhite ? 0.8 : 0.5,
          borderColor: resolvedBorder,
          ...getShadow(isWhite, level),
        },
        style,
      ]}
    >
      {/* White theme: warm ivory gradient base */}
      {isWhite && (
        <LinearGradient
          colors={
            accentColor
              ? ["#FEFDFB", "#F8F4EC", `${accentColor}10`, "#F5EEE0"]
              : ["#FEFDFB", "#F8F4EC", "#F5EEE0"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}

      <BlurView
        intensity={isWhite ? 0 : 30}
        tint={isWhite ? "light" : "dark"}
        style={{
          padding,
          backgroundColor: isWhite
            ? "transparent"
            : "rgba(10,10,20,0.35)",
        }}
      >
        {children}
      </BlurView>
    </View>
  );
}
