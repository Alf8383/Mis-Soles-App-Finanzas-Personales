import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthFlowStore, useOnboardingStore } from "../src/stores";
import { useAppTheme } from "../src/theme";

export default function Index() {
  const { colors } = useAppTheme();
  const authStatus = useAuthFlowStore((state) => state.status);
  const isOnboardingCompleted = useOnboardingStore((state) => state.isCompleted);
  const onboardingStatus = useOnboardingStore((state) => state.status);

  if (authStatus === "loading" || onboardingStatus === "loading") {
    return (
      <View style={[styles.loadingState, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (authStatus !== "authenticated") {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href={isOnboardingCompleted ? "/(tabs)/inicio" : "/(onboarding)"} />;
}

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
