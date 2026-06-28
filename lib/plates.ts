export function compactPlate(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function normalizePlate(value: string) {
  const compact = compactPlate(value);

  if (/^[A-Z]{3}\d{3}$/.test(compact)) {
    return `${compact.slice(0, 3)}-${compact.slice(3)}`;
  }

  if (/^\d{4}[A-Z]{2}$/.test(compact)) {
    return `${compact.slice(0, 4)}-${compact.slice(4)}`;
  }

  if (compact.length > 3 && compact.length <= 8) {
    return compact;
  }

  return value.trim().toUpperCase();
}

export function isValidPlate(value: string) {
  const compact = compactPlate(value);
  return compact.length >= 5 && compact.length <= 8 && /^[A-Z0-9]+$/.test(compact);
}
