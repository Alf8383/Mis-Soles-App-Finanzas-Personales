import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../src/components/layout/Screen";
import { Card, Chip, EmptyState, PrimaryButton, TextField } from "../../src/components/ui";
import { CategoryKind, MovementType } from "../../src/lib/domain/enums";
import {
  useAccountsStore,
  useAuthFlowStore,
  useDashboardStore,
  useMovementsStore,
} from "../../src/stores";
import { useAppTheme } from "../../src/theme";

const FORM_COPY = {
  [MovementType.EXPENSE]: {
    title: "Nuevo gasto",
    subtitle: "Registra una salida y actualiza el saldo de tu cuenta.",
  },
  [MovementType.INCOME]: {
    title: "Nuevo ingreso",
    subtitle: "Registra dinero recibido y suma al saldo de tu cuenta.",
  },
  [MovementType.TRANSFER]: {
    title: "Nueva transferencia",
    subtitle: "Mueve dinero entre cuentas con impacto contable.",
  },
};

export default function NuevoMovimientoModal() {
  const { colors, spacing, typography } = useAppTheme();
  const { type } = useLocalSearchParams();
  const movementType = normalizeMovementType(type);
  const user = useAuthFlowStore((state) => state.user);
  const accounts = useAccountsStore((state) => state.accounts);
  const accountsStatus = useAccountsStore((state) => state.status);
  const loadAccounts = useAccountsStore((state) => state.loadAccounts);
  const loadDashboard = useDashboardStore((state) => state.loadDashboard);
  const categories = useMovementsStore((state) => state.categories);
  const movementError = useMovementsStore((state) => state.error);
  const movementsStatus = useMovementsStore((state) => state.status);
  const createMovement = useMovementsStore((state) => state.createMovement);
  const loadMovements = useMovementsStore((state) => state.loadMovements);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [fee, setFee] = useState("");
  const [formError, setFormError] = useState("");
  const isSaving = movementsStatus === "saving";
  const isLoading = movementsStatus === "loading" || accountsStatus === "loading";
  const copy = FORM_COPY[movementType];

  useEffect(() => {
    if (user?.uid) {
      loadAccounts(user.uid);
      loadMovements(user.uid);
    }
  }, [loadAccounts, loadMovements, user?.uid]);

  useEffect(() => {
    if (!accountId && accounts[0]?.id) setAccountId(accounts[0].id);
    if (!fromAccountId && accounts[0]?.id) setFromAccountId(accounts[0].id);
    if (!toAccountId && accounts[1]?.id) setToAccountId(accounts[1].id);
  }, [accountId, accounts, fromAccountId, toAccountId]);

  const filteredCategories = useMemo(() => {
    const kind = movementType === MovementType.INCOME ? CategoryKind.INCOME : CategoryKind.EXPENSE;
    return categories.filter((category) => category.kind === kind);
  }, [categories, movementType]);
  const selectedAccount = accounts.find((account) => account.id === accountId);
  const fromAccount = accounts.find((account) => account.id === fromAccountId);
  const toAccount = accounts.find((account) => account.id === toAccountId);
  const requiresExchangeRate =
    movementType === MovementType.TRANSFER &&
    fromAccount &&
    toAccount &&
    fromAccount.currency !== toAccount.currency;

  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.some((category) => category.id === categoryId)) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [categoryId, filteredCategories]);

  async function handleSubmit() {
    setFormError("");

    if (!user?.uid) {
      setFormError("Inicia sesión para guardar movimientos.");
      return;
    }

    const validationError = validateForm({
      accountId,
      amount,
      categoryId,
      fromAccountId,
      movementType,
      requiresExchangeRate,
      toAccountId,
      exchangeRate,
    });

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const values =
      movementType === MovementType.TRANSFER
        ? {
            amount,
            date: new Date().toISOString(),
            description,
            exchangeRate: requiresExchangeRate ? exchangeRate : 1,
            fee,
            fromAccountId,
            toAccountId,
            type: MovementType.TRANSFER,
          }
        : {
            accountId,
            amount,
            categoryId,
            currency: selectedAccount?.currency ?? "PEN",
            date: new Date().toISOString(),
            description,
            type: movementType,
          };

    const result = await createMovement(user.uid, values);

    if (!result.error) {
      await Promise.all([loadAccounts(user.uid), loadDashboard(user.uid), loadMovements(user.uid)]);
      router.back();
    }
  }

  if (!copy) {
    return (
      <Screen>
        <Card style={{ marginTop: spacing.lg }}>
          <EmptyState
            icon="construct-outline"
            title="Este flujo llega en EP-06"
            description="Deudas y pagos fijos ya tienen entrada visual, pero su persistencia real se implementará en la siguiente épica."
            actionLabel="Volver"
            onAction={() => router.back()}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scrollable bottomInset={32}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.xxl }]}>
            {copy.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{copy.subtitle}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar formulario"
          onPress={() => router.back()}
          style={[styles.closeButton, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} /> : null}

      <Card style={{ marginTop: spacing.lg }}>
        <TextField
          label="Monto"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
        <TextField
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Ej. Mercado, sueldo, transferencia"
        />

        {movementType === MovementType.TRANSFER ? (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>
              Cuenta origen
            </Text>
            <AccountPicker accounts={accounts} selectedId={fromAccountId} onSelect={setFromAccountId} />
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>
              Cuenta destino
            </Text>
            <AccountPicker accounts={accounts} selectedId={toAccountId} onSelect={setToAccountId} />
            {requiresExchangeRate ? (
              <TextField
                label="Tipo de cambio"
                value={exchangeRate}
                onChangeText={setExchangeRate}
                placeholder="Ej. 3.75"
                keyboardType="decimal-pad"
              />
            ) : null}
            <TextField
              label="Comisión opcional"
              value={fee}
              onChangeText={setFee}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </>
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>
              Cuenta
            </Text>
            <AccountPicker accounts={accounts} selectedId={accountId} onSelect={setAccountId} />
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>
              Categoría
            </Text>
            <View style={styles.chipRow}>
              {filteredCategories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  active={categoryId === category.id}
                  onPress={() => setCategoryId(category.id)}
                />
              ))}
            </View>
          </>
        )}

        {formError || movementError ? (
          <Text style={[styles.error, { color: colors.red, marginTop: spacing.md }]}>
            {formError || movementError}
          </Text>
        ) : null}

        <PrimaryButton
          label={isSaving ? "Guardando..." : "Guardar movimiento"}
          onPress={handleSubmit}
          disabled={isSaving}
          style={{ marginTop: spacing.md }}
        />
      </Card>
    </Screen>
  );
}

