import { create } from "zustand";

export const useOnboardingStore = create((set) => ({
  primaryCurrency: "PEN",
  exchangeRate: "3.75",
  initialAccount: {
    name: "Billetera",
    balance: 0,
  },
  setPrimaryCurrency: (currency) =>
    set({
      primaryCurrency: currency,
    }),
  setExchangeRate: (exchangeRate) =>
    set({
      exchangeRate,
    }),
  setInitialAccount: (initialAccount) =>
    set({
      initialAccount,
    }),
  reset: () =>
    set({
      primaryCurrency: "PEN",
      exchangeRate: "3.75",
      initialAccount: {
        name: "Billetera",
        balance: 0,
      },
    }),
}));
