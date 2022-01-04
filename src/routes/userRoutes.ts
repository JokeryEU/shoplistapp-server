import express from 'express'
import {
  authUser,
  getUserProfile,
  getUsers,
  logoutUser,
  registerUser,
  updateUserProfile,
} from '../controllers/userController'
import { authorize, JWTAuthMiddleware } from '../auth/index'
import { blacklist } from '../auth/validator'

const router = express.Router()

router.get('/', JWTAuthMiddleware, authorize(['Admin']), getUsers)
router.post('/register', registerUser)
router.post('/login', authUser)
router.post('/logout', JWTAuthMiddleware, logoutUser)

router
  .route('/profile')
  .get(JWTAuthMiddleware, getUserProfile)
  .put(JWTAuthMiddleware, blacklist(['role']), updateUserProfile)

export default router
