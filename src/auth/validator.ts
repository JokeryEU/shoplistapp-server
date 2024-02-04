import { check, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express'
import createError from 'http-errors'

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void

export const blacklist =
  (notAllowedFields: string[]): MiddlewareFunction =>
  async (req, res, next) => {
    const validations = notAllowedFields.map((field) =>
      check(field)
        .not()
        .exists()
        .withMessage(`Not allowed to modify ${field} field!`)
    )

    await Promise.all(validations.map((v) => v.run(req)))

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      next()
    } else {
      next(createError(400, 'Errors in request body', { errorsList: errors }))
    }
  }
