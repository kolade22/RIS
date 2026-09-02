import type { Permission, Role } from './permissions'

export type MembershipStatus = 'invited' | 'active' | 'disabled'
export type TenantMembership = {
  tenantId: string
  userId: string
  role: Role
  permissions: Permission[]
  status: MembershipStatus
  locationIds: string[]
}

export function hasMembershipAccess(membership: TenantMembership | undefined): boolean {
  return membership?.status === 'active'
}
