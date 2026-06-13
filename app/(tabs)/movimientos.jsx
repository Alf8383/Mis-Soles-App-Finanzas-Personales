import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import {
  Card,
  Chip,
  ConfirmDialog,
  EmptyState,
  MoneyText,
  QuickActionFab,
  QuickActionSheet,
  TextField,
} from "../../src/components/ui";
import { fromMinorUnits } from "../../src/lib/domain/money";
import { QUICK_FILTERS } from "../../src/lib/constants/quickFilters";
import { getMovementDateLabel } from "../../src/lib/utils";
import {
  useAccountsStore,
  useAuthFlowStore,
  useDashboardStore,
  useMovementFiltersStore,
  useMovementsStore,
} from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function MovimientosScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const user = useAuthFlowStore((state) => state.user);
  const quickFilter = useMovementFiltersStore((state) => state.quickFilter);
  const setQuickFilter = useMovementFiltersStore((state) => state.setQuickFilter);
  const movements = useMovementsStore((state) => state.movements);
  const categories = useMovementsStore((state) => state.categories);
  const query = useMovementsStore((state) => state.query);
  const status = useMovementsStore((state) => state.status);
  const error = useMovementsStore((state) => state.error);
  const setQuery = useMovementsStore((state) => state.setQuery);
  const loadMovements = useMovementsStore((state) => state.loadMovements);
  const archiveMovement = useMovementsStore((state) => state.archiveMovement);
  const loadAccounts = useAccountsStore((state) => state.loadAccounts);
  const loadDashboard = useDashboardStore((state) => state.loadDashboard);
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      loadMovements(user.uid);
    }
  }, [loadMovements, user?.uid]);

  const categoryById = useMemo(
    () =>
      categories.reduce((accumulator, category) => {
        accumulator[category.id] = category;
        return accumulator;
      }, {}),
    [categories],
  );
  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      if (quickFilter === "expense" && movement.type !== "expense" && movement.type !== "fee") {
        return false;
      }
      if (quickFilter === "income" && movement.type !== "income") {
        return false;
      }
      if (quickFilter === "thisMonth" && !isCurrentMonth(movement.date)) {
        return false;
      }
      if (query.trim()) {
        const categoryName = categoryById[movement.categoryId]?.name || "";
        const haystack = `${movement.description || ""} ${categoryName} ${movement.type}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
      }
      return true;
    });
  }, [categoryById, movements, query, quickFilter]);
  const groups = groupMovementsByDate(filteredMovements);
  const isLoading = status === "loading";

  function handleQuickAction(type) {
    setQuickActionsVisible(false);
    router.push({
      pathname: "/(modals)/nuevo-movimiento",
      params: { type },
    });
  }

  async function handleArchive() {
    if (!user?.uid || !archiveTarget) return;

    const result = await archiveMovement(user.uid, archiveTarget.id);

    if (!result.error) {
      setArchiveTarget(null);
      await Promise.all([loadMovements(user.uid), loadAccounts(user.uid), loadDashboard(user.uid)]);
    }
  }

  return (
    <>
      <Screen scrollable bottomInset={120}>
        <AppHeader title="Movimientos" subtitle="Registro y filtros rápidos" />

        <View style={{ marginTop: spacing.lg }}>
          <TextField
            label="Buscar"
            value={query}
            onChangeText={setQuery}
            placeholder="Categoría, descripción o tipo"
          />
        </View>

        <View style={[styles.filters, { marginTop: spacing.md }]}>
          {QUICK_FILTERS.map((filter, index) => (
            <Chip
              key={filter.key}
              label={filter.label}
              active={quickFilter === filter.key || (index === 0 && quickFilter === "all")}
              onPress={() => setQuickFilter(filter.key)}
            />
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.primary} />
        ) : null}
        {error ? <Text style={[styles.error, { color: colors.red, marginTop: spacing.md }]}>{error}</Text> : null}

        {!isLoading && groups.length === 0 ? (
          <Card style={{ marginTop: spacing.md }}>
            <EmptyState
              icon="swap-vertical-outline"
              title="Sin movimientos"
              description="Registra tu primer gasto, ingreso o transferencia desde el botón +."
            />
          </Card>
        ) : (
          groups.map((group) => (
            <Card key={group.label} style={{ marginTop: spacing.md }}>
              <Text
                style={[
                  styles.groupTitle,
                  { color: colors.textPrimary, fontSize: typography.sizes.sm },
                ]}
              >
                {group.label}
              </Text>
              {group.items.map((movement) => (
                <View key={movement.id} style={[styles.itemRow, { marginTop: spacing.md }]}>
                  <View style={styles.itemCopy}>
                    <Text style={[styles.itemName, { color: colors.textPrimary }]}>
                      {movement.description || movement.type}
                    </Text>
                    <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                      {getMovementMeta(movement, categoryById)}
                    </Text>
                  </View>
                  <View style={styles.amountColumn}>
                    <MoneyText
                      amount={getSignedMovementAmount(movement)}
                      currency={movement.currency || "PEN"}
                      type={movement.type}
                    />
                    <Pressable onPress={() => setArchiveTarget(movement)}>
                      <Text style={[styles.deleteAction, { color: colors.red }]}>Eliminar</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </Card>
          ))
        )}
      </Screen>
      <QuickActionFab onPress={() => setQuickActionsVisible(true)} />
      <QuickActionSheet
        visible={quickActionsVisible}
        onClose={() => setQuickActionsVisible(false)}
        onSelect={handleQuickAction}
        title="Nuevo movimiento"
      />
      <ConfirmDialog
        visible={Boolean(archiveTarget)}
        danger
        title="¿Eliminar movimiento?"
        message="Se archivará el movimiento y se reversará su impacto en saldos."
        confirmLabel="Eliminar"
        cancelLabel="Volver"
        onCancel={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
      />
    </>
  );
}

function groupMovementsByDate(movements) {
  const groups = [];

  for (const movement of movements) {
    const label = getMovementDateLabel(movement.date);
    const existingGroup = groups.find((group) => group.label === label);

    if (existingGroup) {
      existingGroup.items.push(movement);
    } else {
      groups.push({ items: [movement], label });
    }
  }

  return groups;
}

function getMovementMeta(movement, categoryById) {
  if (movement.type === "transfer") {
    return "Transferencia entre cuentas";
  }

  return categoryById[movement.categoryId]?.name || "Sin categoría";
}

function getSignedMovementAmount(movement) {
  const amount = fromMinorUnits(movement.amountMinor);

  if (movement.type === "expense" || movement.type === "fee") return -amount;
  return amount;
}

function isCurrentMonth(input) {
  const date = input?.toDate ? input.toDate() : new Date(input);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  groupTitle: {
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemCopy: {
    flex: 1,
  },
  itemName: {
    fontWeight: "700",
  },
  itemMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  amountColumn: {
    alignItems: "flex-end",
  },
  deleteAction: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  error: {
    fontWeight: "700",
  },
});
