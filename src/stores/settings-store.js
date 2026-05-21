import { create } from "zustand";

import {
  getAppSettings,
  getUserProfileInfo,
  updateExchangeRate,
} from "../lib/firebase/repositories/settings-repository";

function mapDataError(error) {
  return error?.message || "No pudimos cargar tu configuración.";
}

export const useSettingsStore = create((set, get) => ({
  error: "",
  profile: null,
  settings: null,
  status: "idle",

  loadSettings: async (uid) => {
    if (!uid) return;

    set({ error: "", status: "loading" });

    try {
      const [settings, profile] = await Promise.all([getAppSettings(uid), getUserProfileInfo(uid)]);
      set({ profile, settings, status: "ready" });
    } catch (error) {
      set({ error: mapDataError(error), status: "error" });
    }
  },

  updateExchangeRate: async (uid, exchangeRate) => {
    set({ error: "", status: "saving" });

    try {
      await updateExchangeRate(uid, exchangeRate);
      await get().loadSettings(uid);
      return { error: "" };
    } catch (error) {
      const message = mapDataError(error);
      set({ error: message, status: "error" });
      return { error: message };
    }
  },

  reset: () => set({ error: "", profile: null, settings: null, status: "idle" }),
}));
