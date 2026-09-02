import { describe, expect, it } from 'vitest'
import { hasMembershipAccess } from './membership'

describe('tenant membership access', () => {
  it('only activates active memberships', () => {
    expect(hasMembershipAccess(undefined)).toBe(false)
    expect(hasMembershipAccess({ tenantId: 'a', userId: 'u', role: 'front_desk', permissions: [], status: 'invited', locationIds: [] })).toBe(false)
    expect(hasMembershipAccess({ tenantId: 'a', userId: 'u', role: 'front_desk', permissions: [], status: 'active', locationIds: [] })).toBe(true)
  })
})
