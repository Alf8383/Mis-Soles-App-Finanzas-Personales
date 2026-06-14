import { addDays, format, startOfWeek } from "date-fns";

import { DEFAULT_CATEGORY_ICON } from "../../domain/category-icons";
import { MovementType } from "../../domain/enums";
import { fromMinorUnits } from "../../domain/money";
import { getPreviousMonthRange, getThisMonthRange } from "../../utils";
import { listCategories } from "./categories-repository";
import { listMovements } from "./movements-repository";

function getMovementDate(value) {
  if (value?.toDate) return value.toDate();
  return new Date(value);
}

function isInRange(value, range) {
  const date = getMovementDate(value);
  const millis = date.getTime();
  return millis >= range.start.getTime() && millis <= range.end.getTime();
}

function getRange(periodKey) {
  return periodKey === "previous_month" ? getPreviousMonthRange() : getThisMonthRange();
}

export async function getStatisticsSummary(uid, { period = "this_month" } = {}) {
  const [movements, categories] = await Promise.all([
    listMovements(uid, { max: 500 }),
    listCategories(uid),
  ]);
  const range = getRange(period);
  const periodMovements = movements.filter((movement) => isInRange(movement.date, range));
  const incomeMinor = periodMovements
    .filter((movement) => movement.type === MovementType.INCOME)
    .reduce((total, movement) => total + Number(movement.amountMinor || 0), 0);
  const expenseMinor = periodMovements
    .filter((movement) => movement.type === MovementType.EXPENSE || movement.type === MovementType.FEE)
    .reduce((total, movement) => total + Number(movement.amountMinor || 0), 0);
  const categoryTotals = getCategoryTotals(periodMovements, categories, expenseMinor);
  const weeklyBars = getWeeklyBars(periodMovements);
  const savingsRate =
    incomeMinor > 0 ? Math.max(0, Math.round(((incomeMinor - expenseMinor) / incomeMinor) * 100)) : 0;

  return {
    categoryTotals,
    expense: fromMinorUnits(expenseMinor),
    income: fromMinorUnits(incomeMinor),
    net: fromMinorUnits(incomeMinor - expenseMinor),
    period,
    savingsRate,
    weeklyBars,
  };
}

function getCategoryTotals(movements, categories, totalExpenseMinor) {
  const totalsByCategory = new Map();

  movements
    .filter((movement) => movement.type === MovementType.EXPENSE || movement.type === MovementType.FEE)
    .forEach((movement) => {
      const key = movement.categoryId || "sin-categoria";
      totalsByCategory.set(key, (totalsByCategory.get(key) || 0) + Number(movement.amountMinor || 0));
    });

  return Array.from(totalsByCategory.entries())
    .map(([categoryId, amountMinor]) => {
      const category = categories.find((item) => item.id === categoryId);

      return {
        amount: fromMinorUnits(amountMinor),
        amountMinor,
        categoryId,
        color: category?.color || "#EF9F27",
        icon: category?.icon || DEFAULT_CATEGORY_ICON,
        name: category?.name || "Sin categoría",
        percent: totalExpenseMinor > 0 ? Math.round((amountMinor / totalExpenseMinor) * 100) : 0,
      };
    })
    .sort((left, right) => right.amountMinor - left.amountMinor);
}

function getWeeklyBars(movements) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  return Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(weekStart, index);
    const dayKey = format(date, "yyyy-MM-dd");
    const expenseMinor = movements
      .filter((movement) => {
        const movementDate = getMovementDate(movement.date);
        return (
          format(movementDate, "yyyy-MM-dd") === dayKey &&
          (movement.type === MovementType.EXPENSE || movement.type === MovementType.FEE)
        );
      })
      .reduce((total, movement) => total + Number(movement.amountMinor || 0), 0);

    return {
      amount: fromMinorUnits(expenseMinor),
      amountMinor: expenseMinor,
      label: format(date, "EEE"),
    };
  });
}
