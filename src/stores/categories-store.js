import { create } from "zustand";

import {
  archiveCategory,
  createCategory,
  listCategories,
  updateCategory,
} from "../lib/firebase/repositories/categories-repository";

function mapDataError(error) {
  return error?.message || "No pudimos cargar tus categorías.";
}

export const useCategoriesStore = create((set, get) => ({
  categories: [],
  error: "",
  status: "idle",

  loadCategories: async (uid) => {
    if (!uid) return;

    set({ error: "", status: "loading" });

    try {
      const categories = await listCategories(uid);
      set({ categories, status: "ready" });
    } catch (error) {
      set({ error: mapDataError(error), status: "error" });
    }
  },

  createCategory: async (uid, values) => {
    set({ error: "", status: "saving" });

    try {
      const categoryId = await createCategory(uid, values);
      await get().loadCategories(uid);
      return { categoryId, error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { categoryId: "", error: message };
    }
  },

  updateCategory: async (uid, categoryId, values) => {
    set({ error: "", status: "saving" });

    try {
      await updateCategory(uid, categoryId, values);
      await get().loadCategories(uid);
      return { error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message };
    }
  },

  archiveCategory: async (uid, categoryId) => {
    set({ error: "", status: "saving" });

    try {
      await archiveCategory(uid, categoryId);
      await get().loadCategories(uid);
      return { error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message };
    }
  },

  reset: () => set({ categories: [], error: "", status: "idle" }),
}));
