import { StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";

import { useAppTheme } from "../../theme";

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  errorMessage,
  ...inputProps
}) {
  const { colors, radii, spacing, typography } = useAppTheme();
  const [focused, setFocused] = useState(false);

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
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: errorMessage ? colors.red : focused ? colors.primary : colors.ghostBorder,
            borderRadius: radii.md,
            color: colors.textPrimary,
            fontSize: typography.sizes.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
          },
        ]}
        {...inputProps}
      />
      {errorMessage ? (
        <Text
          style={[
            styles.error,
            {
              color: colors.red,
              fontSize: typography.sizes.sm,
              marginTop: spacing.xs,
            },
          ]}
        >
          {errorMessage}
        </Text>
      ) : null}
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
    minHeight: 52,
  },
  error: {
    lineHeight: 18,
  },
});
