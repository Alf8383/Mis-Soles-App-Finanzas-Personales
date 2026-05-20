import {
  addDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  DEFAULT_BUDGET_ALERT_THRESHOLD,
  DEFAULT_BUDGET_PERIOD,
} from "../../domain/defaults";
import { BudgetPeriod, MovementType, RecordStatus } from "../../domain/enums";
import { toMinorUnits } from "../../domain/money";
import { getThisMonthRange, getThisWeekRange } from "../../utils";
import { getUserBudget, getUserBudgets } from "../paths";
import { listMovements } from "./movements-repository";

function assertUid(uid) {
  if (!uid) {
    throw new Error("Se requiere un usuario autenticado.");
  }
}

function budgetFromDoc(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

function isInRange(value, range) {
  const date = value?.toDate ? value.toDate() : new Date(value);
  const millis = date.getTime();
  return millis >= range.start.getTime() && millis <= range.end.getTime();
}

function getRangeForPeriod(period) {
  return period === BudgetPeriod.WEEKLY ? getThisWeekRange() : getThisMonthRange();
}

export async function listBudgets(uid, { includeArchived = false } = {}) {
  assertUid(uid);
  const snapshot = await getDocs(getUserBudgets(uid));

  return snapshot.docs
    .map(budgetFromDoc)
    .filter((budget) => includeArchived || budget.status !== RecordStatus.ARCHIVED)
    .sort((left, right) => String(left.categoryId).localeCompare(String(right.categoryId)));
}

export async function createBudget(uid, values) {
  assertUid(uid);
  const now = serverTimestamp();

  const budgetRef = await addDoc(getUserBudgets(uid), {
    alertThreshold: Number(values.alertThreshold || DEFAULT_BUDGET_ALERT_THRESHOLD),
    archivedAt: null,
    categoryId: values.categoryId,
    createdAt: now,
    currency: values.currency,
    limitMinor: toMinorUnits(values.limit),
    period: values.period || DEFAULT_BUDGET_PERIOD,
    status: RecordStatus.ACTIVE,
    updatedAt: now,
  });

  return budgetRef.id;
}

export async function updateBudget(uid, budgetId, values) {
  assertUid(uid);
  const payload = {
    updatedAt: serverTimestamp(),
  };

  if (values.categoryId) payload.categoryId = values.categoryId;
  if (values.currency) payload.currency = values.currency;
  if (values.limit !== undefined) payload.limitMinor = toMinorUnits(values.limit);
  if (values.period) payload.period = values.period;
  if (values.alertThreshold !== undefined) payload.alertThreshold = Number(values.alertThreshold);

  await updateDoc(getUserBudget(uid, budgetId), payload);
}

export async function archiveBudget(uid, budgetId) {
  assertUid(uid);
  await updateDoc(getUserBudget(uid, budgetId), {
    archivedAt: serverTimestamp(),
    status: RecordStatus.ARCHIVED,
    updatedAt: serverTimestamp(),
  });
}

export async function getBudgetProgress(uid) {
  const [budgets, movements] = await Promise.all([
    listBudgets(uid),
    listMovements(uid, { max: 500 }),
  ]);

  return budgets.map((budget) => {
    const range = getRangeForPeriod(budget.period);
    const spentMinor = movements
      .filter(
        (movement) =>
          movement.type === MovementType.EXPENSE &&
          movement.categoryId === budget.categoryId &&
          movement.currency === budget.currency &&
          isInRange(movement.date, range),
      )
      .reduce((total, movement) => total + Number(movement.amountMinor || 0), 0);
    const limitMinor = Number(budget.limitMinor || 0);
    const progress = limitMinor > 0 ? Math.round((spentMinor / limitMinor) * 100) : 0;

    return {
      ...budget,
      progress,
      spentMinor,
    };
  });
}
