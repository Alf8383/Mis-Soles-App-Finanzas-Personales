import { Text } from "react-native";

import { formatCurrencyAmount, getMoneyTone } from "../../lib/utils";
import { useUiPreferencesStore } from "../../stores";
import { useAppTheme } from "../../theme";

export function MoneyText({
  amount,
  currency = "PEN",
  tone,
  type = "default",
  style,
}) {
  const { colors } = useAppTheme();
  const hideAmounts = useUiPreferencesStore((state) => state.hideAmounts);
  const resolvedTone = tone ?? getMoneyTone({ amount, type });

  const toneColor = {
    positive: colors.primaryMuted,
    negative: colors.red,
    transfer: colors.blue,
    default: colors.textPrimary,
  }[resolvedTone];

  return (
    <Text style={[{ color: toneColor, fontWeight: "700" }, style]}>
      {hideAmounts ? "••••" : formatCurrencyAmount(amount, currency)}
    </Text>
  );
}
