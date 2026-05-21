import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { branding } from "../../src/constants/branding";
import { Screen } from "../../src/components/layout/Screen";
import { Card, PrimaryButton, TextField } from "../../src/components/ui";
import { useAuthFlowStore, useOnboardingStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function RegisterScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const authError = useAuthFlowStore((state) => state.error);
  const clearError = useAuthFlowStore((state) => state.clearError);
  const signUp = useAuthFlowStore((state) => state.signUp);
  const status = useAuthFlowStore((state) => state.status);
  const loadOnboardingState = useOnboardingStore((state) => state.loadOnboardingState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const trimmedEmail = email.trim();
  const emailError =
    trimmedEmail.length === 0
      ? "Ingresa tu correo electrónico."
      : !trimmedEmail.includes("@")
        ? "El correo debe incluir @."
        : "";
  const passwordError =
    password.length === 0
      ? "Crea una contraseña."
      : password.length <= 8
        ? "La contraseña debe tener más de 8 caracteres."
        : "";
  const confirmPasswordError =
    confirmPassword.length === 0
      ? "Confirma tu contraseña."
      : confirmPassword !== password
        ? "Las contraseñas no coinciden."
        : "";
  const isFormValid = !emailError && !passwordError && !confirmPasswordError;
  const isLoading = status === "loading";
  const shouldShowEmailError = submitted || trimmedEmail.length > 0;
  const shouldShowPasswordError = submitted || password.length > 0;
  const shouldShowConfirmPasswordError = submitted || confirmPassword.length > 0;

  function handleEmailChange(value) {
    setEmail(value);
    clearError();
  }

  function handlePasswordChange(value) {
    setPassword(value);
    clearError();
  }

  function handleConfirmPasswordChange(value) {
    setConfirmPassword(value);
    clearError();
  }

  async function handleRegister() {
    setSubmitted(true);
    clearError();

    if (!isFormValid) {
      return;
    }

    const result = await signUp({
      email: trimmedEmail,
      password,
    });

    if (result.user) {
      await loadOnboardingState(result.user.uid);
      router.replace("/(onboarding)");
    }
  }

  return (
    <Screen
      contentStyle={[
        styles.container,
        {
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.md,
          paddingBottom: spacing.xl,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver al login"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={22} color={colors.primary} />
      </Pressable>
      <Image source={branding.onboarding} style={styles.logo} resizeMode="contain" />
      <Text
        style={[
          styles.title,
          {
            color: colors.primary,
            fontSize: typography.sizes.xxl,
          },
        ]}
      >
        Crea tu cuenta
      </Text>
      <Text
        style={[
          styles.copy,
          {
            color: colors.textSecondary,
            fontSize: typography.sizes.md,
            marginBottom: spacing.xl,
          },
        ]}
      >
        Empieza a usar Mis Soles en la nube y deja lista tu cuenta para guardar tus datos.
      </Text>

      <Card style={styles.formCard}>
        <TextField
          label="Correo electrónico"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="Correo electrónico"
          keyboardType="email-address"
          errorMessage={shouldShowEmailError ? emailError : ""}
        />
        <View style={{ height: spacing.md }} />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="Contraseña"
          secureTextEntry
          errorMessage={shouldShowPasswordError ? passwordError : ""}
        />
        <View style={{ height: spacing.md }} />
        <TextField
          label="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          placeholder="Confirmar contraseña"
          secureTextEntry
          errorMessage={shouldShowConfirmPasswordError ? confirmPasswordError : ""}
        />
        {authError ? (
          <Text style={[styles.notice, { color: colors.red, marginTop: spacing.md }]}>
            {authError}
          </Text>
        ) : null}
        <PrimaryButton
          label={isLoading ? "Creando cuenta..." : "Crear cuenta"}
          onPress={handleRegister}
          disabled={isLoading}
          style={{ marginTop: spacing.lg }}
        />
      </Card>

      <Pressable
        onPress={() => router.push("/(auth)/login")}
        style={{ marginTop: "auto", paddingTop: spacing.xl }}
      >
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.sizes.md,
          }}
        >
          ¿Ya tienes cuenta?{" "}
          <Text style={{ color: colors.primary, fontWeight: "700" }}>Inicia sesión</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 0,
    padding: 4,
  },
  logo: {
    width: 610,
    height: 330,
    marginBottom: -66,
    marginTop: -58,
  },
  title: {
    fontWeight: "800",
    marginTop: -8,
    marginBottom: 6,
  },
  copy: {
    textAlign: "center",
    lineHeight: 22,
  },
  notice: {
    lineHeight: 20,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "transparent",
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    width: "100%",
  },
});
