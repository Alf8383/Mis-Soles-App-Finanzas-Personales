import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getCategoryIconName } from "../../lib/domain/category-icons";
import { BudgetPeriod, CurrencyCode, RecordStatus } from "../../lib/domain/enums";
import { fromMinorUnits } from "../../lib/domain/money";
import { formatExchangeRateDate, normalizeDate } from "../../lib/utils";
import { useAppTheme } from "../../theme";
import { Card, Chip, EmptyState, MoneyText, PrimaryButton, TextField } from "../ui";

export function FixedPaymentsSection({ isSaving, onArchive, onMarkPaid, payments, spacing }) {
  const { colors, typography } = useAppTheme();

  return (
    <Card style={{ marginTop: spacing.md }}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
          Próximos pagos fijos
        </Text>
        <Pressable onPress={() => router.push({ pathname: "/(modals)/nuevo-movimiento", params: { type: "fixed" } })}>
          <Text style={[styles.link, { color: colors.primary }]}>Nuevo</Text>
        </Pressable>
      </View>
      {payments.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="Sin pagos fijos"
          description="Crea pagos como internet, alquiler o suscripciones desde el botón Nuevo."
        />
      ) : (
        payments.map((payment) => (
          <View key={payment.id} style={[styles.itemBlock, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.itemRow}>
              <View style={[styles.itemIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              </View>
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
                onPress={() => onMarkPaid(payment)}
                disabled={isSaving}
                style={styles.actionButton}
              />
              <Pressable onPress={() => onArchive(payment)}>
                <Text style={[styles.link, { color: colors.red }]}>Archivar</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </Card>
  );
}

export function BudgetsSection({
  budgetDraft,
  budgets,
  categories,
  expenseCategories,
  isSaving,
  onArchive,
  onCreate,
  setBudgetDraft,
  spacing,
}) {
  const { colors, typography } = useAppTheme();

  return (
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
          onPress={onCreate}
          disabled={isSaving}
          style={{ marginTop: spacing.md }}
        />
      </Card>
      <Card style={{ marginTop: spacing.md }}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg }]}>
          Presupuestos activos
        </Text>
        {budgets.length === 0 ? (
          <EmptyState
            icon="pie-chart-outline"
            title="Sin presupuestos"
            description="Define un límite por categoría para ver alertas por color."
          />
        ) : (
          budgets.map((budget) => (
            <BudgetRow
              budget={budget}
              category={categories.find((category) => category.id === budget.categoryId)}
              colors={colors}
              key={budget.id}
              onArchive={() => onArchive(budget)}
            />
          ))
        )}
      </Card>
    </>
  );
}

export function DebtSection({
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
          <View key={obligation.id} style={[styles.itemBlock, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.itemRow}>
              <View style={[styles.itemIcon, { backgroundColor: title === "Debo a otros" ? colors.redSoft : colors.primarySoft }]}>
                <Ionicons
                  name={title === "Debo a otros" ? "arrow-up-circle-outline" : "arrow-down-circle-outline"}
                  size={18}
                  color={title === "Debo a otros" ? colors.red : colors.primary}
                />
              </View>
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
    <View style={[styles.itemBlock, { backgroundColor: colors.surfaceContainerLow }]}>
      <View style={styles.itemRow}>
        <View style={[styles.itemIcon, { backgroundColor: category?.color || colors.primary }]}>
          <Ionicons name={getCategoryIconName(category?.icon)} size={18} color={colors.surface} />
        </View>
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
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  itemBlock: {
    borderRadius: 18,
    marginTop: 14,
    padding: 14,
  },
  itemIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  itemRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
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
    gap: 12,
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontWeight: "800",
  },
});
