import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { auth, hasFirebaseConfig } from "../lib/firebase/client";

const AUTH_CONFIG_ERROR =
  "Falta configurar Firebase. Completa las variables EXPO_PUBLIC_FIREBASE_* en tu .env.";

let unsubscribeAuth = null;

function mapAuthError(error) {
  if (!error) {
    return "";
  }

  switch (error.code) {
    case "auth/email-already-in-use":
      return "Este correo ya esta registrado.";
    case "auth/invalid-email":
      return "El correo no tiene un formato valido.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Correo o contraseña incorrectos.";
    case "auth/weak-password":
      return "La contraseña no cumple los requisitos de seguridad.";
    case "auth/network-request-failed":
      return "No pudimos conectar con Firebase. Revisa tu conexion e intenta de nuevo.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento y vuelve a probar.";
    default:
      return error.message || "Ocurrio un problema con la autenticacion.";
  }
}

function userState(user) {
  return {
    error: "",
    isAuthenticated: Boolean(user),
    status: user ? "authenticated" : "unauthenticated",
    user,
  };
}

function ensureFirebaseReady(set) {
  if (hasFirebaseConfig() && auth) {
    return true;
  }

  set({
    error: AUTH_CONFIG_ERROR,
    isAuthenticated: false,
    status: "unauthenticated",
    user: null,
  });
  return false;
}

export const useAuthFlowStore = create((set) => ({
  error: "",
  isAuthenticated: false,
  status: "loading",
  user: null,

  bootstrapSession: async () => {
    if (!hasFirebaseConfig() || !auth) {
      set({
        error: "",
        isAuthenticated: false,
        status: "unauthenticated",
        user: null,
      });
      return;
    }

    set({ error: "", status: "loading" });

    await new Promise((resolve) => {
      if (unsubscribeAuth) {
        resolve();
        return;
      }

      unsubscribeAuth = onAuthStateChanged(
        auth,
        (user) => {
          set(userState(user));
          resolve();
        },
        (error) => {
          set({
            error: mapAuthError(error),
            isAuthenticated: false,
            status: "unauthenticated",
            user: null,
          });
          resolve();
        },
      );
    });
  },

  clearError: () => {
    set({ error: "" });
  },

  signIn: async ({ email, password }) => {
    if (!ensureFirebaseReady(set)) {
      return { error: AUTH_CONFIG_ERROR, user: null };
    }

    set({ error: "", status: "loading" });

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      set(userState(credential.user));
      return { error: "", user: credential.user };
    } catch (error) {
      const authError = mapAuthError(error);
      set({
        error: authError,
        isAuthenticated: false,
        status: "unauthenticated",
        user: null,
      });
      return { error: authError, user: null };
    }
  },

  signUp: async ({ email, password }) => {
    if (!ensureFirebaseReady(set)) {
      return { error: AUTH_CONFIG_ERROR, user: null };
    }

    set({ error: "", status: "loading" });

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      set(userState(credential.user));
      return { error: "", user: credential.user };
    } catch (error) {
      const authError = mapAuthError(error);
      set({
        error: authError,
        isAuthenticated: false,
        status: "unauthenticated",
        user: null,
      });
      return { error: authError, user: null };
    }
  },

  signOut: async () => {
    if (!ensureFirebaseReady(set)) {
      return { error: AUTH_CONFIG_ERROR };
    }

    set({ error: "", status: "loading" });

    try {
      await firebaseSignOut(auth);
      set({
        error: "",
        isAuthenticated: false,
        status: "unauthenticated",
        user: null,
      });
      return { error: "" };
    } catch (error) {
      const authError = mapAuthError(error);
      set({ error: authError, status: "authenticated" });
      return { error: authError };
    }
  },

  requestPasswordReset: async (email) => {
    if (!ensureFirebaseReady(set)) {
      return { error: AUTH_CONFIG_ERROR };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { error: "" };
    } catch (error) {
      const authError = mapAuthError(error);
      set({ error: authError });
      return { error: authError };
    }
  },
}));
