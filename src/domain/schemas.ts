import { z } from 'zod'

export const tenantSettingsSchema = z.object({
  timezone: z.string().min(1).default('Africa/Lagos'),
  currency: z.literal('NGN').default('NGN'),
  receiptPrefix: z.string().trim().min(1).max(8).regex(/^[A-Z0-9-]+$/),
  patientNumberPrefix: z.string().trim().min(1).max(8).regex(/^[A-Z0-9-]+$/)
})

export const patientSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(30).optional(),
  dateOfBirth: z.string().date().optional(),
  sex: z.enum(['female', 'male', 'other', 'undisclosed']).optional()
})

export const examinationSchema = z.object({
  patientId: z.string().min(1), locationId: z.string().min(1), serviceId: z.string().min(1),
  priceMinor: z.number().int().nonnegative(), discountMinor: z.number().int().nonnegative().default(0),
  notes: z.string().trim().max(1000).optional()
}).refine((value) => value.discountMinor <= value.priceMinor, { message: 'Discount cannot exceed the service price', path: ['discountMinor'] })
