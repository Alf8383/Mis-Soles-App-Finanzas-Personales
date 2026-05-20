import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "../../theme";

export function QuickActionFab({ visible = true, onPress }) {
  const { colors, radii, shadows, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();

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
    left: "50%",
    width: 52,
    height: 52,
    marginLeft: -26,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
});
