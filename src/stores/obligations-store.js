import { create } from "zustand";

import {
  archiveObligation,
  createObligation,
  listObligations,
  payObligationInFull,
  registerObligationPayment,
} from "../lib/firebase/repositories/obligations-repository";

function mapDataError(error) {
  return error?.message || "No pudimos cargar tus obligaciones.";
}

export const useObligationsStore = create((set, get) => ({
  error: "",
  obligations: [],
  status: "idle",

  loadObligations: async (uid) => {
    if (!uid) return;

    set({ error: "", status: "loading" });

    try {
      const obligations = await listObligations(uid);
      set({ obligations, status: "ready" });
    } catch (error) {
      set({ error: mapDataError(error), status: "error" });
    }
  },

  createObligation: async (uid, values) => {
    set({ error: "", status: "saving" });

    try {
      const obligationId = await createObligation(uid, values);
      await get().loadObligations(uid);
      return { error: "", obligationId };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message, obligationId: "" };
    }
  },

  registerPayment: async (uid, obligationId, values) => {
    set({ error: "", status: "saving" });

    try {
      const movementId = await registerObligationPayment(uid, obligationId, values);
      await get().loadObligations(uid);
      return { error: "", movementId };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message, movementId: "" };
    }
  },

  payInFull: async (uid, obligationId, values) => {
    set({ error: "", status: "saving" });

    try {
      const movementId = await payObligationInFull(uid, obligationId, values);
      await get().loadObligations(uid);
      return { error: "", movementId };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message, movementId: "" };
    }
  },

  archiveObligation: async (uid, obligationId) => {
    set({ error: "", status: "saving" });

    try {
      await archiveObligation(uid, obligationId);
      await get().loadObligations(uid);
      return { error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message };
    }
  },

  reset: () => set({ error: "", obligations: [], status: "idle" }),
}));
