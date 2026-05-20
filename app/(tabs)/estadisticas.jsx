import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import { Card, EmptyState } from "../../src/components/ui";
import { useAppTheme } from "../../src/theme";

export default function EstadisticasScreen() {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <Screen scrollable bottomInset={32}>
      <AppHeader title="Estadísticas" subtitle="Vista base del módulo analítico" />
      <View style={[styles.statsGrid, { marginTop: spacing.lg }]}>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Balance</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
            S/ 1,524
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ahorro</Text>
          <Text style={[styles.statValue, { color: colors.primaryMuted, fontSize: typography.sizes.lg }]}>
            32%
          </Text>
        </Card>
      </View>
      <Card style={{ marginTop: spacing.md }}>
        <EmptyState
          icon="bar-chart-outline"
          title="Aún no hay gráficos reales"
          description="Cuando EP-05 agregue movimientos cloud, aquí aparecerán tendencias, categorías y comparativos."
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  statValue: {
    fontWeight: "800",
    marginTop: 4,
  },
});
