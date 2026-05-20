import { create } from "zustand";

import { getDashboardSummary } from "../lib/firebase/repositories/dashboard-repository";

function mapDataError(error) {
  return error?.message || "No pudimos cargar tu dashboard.";
}

export const useDashboardStore = create((set) => ({
  accounts: [],
  error: "",
  latestMovements: [],
  monthlyExpense: 0,
  monthlyIncome: 0,
  savingsRate: 0,
  status: "idle",
  totalBalance: 0,
  upcomingObligations: [],

  loadDashboard: async (uid) => {
    if (!uid) return;

    set({ error: "", status: "loading" });

    try {
      const summary = await getDashboardSummary(uid);
      set({ ...summary, status: "ready" });
    } catch (error) {
      set({ error: mapDataError(error), status: "error" });
    }
  },

  reset: () =>
    set({
      accounts: [],
      error: "",
      latestMovements: [],
      monthlyExpense: 0,
      monthlyIncome: 0,
      savingsRate: 0,
      status: "idle",
      totalBalance: 0,
      upcomingObligations: [],
    }),
}));
