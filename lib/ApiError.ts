export class ApiError extends Error {
  statusCode: number
  errors?: unknown

  constructor(message: string, statusCode = 500, errors?: unknown) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}
