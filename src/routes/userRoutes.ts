import { Router } from 'express'
import {
  authUser,
  getUserProfile,
  getUsers,
  logoutUser,
  refreshTokens,
  registerUser,
  updateUserProfile,
} from '../controllers/userController'
import { authorize, JWTAuthMiddleware } from '../auth/index'
import { validateBody } from '../auth/validator'
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../schemas/userSchemas'

const router = Router()

router.get('/', JWTAuthMiddleware, authorize(['Admin']), getUsers)

router.post('/register', validateBody(registerSchema), registerUser)

router.post('/login', validateBody(loginSchema), authUser)

router.post('/refresh', refreshTokens)
router.post('/logout', JWTAuthMiddleware, logoutUser)

router
  .route('/profile')
  .get(JWTAuthMiddleware, getUserProfile)
  .put(JWTAuthMiddleware, validateBody(updateProfileSchema), updateUserProfile)

export default router
