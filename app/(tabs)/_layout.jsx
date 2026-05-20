import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { MainTabBar } from "../../src/components/navigation/MainTabBar";
import { useAuthFlowStore, useOnboardingStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const status = useAuthFlowStore((state) => state.status);
  const isOnboardingCompleted = useOnboardingStore((state) => state.isCompleted);
  const onboardingStatus = useOnboardingStore((state) => state.status);

  if (status === "loading" || onboardingStatus === "loading") {
    return (
      <View style={[styles.loadingState, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (status !== "authenticated") {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isOnboardingCompleted) {
    return <Redirect href="/(onboarding)" />;
  }

  return (
    <Tabs
      tabBar={(props) => <MainTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Inicio",
        }}
      />
      <Tabs.Screen
        name="movimientos"
        options={{
          title: "Movimientos",
        }}
      />
      <Tabs.Screen
        name="estadisticas"
        options={{
          title: "Estadísticas",
        }}
      />
      <Tabs.Screen
        name="obligaciones"
        options={{
          title: "Obligaciones",
        }}
      />
      <Tabs.Screen
        name="mas"
        options={{
          title: "Más",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
