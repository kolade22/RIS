export function normalizeName(value: string): string {
  return value.trim().toLocaleLowerCase('en-NG').replace(/\s+/g, ' ')
}

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('234')) return `+${digits}`
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`
  return digits ? `+${digits}` : ''
}
