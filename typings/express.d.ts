import { UserDocument } from '../src/models/users/types'
import { ListDocument } from '../src/models/lists/types'

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument | ListDocument
    }
  }
}
