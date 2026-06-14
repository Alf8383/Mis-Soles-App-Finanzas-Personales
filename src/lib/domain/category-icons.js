export const DEFAULT_CATEGORY_ICON = "pricetag-outline";

export const CATEGORY_ICON_OPTIONS = [
  { label: "Comida", value: "restaurant-outline" },
  { label: "Transporte", value: "bus-outline" },
  { label: "Hogar", value: "home-outline" },
  { label: "Salud", value: "heart-outline" },
  { label: "Ocio", value: "sparkles-outline" },
  { label: "Trabajo", value: "briefcase-outline" },
  { label: "Etiqueta", value: DEFAULT_CATEGORY_ICON },
  { label: "Cafe", value: "cafe-outline" },
];

const ICON_ALIASES = {
  bus: "bus-outline",
  "🚌": "bus-outline",
  "☕": "cafe-outline",
  "🍽️": "restaurant-outline",
  heart: "heart-outline",
  home: "home-outline",
  "🏠": "home-outline",
  "🏷️": DEFAULT_CATEGORY_ICON,
  "💊": "medkit-outline",
  "💼": "briefcase-outline",
  "✨": "sparkles-outline",
  sparkles: "sparkles-outline",
  tag: DEFAULT_CATEGORY_ICON,
  utensils: "restaurant-outline",
  wallet: "wallet-outline",
};

export function getCategoryIconName(icon) {
  if (!icon) return DEFAULT_CATEGORY_ICON;
  return ICON_ALIASES[icon] || icon;
}
