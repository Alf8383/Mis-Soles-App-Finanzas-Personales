import { StyleSheet, View } from "react-native";

import { useAppTheme } from "../../theme";

export function Card({ children, style }) {
  const { colors, radii, spacing, shadows } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: colors.border,
          borderRadius: radii.lg,
          padding: spacing.lg,
        },
        shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 0.5,
    overflow: "hidden",
  },
});
