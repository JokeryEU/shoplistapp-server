import { z } from 'zod'

// MongoDB ObjectId pattern
const objectIdRegex = /^[0-9a-fA-F]{24}$/

export const mongoIdSchema = z.string().regex(objectIdRegex, 'Invalid ID')

export const createListSchema = z.object({
  title: z.string().trim().min(1).max(100),
  icon: z.string().trim().max(100).optional(),
})

export const updateListSchema = z.object({
  title: z.string().trim().min(1).max(100),
  icon: z.string().trim().max(100).optional(),
})

export const inviteEmailSchema = z.object({
  email: z.email().toLowerCase().trim(),
})

export const itemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().max(120).optional(),
  unit: z.string().trim().max(50).optional(),
  quantity: z.coerce.number().optional(),
  price: z.coerce.number().optional(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isCrossedOff: z.boolean().optional(),
})

// Partial schema for updating items (all fields optional)
export const updateItemSchema = itemSchema.partial()

export const itemIdParamSchema = z.object({
  itemId: mongoIdSchema,
})

// Inferred types for use in controllers
export type CreateListInput = z.infer<typeof createListSchema>
export type UpdateListInput = z.infer<typeof updateListSchema>
export type InviteEmailInput = z.infer<typeof inviteEmailSchema>
export type ItemInput = z.infer<typeof itemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
