import jwt from 'jsonwebtoken'
import { UserDocument } from '../models/users/types'
import { TokenPayload } from './types'

export const authenticate = async (user: UserDocument) => {
  const accessToken = await generateJWT({ _id: user._id })

  if (accessToken) {
    return accessToken
  } else {
    throw new Error('Error during token generation!')
  }
}

const generateJWT = (payload: TokenPayload): Promise<string | undefined> =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) rej(err)
        res(token)
      }
    )
  )

export const verifyJWT = (token: string): Promise<TokenPayload | undefined> =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
      if (err) rej(err)
      res(decoded as TokenPayload)
    })
  )
