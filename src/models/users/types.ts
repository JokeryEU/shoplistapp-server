import { Document, Model } from 'mongoose'

export interface User {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
  refreshToken?: string
}

export interface UserDocument extends User, Document {}

export interface UserModel extends Model<UserDocument> {
  checkCredentials(email: string, password: string): Promise<UserDocument>
}
