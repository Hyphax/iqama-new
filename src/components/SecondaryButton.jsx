import { TouchableOpacity, Text } from "react-native";
import { WHITE_THEME } from "@/utils/iqamaTheme";
import * as Haptics from "expo-haptics";

export default function SecondaryButton({ title, onPress, style, isWhite }) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={[{
        height: 56, borderRadius: 18,
        borderWidth: isWhite ? 0.8 : 0.5,
        borderColor: isWhite ? WHITE_THEME.cardBorderAccent : "rgba(255,255,255,0.08)",
        alignItems: "center", justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: isWhite ? WHITE_THEME.buttonSecondary : "rgba(255,255,255,0.04)",
        ...(isWhite && WHITE_THEME.cardShadow),
      }, style]}
      activeOpacity={0.7}
    >
      <Text style={{
        fontFamily: "Montserrat_600SemiBold", fontSize: 16,
        color: isWhite ? WHITE_THEME.buttonSecondaryText : "rgba(255,255,255,0.45)",
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
