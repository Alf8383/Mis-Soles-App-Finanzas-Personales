import { getCurrencyConfig } from "./currency";

export function toMinorUnits(amount) {
  return Math.round(Number(amount || 0) * 100);
}

export function fromMinorUnits(minorAmount) {
  return Number(minorAmount || 0) / 100;
}

export function formatCurrencyAmount(amount, currency = "PEN") {
  const { code, locale } = getCurrencyConfig(currency);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

export function getMoneyTone({ amount = 0, type = "default" }) {
  if (type === "transfer") {
    return "transfer";
  }

  if (amount < 0) {
    return "negative";
  }

  if (amount > 0) {
    return "positive";
  }

  return "default";
}
