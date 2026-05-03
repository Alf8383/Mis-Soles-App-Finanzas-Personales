import { StyleSheet, Text } from "react-native";
import { router } from "expo-router";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import { Card, MoneyText, PrimaryButton } from "../../src/components/ui";
import { useAuthFlowStore, useUiPreferencesStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function MasScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const hideAmounts = useUiPreferencesStore((state) => state.hideAmounts);
  const toggleHideAmounts = useUiPreferencesStore((state) => state.toggleHideAmounts);
  const signOut = useAuthFlowStore((state) => state.signOut);
  const status = useAuthFlowStore((state) => state.status);
  const isSigningOut = status === "loading";

  async function handleSignOut() {
    const result = await signOut();

    if (!result.error) {
      router.replace("/(auth)/login");
    }
  }

  return (
    <Screen>
      <AppHeader title="Mas" subtitle="Preferencias y configuracion" />
      <Card style={{ marginTop: spacing.lg }}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
          Mas
        </Text>
        <Text style={[styles.copy, { color: colors.textSecondary, fontSize: typography.sizes.md }]}>
          Placeholder de configuracion y ajustes.
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: spacing.md }}>
          Ocultar montos: {hideAmounts ? "Activado" : "Desactivado"}
        </Text>
        <MoneyText amount={1240.5} currency="PEN" style={{ marginTop: spacing.sm, fontSize: typography.sizes.lg }} />
        <PrimaryButton
          label={hideAmounts ? "Mostrar montos" : "Ocultar montos"}
          onPress={toggleHideAmounts}
          style={{ marginTop: spacing.md }}
        />
        <PrimaryButton
          label={isSigningOut ? "Cerrando sesion..." : "Cerrar sesion"}
          onPress={handleSignOut}
          disabled={isSigningOut}
          style={{ marginTop: spacing.sm, backgroundColor: colors.gold }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    marginBottom: 8,
  },
  copy: {
    lineHeight: 22,
  },
});
