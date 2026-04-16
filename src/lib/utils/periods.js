import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

export function getThisMonthRange(baseDate = new Date()) {
  return {
    start: startOfMonth(baseDate),
    end: endOfMonth(baseDate),
  };
}

export function getPreviousMonthRange(baseDate = new Date()) {
  const previousMonth = subMonths(baseDate, 1);

  return {
    start: startOfMonth(previousMonth),
    end: endOfMonth(previousMonth),
  };
}

export function getThisWeekRange(baseDate = new Date()) {
  return {
    start: startOfWeek(baseDate, { weekStartsOn: 1 }),
    end: endOfWeek(baseDate, { weekStartsOn: 1 }),
  };
}
