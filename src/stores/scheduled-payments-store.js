import { create } from "zustand";

import {
  archiveScheduledPayment,
  createScheduledPayment,
  listScheduledPayments,
  markScheduledPaymentAsPaid,
} from "../lib/firebase/repositories/scheduled-payments-repository";

function mapDataError(error) {
  return error?.message || "No pudimos cargar tus pagos fijos.";
}

export const useScheduledPaymentsStore = create((set, get) => ({
  error: "",
  scheduledPayments: [],
  status: "idle",

  loadScheduledPayments: async (uid) => {
    if (!uid) return;

    set({ error: "", status: "loading" });

    try {
      const scheduledPayments = await listScheduledPayments(uid);
      set({ scheduledPayments, status: "ready" });
    } catch (error) {
      set({ error: mapDataError(error), status: "error" });
    }
  },

  createScheduledPayment: async (uid, values) => {
    set({ error: "", status: "saving" });

    try {
      const scheduledPaymentId = await createScheduledPayment(uid, values);
      await get().loadScheduledPayments(uid);
      return { error: "", scheduledPaymentId };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message, scheduledPaymentId: "" };
    }
  },

  markAsPaid: async (uid, scheduledPaymentId, values) => {
    set({ error: "", status: "saving" });

    try {
      const movementId = await markScheduledPaymentAsPaid(uid, scheduledPaymentId, values);
      await get().loadScheduledPayments(uid);
      return { error: "", movementId };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message, movementId: "" };
    }
  },

  archiveScheduledPayment: async (uid, scheduledPaymentId) => {
    set({ error: "", status: "saving" });

    try {
      await archiveScheduledPayment(uid, scheduledPaymentId);
      await get().loadScheduledPayments(uid);
      return { error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message };
    }
  },

  reset: () => set({ error: "", scheduledPayments: [], status: "idle" }),
}));
