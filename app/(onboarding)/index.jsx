import { Image, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { branding } from "../../src/constants/branding";
import { Screen } from "../../src/components/layout/Screen";
import { Card, Chip, MoneyText, PrimaryButton } from "../../src/components/ui";
import { useOnboardingStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function OnboardingIndexScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const {
    exchangeRate,
    initialAccount,
    primaryCurrency,
    reset,
    setExchangeRate,
    setInitialAccount,
    setPrimaryCurrency,
  } = useOnboardingStore();

  return (
    <Screen
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
        Onboarding
      </Text>
      <Text style={[styles.copy, { color: colors.textSecondary, fontSize: typography.sizes.md }]}>
        Punto de entrada para la configuracion inicial de Mis Soles.
      </Text>
      <Card style={{ width: "100%", marginTop: spacing.xl }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.sizes.lg,
            fontWeight: "700",
            marginBottom: spacing.sm,
          }}
        >
          Base del onboarding
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.sizes.md,
            marginBottom: spacing.lg,
          }}
        >
          La navegacion, los assets y el tema ya estan conectados para empezar
          el flujo de configuracion inicial.
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
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.sizes.sm,
            marginTop: spacing.md,
          }}
        >
          Tipo de cambio actual: {exchangeRate}
        </Text>
        <View style={[styles.row, { marginTop: spacing.sm }]}>
          <Chip label="3.75" active={exchangeRate === "3.75"} onPress={() => setExchangeRate("3.75")} />
          <Chip label="3.80" active={exchangeRate === "3.80"} onPress={() => setExchangeRate("3.80")} />
        </View>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.sizes.sm,
            marginTop: spacing.md,
          }}
        >
          Cuenta inicial: {initialAccount.name}
        </Text>
        <MoneyText amount={initialAccount.balance} currency={primaryCurrency} style={{ marginTop: spacing.xs, fontSize: typography.sizes.lg }} />
        <View style={[styles.row, { marginTop: spacing.sm, marginBottom: spacing.md }]}>
          <Chip
            label="Billetera"
            active={initialAccount.name === "Billetera"}
            onPress={() => setInitialAccount({ name: "Billetera", balance: 80 })}
          />
          <Chip
            label="Ahorros"
            active={initialAccount.name === "Ahorros"}
            onPress={() => setInitialAccount({ name: "Ahorros", balance: 250 })}
          />
        </View>
        <PrimaryButton
          label="Continuar al shell"
          onPress={() => router.replace("/(tabs)/inicio")}
        />
        <PrimaryButton
          label="Reiniciar draft"
          onPress={reset}
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
  },
});
