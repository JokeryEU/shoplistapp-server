import { Schema, model } from 'mongoose'
import { password } from 'bun'
import createError from 'http-errors'
import type { User, UserModel } from './types'

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
      max: 50,
    },
    password: { type: String, trim: true, required: true, min: 8 },
    role: {
      type: String,
      required: true,
      default: 'User',
      enum: ['User', 'Admin'],
    },
    history: [{ type: String, trim: true, min: 3 }],
    refreshToken: String,
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  const newUser = this
  const plainPW = newUser.password
  if (newUser.isModified('password')) {
    newUser.password = await password.hash(plainPW, {
      algorithm: 'bcrypt',
      cost: Number(process.env.SALT_ROUNDS as string),
    })
  }
  next()
})

UserSchema.post('save', function (error: any, doc: any, next: any) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(createError(400, 'Invalid Email!'))
  } else {
    next(error)
  }
})

UserSchema.statics.checkCredentials = async function (
  email,
  candidatePassword
) {
  const user = await this.findOne({ email })

  if (user) {
    const isOk = await password.verify(candidatePassword, user.password)
    if (isOk) return user
    else return null
  } else return null
}

UserSchema.methods.toJSON = function () {
  const user = this

  const userObject = user.toObject()

  delete userObject.password
  delete userObject.__v
  delete userObject.refreshToken

  return userObject
}

export default model<User, UserModel>('User', UserSchema)
