import { Redirect, Tabs } from "expo-router";

import { useAuthFlowStore } from "../../src/stores";

export default function TabsLayout() {
  const isAuthenticated = useAuthFlowStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
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
          title: "Estadisticas",
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
          title: "Mas",
        }}
      />
    </Tabs>
  );
}
