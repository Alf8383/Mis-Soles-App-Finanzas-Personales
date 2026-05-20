import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthFlowStore, useOnboardingStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

export default function ModalsLayout() {
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

  return <Stack screenOptions={{ headerShown: false, presentation: "modal" }} />;
}

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
