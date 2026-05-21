import { create } from "zustand";

export const useUiPreferencesStore = create((set) => ({
  hideAmounts: false,
  setHideAmounts: (hideAmounts) => set({ hideAmounts }),
  toggleHideAmounts: () =>
    set((state) => ({
      hideAmounts: !state.hideAmounts,
    })),
}));
