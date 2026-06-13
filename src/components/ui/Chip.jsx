import { Pressable, StyleSheet, Text } from "react-native";

import { useAppTheme } from "../../theme";

export function Chip({ label, active = false, onPress }) {
  const { colors, radii, spacing, typography } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surfaceContainerLow,
          borderColor: active ? colors.primary : colors.border,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          opacity: pressed ? 0.86 : 1,
          transform: [{ translateY: pressed ? 1 : 0 }],
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: active ? colors.surface : colors.textSecondary,
            fontSize: typography.sizes.sm,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 0.5,
    minHeight: 34,
    justifyContent: "center",
  },
  label: {
    fontWeight: "800",
  },
});
