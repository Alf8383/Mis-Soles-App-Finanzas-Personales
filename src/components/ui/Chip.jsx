import { Pressable, StyleSheet, Text } from "react-native";

import { useAppTheme } from "../../theme";

export function Chip({ label, active = false, onPress }) {
  const { colors, radii, spacing, typography } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
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
    borderWidth: 1,
  },
  label: {
    fontWeight: "600",
  },
});
