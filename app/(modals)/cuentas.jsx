import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../src/components/layout/Screen";
import { Card, Chip, ConfirmDialog, MoneyText, PrimaryButton, TextField } from "../../src/components/ui";
import { AccountType, CurrencyCode } from "../../src/lib/domain/enums";
import { fromMinorUnits } from "../../src/lib/domain/money";
import { useAccountsStore, useAuthFlowStore, useDashboardStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

const ACCOUNT_TYPES = [
  { label: "Efectivo", value: AccountType.CASH },
  { label: "Banco", value: AccountType.BANK },
  { label: "Wallet", value: AccountType.DIGITAL_WALLET },
  { label: "Ahorro", value: AccountType.SAVINGS },
];

export default function CuentasModal() {
  const { colors, spacing, typography } = useAppTheme();
  const user = useAuthFlowStore((state) => state.user);
  const accounts = useAccountsStore((state) => state.accounts);
  const error = useAccountsStore((state) => state.error);
  const status = useAccountsStore((state) => state.status);
  const loadAccounts = useAccountsStore((state) => state.loadAccounts);
  const createAccount = useAccountsStore((state) => state.createAccount);
  const updateAccount = useAccountsStore((state) => state.updateAccount);
  const archiveAccount = useAccountsStore((state) => state.archiveAccount);
  const loadDashboard = useDashboardStore((state) => state.loadDashboard);
  const [name, setName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [type, setType] = useState(AccountType.CASH);
  const [currency, setCurrency] = useState(CurrencyCode.PEN);
  const [editingAccountId, setEditingAccountId] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const isSaving = status === "saving";

  useEffect(() => {
    if (user?.uid) {
      loadAccounts(user.uid);
    }
  }, [loadAccounts, user?.uid]);

  const totalBalance = accounts.reduce(
    (total, account) => total + fromMinorUnits(account.currentBalanceMinor),
    0,
  );
  const editingAccount = accounts.find((account) => account.id === editingAccountId);

  function resetForm() {
    setName("");
    setOpeningBalance("");
    setType(AccountType.CASH);
    setCurrency(CurrencyCode.PEN);
    setEditingAccountId("");
  }

  function startEdit(account) {
    setEditingAccountId(account.id);
    setName(account.name);
    setType(account.type);
    setCurrency(account.currency);
    setOpeningBalance("");
  }

  async function handleSave() {
    if (!user?.uid || !name.trim()) return;

    const result = editingAccount
      ? await updateAccount(user.uid, editingAccount.id, { currency, name, type })
      : await createAccount(user.uid, { currency, name, openingBalance, type });

    if (!result.error) {
      resetForm();
      await loadDashboard(user.uid);
    }
  }

  async function handleArchive() {
    if (!user?.uid || !archiveTarget) return;

    const result = await archiveAccount(user.uid, archiveTarget.id);

    if (!result.error) {
      setArchiveTarget(null);
      await loadDashboard(user.uid);
    }
  }

  return (
    <>
      <Screen scrollable bottomInset={32}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.xxl }]}>
              Cuentas
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Administra tus saldos cloud
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar cuentas"
            onPress={() => router.back()}
            style={[styles.closeButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Card style={{ marginTop: spacing.lg, backgroundColor: colors.primary }}>
          <Text style={[styles.balanceLabel, { color: "rgba(255,255,255,0.68)" }]}>
            Total consolidado
          </Text>
          <MoneyText
            amount={totalBalance}
            currency="PEN"
            style={{ color: colors.surface, fontSize: typography.sizes.display, marginTop: spacing.xs }}
          />
          <Text style={[styles.balanceHint, { color: "rgba(255,255,255,0.72)" }]}>
            Los saldos en USD se muestran sin conversión avanzada por ahora.
          </Text>
        </Card>

        {status === "loading" ? (
          <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.primary} />
        ) : null}
        {error ? <Text style={[styles.error, { color: colors.red, marginTop: spacing.md }]}>{error}</Text> : null}

        {accounts.map((account) => (
          <Card key={account.id} style={{ marginTop: spacing.md }}>
            <View style={styles.accountRow}>
              <View style={[styles.accountIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="wallet-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.accountInfo}>
                <Text style={[styles.accountName, { color: colors.textPrimary }]}>{account.name}</Text>
                <Text style={[styles.accountMeta, { color: colors.textSecondary }]}>
                  {account.currency} · {account.type}
                </Text>
              </View>
              <MoneyText
                amount={fromMinorUnits(account.currentBalanceMinor)}
                currency={account.currency}
                style={{ fontSize: typography.sizes.lg }}
              />
            </View>
            <View style={[styles.actionsRow, { marginTop: spacing.md }]}>
              <PrimaryButton label="Editar" onPress={() => startEdit(account)} style={styles.smallButton} />
              {!account.isInitial ? (
                <PrimaryButton
                  label="Archivar"
                  onPress={() => setArchiveTarget(account)}
                  style={[styles.smallButton, { backgroundColor: colors.red }]}
                />
              ) : null}
            </View>
          </Card>
        ))}

        <Card style={{ marginTop: spacing.md }}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
            {editingAccount ? "Editar cuenta" : "Nueva cuenta"}
          </Text>
          <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Cuenta sueldo" />
          {!editingAccount ? (
            <TextField
              label="Saldo inicial"
              value={openingBalance}
              onChangeText={setOpeningBalance}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          ) : null}
          <View style={[styles.chipRow, { marginTop: spacing.sm }]}>
            {ACCOUNT_TYPES.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                active={type === option.value}
                onPress={() => setType(option.value)}
              />
            ))}
          </View>
          <View style={[styles.chipRow, { marginTop: spacing.sm }]}>
            {[CurrencyCode.PEN, CurrencyCode.USD].map((option) => (
              <Chip
                key={option}
                label={option}
                active={currency === option}
                onPress={() => setCurrency(option)}
              />
            ))}
          </View>
          <PrimaryButton
            label={isSaving ? "Guardando..." : editingAccount ? "Guardar cambios" : "Crear cuenta"}
            onPress={handleSave}
            disabled={isSaving || !name.trim()}
            style={{ marginTop: spacing.md }}
          />
          {editingAccount ? (
            <PrimaryButton
              label="Cancelar edición"
              onPress={resetForm}
              style={{ marginTop: spacing.sm, backgroundColor: colors.gold }}
            />
          ) : null}
        </Card>
      </Screen>
      <ConfirmDialog
        visible={Boolean(archiveTarget)}
        danger
        title="¿Archivar cuenta?"
        message="La cuenta dejará de aparecer en tus listas activas. No se eliminarán documentos."
        confirmLabel="Archivar"
        cancelLabel="Volver"
        onCancel={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  balanceHint: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  accountIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontWeight: "800",
  },
  accountMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 10,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  error: {
    fontWeight: "700",
  },
});
