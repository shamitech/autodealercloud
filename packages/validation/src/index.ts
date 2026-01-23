import { z } from 'zod'

// Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Tenant Schemas
export const CreateTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email').optional(),
  slug: z.string().min(1).max(50).optional(),
  plan: z.enum(['basic', 'pro', 'enterprise']).default('basic'),
})

export const UpdateTenantSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  slug: z.string().min(1).max(50).optional(),
  plan: z.enum(['basic', 'pro', 'enterprise']).optional(),
  status: z.enum(['active', 'suspended', 'cancelled']).optional(),
})

// User Schemas
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'manager', 'member']).default('member'),
  tenantId: z.string().uuid().optional(),
})

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'manager', 'member']).optional(),
})

// Component Schemas
export const CreateComponentSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  type: z.enum(['atom', 'molecule', 'organism', 'template']),
  description: z.string().optional(),
  code: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const UpdateComponentSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['atom', 'molecule', 'organism', 'template']).optional(),
  description: z.string().optional(),
  code: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// Page Schemas
export const CreatePageSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  title: z.string().min(1, 'Page title is required'),
  slug: z.string().min(1, 'Page slug is required'),
  content: z.string().optional(),
})

export const UpdatePageSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().optional(),
})

// Analytics Schemas
export const TrackEventSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  eventData: z.record(z.any()).optional(),
  tenantId: z.string().uuid().optional(),
})

// Custom Domain Schemas
export const CreateCustomDomainSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  domain: z.string().min(1, 'Domain is required').refine(
    (domain) => /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domain),
    'Invalid domain format'
  ),
})

export const CreateAuthDomainSchema = z.object({
  domain: z.string().min(1, 'Domain is required').refine(
    (domain) => /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domain),
    'Invalid domain format'
  ),
  description: z.string().optional(),
})

export const CreatePublishDomainSchema = z.object({
  domain: z.string().min(1, 'Domain is required').refine(
    (domain) => /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domain),
    'Invalid domain format'
  ),
  description: z.string().optional(),
})

// Type exports
export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type CreateTenantInput = z.infer<typeof CreateTenantSchema>
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>
export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type CreateComponentInput = z.infer<typeof CreateComponentSchema>
export type UpdateComponentInput = z.infer<typeof UpdateComponentSchema>
export type CreatePageInput = z.infer<typeof CreatePageSchema>
export type UpdatePageInput = z.infer<typeof UpdatePageSchema>
export type TrackEventInput = z.infer<typeof TrackEventSchema>
export type CreateCustomDomainInput = z.infer<typeof CreateCustomDomainSchema>
export type CreateAuthDomainInput = z.infer<typeof CreateAuthDomainSchema>
export type CreatePublishDomainInput = z.infer<typeof CreatePublishDomainSchema>
