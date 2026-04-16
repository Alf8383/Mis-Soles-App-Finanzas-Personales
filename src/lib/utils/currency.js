import { CURRENCIES } from "../constants/currencies";

export function getCurrencyConfig(currency = "PEN") {
  return CURRENCIES[currency] ?? CURRENCIES.PEN;
}

export function getCurrencySymbol(currency = "PEN") {
  return getCurrencyConfig(currency).symbol;
}

export function isSupportedCurrency(currency) {
  return Object.prototype.hasOwnProperty.call(CURRENCIES, currency);
}
