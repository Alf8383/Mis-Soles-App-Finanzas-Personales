import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";

import { useAppTheme } from "../../theme";

export function BottomSheetLauncher({
  triggerLabel = "+",
  title = "Acciones rapidas",
  options = [],
}) {
  const [visible, setVisible] = useState(false);
  const { colors, radii, shadows, spacing, typography } = useAppTheme();

  const safeOptions = useMemo(() => options.slice(0, 6), [options]);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={[
          styles.trigger,
          shadows.fab,
          {
            backgroundColor: colors.primary,
            borderRadius: radii.pill,
            bottom: spacing.xl,
            right: spacing.lg,
          },
        ]}
      >
        <Text style={[styles.triggerText, { color: colors.surface }]}>{triggerLabel}</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radii.xxl,
                borderTopRightRadius: radii.xxl,
                padding: spacing.lg,
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <View
              style={[
                styles.handle,
                {
                  backgroundColor: colors.border,
                  marginBottom: spacing.md,
                },
              ]}
            />
            <Text
              style={[
                styles.title,
                {
                  color: colors.textPrimary,
                  fontSize: typography.sizes.lg,
                  marginBottom: spacing.md,
                },
              ]}
            >
              {title}
            </Text>
            <View style={styles.options}>
              {safeOptions.map((option) => (
                <View
                  key={option.label}
                  style={[
                    styles.option,
                    {
                      backgroundColor: colors.background,
                      borderRadius: radii.md,
                      paddingVertical: spacing.md,
                      paddingHorizontal: spacing.sm,
                    },
                  ]}
                >
                  <Text style={[styles.optionEmoji, { marginBottom: spacing.xs }]}>
                    {option.emoji}
                  </Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: colors.textSecondary,
                        fontSize: typography.sizes.sm,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  triggerText: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 30,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    minHeight: 240,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
  },
  title: {
    fontWeight: "700",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  option: {
    width: "30%",
    alignItems: "center",
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionLabel: {
    fontWeight: "600",
    textAlign: "center",
  },
});
