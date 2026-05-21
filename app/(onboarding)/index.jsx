import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import { branding } from "../../src/constants/branding";
import { Screen } from "../../src/components/layout/Screen";
import { PrimaryButton } from "../../src/components/ui";
import { useAuthFlowStore, useOnboardingStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function OnboardingIndexScreen() {
  const { colors, spacing } = useAppTheme();
  const user = useAuthFlowStore((state) => state.user);
  const {
    error,
    exchangeRate,
    initialAccount,
    primaryCurrency,
    setExchangeRate,
    setInitialAccount,
    setPrimaryCurrency,
    status,
    submitOnboarding,
  } = useOnboardingStore();
  const isSubmitting = status === "submitting";

  async function handleSubmit() {
    const result = await submitOnboarding({ user });

    if (result.completed) {
      router.replace("/(tabs)/inicio");
    }
  }

  return (
    <Screen
      scrollable
      safeAreaEdges={["left", "right"]}
      contentStyle={[
        styles.container,
        {
          paddingHorizontal: spacing.xl,
          paddingTop: 0,
          paddingBottom: 132,
        },
      ]}
    >
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceContainerHigh }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary }]} />
      </View>

      <View style={styles.logoWrap}>
        <Image source={branding.onboarding} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.headerCopy}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Configura Mis Soles</Text>
        <Text style={[styles.copy, { color: colors.textSecondary }]}>
          Empecemos por definir los detalles de tu cuenta principal.
        </Text>
      </View>

      <View style={styles.formGroups}>
        <View style={styles.group}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Moneda Principal</Text>
          <View style={styles.currencyGrid}>
            <CurrencyButton
              active={primaryCurrency === "PEN"}
              icon="card-outline"
              label="PEN"
              onPress={() => setPrimaryCurrency("PEN")}
            />
            <CurrencyButton
              active={primaryCurrency === "USD"}
              icon="cash-outline"
              label="USD"
              onPress={() => setPrimaryCurrency("USD")}
            />
          </View>
        </View>

        <View style={styles.group}>
          <View style={styles.labelRow}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Tipo de Cambio</Text>
            <Text style={[styles.optionalBadge, { backgroundColor: colors.blueSoft, color: colors.blue }]}>
              Opcional
            </Text>
          </View>
          <IconInput
            icon="swap-horizontal-outline"
            keyboardType="decimal-pad"
            onChangeText={setExchangeRate}
            placeholder="Ej. 3.75"
            value={exchangeRate}
          />
        </View>

        <View style={[styles.softDivider, { backgroundColor: colors.ghostBorder }]} />

        <View style={styles.group}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Nombre de cuenta</Text>
          <IconInput
            autoCapitalize="words"
            icon="wallet-outline"
            onChangeText={(name) => setInitialAccount({ name })}
            placeholder="Ej. Billetera, Ahorros, BCP..."
            value={initialAccount.name}
          />
        </View>

        <View style={styles.group}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Saldo inicial</Text>
          <View
            style={[
              styles.amountInput,
              {
                backgroundColor: colors.surfaceContainerLowest,
                borderColor: colors.ghostBorder,
                borderRadius: 12,
              },
            ]}
          >
            <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>
              {primaryCurrency === "PEN" ? "S/" : "$"}
            </Text>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={(balance) => setInitialAccount({ balance })}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              style={[styles.amountTextInput, { color: colors.textPrimary }]}
              value={String(initialAccount.balance)}
            />
          </View>
        </View>
      </View>

      {error ? (
        <Text style={[styles.error, { color: colors.red, marginTop: spacing.md }]}>
          {error}
        </Text>
      ) : null}

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <PrimaryButton
          label={isSubmitting ? "Guardando..." : "Empezar  →"}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.cta}
        />
      </View>
    </Screen>
  );
}

function CurrencyButton({ active, icon, label, onPress }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.currencyButton,
        {
          backgroundColor: active ? colors.primaryMuted : colors.surfaceContainerLowest,
          borderColor: active ? colors.primaryMuted : colors.ghostBorder,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Ionicons name={icon} size={17} color={active ? colors.surface : colors.textPrimary} />
      <Text style={[styles.currencyLabel, { color: active ? colors.surface : colors.textPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function IconInput({ autoCapitalize = "none", icon, keyboardType = "default", onChangeText, placeholder, value }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.iconInput,
        {
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: colors.ghostBorder,
          borderRadius: 12,
        },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.textTertiary} />
      <TextInput
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={[styles.textInput, { color: colors.textPrimary }]}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
  },
  amountInput: {
    alignItems: "center",
    borderWidth: 0.5,
    flexDirection: "row",
    minHeight: 58,
    overflow: "hidden",
    paddingHorizontal: 14,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    paddingVertical: 12,
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  cta: {
    minHeight: 56,
  },
  currencyButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 0.5,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 52,
  },
  currencyGrid: {
    flexDirection: "row",
    gap: 14,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: "800",
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "800",
    paddingRight: 12,
  },
  error: {
    lineHeight: 20,
    textAlign: "center",
  },
  footer: {
    bottom: 0,
    left: 0,
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 36,
    position: "absolute",
    right: 0,
  },
  formGroups: {
    gap: 22,
    width: "100%",
  },
  group: {
    gap: 10,
    width: "100%",
  },
  headerCopy: {
    alignItems: "center",
    marginBottom: 26,
    width: "100%",
  },
  iconInput: {
    alignItems: "center",
    borderWidth: 0.5,
    flexDirection: "row",
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 14,
  },
  labelRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logo: {
    height: 360,
    width: 640,
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -88,
    marginTop: -72,
    width: "100%",
  },
  optionalBadge: {
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  progressFill: {
    borderBottomRightRadius: 999,
    borderTopRightRadius: 999,
    height: "100%",
    width: "33%",
  },
  progressTrack: {
    alignSelf: "stretch",
    height: 4,
    marginHorizontal: -24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  softDivider: {
    alignSelf: "center",
    height: 0.5,
    marginVertical: -4,
    opacity: 0.5,
    width: "100%",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginBottom: 6,
  },
});
