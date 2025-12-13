import type { Request, Response, NextFunction } from 'express'
import type { ZodType, ZodError } from 'zod'
import createError from 'http-errors'

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void

const formatZodError = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))

/**
 * Validate request body against a Zod schema.
 * On success, `req.body` is replaced with the parsed (and transformed) value.
 */
export const validateBody =
  (schema: ZodType): MiddlewareFunction =>
  (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (result.success) {
      req.body = result.data
      next()
    } else {
      next(
        createError(400, 'Validation failed', {
          errorsList: formatZodError(result.error),
        })
      )
    }
  }

/**
 * Validate request params against a Zod schema.
 * On success, `req.params` is replaced with the parsed value.
 */
export const validateParams =
  (schema: ZodType): MiddlewareFunction =>
  (req, res, next) => {
    const result = schema.safeParse(req.params)
    if (result.success) {
      Object.assign(req.params, result.data)
      next()
    } else {
      next(
        createError(400, 'Invalid params', {
          errorsList: formatZodError(result.error),
        })
      )
    }
  }
