import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../src/components/layout/AppHeader";
import { Screen } from "../../src/components/layout/Screen";
import { Card, Chip, EmptyState, MoneyText, PrimaryButton, TextField } from "../../src/components/ui";
import {
  BudgetPeriod,
  CategoryKind,
  CurrencyCode,
  ObligationType,
  RecordStatus,
} from "../../src/lib/domain/enums";
import { fromMinorUnits } from "../../src/lib/domain/money";
import { formatExchangeRateDate, normalizeDate } from "../../src/lib/utils";
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
  const { colors, spacing, typography } = useAppTheme();
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

      <View style={[styles.filters, { marginTop: spacing.lg }]}>
        <Chip label="Deudas" active={activeTab === TABS.DEBTS} onPress={() => setActiveTab(TABS.DEBTS)} />
        <Chip label="Pagos fijos" active={activeTab === TABS.FIXED} onPress={() => setActiveTab(TABS.FIXED)} />
        <Chip
          label="Presupuestos"
          active={activeTab === TABS.BUDGETS}
          onPress={() => setActiveTab(TABS.BUDGETS)}
        />
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
        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
              Próximos pagos fijos
            </Text>
            <Pressable onPress={() => router.push({ pathname: "/(modals)/nuevo-movimiento", params: { type: "fixed" } })}>
              <Text style={[styles.link, { color: colors.primary }]}>Nuevo</Text>
            </Pressable>
          </View>
          {scheduledStore.scheduledPayments.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="Sin pagos fijos"
              description="Crea pagos como internet, alquiler o suscripciones desde el botón Nuevo."
            />
          ) : (
            scheduledStore.scheduledPayments.map((payment) => (
              <View key={payment.id} style={[styles.itemBlock, { borderColor: colors.border }]}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.name, { color: colors.textPrimary }]}>{payment.name}</Text>
                    <Text style={[styles.meta, { color: getUrgencyColor(payment.nextDueDate, colors) }]}>
                      {getDueLabel(payment.nextDueDate)} · {payment.frequency === "weekly" ? "Semanal" : "Mensual"}
                    </Text>
                  </View>
                  <MoneyText amount={fromMinorUnits(payment.amountMinor)} currency={payment.currency} />
                </View>
                <View style={styles.actionRow}>
                  <PrimaryButton
                    label={isSaving ? "Guardando..." : "Marcar pagado"}
                    onPress={() => handleMarkFixedPaid(payment)}
                    disabled={isSaving}
                    style={styles.actionButton}
                  />
                  <Pressable onPress={() => scheduledStore.archiveScheduledPayment(user.uid, payment.id)}>
                    <Text style={[styles.link, { color: colors.red }]}>Archivar</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </Card>
      ) : null}

      {activeTab === TABS.BUDGETS ? (
        <>
          <Card style={{ marginTop: spacing.md }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
              Nuevo presupuesto
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>Categoría</Text>
            <View style={styles.filters}>
              {expenseCategories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  active={budgetDraft.categoryId === category.id}
                  onPress={() => setBudgetDraft((draft) => ({ ...draft, categoryId: category.id }))}
                />
              ))}
            </View>
            <TextField
              label="Límite"
              value={budgetDraft.limit}
              onChangeText={(limit) => setBudgetDraft((draft) => ({ ...draft, limit }))}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
            <Text style={[styles.meta, { color: colors.textSecondary }]}>Moneda</Text>
            <View style={styles.filters}>
              <Chip
                label="PEN"
                active={budgetDraft.currency === CurrencyCode.PEN}
                onPress={() => setBudgetDraft((draft) => ({ ...draft, currency: CurrencyCode.PEN }))}
              />
              <Chip
                label="USD"
                active={budgetDraft.currency === CurrencyCode.USD}
                onPress={() => setBudgetDraft((draft) => ({ ...draft, currency: CurrencyCode.USD }))}
              />
            </View>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>Periodo</Text>
            <View style={styles.filters}>
              <Chip
                label="Mensual"
                active={budgetDraft.period === BudgetPeriod.MONTHLY}
                onPress={() => setBudgetDraft((draft) => ({ ...draft, period: BudgetPeriod.MONTHLY }))}
              />
              <Chip
                label="Semanal"
                active={budgetDraft.period === BudgetPeriod.WEEKLY}
                onPress={() => setBudgetDraft((draft) => ({ ...draft, period: BudgetPeriod.WEEKLY }))}
              />
            </View>
            <TextField
              label="Umbral de alerta"
              value={budgetDraft.alertThreshold}
              onChangeText={(alertThreshold) => setBudgetDraft((draft) => ({ ...draft, alertThreshold }))}
              placeholder="80"
              keyboardType="number-pad"
            />
            <PrimaryButton
              label={isSaving ? "Guardando..." : "Guardar presupuesto"}
              onPress={handleCreateBudget}
              disabled={isSaving}
              style={{ marginTop: spacing.md }}
            />
          </Card>
          <Card style={{ marginTop: spacing.md }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
              Presupuestos activos
            </Text>
            {budgetsStore.budgets.length === 0 ? (
              <EmptyState
                icon="pie-chart-outline"
                title="Sin presupuestos"
                description="Define un límite por categoría para ver alertas por color."
              />
            ) : (
              budgetsStore.budgets.map((budget) => (
                <BudgetRow
                  budget={budget}
                  category={categories.find((category) => category.id === budget.categoryId)}
                  colors={colors}
                  key={budget.id}
                  onArchive={() => budgetsStore.archiveBudget(user.uid, budget.id)}
                />
              ))
            )}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

function DebtSection({
  accounts,
  categories,
  debts,
  isSaving,
  onArchive,
  onPayInFull,
  onPartialPayment,
  onSelectPayment,
  paymentDraft,
  setPaymentDraft,
  spacing,
  title,
}) {
  const { colors, typography } = useAppTheme();

  return (
    <Card style={{ marginTop: spacing.md }}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
          {title}
        </Text>
        <Pressable onPress={() => router.push({ pathname: "/(modals)/nuevo-movimiento", params: { type: "debt" } })}>
          <Text style={[styles.link, { color: colors.primary }]}>Nueva</Text>
        </Pressable>
      </View>
      {debts.length === 0 ? (
        <EmptyState icon="people-outline" title="Sin deudas" description="Cuando registres una deuda aparecerá aquí." />
      ) : (
        debts.map((obligation) => (
          <View key={obligation.id} style={[styles.itemBlock, { borderColor: colors.border }]}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{obligation.personName}</Text>
                <Text style={[styles.meta, { color: getUrgencyColor(obligation.dueDate, colors) }]}>
                  {getDueLabel(obligation.dueDate)}
                </Text>
              </View>
              <MoneyText
                amount={fromMinorUnits(obligation.pendingAmountMinor)}
                currency={obligation.currency}
                tone={obligation.status === RecordStatus.PAID ? "positive" : "default"}
              />
            </View>
            {paymentDraft.obligationId === obligation.id ? (
              <View style={{ marginTop: spacing.md }}>
                <TextField
                  label="Abono"
                  value={paymentDraft.amount}
                  onChangeText={(amount) => setPaymentDraft((draft) => ({ ...draft, amount }))}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
                <Text style={[styles.meta, { color: colors.textSecondary }]}>Cuenta</Text>
                <View style={styles.filters}>
                  {accounts.map((account) => (
                    <Chip
                      key={account.id}
                      label={account.name}
                      active={paymentDraft.accountId === account.id}
                      onPress={() => setPaymentDraft((draft) => ({ ...draft, accountId: account.id }))}
                    />
                  ))}
                </View>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>Categoría</Text>
                <View style={styles.filters}>
                  {categories.map((category) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      active={paymentDraft.categoryId === category.id}
                      onPress={() => setPaymentDraft((draft) => ({ ...draft, categoryId: category.id }))}
                    />
                  ))}
                </View>
                <PrimaryButton
                  label={isSaving ? "Guardando..." : "Guardar abono"}
                  onPress={() => onPartialPayment(obligation)}
                  disabled={isSaving}
                  style={{ marginTop: spacing.md }}
                />
              </View>
            ) : null}
            {obligation.status === RecordStatus.ACTIVE ? (
              <View style={styles.actionRow}>
                <Pressable onPress={() => onSelectPayment(obligation)}>
                  <Text style={[styles.link, { color: colors.primary }]}>Abonar</Text>
                </Pressable>
                <Pressable onPress={() => onPayInFull(obligation)}>
                  <Text style={[styles.link, { color: colors.primaryMuted }]}>Pago total</Text>
                </Pressable>
                <Pressable onPress={() => onArchive(obligation)}>
                  <Text style={[styles.link, { color: colors.red }]}>Archivar</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={[styles.meta, { color: colors.primaryMuted, marginTop: spacing.sm }]}>Pagada</Text>
            )}
          </View>
        ))
      )}
    </Card>
  );
}

function BudgetRow({ budget, category, colors, onArchive }) {
  const progressColor =
    budget.progress >= 100 ? colors.red : budget.progress >= Number(budget.alertThreshold || 80) ? colors.gold : colors.primary;

  return (
    <View style={[styles.itemBlock, { borderColor: colors.border }]}>
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{category?.name || "Categoría"}</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {budget.period === BudgetPeriod.WEEKLY ? "Semanal" : "Mensual"} · alerta {budget.alertThreshold}%
          </Text>
        </View>
        <Text style={[styles.percent, { color: progressColor }]}>{budget.progress}%</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.background }]}>
        <View style={[styles.progressFill, { backgroundColor: progressColor, width: `${Math.min(100, budget.progress)}%` }]} />
      </View>
      <View style={styles.itemRow}>
        <MoneyText amount={fromMinorUnits(budget.spentMinor)} currency={budget.currency} />
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          de {fromMinorUnits(budget.limitMinor).toFixed(2)} {budget.currency}
        </Text>
      </View>
      <Pressable onPress={onArchive} style={styles.archiveLink}>
        <Text style={[styles.link, { color: colors.red }]}>Archivar</Text>
      </Pressable>
    </View>
  );
}

function getDueLabel(value) {
  if (!value) return "Sin vencimiento";
  return `Vence ${formatExchangeRateDate(normalizeDate(value))}`;
}

function getUrgencyColor(value, colors) {
  if (!value) return colors.textSecondary;
  const dueDate = normalizeDate(value);
  const diffDays = Math.ceil((dueDate.getTime() - Date.now()) / 86400000);

  if (diffDays < 0) return colors.red;
  if (diffDays <= 3) return colors.gold;
  return colors.textSecondary;
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    marginTop: 12,
  },
  archiveLink: {
    alignSelf: "flex-start",
    marginTop: 10,
  },
  error: {
    fontWeight: "700",
    lineHeight: 20,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  itemBlock: {
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 14,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  itemRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  link: {
    fontSize: 13,
    fontWeight: "800",
  },
  meta: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
  },
  percent: {
    fontSize: 18,
    fontWeight: "900",
  },
  progressFill: {
    borderRadius: 999,
    height: 8,
  },
  progressTrack: {
    borderRadius: 999,
    height: 8,
    marginVertical: 10,
    overflow: "hidden",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontWeight: "800",
  },
});
