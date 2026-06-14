import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import { DebtSection, FixedPaymentsSection, BudgetsSection } from "../../src/components/obligations/ObligationSections";
import { Card } from "../../src/components/ui";
import {
  BudgetPeriod,
  CategoryKind,
  CurrencyCode,
  ObligationType,
  RecordStatus,
} from "../../src/lib/domain/enums";
import {
  useAccountsStore,
  useAuthFlowStore,
  useBudgetsStore,
  useDashboardStore,
  useMovementsStore,
  useObligationsStore,
  useScheduledPaymentsStore,
} from "../../src/stores";
import { useAppTheme } from "../../src/theme";

const TABS = {
  DEBTS: "debts",
  FIXED: "fixed",
  BUDGETS: "budgets",
};

export default function ObligacionesScreen() {
  const { colors, spacing } = useAppTheme();
  const user = useAuthFlowStore((state) => state.user);
  const accounts = useAccountsStore((state) => state.accounts);
  const loadAccounts = useAccountsStore((state) => state.loadAccounts);
  const categories = useMovementsStore((state) => state.categories);
  const loadMovements = useMovementsStore((state) => state.loadMovements);
  const loadDashboard = useDashboardStore((state) => state.loadDashboard);
  const obligationsStore = useObligationsStore();
  const scheduledStore = useScheduledPaymentsStore();
  const budgetsStore = useBudgetsStore();
  const [activeTab, setActiveTab] = useState(TABS.DEBTS);
  const [paymentDraft, setPaymentDraft] = useState({ accountId: "", amount: "", categoryId: "", obligationId: "" });
  const [budgetDraft, setBudgetDraft] = useState({
    alertThreshold: "80",
    categoryId: "",
    currency: CurrencyCode.PEN,
    limit: "",
    period: BudgetPeriod.MONTHLY,
  });
  const [formError, setFormError] = useState("");
  const expenseCategories = categories.filter((category) => category.kind === CategoryKind.EXPENSE);
  const incomeCategories = categories.filter((category) => category.kind === CategoryKind.INCOME);
  const isLoading =
    obligationsStore.status === "loading" ||
    scheduledStore.status === "loading" ||
    budgetsStore.status === "loading";
  const isSaving =
    obligationsStore.status === "saving" ||
    scheduledStore.status === "saving" ||
    budgetsStore.status === "saving";

  useEffect(() => {
    if (user?.uid) {
      obligationsStore.loadObligations(user.uid);
      scheduledStore.loadScheduledPayments(user.uid);
      budgetsStore.loadBudgets(user.uid);
      loadAccounts(user.uid);
      loadMovements(user.uid);
    }
  }, [
    budgetsStore.loadBudgets,
    loadAccounts,
    loadMovements,
    obligationsStore.loadObligations,
    scheduledStore.loadScheduledPayments,
    user?.uid,
  ]);

  useEffect(() => {
    if (!paymentDraft.accountId && accounts[0]?.id) {
      setPaymentDraft((draft) => ({ ...draft, accountId: accounts[0].id }));
    }

    if (!budgetDraft.categoryId && expenseCategories[0]?.id) {
      setBudgetDraft((draft) => ({ ...draft, categoryId: expenseCategories[0].id }));
    }
  }, [accounts, budgetDraft.categoryId, expenseCategories, paymentDraft.accountId]);

  const debtsIOwe = useMemo(
    () =>
      obligationsStore.obligations.filter(
        (obligation) =>
          obligation.type === ObligationType.DEBT_I_OWE && obligation.status !== RecordStatus.ARCHIVED,
      ),
    [obligationsStore.obligations],
  );
  const debtsOwedToMe = useMemo(
    () =>
      obligationsStore.obligations.filter(
        (obligation) =>
          obligation.type === ObligationType.DEBT_OWED_TO_ME && obligation.status !== RecordStatus.ARCHIVED,
      ),
    [obligationsStore.obligations],
  );
  const pendingDebtCount = debtsIOwe.filter((debt) => debt.status === RecordStatus.ACTIVE).length +
    debtsOwedToMe.filter((debt) => debt.status === RecordStatus.ACTIVE).length;

  async function refreshAll() {
    if (!user?.uid) return;
    await Promise.all([
      obligationsStore.loadObligations(user.uid),
      scheduledStore.loadScheduledPayments(user.uid),
      budgetsStore.loadBudgets(user.uid),
      loadDashboard(user.uid),
      loadMovements(user.uid),
    ]);
  }

  async function handlePartialPayment(obligation) {
    setFormError("");

    if (!paymentDraft.accountId || !paymentDraft.categoryId) {
      setFormError("Selecciona cuenta y categoría para generar el movimiento.");
      return;
    }

    if (Number(paymentDraft.amount) <= 0) {
      setFormError("Ingresa un abono mayor a 0.");
      return;
    }

    const result = await obligationsStore.registerPayment(user.uid, obligation.id, {
      accountId: paymentDraft.accountId,
      amount: paymentDraft.amount,
      categoryId: paymentDraft.categoryId,
    });

    if (!result.error) {
      setPaymentDraft((draft) => ({ ...draft, amount: "", obligationId: "" }));
      await refreshAll();
    }
  }

  async function handlePayInFull(obligation) {
    setFormError("");
    const categoryId = getDefaultCategoryId(obligation);

    if (!paymentDraft.accountId || !categoryId) {
      setFormError("Selecciona cuenta y categoría para liquidar la deuda.");
      return;
    }

    const result = await obligationsStore.payInFull(user.uid, obligation.id, {
      accountId: paymentDraft.accountId,
      categoryId,
    });

    if (!result.error) {
      await refreshAll();
    }
  }

  async function handleMarkFixedPaid(payment) {
    setFormError("");
    const result = await scheduledStore.markAsPaid(user.uid, payment.id);

    if (!result.error) {
      await refreshAll();
    }
  }

  async function handleCreateBudget() {
    setFormError("");

    if (!budgetDraft.categoryId) {
      setFormError("Selecciona una categoría.");
      return;
    }

    if (Number(budgetDraft.limit) <= 0) {
      setFormError("Ingresa un límite mayor a 0.");
      return;
    }

    const result = await budgetsStore.createBudget(user.uid, budgetDraft);

    if (!result.error) {
      setBudgetDraft((draft) => ({ ...draft, limit: "" }));
      await refreshAll();
    }
  }

  function getDefaultCategoryId(obligation) {
    const collection =
      obligation.type === ObligationType.DEBT_I_OWE ? expenseCategories : incomeCategories;
    return paymentDraft.categoryId || collection[0]?.id || "";
  }

  return (
    <Screen scrollable bottomInset={120}>
      <AppHeader title="Obligaciones" subtitle="Deudas, pagos fijos y presupuestos" />

      <Card style={{ marginTop: spacing.md, backgroundColor: colors.surfaceContainerLow }}>
        <View style={styles.summaryGrid}>
          <ObligationSummary label="Deudas activas" value={String(pendingDebtCount)} icon="people-outline" tone="gold" />
          <ObligationSummary label="Pagos fijos" value={String(scheduledStore.scheduledPayments.length)} icon="calendar-outline" tone="primary" />
          <ObligationSummary label="Presupuestos" value={String(budgetsStore.budgets.length)} icon="pie-chart-outline" tone="blue" />
        </View>
      </Card>

      <View style={[styles.segmentedTabs, { backgroundColor: colors.surfaceContainerLow, marginTop: spacing.md }]}>
        <TabButton label="Deudas" active={activeTab === TABS.DEBTS} onPress={() => setActiveTab(TABS.DEBTS)} />
        <TabButton label="Pagos fijos" active={activeTab === TABS.FIXED} onPress={() => setActiveTab(TABS.FIXED)} />
        <TabButton label="Presupuestos" active={activeTab === TABS.BUDGETS} onPress={() => setActiveTab(TABS.BUDGETS)} />
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} /> : null}
      {formError || obligationsStore.error || scheduledStore.error || budgetsStore.error ? (
        <Text style={[styles.error, { color: colors.red, marginTop: spacing.md }]}>
          {formError || obligationsStore.error || scheduledStore.error || budgetsStore.error}
        </Text>
      ) : null}

      {activeTab === TABS.DEBTS ? (
        <>
          <DebtSection
            accounts={accounts}
            categories={expenseCategories}
            debts={debtsIOwe}
            isSaving={isSaving}
            onArchive={(obligation) => obligationsStore.archiveObligation(user.uid, obligation.id)}
            onPayInFull={handlePayInFull}
            onPartialPayment={handlePartialPayment}
            onSelectPayment={(obligation) =>
              setPaymentDraft((draft) => ({
                ...draft,
                categoryId: expenseCategories[0]?.id || draft.categoryId,
                obligationId: obligation.id,
              }))
            }
            paymentDraft={paymentDraft}
            setPaymentDraft={setPaymentDraft}
            spacing={spacing}
            title="Debo a otros"
          />
          <DebtSection
            accounts={accounts}
            categories={incomeCategories}
            debts={debtsOwedToMe}
            isSaving={isSaving}
            onArchive={(obligation) => obligationsStore.archiveObligation(user.uid, obligation.id)}
            onPayInFull={handlePayInFull}
            onPartialPayment={handlePartialPayment}
            onSelectPayment={(obligation) =>
              setPaymentDraft((draft) => ({
                ...draft,
                categoryId: incomeCategories[0]?.id || draft.categoryId,
                obligationId: obligation.id,
              }))
            }
            paymentDraft={paymentDraft}
            setPaymentDraft={setPaymentDraft}
            spacing={spacing}
            title="Me deben"
          />
        </>
      ) : null}

      {activeTab === TABS.FIXED ? (
        <FixedPaymentsSection
          isSaving={isSaving}
          onArchive={(payment) => scheduledStore.archiveScheduledPayment(user.uid, payment.id)}
          onMarkPaid={handleMarkFixedPaid}
          payments={scheduledStore.scheduledPayments}
          spacing={spacing}
        />
      ) : null}

      {activeTab === TABS.BUDGETS ? (
        <BudgetsSection
          budgetDraft={budgetDraft}
          budgets={budgetsStore.budgets}
          categories={categories}
          expenseCategories={expenseCategories}
          isSaving={isSaving}
          onArchive={(budget) => budgetsStore.archiveBudget(user.uid, budget.id)}
          onCreate={handleCreateBudget}
          setBudgetDraft={setBudgetDraft}
          spacing={spacing}
        />
      ) : null}
    </Screen>
  );
}

