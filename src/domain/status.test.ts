import { describe, expect, it } from 'vitest'
import { canTransition, transitionExamination } from './status'

describe('examination status transitions', () => {
  it('allows the normal workflow', () => {
    expect(canTransition('waiting', 'in_progress')).toBe(true)
    expect(transitionExamination('in_progress', 'completed')).toBe('completed')
  })
  it('requires a reason for cancellation', () => {
    expect(() => transitionExamination('waiting', 'cancelled')).toThrow('reason')
    expect(transitionExamination('waiting', 'cancelled', 'Patient requested cancellation')).toBe('cancelled')
  })
  it('does not reopen terminal records', () => {
    expect(canTransition('completed', 'waiting')).toBe(false)
  })
})
