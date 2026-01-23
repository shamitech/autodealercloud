import { ZodSchema, ZodError } from 'zod'

export function createValidationError(error: ZodError) {
  const fieldErrors: Record<string, string[]> = {}
  
  error.errors.forEach(err => {
    const path = err.path.join('.')
    if (!fieldErrors[path]) {
      fieldErrors[path] = []
    }
    fieldErrors[path].push(err.message)
  })

  return {
    success: false,
    error: 'Validation failed',
    details: fieldErrors,
  }
}

export function validateRequest<T>(schema: ZodSchema, data: unknown): { success: boolean; data?: T; error?: any } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated as T }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: createValidationError(error) }
    }
    return { success: false, error: { success: false, error: 'Unknown validation error' } }
  }
}
