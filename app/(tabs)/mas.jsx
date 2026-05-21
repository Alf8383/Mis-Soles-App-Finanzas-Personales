import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import { Card, ConfirmDialog, MoneyText, PrimaryButton, TextField } from "../../src/components/ui";
import {
  useAccountsStore,
  useAuthFlowStore,
  useBudgetsStore,
  useCategoriesStore,
  useDashboardStore,
  useMovementsStore,
  useObligationsStore,
  useOnboardingStore,
  useScheduledPaymentsStore,
  useSettingsStore,
  useStatisticsStore,
  useUiPreferencesStore,
} from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function MasScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const user = useAuthFlowStore((state) => state.user);
  const hideAmounts = useUiPreferencesStore((state) => state.hideAmounts);
  const toggleHideAmounts = useUiPreferencesStore((state) => state.toggleHideAmounts);
  const signOut = useAuthFlowStore((state) => state.signOut);
  const authStatus = useAuthFlowStore((state) => state.status);
  const settings = useSettingsStore((state) => state.settings);
  const profile = useSettingsStore((state) => state.profile);
  const settingsError = useSettingsStore((state) => state.error);
  const settingsStatus = useSettingsStore((state) => state.status);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const updateExchangeRate = useSettingsStore((state) => state.updateExchangeRate);
  const resetSettings = useSettingsStore((state) => state.reset);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const resetAccounts = useAccountsStore((state) => state.reset);
  const resetBudgets = useBudgetsStore((state) => state.reset);
  const resetCategories = useCategoriesStore((state) => state.reset);
  const resetMovements = useMovementsStore((state) => state.reset);
  const resetDashboard = useDashboardStore((state) => state.reset);
  const resetObligations = useObligationsStore((state) => state.reset);
  const resetScheduledPayments = useScheduledPaymentsStore((state) => state.reset);
  const resetStatistics = useStatisticsStore((state) => state.reset);
  const loadDashboard = useDashboardStore((state) => state.loadDashboard);
  const loadStatistics = useStatisticsStore((state) => state.loadStatistics);
  const [confirmSignOutVisible, setConfirmSignOutVisible] = useState(false);
  const [exchangeRate, setExchangeRate] = useState("");
  const [formError, setFormError] = useState("");
  const isSigningOut = authStatus === "loading";
  const isSavingSettings = settingsStatus === "saving";

  useEffect(() => {
    if (user?.uid) {
      loadSettings(user.uid);
    }
  }, [loadSettings, user?.uid]);

  useEffect(() => {
    if (settings?.exchangeRate) {
      setExchangeRate(String(settings.exchangeRate));
    }
  }, [settings?.exchangeRate]);

  async function handleExchangeRateSave() {
    setFormError("");

    if (!user?.uid) return;

    if (Number(exchangeRate) <= 0) {
      setFormError("Ingresa un tipo de cambio mayor a 0.");
      return;
    }

    const result = await updateExchangeRate(user.uid, exchangeRate);

    if (!result.error) {
      await Promise.all([loadDashboard(user.uid), loadStatistics(user.uid)]);
    }
  }

  async function handleSignOut() {
    const result = await signOut();

    if (!result.error) {
      setConfirmSignOutVisible(false);
      resetAccounts();
      resetBudgets();
      resetCategories();
      resetDashboard();
      resetMovements();
      resetObligations();
      resetOnboarding();
      resetScheduledPayments();
      resetSettings();
      resetStatistics();
      router.replace("/(auth)/login");
    }
  }

  return (
    <>
      <Screen scrollable bottomInset={32}>
        <AppHeader title="Más" subtitle="Configuración y estado cloud" />

        {settingsStatus === "loading" ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : null}
        {settingsError || formError ? (
          <Text style={[styles.error, { color: colors.red, marginTop: spacing.md }]}>
            {formError || settingsError}
          </Text>
        ) : null}

        <Card style={{ marginTop: spacing.lg, backgroundColor: colors.primary }}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.16)" }]}>
              <Ionicons name="person-outline" size={24} color={colors.surface} />
            </View>
            <View style={styles.profileCopy}>
              <Text style={[styles.profileLabel, { color: "rgba(255,255,255,0.68)" }]}>Cuenta Mis Soles</Text>
              <Text style={[styles.profileEmail, { color: colors.surface, fontSize: typography.sizes.lg }]}>
                {user?.email || profile?.email || "Usuario autenticado"}
              </Text>
              <Text style={[styles.profileMeta, { color: "rgba(255,255,255,0.68)" }]}>
                Firebase Auth · {shortUid(user?.uid)}
              </Text>
            </View>
          </View>
        </Card>

        <SectionTitle title="General" />
        <Card style={{ marginTop: spacing.sm }}>
          <SettingRow
            icon="wallet-outline"
            title="Cuentas"
            description="Consulta, crea y edita tus cuentas cloud."
            onPress={() => router.push("/(modals)/cuentas")}
          />
          <SettingRow
            icon="pricetags-outline"
            title="Categorías"
            description="Personaliza categorías de gasto e ingreso."
            onPress={() => router.push("/(modals)/categorias")}
          />
        </Card>

        <SectionTitle title="Preferencias" />
        <Card style={{ marginTop: spacing.sm }}>
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
            Privacidad visual
          </Text>
          <Text style={[styles.copy, { color: colors.textSecondary, fontSize: typography.sizes.md }]}>
            Oculta montos en toda la app cuando necesites privacidad.
          </Text>
          <View style={[styles.summaryRow, { backgroundColor: colors.surfaceContainerLow, marginTop: spacing.md }]}>
            <Text style={{ color: colors.textSecondary }}>
              Estado: {hideAmounts ? "Activado" : "Desactivado"}
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
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
            Tipo de cambio manual
          </Text>
          <Text style={[styles.copy, { color: colors.textSecondary, fontSize: typography.sizes.md }]}>
            Se usa para cálculos con PEN/USD cuando la app necesita una referencia.
          </Text>
          <TextField
            label="USD a PEN"
            value={exchangeRate}
            onChangeText={setExchangeRate}
            placeholder="3.75"
            keyboardType="decimal-pad"
          />
          <PrimaryButton
            label={isSavingSettings ? "Guardando..." : "Guardar tipo de cambio"}
            onPress={handleExchangeRateSave}
            disabled={isSavingSettings}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        <SectionTitle title="App y sesión" />
        <Card style={{ marginTop: spacing.sm }}>
          <InfoRow label="Sesión" value={authStatus === "authenticated" ? "Activa" : authStatus} />
          <InfoRow label="UID" value={shortUid(user?.uid)} />
          <InfoRow label="Email" value={user?.email || "No disponible"} />
          <InfoRow label="Firestore" value={settings ? "Configurado" : "Pendiente de settings"} />
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

