import { Redirect } from "expo-router";

import { useAuthFlowStore } from "../src/stores";

export default function Index() {
  const isAuthenticated = useAuthFlowStore((state) => state.isAuthenticated);

  return <Redirect href={isAuthenticated ? "/(tabs)/inicio" : "/(auth)/login"} />;
}
