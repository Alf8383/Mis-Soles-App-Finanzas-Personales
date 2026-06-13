import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../../theme";

export function Screen({
  children,
  scrollable = false,
  contentStyle,
  safeAreaEdges = ["top", "left", "right"],
  bottomInset = 0,
}) {
  const { colors, spacing } = useAppTheme();

  const baseStyle = [
    styles.content,
    {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl + bottomInset,
    },
    Platform.OS === "web" ? styles.webContent : null,
    contentStyle,
  ];

  return (
    <SafeAreaView
      edges={safeAreaEdges}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {scrollable ? (
        <ScrollView
          contentContainerStyle={baseStyle}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={baseStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  webContent: {
    alignSelf: "center",
    maxWidth: 780,
    width: "100%",
  },
});
