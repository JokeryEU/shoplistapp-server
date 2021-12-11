import { Request, Response, NextFunction } from 'express'
import createError from 'http-errors'
import userModel from '../models/users/userModel'
import { verifyJWT } from './tools'

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void

export const JWTAuthMiddleware: MiddlewareFunction = async (req, res, next) => {
  try {
    if (req.cookies && req.cookies.accessToken) {
      const accessToken = req.cookies.accessToken

      const decoded = await verifyJWT(accessToken)

      const user = await userModel.findById(decoded!._id)

      if (user) {
        req.user = user
        next()
      } else {
        throw new Error('User not found!')
      }
    }
  } catch (error) {
    next(error)
  }
}

export const authorize =
  (allowedRoles: string[]): MiddlewareFunction =>
  async (req, res, next) => {
    if (req.user) {
      if (allowedRoles.includes(req.user.role)) {
        next()
      } else {
        next(createError(403, 'Not allowed!'))
      }
    } else {
      next(createError(401, 'Please log in!'))
    }
  }
