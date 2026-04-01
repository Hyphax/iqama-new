import { TouchableOpacity, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GOLD_GRADIENT, SHADOWS, WHITE_THEME } from "@/utils/iqamaTheme";
import * as Haptics from "expo-haptics";

export default function GoldGradientButton({ title, onPress, icon: Icon, style, isWhite }) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
      }}
      style={[
        isWhite ? WHITE_THEME.cardShadowStrong : { ...SHADOWS.glow("#D4AF37") },
        style,
      ]}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <LinearGradient
        colors={
          isWhite
            ? [WHITE_THEME.gold, "#B8860B", "#8B6914"]
            : GOLD_GRADIENT
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          height: 56, borderRadius: 16,
          flexDirection: "row", alignItems: "center", justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        {Icon && <Icon size={20} color={isWhite ? "#FFFFFF" : "#050510"} style={{ marginRight: 8 }} />}
        <Text style={{
          fontFamily: "Montserrat_600SemiBold",
          fontSize: 16, color: isWhite ? "#FFFFFF" : "#050510", letterSpacing: 0.3,
        }}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
