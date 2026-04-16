import { StyleSheet, Text } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import { Card } from "../../src/components/ui";
import { useAppTheme } from "../../src/theme";

export default function ObligacionesScreen() {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <Screen>
      <AppHeader title="Obligaciones" subtitle="Deudas y pagos fijos" />
      <Card style={{ marginTop: spacing.lg }}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
          Obligaciones
        </Text>
        <Text style={[styles.copy, { color: colors.textSecondary, fontSize: typography.sizes.md }]}>
          Placeholder de deudas y pagos fijos.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    marginBottom: 8,
  },
  copy: {
    lineHeight: 22,
  },
});
