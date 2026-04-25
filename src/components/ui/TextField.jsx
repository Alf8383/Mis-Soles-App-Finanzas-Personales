import { StyleSheet, Text, TextInput, View } from "react-native";

import { useAppTheme } from "../../theme";

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
}) {
  const { colors, radii, spacing, typography } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontSize: typography.sizes.sm,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radii.md,
            color: colors.textPrimary,
            fontSize: typography.sizes.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
  },
});
