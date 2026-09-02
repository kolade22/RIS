import { describe, expect, it } from 'vitest'
import { evaluateFormula, validateFormula } from './accounting'

describe('accounting formulas', () => {
  it('evaluates approved arithmetic and rounds to a minor unit', () => {
    expect(evaluateFormula('openingCash + cashPayments - cashExpenses', { openingCash: 120000, cashPayments: 286500, cashExpenses: 10000 })).toBe(396500)
  })
  it('rejects executable or unknown expressions', () => {
    expect(() => validateFormula('eval(grossCharges)')).toThrow('Unknown formula variable')
    expect(() => evaluateFormula('cashPayments / cashExpenses', { cashPayments: 10, cashExpenses: 0 })).toThrow('divide by zero')
  })
  it('uses zero for a missing optional input', () => {
    expect(evaluateFormula('grossCharges - discounts', { grossCharges: 5000 })).toBe(5000)
  })
})
