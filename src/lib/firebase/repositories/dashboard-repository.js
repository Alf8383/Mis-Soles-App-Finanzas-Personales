import { getThisMonthRange } from "../../utils";
import { fromMinorUnits } from "../../domain/money";
import { MovementType } from "../../domain/enums";
import { listAccounts } from "./accounts-repository";
import { listMovements } from "./movements-repository";
import { listObligations } from "./obligations-repository";
import { listScheduledPayments } from "./scheduled-payments-repository";

function getMovementMillis(movement) {
  const date = movement.date?.toDate ? movement.date.toDate() : new Date(movement.date);
  return date.getTime();
}

export async function getDashboardSummary(uid) {
  const [accounts, movements, obligations, scheduledPayments] = await Promise.all([
    listAccounts(uid),
    listMovements(uid, { max: 100 }),
    listObligations(uid),
    listScheduledPayments(uid),
  ]);
  const { start, end } = getThisMonthRange();
  const startMillis = start.getTime();
  const endMillis = end.getTime();
  const monthlyMovements = movements.filter((movement) => {
    const millis = getMovementMillis(movement);
    return millis >= startMillis && millis <= endMillis;
  });
  const monthlyIncomeMinor = monthlyMovements
    .filter((movement) => movement.type === MovementType.INCOME)
    .reduce((total, movement) => total + Number(movement.amountMinor || 0), 0);
  const monthlyExpenseMinor = monthlyMovements
    .filter((movement) => movement.type === MovementType.EXPENSE || movement.type === MovementType.FEE)
    .reduce((total, movement) => total + Number(movement.amountMinor || 0), 0);
  const totalBalanceMinor = accounts.reduce(
    (total, account) => total + Number(account.currentBalanceMinor || 0),
    0,
  );
  const savingsRate =
    monthlyIncomeMinor > 0
      ? Math.max(0, Math.round(((monthlyIncomeMinor - monthlyExpenseMinor) / monthlyIncomeMinor) * 100))
      : 0;

  return {
    accounts,
    latestMovements: movements.slice(0, 5),
    monthlyExpense: fromMinorUnits(monthlyExpenseMinor),
    monthlyIncome: fromMinorUnits(monthlyIncomeMinor),
    upcomingObligations: getUpcomingObligations(obligations, scheduledPayments),
    savingsRate,
    totalBalance: fromMinorUnits(totalBalanceMinor),
  };
}

function getUpcomingObligations(obligations, scheduledPayments) {
  return [
    ...obligations
      .filter((obligation) => obligation.status === "active")
      .map((obligation) => ({
        amountMinor: obligation.pendingAmountMinor,
        currency: obligation.currency,
        date: obligation.dueDate,
        id: `obligation-${obligation.id}`,
        label: obligation.personName,
        source: "debt",
      })),
    ...scheduledPayments
      .filter((payment) => payment.status === "active")
      .map((payment) => ({
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        date: payment.nextDueDate,
        id: `scheduled-${payment.id}`,
        label: payment.name,
        source: "fixed",
      })),
  ]
    .sort((left, right) => getDateMillis(left.date) - getDateMillis(right.date))
    .slice(0, 3);
}

function getDateMillis(value) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  if (value?.toDate) return value.toDate().getTime();
  return new Date(value).getTime();
}
