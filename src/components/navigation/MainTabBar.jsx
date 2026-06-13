import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "../../theme";

const TAB_ICON_BY_ROUTE = {
  inicio: ["home-outline", "home"],
  movimientos: ["swap-vertical-outline", "swap-vertical"],
  estadisticas: ["bar-chart-outline", "bar-chart"],
  obligaciones: ["calendar-outline", "calendar"],
  mas: ["menu-outline", "menu"],
};

export function MainTabBar({ state, descriptors, navigation }) {
  const { colors, radii, shadows, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        shadows.card,
        {
          backgroundColor: colors.tabBar,
          borderColor: colors.border,
          borderRadius: radii.xl,
          marginBottom: spacing.xs,
          marginHorizontal: spacing.md,
          paddingBottom: Math.max(insets.bottom, spacing.xs),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        const options = descriptor.options;
        const label = options.title ?? route.name;
        const focused = state.index === index;
        const iconPair = TAB_ICON_BY_ROUTE[route.name] ?? ["ellipse-outline", "ellipse"];
        const iconName = focused ? iconPair[1] : iconPair[0];

        function handlePress() {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={handlePress}
            style={({ pressed }) => [
              styles.item,
              {
                backgroundColor: focused ? colors.primarySoft : "transparent",
                borderRadius: radii.lg,
                opacity: pressed ? 0.86 : 1,
              },
            ]}
          >
            <Ionicons
              name={iconName}
              size={21}
              color={focused ? colors.primary : colors.textTertiary}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: focused ? colors.primary : colors.textTertiary },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 0.5,
    maxWidth: 780,
    minHeight: 70,
    paddingHorizontal: 6,
    paddingTop: 6,
    width: "100%",
  },
  item: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
  },
});
