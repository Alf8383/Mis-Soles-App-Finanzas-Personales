import { create } from "zustand";

import { listCategories } from "../lib/firebase/repositories/categories-repository";
import {
  archiveMovement,
  createMovement,
  listMovements,
} from "../lib/firebase/repositories/movements-repository";

function mapDataError(error) {
  return error?.message || "No pudimos cargar tus movimientos.";
}

export const useMovementsStore = create((set, get) => ({
  categories: [],
  error: "",
  movements: [],
  query: "",
  status: "idle",

  loadMovements: async (uid) => {
    if (!uid) return;

    set({ error: "", status: "loading" });

    try {
      const [movements, categories] = await Promise.all([
        listMovements(uid, { max: 120 }),
        listCategories(uid),
      ]);
      set({ categories, movements, status: "ready" });
    } catch (error) {
      set({ error: mapDataError(error), status: "error" });
    }
  },

  createMovement: async (uid, values) => {
    set({ error: "", status: "saving" });

    try {
      const movementId = await createMovement(uid, values);
      await get().loadMovements(uid);
      set({ status: "ready" });
      return { error: "", movementId };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message, movementId: "" };
    }
  },

  archiveMovement: async (uid, movementId) => {
    set({ error: "", status: "saving" });

    try {
      await archiveMovement(uid, movementId);
      await get().loadMovements(uid);
      set({ status: "ready" });
      return { error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message };
    }
  },

  setQuery: (query) => set({ query }),
  reset: () => set({ categories: [], error: "", movements: [], query: "", status: "idle" }),
}));
