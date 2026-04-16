import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import {
  BottomSheetLauncher,
  Card,
  Chip,
  MoneyText,
} from "../../src/components/ui";
import { getThisMonthRange } from "../../src/lib/utils";
import { useAppTheme } from "../../src/theme";

export default function InicioScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const monthRange = getThisMonthRange();

  return (
    <Screen scrollable contentStyle={{ paddingBottom: spacing.xxxl * 2 }}>
      <AppHeader title="Inicio" subtitle="Tu resumen financiero local" />

      <Card style={{ marginTop: spacing.lg }}>
        <Text
          style={[
            styles.label,
            { color: colors.textSecondary, fontSize: typography.sizes.sm },
          ]}
        >
          Balance total
        </Text>
        <MoneyText
          amount={1524.4}
          currency="PEN"
          style={{ fontSize: typography.sizes.display, marginTop: spacing.xs }}
        />
        <View style={[styles.row, { marginTop: spacing.md }]}>
          <Chip label="Ingresos" active />
          <Chip label="Gastos" />
          <Chip label={`${monthRange.start.getDate()}-${monthRange.end.getDate()} mes`} />
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.textPrimary, fontSize: typography.sizes.lg },
          ]}
        >
          Ultimos movimientos
        </Text>
        <View style={[styles.itemRow, { marginTop: spacing.md }]}>
          <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>
            Mercado
          </Text>
          <MoneyText amount={-48.9} currency="PEN" tone="negative" />
        </View>
        <View style={[styles.itemRow, { marginTop: spacing.sm }]}>
          <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>
            Freelance
          </Text>
          <MoneyText amount={220} currency="PEN" tone="positive" />
        </View>
      </Card>

      <BottomSheetLauncher
        title="Agregar"
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
  label: {
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
