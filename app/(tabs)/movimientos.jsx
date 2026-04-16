import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import { BottomSheetLauncher, Card, Chip, MoneyText } from "../../src/components/ui";
import { QUICK_FILTERS } from "../../src/lib/constants/quickFilters";
import { getMovementDateLabel } from "../../src/lib/utils";
import { useMovementFiltersStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function MovimientosScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const quickFilter = useMovementFiltersStore((state) => state.quickFilter);
  const setQuickFilter = useMovementFiltersStore((state) => state.setQuickFilter);

  return (
    <Screen scrollable contentStyle={{ paddingBottom: spacing.xxxl * 2 }}>
      <AppHeader title="Movimientos" subtitle="Registro y filtros rapidos" />

      <View style={[styles.filters, { marginTop: spacing.lg }]}>
        {QUICK_FILTERS.map((filter, index) => (
          <Chip
            key={filter.key}
            label={filter.label}
            active={quickFilter === filter.key || (index === 0 && quickFilter === "all")}
            onPress={() => setQuickFilter(filter.key)}
          />
        ))}
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <Text
          style={[
            styles.groupTitle,
            { color: colors.textPrimary, fontSize: typography.sizes.sm },
          ]}
        >
          {quickFilter === "thisMonth" ? "Este mes" : getMovementDateLabel(new Date())}
        </Text>
        <View style={[styles.itemRow, { marginTop: spacing.md }]}>
          <View>
            <Text style={[styles.itemName, { color: colors.textPrimary }]}>Comida</Text>
            <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
              Restaurante
            </Text>
          </View>
          <MoneyText amount={-22.5} currency="PEN" tone="negative" />
        </View>
        <View style={[styles.itemRow, { marginTop: spacing.md }]}>
          <View>
            <Text style={[styles.itemName, { color: colors.textPrimary }]}>Propina</Text>
            <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>Familia</Text>
          </View>
          <MoneyText amount={50} currency="PEN" tone="positive" />
        </View>
      </Card>

      <BottomSheetLauncher
        title="Nuevo movimiento"
        options={[
          { label: "Gasto", emoji: "🛒" },
          { label: "Ingreso", emoji: "💼" },
          { label: "Transferencia", emoji: "💸" },
          { label: "Deuda", emoji: "🤝" },
          { label: "Pago fijo", emoji: "📅" },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  groupTitle: {
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemName: {
    fontWeight: "700",
  },
  itemMeta: {
    fontSize: 13,
    marginTop: 2,
  },
});
