import { Tabs } from "expo-router";

export default function TabsLayout() {
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
