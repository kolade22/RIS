import { z } from 'zod'

export const onboardingSchema = z.object({
  tenantName: z.string().trim().min(2).max(120),
  administratorName: z.string().trim().min(2).max(120),
  email: z.string().email(),
  timezone: z.string().min(1).default('Africa/Lagos'),
  currency: z.literal('NGN').default('NGN'),
  receiptPrefix: z.string().trim().min(1).max(8).regex(/^[A-Z0-9-]+$/),
  patientNumberPrefix: z.string().trim().min(1).max(8).regex(/^[A-Z0-9-]+$/),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>
