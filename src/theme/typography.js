import { Platform } from "react-native";

const systemSans = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});

export const typography = {
  fontFamily: {
    regular: systemSans,
    medium: systemSans,
    semibold: systemSans,
    bold: systemSans,
  },
  sizes: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  lineHeights: {
    tight: 18,
    base: 22,
    relaxed: 26,
    display: 38,
  },
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    heavy: "800",
  },
};
