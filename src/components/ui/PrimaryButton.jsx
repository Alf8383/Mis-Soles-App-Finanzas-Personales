import { Pressable, StyleSheet, Text } from "react-native";

import { useAppTheme } from "../../theme";

export function PrimaryButton({ label, onPress, style, disabled = false }) {
  const { colors, radii, spacing, typography } = useAppTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? colors.textTertiary : colors.primary,
          borderRadius: radii.xl,
          opacity: pressed && !disabled ? 0.9 : 1,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          transform: [{ translateY: pressed && !disabled ? 1 : 0 }, { scale: pressed && !disabled ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: colors.surface,
            fontSize: typography.sizes.md,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  label: {
    fontWeight: "800",
  },
});
