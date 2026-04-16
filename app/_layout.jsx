import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { runMigrations } from "../src/lib/db/migrate";
import { AppProviders } from "../src/providers/AppProviders";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        await runMigrations();
        if (mounted) {
          setReady(true);
        }
      } catch (migrationError) {
        if (mounted) {
          setError(migrationError);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppProviders>
      <StatusBar style="dark" />
      {!ready ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#0F6E56" />
          <Text style={styles.loadingTitle}>Preparando Mis Soles</Text>
          <Text style={styles.loadingCopy}>
            {error
              ? "Hubo un problema inicializando la base local."
              : "Inicializando rutas y almacenamiento local."}
          </Text>
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen
            name="(modals)"
            options={{
              presentation: "modal",
            }}
          />
        </Stack>
      )}
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
    backgroundColor: "#F4F6F4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  loadingCopy: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
  },
});
