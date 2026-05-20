import { create } from "zustand";

import { getStatisticsSummary } from "../lib/firebase/repositories/statistics-repository";

function mapDataError(error) {
  return error?.message || "No pudimos cargar tus estadísticas.";
}

const INITIAL_SUMMARY = {
  categoryTotals: [],
  expense: 0,
  income: 0,
  net: 0,
  savingsRate: 0,
  weeklyBars: [],
};

export const useStatisticsStore = create((set) => ({
  ...INITIAL_SUMMARY,
  error: "",
  period: "this_month",
  status: "idle",

  loadStatistics: async (uid, period = "this_month") => {
    if (!uid) return;

    set({ error: "", period, status: "loading" });

    try {
      const summary = await getStatisticsSummary(uid, { period });
      set({ ...summary, status: "ready" });
    } catch (error) {
      set({ error: mapDataError(error), status: "error" });
    }
  },

  reset: () => set({ ...INITIAL_SUMMARY, error: "", period: "this_month", status: "idle" }),
}));
