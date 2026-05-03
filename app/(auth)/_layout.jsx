import { Redirect, Stack } from "expo-router";

import { useAuthFlowStore } from "../../src/stores";

export default function AuthLayout() {
  const status = useAuthFlowStore((state) => state.status);

  if (status === "authenticated") {
    return <Redirect href="/(tabs)/inicio" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
