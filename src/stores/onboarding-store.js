import { create } from "zustand";

import {
  DEFAULT_EXCHANGE_RATE,
  DEFAULT_INITIAL_ACCOUNT,
  DEFAULT_PRIMARY_CURRENCY,
} from "../lib/domain/defaults";
import { completeOnboarding, getOnboardingState } from "../lib/firebase/repositories/onboarding-repository";

function defaultState() {
  return {
    error: "",
    exchangeRate: String(DEFAULT_EXCHANGE_RATE),
    initialAccount: {
      ...DEFAULT_INITIAL_ACCOUNT,
      balance: String(DEFAULT_INITIAL_ACCOUNT.balance),
    },
    isCompleted: false,
    primaryCurrency: DEFAULT_PRIMARY_CURRENCY,
    status: "idle",
  };
}

function mapOnboardingError(error) {
  const message = error?.message || String(error);
  const normalizedMessage = message.toLowerCase();

  if (message.includes("EXPO_PUBLIC_FIREBASE")) {
    return message;
  }

  if (normalizedMessage.includes("database") && normalizedMessage.includes("not found")) {
    return "Firestore no tiene creada la base de datos configurada. Crea la base '(default)' en Firebase Console o define EXPO_PUBLIC_FIREBASE_DATABASE_ID si usas una base con otro ID.";
  }

  if (normalizedMessage.includes("client is offline")) {
    return "Firestore no pudo leer datos. Revisa que la base exista en Firebase Console, que el projectId del .env sea correcto y que tengas conexion.";
  }

  if (normalizedMessage.includes("permission")) {
    return "No tienes permisos para guardar esta configuracion. Revisa las reglas de Firestore.";
  }

  if (normalizedMessage.includes("network")) {
    return "No pudimos conectar con Firestore. Revisa tu conexion e intenta otra vez.";
  }

  return message || "No pudimos guardar el onboarding.";
}

export const useOnboardingStore = create((set, get) => ({
  ...defaultState(),

  clearError: () => {
    set({ error: "" });
  },

  loadOnboardingState: async (uid) => {
    if (!uid) {
      set({ isCompleted: false, status: "idle" });
      return { completed: false };
    }

    set({ error: "", status: "loading" });

    try {
      const state = await getOnboardingState(uid);
      const completed = Boolean(state.completed);
      set({
        error: "",
        isCompleted: completed,
        status: "idle",
      });
      return { completed };
    } catch (error) {
      set({
        error: mapOnboardingError(error),
        isCompleted: false,
        status: "idle",
      });
      return { completed: false, error };
    }
  },

  reset: () => {
    set(defaultState());
  },

  setExchangeRate: (exchangeRate) => {
    set({ exchangeRate, error: "" });
  },

  setInitialAccount: (initialAccount) => {
    set((state) => ({
      error: "",
      initialAccount: {
        ...state.initialAccount,
        ...initialAccount,
      },
    }));
  },

  setPrimaryCurrency: (currency) => {
    set({
      error: "",
      primaryCurrency: currency,
    });
  },

  submitOnboarding: async ({ user }) => {
    const { exchangeRate, initialAccount, primaryCurrency } = get();
    const parsedExchangeRate = Number(exchangeRate);
    const parsedBalance = Number(initialAccount.balance);

    if (!Number.isFinite(parsedExchangeRate) || parsedExchangeRate <= 0) {
      set({ error: "Ingresa un tipo de cambio valido." });
      return { completed: false, error: "Ingresa un tipo de cambio valido." };
    }

    if (!initialAccount.name?.trim()) {
      set({ error: "Ingresa un nombre para tu cuenta inicial." });
      return { completed: false, error: "Ingresa un nombre para tu cuenta inicial." };
    }

    if (!Number.isFinite(parsedBalance) || parsedBalance < 0) {
      set({ error: "Ingresa un saldo inicial valido." });
      return { completed: false, error: "Ingresa un saldo inicial valido." };
    }

    set({ error: "", status: "submitting" });

    try {
      const state = await completeOnboarding({
        exchangeRate: parsedExchangeRate,
        initialAccount: {
          ...initialAccount,
          balance: parsedBalance,
        },
        primaryCurrency,
        user,
      });
      const completed = Boolean(state.completed);
      set({
        error: "",
        isCompleted: completed,
        status: "idle",
      });
      return { completed };
    } catch (error) {
      const mappedError = mapOnboardingError(error);
      set({
        error: mappedError,
        isCompleted: false,
        status: "idle",
      });
      return { completed: false, error: mappedError };
    }
  },
}));
