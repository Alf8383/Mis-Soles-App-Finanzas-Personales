import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import { Card, Chip, EmptyState, MoneyText } from "../../src/components/ui";
import { useAppTheme } from "../../src/theme";

export default function ObligacionesScreen() {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <Screen scrollable bottomInset={32}>
      <AppHeader title="Obligaciones" subtitle="Deudas y pagos fijos" />
      <View style={[styles.filters, { marginTop: spacing.lg }]}>
        <Chip label="Deudas" active />
        <Chip label="Pagos fijos" />
      </View>
      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.obligationRow}>
          <View style={[styles.dot, { backgroundColor: colors.gold }]} />
          <View style={styles.obligationInfo}>
            <Text style={[styles.name, { color: colors.textPrimary }]}>Internet</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>Demo mensual · 25 may</Text>
          </View>
          <MoneyText amount={120.5} currency="PEN" style={{ fontSize: typography.sizes.md }} />
        </View>
      </Card>
      <Card style={{ marginTop: spacing.md }}>
        <EmptyState
          icon="calendar-outline"
          title="Sin obligaciones cloud todavía"
          description="El alta real de deudas y pagos fijos llegará después. Por ahora dejamos la experiencia base lista."
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  obligationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  obligationInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
});
