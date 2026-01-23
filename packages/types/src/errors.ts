export enum ErrorCode {
  // Auth errors (4001-4099)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Validation errors (4201-4299)
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resource errors (4041-4099)
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  FORBIDDEN = 'FORBIDDEN',

  // Server errors (5001-5099)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: Record<string, any>
    timestamp: string
  }
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  timestamp: string
}

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getStatusCode(code: ErrorCode): number {
  if (code.startsWith('UNAUTHORIZED') || code === ErrorCode.INVALID_CREDENTIALS || code === ErrorCode.TOKEN_EXPIRED || code === ErrorCode.INVALID_TOKEN) {
    return 401
  }
  if (code === ErrorCode.VALIDATION_FAILED || code === ErrorCode.INVALID_INPUT) {
    return 422
  }
  if (code === ErrorCode.FORBIDDEN) {
    return 403
  }
  if (code === ErrorCode.NOT_FOUND) {
    return 404
  }
  if (code === ErrorCode.CONFLICT) {
    return 409
  }
  return 500
}

export function createErrorResponse(error: ApiError): ApiErrorResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
    },
  }
}

export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }
}
