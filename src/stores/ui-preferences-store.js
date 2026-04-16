import { create } from "zustand";

export const useUiPreferencesStore = create((set) => ({
  hideAmounts: false,
  toggleHideAmounts: () =>
    set((state) => ({
      hideAmounts: !state.hideAmounts,
    })),
}));
