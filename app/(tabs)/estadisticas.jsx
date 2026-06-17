import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import { Card, Chip, EmptyState, MoneyText } from "../../src/components/ui";
import { getCategoryIconName } from "../../src/lib/domain/category-icons";
import { useAuthFlowStore, useStatisticsStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

const PERIODS = [
  { label: "Este mes", value: "this_month" },
  { label: "Mes anterior", value: "previous_month" },
];

const WEEKDAY_LABELS = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];

function getTodayWeekIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

function formatCompactAmount(amountMinor) {
  const amount = Math.round(Number(amountMinor || 0) / 100);
  return amount > 0 ? `S/${amount}` : "";
}

export default function EstadisticasScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const user = useAuthFlowStore((state) => state.user);
  const statistics = useStatisticsStore();
  const [period, setPeriod] = useState("this_month");
  const todayWeekIndex = useMemo(getTodayWeekIndex, []);
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
        <Card style={[styles.statCard, { backgroundColor: colors.primarySoft }]}>
          <View style={styles.statHeader}>
            <Ionicons name="arrow-down-circle-outline" size={18} color={colors.primary} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ingresos</Text>
          </View>
          <MoneyText
            amount={statistics.income}
            currency="PEN"
            tone="positive"
            style={[styles.statValue, { fontSize: typography.sizes.md }]}
          />
        </Card>
        <Card style={[styles.statCard, { backgroundColor: colors.redSoft }]}>
          <View style={styles.statHeader}>
            <Ionicons name="arrow-up-circle-outline" size={18} color={colors.red} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Gastos</Text>
          </View>
          <MoneyText
            amount={statistics.expense}
            currency="PEN"
            tone="negative"
            style={[styles.statValue, { fontSize: typography.sizes.md }]}
          />
        </Card>
      </View>

      <Card style={{ marginTop: spacing.md, backgroundColor: colors.surfaceContainerLow }}>
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
        <View style={styles.sectionHeader}>
          <View style={styles.itemInfo}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
              Gastos por categoría
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>Reparto del periodo seleccionado</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Gestionar categorías"
            onPress={() => router.push("/(modals)/categorias")}
            style={({ pressed }) => [
              styles.manageButton,
              { backgroundColor: colors.surfaceContainerLow, opacity: pressed ? 0.82 : 1 },
            ]}
          >
            <Ionicons name="pricetags-outline" size={18} color={colors.primary} />
          </Pressable>
        </View>
        {statistics.categoryTotals.length === 0 ? (
          <EmptyState
            icon="pie-chart-outline"
            title="Sin gastos en este periodo"
            description="Cuando registres gastos, verás aquí el reparto por categoría."
            actionLabel="Gestionar categorías"
            onAction={() => router.push("/(modals)/categorias")}
          />
        ) : (
          <>
            <View style={[styles.categorySummary, { backgroundColor: colors.surfaceContainerLow }]}>
              <View>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Principal</Text>
                <Text style={[styles.summaryName, { color: colors.textPrimary }]}>
                  {statistics.categoryTotals[0]?.name}
                </Text>
              </View>
              <Text style={[styles.summaryPercent, { color: colors.primary }]}>
                {statistics.categoryTotals[0]?.percent || 0}%
              </Text>
            </View>
            <View style={[styles.distributionTrack, { backgroundColor: colors.surfaceContainerHigh }]}>
              {statistics.categoryTotals.slice(0, 5).map((category) => (
                <View
                  key={category.categoryId}
                  style={[
                    styles.distributionSegment,
                    {
                      backgroundColor: category.color || colors.gold,
                      flexGrow: Math.max(Number(category.percent || 0), 3),
                    },
                  ]}
                />
              ))}
            </View>
            {statistics.categoryTotals.map((category) => (
              <View key={category.categoryId} style={[styles.categoryRow, { backgroundColor: colors.surfaceContainerLow }]}>
                <View style={styles.categoryTopLine}>
                  <View style={styles.categoryNameWrap}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color || colors.gold }]}>
                      <Ionicons name={getCategoryIconName(category.icon)} size={18} color={colors.surface} />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.name, { color: colors.textPrimary }]}>{category.name}</Text>
                      <Text style={[styles.meta, { color: colors.textSecondary }]}>{category.percent}% del gasto</Text>
                    </View>
                  </View>
                  <MoneyText amount={category.amount} currency="PEN" tone="negative" />
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: category.color || colors.gold,
                        width: `${Math.max(2, Math.min(Number(category.percent || 0), 100))}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </>
        )}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.sectionHeader}>
          <View style={styles.itemInfo}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
              Barras semanales
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>Gastos registrados por día</Text>
          </View>
          <View style={[styles.manageButton, { backgroundColor: colors.goldSoft }]}>
            <Ionicons name="bar-chart-outline" size={18} color={colors.gold} />
          </View>
        </View>
        <View style={[styles.barChart, { backgroundColor: colors.surfaceContainerLowest }]}>
          {statistics.weeklyBars.map((bar, index) => {
            const amountMinor = Number(bar.amountMinor || 0);
            const isToday = index === todayWeekIndex;
            const barHeight = amountMinor > 0 ? Math.max(18, (amountMinor / maxWeeklyAmount) * 100) : 0;

            return (
              <View key={`${bar.label}-${index}`} style={styles.barItem}>
                <Text
                  numberOfLines={1}
                  style={[styles.barValue, { color: amountMinor > 0 ? colors.textPrimary : colors.textTertiary }]}
                >
                  {formatCompactAmount(amountMinor)}
                </Text>
                <View
                  style={[
                    styles.barTrack,
                    {
                      backgroundColor: isToday ? colors.goldSoft : colors.surfaceContainerLow,
                    },
                  ]}
                >
                  {amountMinor > 0 ? (
                    <View
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: isToday ? colors.primary : colors.gold,
                          height: `${barHeight}%`,
                        },
                      ]}
                    />
                  ) : (
                    <View style={[styles.barZeroMark, { backgroundColor: colors.surfaceContainerHigh }]} />
                  )}
                </View>
                <Text style={[styles.barLabel, { color: isToday ? colors.primary : colors.textSecondary }]}>
                  {WEEKDAY_LABELS[index] || bar.label}
                </Text>
                <View style={[styles.todayIndicator, { backgroundColor: isToday ? colors.primary : "transparent" }]} />
              </View>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  barChart: {
    alignItems: "stretch",
    borderRadius: 18,
    flexDirection: "row",
    gap: 8,
    height: 174,
    marginTop: 14,
    paddingHorizontal: 10,
    paddingTop: 12,
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
    gap: 6,
    height: "100%",
    justifyContent: "flex-end",
  },
  barLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  barTrack: {
    borderRadius: 999,
    height: 104,
    overflow: "hidden",
    position: "relative",
    width: 18,
  },
  barValue: {
    fontSize: 10,
    fontWeight: "900",
    minHeight: 13,
    textAlign: "center",
    width: 42,
  },
  barZeroMark: {
    borderRadius: 999,
    bottom: 0,
    height: 5,
    left: 4,
    position: "absolute",
    right: 4,
  },
  todayIndicator: {
    borderRadius: 999,
    height: 4,
    marginTop: -2,
    width: 14,
  },
  categoryIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  categoryNameWrap: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  categoryRow: {
    borderRadius: 18,
    marginTop: 12,
    padding: 12,
  },
  categorySummary: {
    alignItems: "center",
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    padding: 14,
  },
  categoryTopLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  distributionSegment: {
    flexBasis: 0,
    minWidth: 6,
  },
  distributionTrack: {
    borderRadius: 999,
    flexDirection: "row",
    gap: 3,
    height: 14,
    marginTop: 12,
    overflow: "hidden",
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
  manageButton: {
    alignItems: "center",
    borderRadius: 16,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  name: {
    fontSize: 14,
    fontWeight: "900",
  },
  progressFill: {
    borderRadius: 999,
    height: "100%",
  },
  progressTrack: {
    borderRadius: 999,
    height: 7,
    marginTop: 10,
    overflow: "hidden",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  sectionTitle: {
    fontWeight: "800",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  summaryName: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  summaryPercent: {
    fontSize: 28,
    fontWeight: "900",
  },
  statCard: {
    flex: 1,
  },
  statHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
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
