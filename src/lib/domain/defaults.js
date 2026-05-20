import { AccountType, BudgetPeriod, CategoryKind, CurrencyCode } from "./enums";

export const DEFAULT_PRIMARY_CURRENCY = CurrencyCode.PEN;
export const DEFAULT_EXCHANGE_RATE = 3.75;
export const DEFAULT_INITIAL_ACCOUNT = {
  balance: 0,
  name: "Billetera",
  type: AccountType.CASH,
};

export const DEFAULT_CATEGORIES = [
  {
    color: "#EF9F27",
    icon: "utensils",
    id: "comida",
    kind: CategoryKind.EXPENSE,
    name: "Comida",
  },
  {
    color: "#378ADD",
    icon: "bus",
    id: "transporte",
    kind: CategoryKind.EXPENSE,
    name: "Transporte",
  },
  {
    color: "#0F6E56",
    icon: "home",
    id: "hogar",
    kind: CategoryKind.EXPENSE,
    name: "Hogar",
  },
  {
    color: "#E24B4A",
    icon: "heart",
    id: "salud",
    kind: CategoryKind.EXPENSE,
    name: "Salud",
  },
  {
    color: "#8B5CF6",
    icon: "sparkles",
    id: "ocio",
    kind: CategoryKind.EXPENSE,
    name: "Ocio",
  },
  {
    color: "#1D9E75",
    icon: "wallet",
    id: "ingresos",
    kind: CategoryKind.INCOME,
    name: "Ingresos",
  },
];

export const DEFAULT_BUDGET_ALERT_THRESHOLD = 80;
export const DEFAULT_BUDGET_PERIOD = BudgetPeriod.MONTHLY;
