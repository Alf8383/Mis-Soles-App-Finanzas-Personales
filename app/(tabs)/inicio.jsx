import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import {
  Card,
  Chip,
  EmptyState,
  MoneyText,
  QuickActionFab,
  QuickActionSheet,
} from "../../src/components/ui";
import { fromMinorUnits } from "../../src/lib/domain/money";
import { formatExchangeRateDate, getMovementDateLabel, getThisMonthRange, normalizeDate } from "../../src/lib/utils";
import { useAuthFlowStore, useDashboardStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function InicioScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const user = useAuthFlowStore((state) => state.user);
  const dashboard = useDashboardStore();
  const monthRange = getThisMonthRange();
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      dashboard.loadDashboard(user.uid);
    }
  }, [dashboard.loadDashboard, user?.uid]);

  function handleQuickAction(type) {
    setQuickActionsVisible(false);
    router.push({
      pathname: "/(modals)/nuevo-movimiento",
      params: { type },
    });
  }

  return (
    <>
      <Screen scrollable bottomInset={120}>
        <AppHeader
          title="Inicio"
          subtitle="Tu resumen financiero"
          rightSlot={
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(modals)/cuentas")}
              style={[styles.headerButton, { backgroundColor: "rgba(255,255,255,0.16)" }]}
            >
              <Text style={styles.headerButtonText}>Cuentas</Text>
            </Pressable>
          }
        />

        {dashboard.status === "loading" ? (
          <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.primary} />
        ) : null}
        {dashboard.error ? (
          <Text style={[styles.error, { color: colors.red, marginTop: spacing.md }]}>
            {dashboard.error}
          </Text>
        ) : null}

        <Card style={{ marginTop: spacing.lg, backgroundColor: colors.primary }}>
          <Text
            style={[
              styles.label,
              { color: "rgba(255,255,255,0.68)", fontSize: typography.sizes.sm },
            ]}
          >
            Balance total
          </Text>
          <MoneyText
            amount={dashboard.totalBalance}
            currency="PEN"
            style={{
              color: colors.surface,
              fontSize: typography.sizes.display,
              marginTop: spacing.xs,
            }}
          />
          <View style={[styles.balanceGrid, { marginTop: spacing.md }]}>
            <View style={styles.balanceTile}>
              <Text style={styles.balanceTileLabel}>Ingresos</Text>
              <MoneyText
                amount={dashboard.monthlyIncome}
                currency="PEN"
                style={styles.balanceTileValue}
              />
            </View>
            <View style={styles.balanceTile}>
              <Text style={styles.balanceTileLabel}>Gastos</Text>
              <MoneyText
                amount={dashboard.monthlyExpense}
                currency="PEN"
                style={styles.balanceTileValue}
              />
            </View>
          </View>
          <View style={[styles.healthPill, { marginTop: spacing.sm }]}>
            <View
              style={[
                styles.healthDot,
                { backgroundColor: dashboard.savingsRate >= 20 ? colors.gold : colors.red },
              ]}
            />
            <Text style={styles.healthText}>
              Salud financiera: ahorro {dashboard.savingsRate}%
            </Text>
          </View>
        </Card>

        <View style={[styles.row, { marginTop: spacing.md }]}>
          <Chip label="Ingresos" active />
          <Chip label="Gastos" />
          <Chip label={`${monthRange.start.getDate()}-${monthRange.end.getDate()} mes`} />
        </View>

        <Card style={{ marginTop: spacing.md }}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textPrimary, fontSize: typography.sizes.lg },
            ]}
          >
            Próximas obligaciones
          </Text>
          {dashboard.upcomingObligations.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="Todavía no hay obligaciones"
              description="Registra deudas o pagos fijos para ver próximos vencimientos."
            />
          ) : (
            dashboard.upcomingObligations.map((item) => (
              <View key={item.id} style={[styles.itemRow, { marginTop: spacing.md }]}>
                <View>
                  <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                  <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                    {item.source === "debt" ? "Deuda" : "Pago fijo"} · {formatObligationDate(item.date)}
                  </Text>
                </View>
                <MoneyText amount={fromMinorUnits(item.amountMinor)} currency={item.currency || "PEN"} />
              </View>
            ))
          )}
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textPrimary, fontSize: typography.sizes.lg },
            ]}
          >
            Últimos movimientos
          </Text>
          {dashboard.latestMovements.length === 0 ? (
            <EmptyState
              icon="swap-vertical-outline"
              title="Sin movimientos aún"
              description="Usa el botón + para registrar tu primer gasto, ingreso o transferencia."
            />
          ) : (
            dashboard.latestMovements.map((movement) => (
              <View key={movement.id} style={[styles.itemRow, { marginTop: spacing.md }]}>
                <View>
                  <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>
                    {movement.description || movement.type}
                  </Text>
                  <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                    {getMovementDateLabel(movement.date)}
                  </Text>
                </View>
                <MoneyText
                  amount={getSignedMovementAmount(movement)}
                  currency={movement.currency || "PEN"}
                  type={movement.type}
                />
              </View>
            ))
          )}
        </Card>
      </Screen>
      <QuickActionFab onPress={() => setQuickActionsVisible(true)} />
      <QuickActionSheet
        visible={quickActionsVisible}
        onClose={() => setQuickActionsVisible(false)}
        onSelect={handleQuickAction}
      />
    </>
  );
}

function getSignedMovementAmount(movement) {
  const amount = fromMinorUnits(movement.amountMinor);

  if (movement.type === "expense" || movement.type === "fee") return -amount;
  return amount;
}

function formatObligationDate(value) {
  if (!value) return "Sin vencimiento";
  return formatExchangeRateDate(normalizeDate(value));
}

const styles = StyleSheet.create({
  headerButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  label: {
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  balanceGrid: {
    flexDirection: "row",
    gap: 10,
  },
  balanceTile: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  balanceTileLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 10,
    fontWeight: "700",
  },
  balanceTileValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  healthPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    fontWeight: "700",
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  itemMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  error: {
    fontWeight: "700",
  },
});
