import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "../../theme";

export function QuickActionFab({ visible = true, onPress }) {
  const { colors, radii, shadows, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const webContentOffset = Math.max(0, (width - 780) / 2);

  if (!visible) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Abrir acciones rapidas"
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        shadows.fab,
        {
          backgroundColor: colors.primary,
          borderRadius: radii.pill,
          bottom: Math.max(insets.bottom, spacing.xs) + 78,
          opacity: pressed ? 0.92 : 1,
          right: webContentOffset + spacing.xl,
          transform: [{ translateY: pressed ? 1 : 0 }, { scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <Ionicons name="add" size={32} color={colors.surface} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.82)",
  },
});
