import { sign, verify } from 'jsonwebtoken'
import { type UserDocument } from '../models/users/types'
import { type TokenPayload } from './types'

export const authenticate = async (user: UserDocument) => {
  const userId = user._id.toString()
  const newAccessToken = await generateJWT({ _id: userId })
  if (!newAccessToken) throw new Error('Error during token generation!')

  const newRefreshToken = await generateRefreshJWT({ _id: userId })
  if (!newRefreshToken) throw new Error('Error during token generation!')

  user.refreshToken = newRefreshToken
  await user.save()

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

const generateJWT = (payload: TokenPayload): Promise<string | undefined> =>
  new Promise((res, rej) =>
    sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) rej(err)
        res(token)
      }
    )
  )

const generateRefreshJWT = (
  payload: TokenPayload
): Promise<string | undefined> =>
  new Promise((res, rej) =>
    sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' },
      (error, token) => {
        if (error) rej(error)
        res(token)
      }
    )
  )

export const verifyJWT = (token: string): Promise<TokenPayload | undefined> =>
  new Promise((res, rej) =>
    verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
      if (err) rej(err)
      res(decoded as TokenPayload)
    })
  )

export const verifyRefreshJWT = (
  token: string
): Promise<TokenPayload | undefined> =>
  new Promise((res, rej) =>
    verify(token, process.env.REFRESH_TOKEN_SECRET!, (err, decoded) => {
      if (err) rej(err)
      res(decoded as TokenPayload)
    })
  )
