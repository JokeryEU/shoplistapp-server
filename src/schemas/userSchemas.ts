import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email().toLowerCase().trim(),
  password: z.string().min(8),
})

export const registerSchema = z.object({
  email: z.email().toLowerCase().trim(),
  password: z.string().min(8),
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
})

export const updateProfileSchema = z
  .object({
    email: z.email().toLowerCase().trim().optional(),
    password: z.string().min(8).optional(),
    firstName: z.string().trim().max(50).optional(),
    lastName: z.string().trim().max(50).optional(),
  })
  .strict() // Disallows extra keys like 'role' or 'refreshToken'

// Inferred types for use in controllers
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
