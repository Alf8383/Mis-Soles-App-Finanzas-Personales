import { Ionicons } from "@expo/vector-icons";
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
              style={[styles.headerButton, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[
                  styles.headerButtonText,
                  { color: colors.surface, fontFamily: typography.fontFamily.bold },
                ]}
              >
                Cuentas
              </Text>
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

        <Card style={{ marginTop: spacing.md, backgroundColor: colors.primary }}>
          <View style={styles.balanceHeader}>
            <View>
              <Text
                style={[
                  styles.label,
                  { color: "rgba(255,255,255,0.68)", fontSize: typography.sizes.xs },
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
            </View>
            <View style={styles.balanceBadge}>
              <Ionicons name="trending-up-outline" size={16} color={colors.surface} />
            </View>
          </View>
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
          <SectionHeader
            icon="calendar-outline"
            title="Próximas obligaciones"
            actionLabel="Ver todas"
            onAction={() => router.push("/(tabs)/obligaciones")}
          />
          {dashboard.upcomingObligations.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="Todavía no hay obligaciones"
              description="Registra deudas o pagos fijos para ver próximos vencimientos."
            />
          ) : (
            dashboard.upcomingObligations.map((item) => (
              <View key={item.id} style={[styles.itemRow, { backgroundColor: colors.surfaceContainerLow, marginTop: spacing.sm }]}>
                <View style={[styles.itemIcon, { backgroundColor: item.source === "debt" ? colors.goldSoft : colors.primarySoft }]}>
                  <Ionicons
                    name={item.source === "debt" ? "people-outline" : "calendar-outline"}
                    size={18}
                    color={item.source === "debt" ? colors.gold : colors.primary}
                  />
                </View>
                <View style={styles.itemCopy}>
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
          <SectionHeader
            icon="swap-vertical-outline"
            title="Últimos movimientos"
            actionLabel="Ver lista"
            onAction={() => router.push("/(tabs)/movimientos")}
          />
          {dashboard.latestMovements.length === 0 ? (
            <EmptyState
              icon="swap-vertical-outline"
              title="Sin movimientos aún"
              description="Usa el botón + para registrar tu primer gasto, ingreso o transferencia."
            />
          ) : (
            dashboard.latestMovements.map((movement) => (
              <View key={movement.id} style={[styles.itemRow, { backgroundColor: colors.surfaceContainerLow, marginTop: spacing.sm }]}>
                <View style={[styles.itemIcon, { backgroundColor: getMovementToneBackground(movement, colors) }]}>
                  <Ionicons name={getMovementIcon(movement)} size={18} color={getMovementTone(movement, colors)} />
                </View>
                <View style={styles.itemCopy}>
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

function SectionHeader({ actionLabel, icon, onAction, title }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionIcon, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name={icon} size={17} color={colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      </View>
      <Pressable onPress={onAction}>
        <Text style={[styles.sectionAction, { color: colors.primary }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function getSignedMovementAmount(movement) {
  const amount = fromMinorUnits(movement.amountMinor);

  if (movement.type === "expense" || movement.type === "fee") return -amount;
  return amount;
}

function getMovementIcon(movement) {
  if (movement.type === "income") return "arrow-down-circle-outline";
  if (movement.type === "transfer") return "swap-horizontal-outline";
  return "arrow-up-circle-outline";
}

function getMovementTone(movement, colors) {
  if (movement.type === "income") return colors.primary;
  if (movement.type === "transfer") return colors.blue;
  return colors.red;
}

function getMovementToneBackground(movement, colors) {
  if (movement.type === "income") return colors.primarySoft;
  if (movement.type === "transfer") return colors.blueSoft;
  return colors.redSoft;
}

function formatObligationDate(value) {
  if (!value) return "Sin vencimiento";
  return formatExchangeRateDate(normalizeDate(value));
}

const styles = StyleSheet.create({
  headerButton: {
    borderRadius: 999,
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  headerButtonText: {
    fontSize: 12,
    letterSpacing: 0,
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
  balanceBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  balanceHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  balanceTile: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 14,
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
    fontSize: 16,
    fontWeight: "900",
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: "900",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    gap: 10,
    padding: 10,
  },
  itemCopy: {
    flex: 1,
  },
  itemIcon: {
    alignItems: "center",
    borderRadius: 13,
    height: 36,
    justifyContent: "center",
    width: 36,
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
