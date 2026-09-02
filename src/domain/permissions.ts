export const permissions = [
  'patients.read', 'patients.write', 'examinations.read', 'examinations.write',
  'inventory.read', 'inventory.write', 'payments.read', 'payments.write',
  'reports.read', 'reports.export', 'shifts.read', 'shifts.write',
  'settings.write', 'staff.write', 'audit.read', 'platform.tenants'
] as const
export type Permission = typeof permissions[number]
export type Role = 'platform_admin' | 'tenant_admin' | 'front_desk' | 'technologist' | 'accountant_manager'

const rolePermissions: Record<Role, readonly Permission[]> = {
  platform_admin: ['platform.tenants'],
  tenant_admin: permissions.filter((permission) => permission !== 'platform.tenants'),
  front_desk: ['patients.read', 'patients.write', 'examinations.read', 'examinations.write', 'payments.read', 'payments.write'],
  technologist: ['examinations.read', 'examinations.write', 'inventory.read', 'inventory.write', 'shifts.read', 'shifts.write'],
  accountant_manager: ['patients.read', 'examinations.read', 'payments.read', 'reports.read', 'reports.export', 'shifts.read', 'shifts.write']
}

export function can(role: Role | undefined, permission: Permission): boolean {
  return role ? rolePermissions[role].includes(permission) : false
}

export function permissionsFor(role: Role): readonly Permission[] { return rolePermissions[role] }
