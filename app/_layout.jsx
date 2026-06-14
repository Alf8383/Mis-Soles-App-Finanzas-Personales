import { Ionicons } from "@expo/vector-icons";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";

import { runMigrations } from "../src/lib/db/migrate";
import { AppProviders } from "../src/providers/AppProviders";
import { useAuthFlowStore, useOnboardingStore } from "../src/stores";

const defaultTextStyle = { fontFamily: "PlusJakartaSans_400Regular" };

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = [defaultTextStyle, Text.defaultProps.style];
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = [defaultTextStyle, TextInput.defaultProps.style];

if (typeof document !== "undefined" && !document.getElementById("mis-soles-font")) {
  const style = document.createElement("style");
  style.id = "mis-soles-font";
  style.textContent = `
    [dir="auto"]:not([style*="PlusJakartaSans"]):not([style*="ionicons"]):not([style*="MaterialIcons"]):not([style*="MaterialCommunityIcons"]):not([style*="Feather"]):not([style*="FontAwesome"]) {
      font-family: PlusJakartaSans_400Regular, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    }
    input,
    textarea {
      font-family: PlusJakartaSans_400Regular, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    }
  `;
  document.head.appendChild(style);
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        await runMigrations();
        await useAuthFlowStore.getState().bootstrapSession();
        const user = useAuthFlowStore.getState().user;
        if (user?.uid) {
          await useOnboardingStore.getState().loadOnboardingState(user.uid);
        }
        if (mounted) {
          setReady(true);
        }
      } catch (migrationError) {
        console.error("Bootstrap failed", migrationError);
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
      {!ready || !fontsLoaded ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#005440" />
          <Text style={styles.loadingTitle}>Preparando Mis Soles</Text>
          <Text style={styles.loadingCopy}>
            {error
              ? `Hubo un problema inicializando la base local: ${error.message}`
              : "Inicializando rutas, sesion y almacenamiento local."}
          </Text>
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
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
    backgroundColor: "#F8FAF8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: "#191C1B",
  },
  loadingCopy: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#5D6662",
    textAlign: "center",
  },
});
