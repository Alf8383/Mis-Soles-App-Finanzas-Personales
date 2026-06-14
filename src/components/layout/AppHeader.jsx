import { Image, StyleSheet, Text, View } from "react-native";

import { branding } from "../../constants/branding";
import { useAppTheme } from "../../theme";

export function AppHeader({ title, subtitle, rightSlot }) {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: "rgba(0, 81, 62, 0.075)",
          marginHorizontal: -spacing.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        },
      ]}
    >
      <View style={[styles.brandRail, { backgroundColor: colors.primary }]} />
      <View style={styles.left}>
        <View
          style={[
            styles.logoWrap,
            {
              backgroundColor: "rgba(255, 255, 255, 0.82)",
              borderColor: "rgba(0,81,62,0.16)",
              marginRight: spacing.sm,
            },
          ]}
        >
          <Image source={branding.headerIcon} style={styles.logo} resizeMode="contain" />
        </View>
        <View>
          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontFamily: typography.fontFamily.extraBold,
                fontSize: typography.sizes.xl,
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.semibold,
                  fontSize: typography.sizes.xs,
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 76,
    overflow: "hidden",
    position: "relative",
  },
  brandRail: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    zIndex: 1,
  },
  logoWrap: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
  },
  logo: {
    width: 29,
    height: 29,
  },
  title: {
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 2,
    letterSpacing: 0,
  },
  rightSlot: {
    alignItems: "flex-end",
    zIndex: 1,
  },
});
