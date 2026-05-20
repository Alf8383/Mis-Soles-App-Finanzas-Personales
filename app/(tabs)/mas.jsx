import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import { Card, ConfirmDialog, MoneyText, PrimaryButton } from "../../src/components/ui";
import {
  useAccountsStore,
  useAuthFlowStore,
  useBudgetsStore,
  useDashboardStore,
  useMovementsStore,
  useObligationsStore,
  useOnboardingStore,
  useScheduledPaymentsStore,
  useStatisticsStore,
  useUiPreferencesStore,
} from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function MasScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const hideAmounts = useUiPreferencesStore((state) => state.hideAmounts);
  const toggleHideAmounts = useUiPreferencesStore((state) => state.toggleHideAmounts);
  const signOut = useAuthFlowStore((state) => state.signOut);
  const status = useAuthFlowStore((state) => state.status);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const resetAccounts = useAccountsStore((state) => state.reset);
  const resetBudgets = useBudgetsStore((state) => state.reset);
  const resetMovements = useMovementsStore((state) => state.reset);
  const resetDashboard = useDashboardStore((state) => state.reset);
  const resetObligations = useObligationsStore((state) => state.reset);
  const resetScheduledPayments = useScheduledPaymentsStore((state) => state.reset);
  const resetStatistics = useStatisticsStore((state) => state.reset);
  const [confirmSignOutVisible, setConfirmSignOutVisible] = useState(false);
  const isSigningOut = status === "loading";

  async function handleSignOut() {
    const result = await signOut();

    if (!result.error) {
      setConfirmSignOutVisible(false);
      resetAccounts();
      resetBudgets();
      resetDashboard();
      resetMovements();
      resetObligations();
      resetOnboarding();
      resetScheduledPayments();
      resetStatistics();
      router.replace("/(auth)/login");
    }
  }

  return (
    <>
      <Screen scrollable bottomInset={32}>
        <AppHeader title="Más" subtitle="Preferencias y configuración" />
        <Card style={{ marginTop: spacing.lg }}>
          <Text
            style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}
          >
            Privacidad visual
          </Text>
          <Text
            style={[styles.copy, { color: colors.textSecondary, fontSize: typography.sizes.md }]}
          >
            Controla cómo se muestran los montos mientras navegas la app.
          </Text>
          <View style={[styles.summaryRow, { marginTop: spacing.md }]}>
            <Text style={{ color: colors.textSecondary }}>
              Ocultar montos: {hideAmounts ? "Activado" : "Desactivado"}
            </Text>
            <MoneyText amount={1240.5} currency="PEN" style={{ fontSize: typography.sizes.lg }} />
          </View>
          <PrimaryButton
            label={hideAmounts ? "Mostrar montos" : "Ocultar montos"}
            onPress={toggleHideAmounts}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text
            style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}
          >
            Cuentas
          </Text>
          <Text
            style={[styles.copy, { color: colors.textSecondary, fontSize: typography.sizes.md }]}
          >
            Consulta, crea y edita las cuentas conectadas a tus movimientos.
          </Text>
          <PrimaryButton
            label="Administrar cuentas"
            onPress={() => router.push("/(modals)/cuentas")}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text
            style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}
          >
            Sesión
          </Text>
          <Text
            style={[styles.copy, { color: colors.textSecondary, fontSize: typography.sizes.md }]}
          >
            Cierra sesión de forma segura. Tus datos permanecen guardados en tu cuenta.
          </Text>
          <PrimaryButton
            label={isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
            onPress={() => setConfirmSignOutVisible(true)}
            disabled={isSigningOut}
            style={{ marginTop: spacing.md, backgroundColor: colors.gold }}
          />
        </Card>
      </Screen>
      <ConfirmDialog
        visible={confirmSignOutVisible}
        title="¿Cerrar sesión?"
        message="Volverás al login. Tus datos cloud no se eliminarán."
        confirmLabel={isSigningOut ? "Cerrando..." : "Cerrar sesión"}
        cancelLabel="Volver"
        onCancel={() => setConfirmSignOutVisible(false)}
        onConfirm={handleSignOut}
      />
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "800",
    marginBottom: 8,
  },
  copy: {
    lineHeight: 22,
  },
  summaryRow: {
    gap: 6,
  },
});
