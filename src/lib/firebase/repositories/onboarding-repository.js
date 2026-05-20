import { getDoc, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";

import { DEFAULT_CATEGORIES } from "../../domain/defaults";
import { AccountType } from "../../domain/enums";
import { toMinorUnits } from "../../domain/money";
import { db } from "../client";
import { getInitialAccount, getOnboardingStateRef, getUserCategory, getUserSettings } from "../paths";
import { ensureUserProfile } from "./user-repository";

export async function getOnboardingState(uid) {
  const onboardingRef = getOnboardingStateRef(uid);
  const snapshot = await getDoc(onboardingRef);

  if (!snapshot.exists()) {
    return {
      completed: false,
      version: 1,
    };
  }

  return snapshot.data();
}

export async function completeOnboarding({
  exchangeRate,
  initialAccount,
  primaryCurrency,
  user,
}) {
  if (!user?.uid) {
    throw new Error("Se requiere un usuario autenticado para completar el onboarding.");
  }

  await ensureUserProfile({ user });

  const now = serverTimestamp();
  const batch = writeBatch(db);
  const accountName = initialAccount?.name?.trim() || "Billetera";
  const balanceMinor = toMinorUnits(initialAccount?.balance ?? 0);

  batch.set(
    getUserSettings(user.uid),
    {
      createdAt: now,
      exchangeRate: Number(exchangeRate),
      exchangeRateUpdatedAt: now,
      onboardingCompleted: true,
      primaryCurrency,
      updatedAt: now,
    },
    { merge: true },
  );

  batch.set(
    getInitialAccount(user.uid),
    {
      createdAt: now,
      currency: primaryCurrency,
      currentBalanceMinor: balanceMinor,
      isArchived: false,
      isInitial: true,
      name: accountName,
      openingBalanceMinor: balanceMinor,
      type: initialAccount?.type ?? AccountType.CASH,
      updatedAt: now,
    },
    { merge: true },
  );

  for (const category of DEFAULT_CATEGORIES) {
    batch.set(
      getUserCategory(user.uid, category.id),
      {
        color: category.color,
        createdAt: now,
        icon: category.icon,
        isDefault: true,
        kind: category.kind,
        name: category.name,
        updatedAt: now,
      },
      { merge: true },
    );
  }

  batch.set(
    getOnboardingStateRef(user.uid),
    {
      completed: true,
      completedAt: now,
      version: 1,
    },
    { merge: true },
  );

  await batch.commit();

  return getOnboardingState(user.uid);
}
