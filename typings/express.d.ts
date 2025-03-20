import type { UserDocument } from '../src/models/users/types'

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument
    }
  }
}
