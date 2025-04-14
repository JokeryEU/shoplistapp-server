import type { Request, Response, NextFunction } from 'express'
import { HttpError } from 'http-errors'

export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default to a 500 if no error status is provided.
  const statusCode = err.status || 500
  const defaultMessages: { [key: number]: string } = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
  }

  console.error('Error:', err)

  res.status(statusCode).json({
    status: statusCode,
    error: err.message || defaultMessages[statusCode],
    details: statusCode === 400 ? err.errorsList || null : undefined,
  })
}
