import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { branding } from "../../src/constants/branding";
import { Screen } from "../../src/components/layout/Screen";
import { Card, PrimaryButton, TextField } from "../../src/components/ui";
import { useAuthFlowStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function RegisterScreen() {
  const { colors, spacing, typography } = useAppTheme();
  const signUpMock = useAuthFlowStore((state) => state.signUpMock);
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
  const shouldShowEmailError = submitted || trimmedEmail.length > 0;
  const shouldShowPasswordError = submitted || password.length > 0;
  const shouldShowConfirmPasswordError = submitted || confirmPassword.length > 0;

  function handleRegister() {
    setSubmitted(true);

    if (!isFormValid) {
      return;
    }

    signUpMock();
    router.replace("/(tabs)/inicio");
  }

  return (
    <Screen
      contentStyle={[
        styles.container,
        {
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.xxl,
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

      <Card style={{ width: "100%" }}>
        <TextField
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com"
          keyboardType="email-address"
          errorMessage={shouldShowEmailError ? emailError : ""}
        />
        <View style={{ height: spacing.md }} />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Crea una contraseña"
          secureTextEntry
          errorMessage={shouldShowPasswordError ? passwordError : ""}
        />
        <View style={{ height: spacing.md }} />
        <TextField
          label="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repite tu contraseña"
          secureTextEntry
          errorMessage={shouldShowConfirmPasswordError ? confirmPasswordError : ""}
        />
        <PrimaryButton
          label="Crear cuenta"
          onPress={handleRegister}
          style={{ marginTop: spacing.lg }}
        />
      </Card>

      <Pressable
        onPress={() => router.push("/(auth)/login")}
        style={{ marginTop: spacing.lg }}
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
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 224,
    height: 72,
    marginBottom: 20,
  },
  title: {
    fontWeight: "700",
    marginBottom: 8,
  },
  copy: {
    textAlign: "center",
    lineHeight: 22,
  },
});
