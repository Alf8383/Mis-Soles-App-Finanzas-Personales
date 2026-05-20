import { create } from "zustand";

import {
  archiveAccount,
  createAccount,
  listAccounts,
  updateAccount,
} from "../lib/firebase/repositories/accounts-repository";

function mapDataError(error) {
  return error?.message || "No pudimos cargar tus cuentas.";
}

export const useAccountsStore = create((set, get) => ({
  accounts: [],
  error: "",
  selectedAccountId: "",
  status: "idle",

  loadAccounts: async (uid) => {
    if (!uid) return;

    set({ error: "", status: "loading" });

    try {
      const accounts = await listAccounts(uid);
      set({
        accounts,
        selectedAccountId: get().selectedAccountId || accounts[0]?.id || "",
        status: "ready",
      });
    } catch (error) {
      set({ error: mapDataError(error), status: "error" });
    }
  },

  createAccount: async (uid, values) => {
    set({ error: "", status: "saving" });

    try {
      const accountId = await createAccount(uid, values);
      await get().loadAccounts(uid);
      set({ selectedAccountId: accountId, status: "ready" });
      return { accountId, error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { accountId: "", error: message };
    }
  },

  updateAccount: async (uid, accountId, values) => {
    set({ error: "", status: "saving" });

    try {
      await updateAccount(uid, accountId, values);
      await get().loadAccounts(uid);
      set({ status: "ready" });
      return { error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message };
    }
  },

  archiveAccount: async (uid, accountId) => {
    set({ error: "", status: "saving" });

    try {
      await archiveAccount(uid, accountId);
      await get().loadAccounts(uid);
      set({ status: "ready" });
      return { error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message };
    }
  },

  selectAccount: (selectedAccountId) => set({ selectedAccountId }),
  reset: () => set({ accounts: [], error: "", selectedAccountId: "", status: "idle" }),
}));
