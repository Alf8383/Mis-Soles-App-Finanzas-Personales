import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { branding } from "../../src/constants/branding";
import { Screen } from "../../src/components/layout/Screen";
import { Card, PrimaryButton, TextField } from "../../src/components/ui";
import { useAuthFlowStore, useOnboardingStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function LoginScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const authError = useAuthFlowStore((state) => state.error);
  const clearError = useAuthFlowStore((state) => state.clearError);
  const requestPasswordReset = useAuthFlowStore((state) => state.requestPasswordReset);
  const signIn = useAuthFlowStore((state) => state.signIn);
  const status = useAuthFlowStore((state) => state.status);
  const isOnboardingCompleted = useOnboardingStore((state) => state.isCompleted);
  const loadOnboardingState = useOnboardingStore((state) => state.loadOnboardingState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetFeedback, setResetFeedback] = useState(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetSubmitted, setResetSubmitted] = useState(false);
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
      ? "Ingresa tu contraseña."
      : password.length <= 8
        ? "La contraseña debe tener más de 8 caracteres."
        : "";
  const isFormValid = !emailError && !passwordError;
  const isLoading = status === "loading";
  const shouldShowEmailError = submitted || resetSubmitted || trimmedEmail.length > 0;
  const shouldShowPasswordError = submitted || password.length > 0;
  const notice = resetFeedback || (authError ? { type: "error", text: authError } : null);

  function handleEmailChange(value) {
    setEmail(value);
    setResetSubmitted(false);
    setResetFeedback(null);
    clearError();
  }

  function handlePasswordChange(value) {
    setPassword(value);
    setResetFeedback(null);
    clearError();
  }

  async function handleLogin() {
    setSubmitted(true);
    setResetFeedback(null);
    clearError();

    if (!isFormValid) {
      return;
    }

    const result = await signIn({
      email: trimmedEmail,
      password,
    });

    if (result.user) {
      const onboarding = await loadOnboardingState(result.user.uid);
      router.replace(onboarding.completed || isOnboardingCompleted ? "/(tabs)/inicio" : "/(onboarding)");
    }
  }

  async function handlePasswordReset() {
    clearError();
    setResetFeedback(null);
    setResetSubmitted(true);

    if (emailError) {
      return;
    }

    setIsResettingPassword(true);
    const result = await requestPasswordReset(trimmedEmail);
    setIsResettingPassword(false);

    if (result.error) {
      setResetFeedback({ type: "error", text: result.error });
      return;
    }

    setResetFeedback({
      type: "success",
      text: "Te enviamos un enlace para restablecer tu contraseña.",
    });
  }

  return (
    <Screen
      safeAreaEdges={["left", "right"]}
      contentStyle={[
        styles.container,
        {
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.md,
          paddingBottom: spacing.xl,
        },
      ]}
    >
      <View style={styles.hero}>
        <Image source={branding.onboarding} style={styles.logo} resizeMode="contain" />
      </View>
      <Text
        style={[
          styles.title,
          {
            color: colors.primary,
            fontSize: typography.sizes.xxl,
          },
        ]}
      >
        Inicia sesión
      </Text>
      <Text
        style={[
          styles.copy,
          {
            color: colors.textSecondary,
            fontSize: typography.sizes.md,
            marginBottom: spacing.lg,
          },
        ]}
      >
        Accede a tu cuenta de Mis Soles
      </Text>

      <Card style={styles.formCard}>
        <TextField
          label="Correo electrónico"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="ejemplo@correo.com"
          keyboardType="email-address"
          errorMessage={shouldShowEmailError ? emailError : ""}
        />
        <View style={{ height: spacing.md }} />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="Ingresa tu contraseña"
          secureTextEntry
          errorMessage={shouldShowPasswordError ? passwordError : ""}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Solicitar restablecimiento de contraseña"
          disabled={isResettingPassword || isLoading}
          onPress={handlePasswordReset}
          style={({ pressed }) => [
            styles.forgotLink,
            {
              opacity: pressed && !isResettingPassword && !isLoading ? 0.75 : 1,
            },
          ]}
        >
          <Text style={[styles.forgotText, { color: colors.primary }]}>
            {isResettingPassword ? "Enviando..." : "¿Olvidaste tu contraseña?"}
          </Text>
        </Pressable>
        {notice ? (
          <Text
            style={[
              styles.notice,
              {
                color: notice.type === "success" ? colors.primary : colors.red,
                marginTop: spacing.md,
              },
            ]}
          >
            {notice.text}
          </Text>
        ) : null}
        <PrimaryButton
          label={isLoading ? "Ingresando..." : "Ingresar"}
          onPress={handleLogin}
          disabled={isLoading}
          style={{ marginTop: spacing.lg }}
        />
      </Card>

      <Pressable
        onPress={() => router.push("/(auth)/register")}
        style={{ marginTop: "auto", paddingTop: spacing.xl }}
      >
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.sizes.md,
          }}
        >
          ¿No tienes cuenta?{" "}
          <Text style={{ color: colors.primary, fontWeight: "700" }}>Crear cuenta</Text>
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
  hero: {
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: 235,
    width: "100%",
  },
  logo: {
    width: 610,
    height: 330,
    marginBottom: -62,
  },
  title: {
    fontWeight: "800",
    marginTop: -10,
    marginBottom: 6,
  },
  copy: {
    textAlign: "center",
    lineHeight: 22,
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginTop: 10,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: "transparent",
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    width: "100%",
  },
  notice: {
    lineHeight: 20,
    textAlign: "center",
  },
});
