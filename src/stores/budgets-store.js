import { create } from "zustand";

import {
  archiveBudget,
  createBudget,
  getBudgetProgress,
  updateBudget,
} from "../lib/firebase/repositories/budgets-repository";

function mapDataError(error) {
  return error?.message || "No pudimos cargar tus presupuestos.";
}

export const useBudgetsStore = create((set, get) => ({
  budgets: [],
  error: "",
  status: "idle",

  loadBudgets: async (uid) => {
    if (!uid) return;

    set({ error: "", status: "loading" });

    try {
      const budgets = await getBudgetProgress(uid);
      set({ budgets, status: "ready" });
    } catch (error) {
      set({ error: mapDataError(error), status: "error" });
    }
  },

  createBudget: async (uid, values) => {
    set({ error: "", status: "saving" });

    try {
      const budgetId = await createBudget(uid, values);
      await get().loadBudgets(uid);
      return { budgetId, error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { budgetId: "", error: message };
    }
  },

  updateBudget: async (uid, budgetId, values) => {
    set({ error: "", status: "saving" });

    try {
      await updateBudget(uid, budgetId, values);
      await get().loadBudgets(uid);
      return { error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message };
    }
  },

  archiveBudget: async (uid, budgetId) => {
    set({ error: "", status: "saving" });

    try {
      await archiveBudget(uid, budgetId);
      await get().loadBudgets(uid);
      return { error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message };
    }
  },

  reset: () => set({ budgets: [], error: "", status: "idle" }),
}));
