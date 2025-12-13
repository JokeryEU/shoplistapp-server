import type { Request, Response, NextFunction } from 'express'
import type { User } from '../models/users/types'
import { authenticate, verifyRefreshJWT } from '../auth/tools'
import UserModel from '../models/users/userModel'
import createError from 'http-errors'

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void

const getAuthCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    httpOnly: true,
    path: '/',
  }
}

// @description Auth user & get tokens
// @route POST /users/login
// @access Public
export const authUser: MiddlewareFunction = async (
  req: Request<{}, {}, Pick<User, 'email' | 'password'>>,
  res,
  next
) => {
  try {
    const { email, password } = req.body
    const user = await UserModel.checkCredentials(email, password)
    if (!user) throw createError(400, 'Invalid email or password')

    const tokens = await authenticate(user)
    const cookieOptions = getAuthCookieOptions()
    res.cookie('accessToken', tokens.accessToken, cookieOptions)
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions)

    res.send(user)
  } catch (error) {
    next(error)
  }
}

// @description Register a new user
// @route POST /users/register
// @access Public
export const registerUser: MiddlewareFunction = async (
  req: Request<
    {},
    {},
    Pick<User, 'email' | 'password' | 'firstName' | 'lastName'>
  >,
  res,
  next
) => {
  try {
    const newUser = await UserModel.create({
      ...req.body,
      role: 'User',
    })
    if (!newUser) throw createError(400, 'Please try again.')

    const tokens = await authenticate(newUser)
    const cookieOptions = getAuthCookieOptions()
    res.cookie('accessToken', tokens.accessToken, cookieOptions)
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions)

    res.status(201).send(newUser)
  } catch (error) {
    next(error)
  }
}

// @description Refresh access & refresh tokens
// @route POST /users/refresh
// @access Public (cookie-based)
export const refreshTokens: MiddlewareFunction = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) throw createError(401, 'Please log in!')

    const decoded = await verifyRefreshJWT(refreshToken)
    if (!decoded?._id) throw createError(401, 'Please log in!')

    const user = await UserModel.findById(decoded._id)
    if (!user) throw createError(401, 'Please log in!')

    // Enforce refresh-token rotation / single active refresh token.
    if (!user.refreshToken || user.refreshToken !== refreshToken) {
      user.refreshToken = undefined
      await user.save()

      const cookieOptions = getAuthCookieOptions()
      res.clearCookie('accessToken', cookieOptions)
      res.clearCookie('refreshToken', cookieOptions)
      throw createError(401, 'Invalid refresh token')
    }

    const tokens = await authenticate(user)
    const cookieOptions = getAuthCookieOptions()
    res.cookie('accessToken', tokens.accessToken, cookieOptions)
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions)

    res.status(200).send({ success: true })
  } catch (error) {
    next(error)
  }
}

// @description Logout user
// @route POST /users/logout
// @access Private
export const logoutUser: MiddlewareFunction = async (req, res, next) => {
  try {
    req.user!.refreshToken = undefined
    await req.user?.save()

    const cookieOptions = getAuthCookieOptions()
    res.clearCookie('accessToken', cookieOptions)
    res.clearCookie('refreshToken', cookieOptions)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

// @description Get user profile
// @route GET /users/profile
// @access Private
export const getUserProfile: MiddlewareFunction = async (req, res, next) => {
  try {
    res.send(req.user)
  } catch (error) {
    next(error)
  }
}

// @description Update user profile
// @route PUT /users/profile
// @access Private
export const updateUserProfile: MiddlewareFunction = async (
  req: Request<
    {},
    {},
    Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'password'>>
  >,
  res,
  next
) => {
  try {
    const user = req.user

    if (!user) throw createError(404, 'Please log in')

    const updates = Object.keys(req.body) as (keyof typeof req.body)[]
    updates.forEach((update) => ((user as any)[update] = req.body[update]))
    await user.save()

    res.send(user)
  } catch (error) {
    next(error)
  }
}

// @description Get all users
// @route GET /users
// @access Private/Admin
export const getUsers: MiddlewareFunction = async (req, res, next) => {
  try {
    const users = await UserModel.find({})
    res.send(users)
  } catch (error) {
    next(error)
  }
}
