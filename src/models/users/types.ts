import { Document, Model } from 'mongoose'

export interface User {
  firstName: string
  lastName: string
  email: string
  role: string
  refreshToken: string
  googleId: string
  profilePic: string
}

export interface UserDocument extends User, Document {}

export interface UserModel extends Model<UserDocument> {}
