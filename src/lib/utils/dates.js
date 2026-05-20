import { format, isToday, isYesterday, parseISO } from "date-fns";

export function normalizeDate(input) {
  if (!input) {
    return new Date();
  }

  if (input?.toDate) {
    return input.toDate();
  }

  return input instanceof Date ? input : parseISO(String(input));
}

export function getMovementDateLabel(input) {
  const date = normalizeDate(input);

  if (isToday(date)) {
    return "Hoy";
  }

  if (isYesterday(date)) {
    return "Ayer";
  }

  return format(date, "dd MMM");
}

export function formatExchangeRateDate(input) {
  return format(normalizeDate(input), "dd/MM/yyyy");
}
