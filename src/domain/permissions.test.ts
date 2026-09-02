import { describe, expect, it } from 'vitest'
import { can } from './permissions'

describe('permissions', () => {
  it('keeps permission checks deny-by-default', () => {
    expect(can(undefined, 'patients.read')).toBe(false)
    expect(can('front_desk', 'settings.write')).toBe(false)
    expect(can('technologist', 'inventory.write')).toBe(true)
    expect(can('platform_admin', 'patients.read')).toBe(false)
  })
})
