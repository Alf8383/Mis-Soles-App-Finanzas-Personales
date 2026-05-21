import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../theme";
import { PrimaryButton } from "./PrimaryButton";

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  danger = false,
}) {
  const { colors, radii, spacing, typography } = useAppTheme();

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.surface,
              borderRadius: radii.xl,
              padding: spacing.lg,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontSize: typography.sizes.lg,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.message,
              {
                color: colors.textSecondary,
                fontSize: typography.sizes.md,
                marginTop: spacing.xs,
              },
            ]}
          >
            {message}
          </Text>
          <View style={[styles.actions, { marginTop: spacing.lg }]}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelButton,
                {
          borderColor: colors.ghostBorder,
                  borderRadius: radii.md,
                  opacity: pressed ? 0.82 : 1,
                  paddingVertical: spacing.md,
                },
              ]}
            >
              <Text style={[styles.cancelLabel, { color: colors.textSecondary }]}>
                {cancelLabel}
              </Text>
            </Pressable>
            <PrimaryButton
              label={confirmLabel}
              onPress={onConfirm}
              style={[styles.confirmButton, danger ? { backgroundColor: colors.red } : null]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  dialog: {
    width: "100%",
  },
  title: {
    fontWeight: "800",
  },
  message: {
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
  },
  cancelLabel: {
    fontWeight: "700",
  },
  confirmButton: {
    flex: 1,
  },
});
