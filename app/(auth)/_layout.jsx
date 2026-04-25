import { Redirect, Stack } from "expo-router";

import { useAuthFlowStore } from "../../src/stores";

export default function AuthLayout() {
  const isAuthenticated = useAuthFlowStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/inicio" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
