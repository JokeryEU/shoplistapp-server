import { sign, verify } from 'jsonwebtoken'
import { UserDocument } from '../models/users/types'
import { TokenPayload } from './types'

export const authenticate = async (user: UserDocument) => {
  const newAccessToken = await generateJWT({ _id: user._id })
  if (!newAccessToken) throw new Error('Error during token generation!')
  const newRefreshToken = await generateRefreshJWT({ _id: user._id })
  user.refreshToken = newRefreshToken
  await user.save()

  if (newAccessToken && newRefreshToken) {
    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }
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
