import { useEffect } from "react";

import * as SystemUI from "expo-system-ui";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider, theme } from "../theme";

export function AppProviders({ children }) {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => {
      return null;
    });
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </ThemeProvider>
  );
}