function AccountPicker({ accounts, selectedId, onSelect }) {
  return (
    <View style={styles.chipRow}>
      {accounts.map((account) => (
        <Chip
          key={account.id}
          label={`${account.name} · ${account.currency}`}
          active={selectedId === account.id}
          onPress={() => onSelect(account.id)}
        />
      ))}
    </View>
  );
}

function normalizeMovementType(type) {
  if (type === MovementType.INCOME) return MovementType.INCOME;
  if (type === MovementType.TRANSFER) return MovementType.TRANSFER;
  if (type === "debt" || type === "fixed") return type;
  return MovementType.EXPENSE;
}

function validateForm(values) {
  if (Number(values.amount) <= 0) {
    return "Ingresa un monto mayor a 0.";
  }

  if (values.movementType === MovementType.TRANSFER) {
    if (!values.fromAccountId || !values.toAccountId) {
      return "Selecciona cuenta origen y destino.";
    }

    if (values.fromAccountId === values.toAccountId) {
      return "La cuenta origen y destino deben ser distintas.";
    }

    if (values.requiresExchangeRate && Number(values.exchangeRate) <= 0) {
      return "Ingresa un tipo de cambio válido.";
    }

    return "";
  }

  if (!values.accountId) {
    return "Selecciona una cuenta.";
  }

  if (!values.categoryId) {
    return "Selecciona una categoría.";
  }

  return "";
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  error: {
    fontWeight: "700",
    lineHeight: 20,
  },
});