function SectionTitle({ title }) {
  const { colors, spacing } = useAppTheme();

  return (
    <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: spacing.lg }]}>
      {title}
    </Text>
  );
}

function SettingRow({ description, icon, onPress, title }) {
  const { colors, radii } = useAppTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingRow, { opacity: pressed ? 0.86 : 1 }]}>
      <View style={[styles.settingIcon, { backgroundColor: colors.surfaceContainerLow, borderRadius: radii.md }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.settingCopy}>
        <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

function InfoRow({ label, value }) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.infoRow, { backgroundColor: colors.surfaceContainerLow }]}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function shortUid(uid) {
  if (!uid) return "No disponible";
  return `${uid.slice(0, 6)}…${uid.slice(-4)}`;
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    height: 52,
    justifyContent: "center",
    width: 52,
    borderRadius: 20,
  },
  copy: {
    lineHeight: 22,
  },
  error: {
    fontWeight: "700",
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  infoRow: {
    borderRadius: 18,
    gap: 4,
    marginTop: 10,
    padding: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "800",
  },
  profileCopy: {
    flex: 1,
  },
  profileEmail: {
    fontWeight: "900",
    marginTop: 2,
  },
  profileLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  profileMeta: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  profileRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  settingCopy: {
    flex: 1,
  },
  settingDescription: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 2,
  },
  settingIcon: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  settingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  summaryRow: {
    borderRadius: 18,
    gap: 6,
    padding: 12,
  },
  title: {
    fontWeight: "800",
    marginBottom: 8,
  },
});
