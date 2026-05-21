import { getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

import { getUserProfile, getUserSettings } from "../paths";

export async function getAppSettings(uid) {
  const snapshot = await getDoc(getUserSettings(uid));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function updateExchangeRate(uid, exchangeRate) {
  await updateDoc(getUserSettings(uid), {
    exchangeRate: Number(exchangeRate),
    exchangeRateUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserProfileInfo(uid) {
  const snapshot = await getDoc(getUserProfile(uid));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}
