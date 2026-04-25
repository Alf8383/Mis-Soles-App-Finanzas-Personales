import { create } from "zustand";

export const useAuthFlowStore = create((set) => ({
  isAuthenticated: false,
  signInMock: () =>
    set({
      isAuthenticated: true,
    }),
  signUpMock: () =>
    set({
      isAuthenticated: true,
    }),
  signOutMock: () =>
    set({
      isAuthenticated: false,
    }),
}));
