import { Request, Response, NextFunction } from 'express'
import { User } from '../models/users/types'
import { authenticate } from '../auth/tools'
import UserModel from '../models/users/userModel'
import createError from 'http-errors'

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void

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
    res.cookie('accessToken', tokens?.accessToken, {
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true,
    })
    res.cookie('refreshToken', tokens?.refreshToken, {
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true,
    })

    res.send(user)
  } catch (error) {
    next(error)
  }
}

// @description Register a new user
// @route POST /users/register
// @access Public
export const registerUser: MiddlewareFunction = async (
  req: Request<{}, {}, User>,
  res,
  next
) => {
  try {
    const newUser = await UserModel.create({
      ...req.body,
      role: 'User',
    })
    if (!newUser) throw createError(400, 'Please try again.')
    const user = await UserModel.checkCredentials(
      req.body.email,
      req.body.password
    )
    const tokens = await authenticate(user)
    res.cookie('accessToken', tokens?.accessToken, {
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true,
    })
    res.cookie('refreshToken', tokens?.refreshToken, {
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true,
    })

    res.status(201).send(newUser)
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
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
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
  req: Request<{}, {}, User>,
  res,
  next
) => {
  try {
    const user = req.user

    if (!user) throw createError(404, 'Please log in')
    const updates = Object.keys(req.body) as (keyof User)[]

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
