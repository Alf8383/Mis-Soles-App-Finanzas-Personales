import { Image, StyleSheet, Text, View } from "react-native";

import { branding } from "../../constants/branding";
import { useAppTheme } from "../../theme";

export function AppHeader({ title, subtitle, rightSlot }) {
  const { colors, radii, spacing, typography } = useAppTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.primary,
          borderRadius: radii.xl,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
        },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.logoWrap,
            {
              backgroundColor: colors.surface,
              borderRadius: radii.md,
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
                color: colors.surface,
                fontSize: typography.sizes.lg,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                {
                  color: "rgba(255,255,255,0.72)",
                  fontSize: typography.sizes.sm,
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightSlot ? <View>{rightSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoWrap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 28,
    height: 28,
  },
  title: {
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 2,
    fontWeight: "500",
  },
});
