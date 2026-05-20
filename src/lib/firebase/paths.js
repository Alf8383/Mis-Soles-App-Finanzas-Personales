import { collection, doc } from "firebase/firestore";

import { db } from "./client";

export function assertFirestoreReady() {
  if (!db) {
    throw new Error(
      "Falta configurar Firebase. Completa las variables EXPO_PUBLIC_FIREBASE_* en tu .env.",
    );
  }
}

export function getUserRoot(uid) {
  assertFirestoreReady();
  return doc(db, "users", uid);
}

export function getUserProfile(uid) {
  assertFirestoreReady();
  return doc(db, "users", uid, "profile", "main");
}

export function getUserSettings(uid) {
  assertFirestoreReady();
  return doc(db, "users", uid, "settings", "app");
}

export function getUserAccounts(uid) {
  assertFirestoreReady();
  return collection(db, "users", uid, "accounts");
}

export function getUserAccount(uid, accountId) {
  assertFirestoreReady();
  return doc(db, "users", uid, "accounts", accountId);
}

export function getInitialAccount(uid) {
  assertFirestoreReady();
  return doc(db, "users", uid, "accounts", "initial");
}

export function getUserCategories(uid) {
  assertFirestoreReady();
  return collection(db, "users", uid, "categories");
}

export function getUserCategory(uid, categoryId) {
  assertFirestoreReady();
  return doc(db, "users", uid, "categories", categoryId);
}

export function getUserMovements(uid) {
  assertFirestoreReady();
  return collection(db, "users", uid, "movements");
}

export function getUserMovement(uid, movementId) {
  assertFirestoreReady();
  return doc(db, "users", uid, "movements", movementId);
}

export function getOnboardingStateRef(uid) {
  assertFirestoreReady();
  return doc(db, "users", uid, "onboarding", "state");
}
