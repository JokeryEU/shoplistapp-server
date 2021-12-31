import express from 'express'
import {
  addInvitedToList,
  addToList,
  createList,
  getLists,
  getUserLists,
  removeFromList,
  removeInvited,
  removeList,
  updateItem,
  updateList,
} from '../controllers/listController'
import { ownsList, authorize, JWTAuthMiddleware } from '../auth'

const router = express.Router()

router.get('/', JWTAuthMiddleware, authorize(['Admin']), getLists)
router.get('/user', JWTAuthMiddleware, getUserLists)

router.post('/user', JWTAuthMiddleware, createList)
router.post('/:id/invited', JWTAuthMiddleware, ownsList, addInvitedToList)
router.post('/:id', JWTAuthMiddleware, ownsList, addToList)

router.put('/:id/item/:itemId', JWTAuthMiddleware, ownsList, updateItem)
router.put('/:id', JWTAuthMiddleware, ownsList, updateList)

router.delete('/:id/item/:itemId', JWTAuthMiddleware, ownsList, removeFromList)
router.delete('/:id/invited', JWTAuthMiddleware, ownsList, removeInvited)
router.delete('/:id', JWTAuthMiddleware, ownsList, removeList)

export default router
