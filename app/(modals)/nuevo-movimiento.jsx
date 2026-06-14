import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { DebtForm, FixedPaymentForm, MovementForm } from "../../src/components/forms/NuevoMovimientoForms";
import { Screen } from "../../src/components/layout/Screen";
import { Card, PrimaryButton } from "../../src/components/ui";
import {
  CategoryKind,
  CurrencyCode,
  MovementType,
  ObligationType,
  ScheduledPaymentFrequency,
} from "../../src/lib/domain/enums";
import {
  useAccountsStore,
  useAuthFlowStore,
  useDashboardStore,
  useMovementsStore,
  useObligationsStore,
  useScheduledPaymentsStore,
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

const AUX_COPY = {
  debt: {
    title: "Nueva deuda",
    subtitle: "Registra préstamos informales sin mover saldos hasta que hagas un abono.",
  },
  fixed: {
    title: "Nuevo pago fijo",
    subtitle: "Programa un gasto recurrente y márcalo como pagado cuando corresponda.",
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
  const createObligation = useObligationsStore((state) => state.createObligation);
  const obligationError = useObligationsStore((state) => state.error);
  const obligationsStatus = useObligationsStore((state) => state.status);
  const createScheduledPayment = useScheduledPaymentsStore((state) => state.createScheduledPayment);
  const scheduledPaymentError = useScheduledPaymentsStore((state) => state.error);
  const scheduledPaymentStatus = useScheduledPaymentsStore((state) => state.status);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [currency, setCurrency] = useState(CurrencyCode.PEN);
  const [debtDirection, setDebtDirection] = useState(ObligationType.DEBT_I_OWE);
  const [dueDate, setDueDate] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [frequency, setFrequency] = useState(ScheduledPaymentFrequency.MONTHLY);
  const [personName, setPersonName] = useState("");
  const [fixedName, setFixedName] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [fee, setFee] = useState("");
  // Si en clase piden agregar un campo al formulario, normalmente empieza con un useState aqui.
  const [formError, setFormError] = useState("");
  const isAuxType = movementType === "debt" || movementType === "fixed";
  const isSaving =
    movementsStatus === "saving" ||
    obligationsStatus === "saving" ||
    scheduledPaymentStatus === "saving";
  const isLoading = movementsStatus === "loading" || accountsStatus === "loading";
  const copy = FORM_COPY[movementType] || AUX_COPY[movementType];

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
  const selectedFixedAccount = accounts.find((account) => account.id === accountId);
  const fromAccount = accounts.find((account) => account.id === fromAccountId);
  const toAccount = accounts.find((account) => account.id === toAccountId);
  const selectedFixedCategory = filteredCategories.find((category) => category.id === categoryId);
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

    if (movementType === "debt") {
      await handleDebtSubmit();
      return;
    }

    if (movementType === "fixed") {
      await handleFixedSubmit();
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

    // La pantalla solo arma los datos del formulario; el store y el repositorio se encargan de guardarlos.
    // Para guardar un campo nuevo, agregalo en este objeto y despues leelo en el repositorio.
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

    // Aqui empieza el camino hacia la BD: pantalla -> store -> repositorio -> Firestore.
    const result = await createMovement(user.uid, values);

    if (!result.error) {
      await Promise.all([loadAccounts(user.uid), loadDashboard(user.uid), loadMovements(user.uid)]);
      router.back();
    }
  }

  async function handleDebtSubmit() {
    const validationError = validateDebtForm({ amount, personName });

    if (validationError) {
      setFormError(validationError);
      return;
    }

    // Este payload viaja al store de obligaciones y luego al repositorio de Firestore.
    const result = await createObligation(user.uid, {
      amount,
      currency,
      dueDate,
      note: description,
      personName,
      type: debtDirection,
    });

    if (!result.error) {
      router.back();
    }
  }

  async function handleFixedSubmit() {
    const selectedFixedAccount = accounts.find((account) => account.id === accountId);
    const validationError = validateFixedForm({
      accountId,
      amount,
      categoryId,
      name: fixedName,
      nextDueDate,
    });

    if (validationError) {
      setFormError(validationError);
      return;
    }

    // Los pagos fijos se guardan como programación; el saldo cambia recién al marcarlos como pagados.
    const result = await createScheduledPayment(user.uid, {
      accountId,
      amount,
      categoryId,
      currency: selectedFixedAccount?.currency || CurrencyCode.PEN,
      frequency,
      name: fixedName,
      nextDueDate,
    });

    if (!result.error) {
      router.back();
    }
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
        {movementType === "debt" ? (
          <DebtForm
            amount={amount}
            currency={currency}
            debtDirection={debtDirection}
            description={description}
            dueDate={dueDate}
            personName={personName}
            setAmount={setAmount}
            setCurrency={setCurrency}
            setDebtDirection={setDebtDirection}
            setDescription={setDescription}
            setDueDate={setDueDate}
            setPersonName={setPersonName}
          />
        ) : null}

        {movementType === "fixed" ? (
          <FixedPaymentForm
            accounts={accounts}
            amount={amount}
            categoryId={categoryId}
            fixedName={fixedName}
            frequency={frequency}
            nextDueDate={nextDueDate}
            selectedAccountId={accountId}
            selectedCategory={selectedFixedCategory}
            selectedCurrency={selectedFixedAccount?.currency || CurrencyCode.PEN}
            categories={filteredCategories}
            setAccountId={setAccountId}
            setAmount={setAmount}
            setCategoryId={setCategoryId}
            setFixedName={setFixedName}
            setFrequency={setFrequency}
            setNextDueDate={setNextDueDate}
          />
        ) : null}

        {!isAuxType ? (
          // Las props conectan el estado de esta pantalla con los campos visibles del formulario.
          <MovementForm
            accountId={accountId}
            accounts={accounts}
            amount={amount}
            categoryId={categoryId}
            categories={filteredCategories}
            description={description}
            exchangeRate={exchangeRate}
            fee={fee}
            fromAccountId={fromAccountId}
            movementType={movementType}
            requiresExchangeRate={requiresExchangeRate}
            setAccountId={setAccountId}
            setAmount={setAmount}
            setCategoryId={setCategoryId}
            setDescription={setDescription}
            setExchangeRate={setExchangeRate}
            setFee={setFee}
            setFromAccountId={setFromAccountId}
            setToAccountId={setToAccountId}
            toAccountId={toAccountId}
          />
        ) : null}

        {formError || movementError || obligationError || scheduledPaymentError ? (
          <Text style={[styles.error, { color: colors.red, marginTop: spacing.md }]}>
            {formError || movementError || obligationError || scheduledPaymentError}
          </Text>
        ) : null}

        <PrimaryButton
          label={isSaving ? "Guardando..." : getSubmitLabel(movementType)}
          onPress={handleSubmit}
          disabled={isSaving}
          style={{ marginTop: spacing.md }}
        />
      </Card>
    </Screen>
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

function validateDebtForm(values) {
  if (!values.personName.trim()) {
    return "Ingresa el nombre de la persona.";
  }

  if (Number(values.amount) <= 0) {
    return "Ingresa un monto mayor a 0.";
  }

  return "";
}

function validateFixedForm(values) {
  if (!values.name.trim()) {
    return "Ingresa el nombre del pago fijo.";
  }

  if (Number(values.amount) <= 0) {
    return "Ingresa un monto mayor a 0.";
  }

  if (!values.accountId) {
    return "Selecciona una cuenta.";
  }

  if (!values.categoryId) {
    return "Selecciona una categoría.";
  }

  if (!values.nextDueDate.trim()) {
    return "Ingresa el próximo vencimiento.";
  }

  return "";
}

function getSubmitLabel(type) {
  if (type === "debt") return "Guardar deuda";
  if (type === "fixed") return "Guardar pago fijo";
  return "Guardar movimiento";
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
  error: {
    fontWeight: "700",
    lineHeight: 20,
  },
});
