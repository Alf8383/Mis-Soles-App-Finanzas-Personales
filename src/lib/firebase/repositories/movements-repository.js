import {
  getDoc,
  getDocs,
  increment,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { MovementType, RecordStatus } from "../../domain/enums";
import { toMinorUnits } from "../../domain/money";
import { db } from "../client";
import { getUserAccount, getUserMovement, getUserMovements } from "../paths";

function movementFromDoc(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

function assertUid(uid) {
  if (!uid) {
    throw new Error("Se requiere un usuario autenticado.");
  }
}

function normalizeMovementInput(values) {
  return {
    ...values,
    amountMinor: toMinorUnits(values.amount),
    feeMinor: toMinorUnits(values.fee ?? 0),
  };
}

export async function listMovements(uid, { max = 100 } = {}) {
  assertUid(uid);
  const snapshot = await getDocs(getUserMovements(uid));

  return snapshot.docs
    .map(movementFromDoc)
    .filter((movement) => movement.status === RecordStatus.ACTIVE)
    .sort((left, right) => getMovementMillis(right) - getMovementMillis(left))
    .slice(0, max);
}

export async function createMovement(uid, values) {
  assertUid(uid);
  const normalized = normalizeMovementInput(values);

  if (normalized.type === MovementType.TRANSFER) {
    return createTransfer(uid, normalized);
  }

  return createIncomeOrExpense(uid, normalized);
}

async function createIncomeOrExpense(uid, values) {
  return runTransaction(db, async (transaction) => {
    const accountRef = getUserAccount(uid, values.accountId);
    const accountSnapshot = await transaction.get(accountRef);

    if (!accountSnapshot.exists()) {
      throw new Error("No encontramos la cuenta seleccionada.");
    }

    const now = serverTimestamp();
    const movementRef = getUserMovement(uid, createClientId(values.type));

    transaction.set(movementRef, {
      accountId: values.accountId,
      amountMinor: values.amountMinor,
      archivedAt: null,
      categoryId: values.categoryId,
      createdAt: now,
      currency: values.currency,
      date: values.date,
      description: values.description?.trim() || "",
      status: RecordStatus.ACTIVE,
      type: values.type,
      updatedAt: now,
    });

    transaction.update(accountRef, {
      currentBalanceMinor: increment(
        values.type === MovementType.EXPENSE ? -values.amountMinor : values.amountMinor,
      ),
      updatedAt: now,
    });

    return movementRef.id;
  });
}

async function createTransfer(uid, values) {
  return runTransaction(db, async (transaction) => {
    const fromRef = getUserAccount(uid, values.fromAccountId);
    const toRef = getUserAccount(uid, values.toAccountId);
    const fromSnapshot = await transaction.get(fromRef);
    const toSnapshot = await transaction.get(toRef);

    if (!fromSnapshot.exists() || !toSnapshot.exists()) {
      throw new Error("No encontramos una de las cuentas de la transferencia.");
    }

    const fromAccount = fromSnapshot.data();
    const toAccount = toSnapshot.data();
    const exchangeRate = Number(values.exchangeRate || 1);
    const destinationAmountMinor =
      fromAccount.currency === toAccount.currency
        ? values.amountMinor
        : Math.round(values.amountMinor * exchangeRate);
    const now = serverTimestamp();
    const transferRef = getUserMovement(uid, createClientId("transfer"));

    transaction.set(transferRef, {
      amountMinor: values.amountMinor,
      archivedAt: null,
      categoryId: "",
      createdAt: now,
      currency: fromAccount.currency,
      date: values.date,
      description: values.description?.trim() || "",
      exchangeRate,
      feeMinor: values.feeMinor,
      fromAccountId: values.fromAccountId,
      status: RecordStatus.ACTIVE,
      toAccountId: values.toAccountId,
      toAmountMinor: destinationAmountMinor,
      toCurrency: toAccount.currency,
      type: MovementType.TRANSFER,
      updatedAt: now,
    });

    transaction.update(fromRef, {
      currentBalanceMinor: increment(-values.amountMinor),
      updatedAt: now,
    });
    transaction.update(toRef, {
      currentBalanceMinor: increment(destinationAmountMinor),
      updatedAt: now,
    });

    if (values.feeMinor > 0) {
      const feeRef = getUserMovement(uid, createClientId("fee"));
      transaction.set(feeRef, {
        accountId: values.fromAccountId,
        amountMinor: values.feeMinor,
        archivedAt: null,
        categoryId: "",
        createdAt: now,
        currency: fromAccount.currency,
        date: values.date,
        description: "Comision por transferencia",
        relatedMovementId: transferRef.id,
        status: RecordStatus.ACTIVE,
        type: MovementType.FEE,
        updatedAt: now,
      });
      transaction.update(fromRef, {
        currentBalanceMinor: increment(-values.feeMinor),
        updatedAt: now,
      });
    }

    return transferRef.id;
  });
}

function createClientId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getMovementMillis(movement) {
  if (movement.date?.toDate) {
    return movement.date.toDate().getTime();
  }

  return new Date(movement.date).getTime();
}

export async function archiveMovement(uid, movementId) {
  assertUid(uid);

  return runTransaction(db, async (transaction) => {
    const movementRef = getUserMovement(uid, movementId);
    const movementSnapshot = await transaction.get(movementRef);

    if (!movementSnapshot.exists()) {
      throw new Error("No encontramos el movimiento.");
    }

    const movement = movementSnapshot.data();
    if (movement.status !== RecordStatus.ACTIVE) {
      return;
    }

    const now = serverTimestamp();

    if (movement.type === MovementType.EXPENSE || movement.type === MovementType.FEE) {
      transaction.update(getUserAccount(uid, movement.accountId), {
        currentBalanceMinor: increment(movement.amountMinor),
        updatedAt: now,
      });
    }

    if (movement.type === MovementType.INCOME) {
      transaction.update(getUserAccount(uid, movement.accountId), {
        currentBalanceMinor: increment(-movement.amountMinor),
        updatedAt: now,
      });
    }

    if (movement.type === MovementType.TRANSFER) {
      transaction.update(getUserAccount(uid, movement.fromAccountId), {
        currentBalanceMinor: increment(movement.amountMinor),
        updatedAt: now,
      });
      transaction.update(getUserAccount(uid, movement.toAccountId), {
        currentBalanceMinor: increment(-(movement.toAmountMinor || movement.amountMinor)),
        updatedAt: now,
      });
    }

    transaction.update(movementRef, {
      archivedAt: now,
      status: RecordStatus.ARCHIVED,
      updatedAt: now,
    });
  });
}

export async function getMovement(uid, movementId) {
  const snapshot = await getDoc(getUserMovement(uid, movementId));
  return snapshot.exists() ? movementFromDoc(snapshot) : null;
}
