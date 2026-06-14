import { addMonths, addWeeks } from "date-fns";
import {
  addDoc,
  getDocs,
  increment,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  MovementType,
  RecordStatus,
  ScheduledPaymentFrequency,
} from "../../domain/enums";
import { toMinorUnits } from "../../domain/money";
import { db } from "../client";
import {
  getUserAccount,
  getUserMovement,
  getUserScheduledPayment,
  getUserScheduledPayments,
} from "../paths";

function assertUid(uid) {
  if (!uid) {
    throw new Error("Se requiere un usuario autenticado.");
  }
}

function scheduledPaymentFromDoc(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

function createClientId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getDateMillis(value) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  if (value?.toDate) return value.toDate().getTime();
  return new Date(value).getTime();
}

function getNextDueDate(currentDate, frequency) {
  const baseDate = currentDate ? new Date(currentDate) : new Date();
  const nextDate =
    frequency === ScheduledPaymentFrequency.WEEKLY ? addWeeks(baseDate, 1) : addMonths(baseDate, 1);

  return nextDate.toISOString().slice(0, 10);
}

export async function listScheduledPayments(uid, { includeArchived = false } = {}) {
  assertUid(uid);
  const snapshot = await getDocs(getUserScheduledPayments(uid));

  return snapshot.docs
    .map(scheduledPaymentFromDoc)
    .filter((payment) => includeArchived || payment.status !== RecordStatus.ARCHIVED)
    .sort((left, right) => getDateMillis(left.nextDueDate) - getDateMillis(right.nextDueDate));
}

export async function createScheduledPayment(uid, values) {
  assertUid(uid);
  const now = serverTimestamp();

  const paymentRef = await addDoc(getUserScheduledPayments(uid), {
    accountId: values.accountId,
    amountMinor: toMinorUnits(values.amount),
    archivedAt: null,
    categoryId: values.categoryId,
    createdAt: now,
    currency: values.currency,
    frequency: values.frequency,
    lastPaidAt: null,
    name: values.name.trim(),
    nextDueDate: values.nextDueDate,
    status: RecordStatus.ACTIVE,
    updatedAt: now,
  });

  return paymentRef.id;
}

export async function markScheduledPaymentAsPaid(uid, scheduledPaymentId, values = {}) {
  assertUid(uid);

  // Marcar como pagado crea un movimiento real y mueve el proximo vencimiento.
  return runTransaction(db, async (transaction) => {
    const paymentRef = getUserScheduledPayment(uid, scheduledPaymentId);
    const paymentSnapshot = await transaction.get(paymentRef);

    if (!paymentSnapshot.exists()) {
      throw new Error("No encontramos el pago fijo.");
    }

    const payment = paymentSnapshot.data();

    if (payment.status !== RecordStatus.ACTIVE) {
      throw new Error("Este pago fijo ya no está activo.");
    }

    const accountRef = getUserAccount(uid, payment.accountId);
    const accountSnapshot = await transaction.get(accountRef);

    if (!accountSnapshot.exists()) {
      throw new Error("No encontramos la cuenta vinculada.");
    }

    const now = serverTimestamp();
    const movementRef = getUserMovement(uid, createClientId("fixed-payment"));
    const paidDate = values.date || new Date().toISOString();

    transaction.set(movementRef, {
      accountId: payment.accountId,
      amountMinor: payment.amountMinor,
      archivedAt: null,
      categoryId: payment.categoryId,
      createdAt: now,
      currency: payment.currency,
      date: paidDate,
      description: values.description?.trim() || payment.name,
      scheduledPaymentId,
      status: RecordStatus.ACTIVE,
      type: MovementType.EXPENSE,
      updatedAt: now,
    });

    transaction.update(accountRef, {
      currentBalanceMinor: increment(-Number(payment.amountMinor || 0)),
      updatedAt: now,
    });

    transaction.update(paymentRef, {
      lastPaidAt: now,
      nextDueDate: getNextDueDate(payment.nextDueDate, payment.frequency),
      updatedAt: now,
    });

    return movementRef.id;
  });
}

export async function archiveScheduledPayment(uid, scheduledPaymentId) {
  assertUid(uid);
  await updateDoc(getUserScheduledPayment(uid, scheduledPaymentId), {
    archivedAt: serverTimestamp(),
    status: RecordStatus.ARCHIVED,
    updatedAt: serverTimestamp(),
  });
}
