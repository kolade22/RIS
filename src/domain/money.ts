export function assertMinorUnits(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Money must be a non-negative integer minor unit value')
  return value
}

export function multiplyMinorUnits(value: number, quantity: number): number {
  assertMinorUnits(value)
  if (!Number.isSafeInteger(quantity) || quantity < 0) throw new Error('Quantity must be a non-negative integer')
  return assertMinorUnits(value * quantity)
}

export function formatNaira(minorUnits: number): string {
  assertMinorUnits(minorUnits)
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(minorUnits / 100)
}
