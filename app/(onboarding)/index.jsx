import { Image, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { branding } from "../../src/constants/branding";
import { Screen } from "../../src/components/layout/Screen";
import { Card, Chip, MoneyText, PrimaryButton, TextField } from "../../src/components/ui";
import { useAuthFlowStore, useOnboardingStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function OnboardingIndexScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const user = useAuthFlowStore((state) => state.user);
  const {
    error,
    exchangeRate,
    initialAccount,
    primaryCurrency,
    reset,
    setExchangeRate,
    setInitialAccount,
    setPrimaryCurrency,
    status,
    submitOnboarding,
  } = useOnboardingStore();
  const isSubmitting = status === "submitting";
  const previewBalance = Number(initialAccount.balance) || 0;

  async function handleSubmit() {
    const result = await submitOnboarding({ user });

    if (result.completed) {
      router.replace("/(tabs)/inicio");
    }
  }

  return (
    <Screen
      scrollable
      contentStyle={[
        styles.container,
        { paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
      ]}
    >
      <Image source={branding.onboarding} style={styles.logo} resizeMode="contain" />
      <Text
        style={[
          styles.title,
          { color: colors.primary, fontSize: typography.sizes.xxl },
        ]}
      >
        Configura tu cuenta
      </Text>
      <Text style={[styles.copy, { color: colors.textSecondary, fontSize: typography.sizes.md }]}>
        Define tu moneda principal, tipo de cambio y primera cuenta para empezar.
      </Text>

      <Card style={{ width: "100%", marginTop: spacing.xl }}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
          Moneda principal
        </Text>
        <View style={styles.row}>
          <Chip
            label="PEN"
            active={primaryCurrency === "PEN"}
            onPress={() => setPrimaryCurrency("PEN")}
          />
          <Chip
            label="USD"
            active={primaryCurrency === "USD"}
            onPress={() => setPrimaryCurrency("USD")}
          />
        </View>

        <View style={{ height: spacing.md }} />
        <TextField
          label="Tipo de cambio manual"
          value={exchangeRate}
          onChangeText={setExchangeRate}
          placeholder="3.75"
          keyboardType="decimal-pad"
        />

        <View style={{ height: spacing.lg }} />
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
          Cuenta inicial
        </Text>
        <TextField
          label="Nombre de la cuenta"
          value={initialAccount.name}
          onChangeText={(name) => setInitialAccount({ name })}
          placeholder="Billetera"
          autoCapitalize="words"
        />
        <View style={{ height: spacing.md }} />
        <TextField
          label="Saldo inicial"
          value={String(initialAccount.balance)}
          onChangeText={(balance) => setInitialAccount({ balance })}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <Text style={[styles.previewLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>
          Vista previa del saldo inicial
        </Text>
        <MoneyText
          amount={previewBalance}
          currency={primaryCurrency}
          style={{ marginTop: spacing.xs, fontSize: typography.sizes.lg }}
        />

        {error ? (
          <Text style={[styles.error, { color: colors.red, marginTop: spacing.md }]}>
            {error}
          </Text>
        ) : null}

        <PrimaryButton
          label={isSubmitting ? "Guardando..." : "Guardar y continuar"}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={{ marginTop: spacing.lg }}
        />
        <PrimaryButton
          label="Reiniciar formulario"
          onPress={reset}
          disabled={isSubmitting}
          style={{ marginTop: spacing.sm, backgroundColor: colors.gold }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    marginBottom: 8,
  },
  logo: {
    width: 224,
    height: 72,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  copy: {
    textAlign: "center",
    lineHeight: 22,
  },
  error: {
    lineHeight: 20,
    textAlign: "center",
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
});
