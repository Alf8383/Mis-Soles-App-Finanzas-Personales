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
  const signInMock = useAuthFlowStore((state) => state.signInMock);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    signInMock();
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
          onChangeText={setEmail}
          placeholder="tu@email.com"
          keyboardType="email-address"
        />
        <View style={{ height: spacing.md }} />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Tu contraseña"
          secureTextEntry
        />
        <PrimaryButton
          label="Ingresar"
          onPress={handleLogin}
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
