import { create } from "zustand";

export const useMovementFiltersStore = create((set) => ({
  quickFilter: "all",
  setQuickFilter: (quickFilter) =>
    set({
      quickFilter,
    }),
  resetFilters: () =>
    set({
      quickFilter: "all",
    }),
}));
