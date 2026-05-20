export function toMinorUnits(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return 0;
  }

  return Math.round(numericAmount * 100);
}

export function fromMinorUnits(amountMinor) {
  const numericAmount = Number(amountMinor);

  if (!Number.isFinite(numericAmount)) {
    return 0;
  }

  return numericAmount / 100;
}
