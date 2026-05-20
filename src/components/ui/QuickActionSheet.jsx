import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "../../theme";

export const QUICK_ACTIONS = [
  { type: "expense", label: "Gasto", icon: "cart-outline", tone: "red" },
  { type: "income", label: "Ingreso", icon: "briefcase-outline", tone: "green" },
  { type: "transfer", label: "Transferencia", icon: "swap-horizontal-outline", tone: "blue" },
  { type: "debt", label: "Deuda", icon: "people-outline", tone: "gold" },
  { type: "fixed", label: "Pago fijo", icon: "calendar-outline", tone: "green" },
];

export function QuickActionSheet({ visible, onClose, onSelect, title = "Alta rapida" }) {
  const { colors, radii, spacing, typography } = useAppTheme();
  const insets = useSafeAreaInsets();

  function getToneColor(tone) {
    if (tone === "red") return colors.red;
    if (tone === "blue") return colors.blue;
    if (tone === "gold") return colors.gold;
    return colors.primary;
  }

  function getToneBackground(tone) {
    if (tone === "red") return colors.redSoft;
    if (tone === "blue") return colors.blueSoft;
    if (tone === "gold") return colors.goldSoft;
    return colors.primarySoft;
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar acciones rapidas"
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radii.xxl,
              borderTopRightRadius: radii.xxl,
              paddingHorizontal: spacing.md,
              paddingTop: spacing.sm,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontSize: typography.sizes.lg,
                marginTop: spacing.sm,
                marginBottom: spacing.md,
              },
            ]}
          >
            {title}
          </Text>
          <View style={styles.options}>
            {QUICK_ACTIONS.map((action) => {
              const toneColor = getToneColor(action.tone);
              return (
                <Pressable
                  key={action.type}
                  accessibilityRole="button"
                  accessibilityLabel={`Crear ${action.label}`}
                  onPress={() => onSelect(action.type)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      borderRadius: radii.md,
                      opacity: pressed ? 0.9 : 1,
                      paddingVertical: spacing.md,
                      paddingHorizontal: spacing.sm,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        backgroundColor: getToneBackground(action.tone),
                        borderRadius: radii.md,
                      },
                    ]}
                  >
                    <Ionicons name={action.icon} size={22} color={toneColor} />
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: colors.textSecondary,
                        fontSize: typography.sizes.sm,
                      },
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    minHeight: 220,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontWeight: "800",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    width: "31.5%",
    alignItems: "center",
    borderWidth: 1,
    gap: 7,
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontWeight: "700",
    textAlign: "center",
  },
});
