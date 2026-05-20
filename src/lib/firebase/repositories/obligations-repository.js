import {
  addDoc,
  getDocs,
  increment,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { MovementType, ObligationType, RecordStatus } from "../../domain/enums";
import { toMinorUnits } from "../../domain/money";
import { db } from "../client";
import {
  getUserAccount,
  getUserMovement,
  getUserObligation,
  getUserObligations,
} from "../paths";

function assertUid(uid) {
  if (!uid) {
    throw new Error("Se requiere un usuario autenticado.");
  }
}

function obligationFromDoc(snapshot) {
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

export async function listObligations(uid, { includeArchived = false } = {}) {
  assertUid(uid);
  const snapshot = await getDocs(getUserObligations(uid));

  return snapshot.docs
    .map(obligationFromDoc)
    .filter((obligation) => includeArchived || obligation.status !== RecordStatus.ARCHIVED)
    .sort((left, right) => getDateMillis(left.dueDate) - getDateMillis(right.dueDate));
}

export async function createObligation(uid, values) {
  assertUid(uid);
  const amountMinor = toMinorUnits(values.amount);
  const now = serverTimestamp();

  const obligationRef = await addDoc(getUserObligations(uid), {
    archivedAt: null,
    createdAt: now,
    currency: values.currency,
    dueDate: values.dueDate || "",
    note: values.note?.trim() || "",
    originalAmountMinor: amountMinor,
    paidAt: null,
    pendingAmountMinor: amountMinor,
    personName: values.personName.trim(),
    status: RecordStatus.ACTIVE,
    type: values.type,
    updatedAt: now,
  });

  return obligationRef.id;
}

export async function registerObligationPayment(uid, obligationId, values) {
  assertUid(uid);
  const paymentMinor = toMinorUnits(values.amount);

  return runTransaction(db, async (transaction) => {
    const obligationRef = getUserObligation(uid, obligationId);
    const accountRef = getUserAccount(uid, values.accountId);
    const obligationSnapshot = await transaction.get(obligationRef);
    const accountSnapshot = await transaction.get(accountRef);

    if (!obligationSnapshot.exists()) {
      throw new Error("No encontramos la deuda seleccionada.");
    }

    if (!accountSnapshot.exists()) {
      throw new Error("No encontramos la cuenta seleccionada.");
    }

    const obligation = obligationSnapshot.data();

    if (obligation.status !== RecordStatus.ACTIVE) {
      throw new Error("Esta deuda ya no está activa.");
    }

    if (paymentMinor <= 0 || paymentMinor > Number(obligation.pendingAmountMinor || 0)) {
      throw new Error("El abono debe ser mayor a 0 y no superar el pendiente.");
    }

    const now = serverTimestamp();
    const movementType =
      obligation.type === ObligationType.DEBT_I_OWE ? MovementType.EXPENSE : MovementType.INCOME;
    const nextPending = Number(obligation.pendingAmountMinor || 0) - paymentMinor;
    const movementRef = getUserMovement(uid, createClientId("debt-payment"));

    transaction.set(movementRef, {
      accountId: values.accountId,
      amountMinor: paymentMinor,
      archivedAt: null,
      categoryId: values.categoryId,
      createdAt: now,
      currency: obligation.currency,
      date: values.date || new Date().toISOString(),
      description:
        values.description?.trim() ||
        `${movementType === MovementType.EXPENSE ? "Abono a" : "Cobro de"} ${obligation.personName}`,
      obligationId,
      status: RecordStatus.ACTIVE,
      type: movementType,
      updatedAt: now,
    });

    transaction.update(accountRef, {
      currentBalanceMinor: increment(
        movementType === MovementType.EXPENSE ? -paymentMinor : paymentMinor,
      ),
      updatedAt: now,
    });

    transaction.update(obligationRef, {
      paidAt: nextPending === 0 ? now : null,
      pendingAmountMinor: nextPending,
      status: nextPending === 0 ? RecordStatus.PAID : RecordStatus.ACTIVE,
      updatedAt: now,
    });

    return movementRef.id;
  });
}

export async function payObligationInFull(uid, obligationId, values) {
  assertUid(uid);
  const obligations = await listObligations(uid, { includeArchived: true });
  const obligation = obligations.find((item) => item.id === obligationId);

  if (!obligation) {
    throw new Error("No encontramos la deuda seleccionada.");
  }

  return registerObligationPayment(uid, obligationId, {
    ...values,
    amount: Number(obligation.pendingAmountMinor || 0) / 100,
  });
}

export async function archiveObligation(uid, obligationId) {
  assertUid(uid);
  await updateDoc(getUserObligation(uid, obligationId), {
    archivedAt: serverTimestamp(),
    status: RecordStatus.ARCHIVED,
    updatedAt: serverTimestamp(),
  });
}
