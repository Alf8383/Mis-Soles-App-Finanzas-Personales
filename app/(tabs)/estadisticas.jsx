import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import { Card, Chip, EmptyState, MoneyText } from "../../src/components/ui";
import { useAuthFlowStore, useStatisticsStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

const PERIODS = [
  { label: "Este mes", value: "this_month" },
  { label: "Mes anterior", value: "previous_month" },
];

export default function EstadisticasScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const user = useAuthFlowStore((state) => state.user);
  const statistics = useStatisticsStore();
  const [period, setPeriod] = useState("this_month");
  const maxWeeklyAmount = useMemo(
    () => Math.max(...statistics.weeklyBars.map((bar) => Number(bar.amountMinor || 0)), 1),
    [statistics.weeklyBars],
  );

  useEffect(() => {
    if (user?.uid) {
      statistics.loadStatistics(user.uid, period);
    }
  }, [period, statistics.loadStatistics, user?.uid]);

  return (
    <Screen scrollable bottomInset={120}>
      <AppHeader title="Estadísticas" subtitle="Tendencias reales desde tus movimientos" />

      <View style={[styles.filters, { marginTop: spacing.lg }]}>
        {PERIODS.map((item) => (
          <Chip
            key={item.value}
            label={item.label}
            active={period === item.value}
            onPress={() => setPeriod(item.value)}
          />
        ))}
      </View>

      {statistics.status === "loading" ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : null}
      {statistics.error ? (
        <Text style={[styles.error, { color: colors.red, marginTop: spacing.md }]}>{statistics.error}</Text>
      ) : null}

      <View style={[styles.statsGrid, { marginTop: spacing.lg }]}>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ingresos</Text>
          <MoneyText
            amount={statistics.income}
            currency="PEN"
            tone="positive"
            style={[styles.statValue, { fontSize: typography.sizes.md }]}
          />
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Gastos</Text>
          <MoneyText
            amount={statistics.expense}
            currency="PEN"
            tone="negative"
            style={[styles.statValue, { fontSize: typography.sizes.md }]}
          />
        </Card>
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.itemRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
              Salud del periodo
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Ahorro estimado {statistics.savingsRate}%
            </Text>
          </View>
          <MoneyText amount={statistics.net} currency="PEN" tone={statistics.net >= 0 ? "positive" : "negative"} />
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
          Gastos por categoría
        </Text>
        {statistics.categoryTotals.length === 0 ? (
          <EmptyState
            icon="pie-chart-outline"
            title="Sin gastos en este periodo"
            description="Cuando registres gastos, verás aquí el reparto por categoría."
          />
        ) : (
          <>
            <View style={styles.donutWrap}>
              <View style={[styles.donut, { borderColor: colors.background }]}>
                {statistics.categoryTotals.slice(0, 4).map((category, index) => (
                  <View
                    key={category.categoryId}
                    style={[
                      styles.donutSlice,
                      {
                        backgroundColor: category.color,
                        opacity: 0.42 + index * 0.16,
                        transform: [{ rotate: `${index * 42}deg` }],
                      },
                    ]}
                  />
                ))}
                <View style={[styles.donutCenter, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.donutText, { color: colors.textPrimary }]}>
                    {statistics.categoryTotals[0]?.percent || 0}%
                  </Text>
                </View>
              </View>
            </View>
            {statistics.categoryTotals.map((category) => (
              <View key={category.categoryId} style={[styles.categoryRow, { backgroundColor: colors.surfaceContainerLow }]}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <View style={styles.itemInfo}>
                  <Text style={[styles.name, { color: colors.textPrimary }]}>{category.name}</Text>
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>{category.percent}% del gasto</Text>
                </View>
                <MoneyText amount={category.amount} currency="PEN" tone="negative" />
              </View>
            ))}
          </>
        )}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
          Barras semanales
        </Text>
        <View style={styles.barChart}>
          {statistics.weeklyBars.map((bar) => (
            <View key={bar.label} style={styles.barItem}>
              <View style={[styles.barTrack, { backgroundColor: colors.background }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: colors.gold,
                      height: `${Math.max(8, (Number(bar.amountMinor || 0) / maxWeeklyAmount) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{bar.label}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  barChart: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    height: 150,
    marginTop: 12,
  },
  barFill: {
    borderRadius: 999,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
  barItem: {
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  barTrack: {
    borderRadius: 999,
    flex: 1,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  categoryDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  categoryRow: {
    alignItems: "center",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    padding: 12,
    marginTop: 12,
  },
  donut: {
    alignItems: "center",
    borderRadius: 70,
    borderWidth: 12,
    height: 140,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    width: 140,
  },
  donutCenter: {
    alignItems: "center",
    borderRadius: 42,
    height: 84,
    justifyContent: "center",
    width: 84,
    zIndex: 2,
  },
  donutSlice: {
    height: 90,
    position: "absolute",
    width: 150,
  },
  donutText: {
    fontSize: 18,
    fontWeight: "900",
  },
  donutWrap: {
    alignItems: "center",
    marginVertical: 12,
  },
  error: {
    fontWeight: "700",
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  meta: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
  },
  sectionTitle: {
    fontWeight: "800",
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statValue: {
    marginTop: 6,
  },
});
