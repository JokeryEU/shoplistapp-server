import mongoose from 'mongoose'
import createError from 'http-errors'

import { User, UserModel } from './types'

const { Schema, model } = mongoose

const UserSchema = new Schema<User, UserModel>(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      default: 'User',
      enum: ['User', 'Admin'],
    },
    googleId: String,
    profilePic: String,
    refreshToken: String,
  },
  { timestamps: true }
)

UserSchema.post('save', function (error: any, doc: any, next: any) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(createError(400, 'Email already in use!'))
  } else {
    next(error)
  }
})

export default model<User, UserModel>('User', UserSchema)
