import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

const db = getFirestore()

/**
 * Tenant creation. Runs for authenticated users only. The function itself is the
 * only writer of tenant documents, memberships, and platform counters, so
 * Firestore rules can deny all direct client writes to these paths.
 */

const createTenantSchema = z.object({
  tenantName: z.string().trim().min(2).max(120),
  administratorName: z.string().trim().min(2).max(120),
  timezone: z.string().trim().min(1).default('Africa/Lagos'),
  currency: z.literal('NGN').default('NGN'),
  receiptPrefix: z.string().trim().min(1).max(8).regex(/^[A-Z0-9-]+$/),
  patientNumberPrefix: z.string().trim().min(1).max(8).regex(/^[A-Z0-9-]+$/),
})

export const createTenant = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.')
  const parsed = createTenantSchema.safeParse(request.data)
  if (!parsed.success) throw new HttpsError('invalid-argument', 'Invalid tenant details.')

  const callerMemberships = await db
    .collectionGroup('memberships')
    .where('userId', '==', request.auth.uid)
    .get()
  if (callerMemberships.docs.length > 0) {
    throw new HttpsError('failed-precondition', 'This account already belongs to a tenant.')
  }

  const settings = parsed.data
  const tenantRef = db.collection('tenants').doc()

  await tenantRef.set({
    name: settings.tenantName,
    status: 'active',
    timezone: settings.timezone,
    currency: settings.currency,
    receiptPrefix: settings.receiptPrefix,
    patientNumberPrefix: settings.patientNumberPrefix,
    createdBy: request.auth.uid,
    createdAt: FieldValue.serverTimestamp(),
  })

  await tenantRef.collection('memberships').doc(request.auth.uid).set({
    userId: request.auth.uid,
    role: 'tenant_admin',
    permissions: ['patients.read', 'patients.write', 'examinations.read', 'examinations.write', 'inventory.read', 'inventory.write', 'payments.read', 'payments.write', 'reports.read', 'reports.export', 'shifts.read', 'shifts.write', 'settings.write', 'staff.write', 'audit.read'],
    status: 'active',
    locationIds: [],
    displayName: settings.administratorName,
    invitedBy: request.auth.uid,
    createdAt: FieldValue.serverTimestamp(),
  })

  await db.collection('platform').doc('registry').set(
    { tenantIds: FieldValue.arrayUnion(tenantRef.id) },
    { merge: true }
  )

  return { tenantId: tenantRef.id }
})

/**
 * Staff invitation. Tenant admins only. Invitation documents are written by
 * this function, never by clients.
 */

const inviteStaffSchema = z.object({
  tenantId: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().trim().min(2).max(120),
  role: z.enum(['tenant_admin', 'front_desk', 'technologist', 'accountant_manager']),
})

export const inviteStaff = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.')
  const parsed = inviteStaffSchema.safeParse(request.data)
  if (!parsed.success) throw new HttpsError('invalid-argument', 'Invalid invitation details.')

  const callerRole = await getCallerRole(parsed.data.tenantId, request.auth.uid)
  if (callerRole !== 'tenant_admin') {
    throw new HttpsError('permission-denied', 'Only tenant administrators can invite staff.')
  }

  const invitationRef = db
    .collection('tenants')
    .doc(parsed.data.tenantId)
    .collection('invitations')
    .doc()

  await invitationRef.set({
    email: parsed.data.email.toLowerCase(),
    displayName: parsed.data.displayName,
    role: parsed.data.role,
    status: 'invited',
    invitedBy: request.auth.uid,
    acceptedAt: null,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: FieldValue.serverTimestamp(),
  })

  return { invitationId: invitationRef.id }
})

/**
 * Invitation acceptance. Links the caller's auth account to the tenant
 * membership. Sets a display name on the user profile document.
 */

const acceptInvitationSchema = z.object({ invitationId: z.string().min(1) })

export const acceptInvitation = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.')
  const parsed = acceptInvitationSchema.safeParse(request.data)
  if (!parsed.success) throw new HttpsError('invalid-argument', 'Invalid acceptance details.')

  const invitationId = parsed.data.invitationId

  const invitationQuery = await db
    .collectionGroup('invitations')
    .where('invitationId', '==', invitationId)
    .get()
  if (invitationQuery.empty) throw new HttpsError('not-found', 'This invitation link is not valid.')
  const invitationDoc = invitationQuery.docs[0]

  const invitation = invitationDoc.data()
  if (invitation.status !== 'invited') {
    throw new HttpsError('failed-precondition', 'This invitation has already been used.')
  }
  const expiresAtMs = typeof invitation.expiresAt?.toMillis === 'function' ? invitation.expiresAt.toMillis() : null
  if (expiresAtMs !== null && expiresAtMs < Date.now()) {
    throw new HttpsError('failed-precondition', 'This invitation has expired.')
  }
  if (invitation.email !== request.auth.token.email) {
    throw new HttpsError('permission-denied', 'This invitation was sent to a different email address.')
  }

  const tenantId = invitationDoc.ref.parent.parent!.id

  await db.collection('tenants').doc(tenantId).collection('memberships').doc(request.auth.uid).set({
    userId: request.auth.uid,
    role: invitation.role,
    permissions: defaultPermissionsFor(invitation.role),
    status: 'active',
    locationIds: [],
    displayName: invitation.displayName,
    invitedBy: invitation.invitedBy,
    createdAt: FieldValue.serverTimestamp(),
  })

  await invitationDoc.ref.update({ status: 'accepted', acceptedAt: FieldValue.serverTimestamp() })

  return { tenantId }
})

function defaultPermissionsFor(role: string): string[] {
  switch (role) {
    case 'tenant_admin': return ['patients.read', 'patients.write', 'examinations.read', 'examinations.write', 'inventory.read', 'inventory.write', 'payments.read', 'payments.write', 'reports.read', 'reports.export', 'shifts.read', 'shifts.write', 'settings.write', 'staff.write', 'audit.read']
    case 'front_desk': return ['patients.read', 'patients.write', 'examinations.read', 'examinations.write', 'payments.read', 'payments.write']
    case 'technologist': return ['examinations.read', 'examinations.write', 'inventory.read', 'inventory.write', 'shifts.read', 'shifts.write']
    case 'accountant_manager': return ['patients.read', 'examinations.read', 'payments.read', 'reports.read', 'reports.export', 'shifts.read', 'shifts.write']
    default: return []
  }
}

async function getCallerRole(tenantId: string, uid: string): Promise<string | undefined> {
  const membership = await db
    .collection('tenants')
    .doc(tenantId)
    .collection('memberships')
    .doc(uid)
    .get()
  const data = membership.data()
  return data?.status === 'active' ? data.role : undefined
}