function TabButton({ active, label, onPress }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        {
          backgroundColor: active ? colors.primary : "transparent",
          opacity: pressed ? 0.86 : 1,
        },
      ]}
    >
      <Text style={[styles.tabButtonText, { color: active ? colors.surface : colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

function ObligationSummary({ icon, label, tone, value }) {
  const { colors } = useAppTheme();
  const toneColor = tone === "gold" ? colors.gold : tone === "blue" ? colors.blue : colors.primary;
  const toneBg = tone === "gold" ? colors.goldSoft : tone === "blue" ? colors.blueSoft : colors.primarySoft;

  return (
    <View style={styles.summaryItem}>
      <View style={[styles.summaryIcon, { backgroundColor: toneBg }]}>
        <Ionicons name={icon} size={17} color={toneColor} />
      </View>
      <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    fontWeight: "700",
    lineHeight: 20,
  },
  segmentedTabs: {
    borderRadius: 18,
    flexDirection: "row",
    gap: 4,
    padding: 4,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
  },
  summaryIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  summaryItem: {
    flex: 1,
    gap: 3,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "800",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "900",
  },
  tabButton: {
    alignItems: "center",
    borderRadius: 15,
    flex: 1,
    justifyContent: "center",
    minHeight: 38,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "900",
  },
});
