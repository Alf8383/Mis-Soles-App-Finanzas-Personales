import {
  addDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { AccountType, CurrencyCode } from "../../domain/enums";
import { toMinorUnits } from "../../domain/money";
import { getUserAccount, getUserAccounts } from "../paths";

function accountFromDoc(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function listAccounts(uid, { includeArchived = false } = {}) {
  const snapshot = await getDocs(getUserAccounts(uid));
  return snapshot.docs
    .map(accountFromDoc)
    .filter((account) => includeArchived || !account.isArchived)
    .sort((left, right) => Number(Boolean(right.isInitial)) - Number(Boolean(left.isInitial)));
}

export async function createAccount(uid, values) {
  const now = serverTimestamp();
  const openingBalanceMinor = toMinorUnits(values.openingBalance ?? 0);

  const accountRef = await addDoc(getUserAccounts(uid), {
    createdAt: now,
    currency: values.currency ?? CurrencyCode.PEN,
    currentBalanceMinor: openingBalanceMinor,
    isArchived: false,
    isInitial: false,
    name: values.name.trim(),
    openingBalanceMinor,
    type: values.type ?? AccountType.CASH,
    updatedAt: now,
  });

  return accountRef.id;
}

export async function updateAccount(uid, accountId, values) {
  const payload = {
    updatedAt: serverTimestamp(),
  };

  if (values.name) payload.name = values.name.trim();
  if (values.type) payload.type = values.type;
  if (values.currency) payload.currency = values.currency;

  await updateDoc(getUserAccount(uid, accountId), payload);
}

export async function archiveAccount(uid, accountId) {
  await updateDoc(getUserAccount(uid, accountId), {
    archivedAt: serverTimestamp(),
    isArchived: true,
    updatedAt: serverTimestamp(),
  });
}
