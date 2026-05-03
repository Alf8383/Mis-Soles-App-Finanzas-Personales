import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthFlowStore } from "../src/stores";
import { useAppTheme } from "../src/theme";

export default function Index() {
  const { colors } = useAppTheme();
  const status = useAuthFlowStore((state) => state.status);

  if (status === "loading") {
    return (
      <View style={[styles.loadingState, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={status === "authenticated" ? "/(tabs)/inicio" : "/(auth)/login"} />;
}

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
