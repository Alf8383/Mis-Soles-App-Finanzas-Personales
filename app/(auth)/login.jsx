import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { branding } from "../../src/constants/branding";
import { Screen } from "../../src/components/layout/Screen";
import { Card, PrimaryButton, TextField } from "../../src/components/ui";
import { useAuthFlowStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function LoginScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const authError = useAuthFlowStore((state) => state.error);
  const clearError = useAuthFlowStore((state) => state.clearError);
  const signIn = useAuthFlowStore((state) => state.signIn);
  const status = useAuthFlowStore((state) => state.status);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  const shouldShowEmailError = submitted || trimmedEmail.length > 0;
  const shouldShowPasswordError = submitted || password.length > 0;

  function handleEmailChange(value) {
    setEmail(value);
    clearError();
  }

  function handlePasswordChange(value) {
    setPassword(value);
    clearError();
  }

  async function handleLogin() {
    setSubmitted(true);
    clearError();

    if (!isFormValid) {
      return;
    }

    const result = await signIn({
      email: trimmedEmail,
      password,
    });

    if (result.user) {
      router.replace("/(tabs)/inicio");
    }
  }

  return (
    <Screen
      safeAreaEdges={["left", "right"]}
      contentStyle={[
        styles.container,
        {
          paddingHorizontal: spacing.xl,
          paddingTop: 0,
          paddingBottom: spacing.md,
        },
      ]}
    >
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
        Inicia sesión
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
        Ingresa a tu cuenta cloud de Mis Soles para continuar con tu información financiera.
      </Text>

      <Card style={{ width: "100%" }}>
        <TextField
          label="Correo electrónico"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="tu@email.com"
          keyboardType="email-address"
          errorMessage={shouldShowEmailError ? emailError : ""}
        />
        <View style={{ height: spacing.md }} />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="Tu contraseña"
          secureTextEntry
          errorMessage={shouldShowPasswordError ? passwordError : ""}
        />
        {authError ? (
          <Text style={[styles.notice, { color: colors.red, marginTop: spacing.md }]}>
            {authError}
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
        style={{ marginTop: spacing.lg }}
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
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 8,
  },
  logo: {
    width: '100%',
    height: 400,
    marginBottom: 0,
    marginTop: -40,
  },
  title: {
    fontWeight: "700",
    marginBottom: 0,
    marginTop: -100,
  },
  copy: {
    textAlign: "center",
    lineHeight: 22,
  },
  notice: {
    lineHeight: 20,
    textAlign: "center",
  },
});
