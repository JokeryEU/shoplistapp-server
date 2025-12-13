import { Router } from 'express'
import {
  addInvitedToList,
  addToList,
  createList,
  getLists,
  getUserLists,
  ownsList,
  removeFromList,
  removeInvited,
  removeList,
  updateItem,
  updateList,
} from '../controllers/listController'
import { authorize, JWTAuthMiddleware } from '../auth/index'
import { validateBody, validateParams } from '../auth/validator'
import {
  createListSchema,
  inviteEmailSchema,
  itemIdParamSchema,
  itemSchema,
  updateListSchema,
} from '../schemas/listSchemas'

const router = Router()

router.get('/', JWTAuthMiddleware, authorize(['Admin']), getLists)
router.get('/user', JWTAuthMiddleware, getUserLists)

router.post(
  '/user',
  JWTAuthMiddleware,
  validateBody(createListSchema),
  createList
)

router.post(
  '/:id/invited',
  JWTAuthMiddleware,
  ownsList,
  validateBody(inviteEmailSchema),
  addInvitedToList
)

router.post(
  '/:id',
  JWTAuthMiddleware,
  ownsList,
  validateBody(itemSchema),
  addToList
)

router.put(
  '/:id/item/:itemId',
  JWTAuthMiddleware,
  ownsList,
  validateParams(itemIdParamSchema),
  validateBody(itemSchema),
  updateItem
)

router.put(
  '/:id/invited',
  JWTAuthMiddleware,
  ownsList,
  validateBody(inviteEmailSchema),
  removeInvited
)

router.put(
  '/:id',
  JWTAuthMiddleware,
  ownsList,
  validateBody(updateListSchema),
  updateList
)

router.delete(
  '/:id/item/:itemId',
  JWTAuthMiddleware,
  ownsList,
  validateParams(itemIdParamSchema),
  removeFromList
)
router.delete('/:id', JWTAuthMiddleware, ownsList, removeList)

export default router
