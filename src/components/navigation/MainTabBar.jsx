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
  const { colors, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: "rgba(239,159,39,0.2)",
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
            style={styles.item}
          >
            <View
              style={[
                styles.activeBar,
                { backgroundColor: focused ? colors.primary : "transparent" },
              ]}
            />
            <Ionicons
              name={iconName}
              size={22}
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
    alignItems: "flex-start",
    borderTopWidth: 1,
    minHeight: 72,
    paddingTop: 6,
  },
  item: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 2,
  },
  activeBar: {
    width: 22,
    height: 3,
    borderRadius: 2,
    marginBottom: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
  },
});
