import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../theme";
import { PrimaryButton } from "./PrimaryButton";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "sparkles-outline",
}) {
  const { colors, radii, spacing, typography } = useAppTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderColor: colors.border,
          borderRadius: radii.xl,
          padding: spacing.lg,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: colors.primarySoft,
            borderRadius: radii.pill,
            marginBottom: spacing.md,
          },
        ]}
      >
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <Text
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            fontSize: typography.sizes.lg,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.description,
          {
            color: colors.textSecondary,
            fontSize: typography.sizes.md,
            marginTop: spacing.xs,
          },
        ]}
      >
        {description}
      </Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} style={{ marginTop: spacing.md }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  iconWrap: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    lineHeight: 22,
    textAlign: "center",
  },
});
