import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../src/theme";

export default function NuevoMovimientoModal() {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, padding: spacing.xl },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: colors.textPrimary, fontSize: typography.sizes.xxl },
        ]}
      >
        Nuevo movimiento
      </Text>
      <Text style={[styles.copy, { color: colors.textSecondary, fontSize: typography.sizes.md }]}>
        Modal base para el flujo de alta rapida.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    marginBottom: 8,
  },
  copy: {
    textAlign: "center",
  },
});
