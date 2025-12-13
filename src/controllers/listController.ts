import type { Request, Response, NextFunction } from 'express'
import type { Item, List } from '../models/lists/types'
import listModel from '../models/lists/listModel'
import createHttpError from 'http-errors'
import type { User } from '../models/users/types'
import userModel from '../models/users/userModel'
import { isValidObjectId } from 'mongoose'

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void

// @description Get all lists
// @route GET /lists
// @access Private/Admin
export const getLists: MiddlewareFunction = async (req, res, next) => {
  try {
    const lists = await listModel.find({})
    res.send(lists)
  } catch (error) {
    next(error)
  }
}

// @description Get user lists
// @route GET /lists/user
// @access Private
export const getUserLists: MiddlewareFunction = async (req, res, next) => {
  try {
    const userLists = await listModel.find({
      $or: [{ user: req.user!._id }, { invited: req.user!._id }],
    })

    res.send(userLists)
  } catch (error) {
    next(error)
  }
}

// @description Create list
// @route POST /lists/user
// @access Private
export const createList: MiddlewareFunction = async (
  req: Request<{}, {}, Pick<List, 'title' | 'icon'>>,
  res,
  next
) => {
  try {
    const newlist = await listModel.create({
      ...req.body,
      user: req.user!._id,
    })

    res.status(201).send(newlist)
  } catch (error) {
    next(error)
  }
}

// @description Add item to the list
// @route POST /lists/:id
// @access Private
export const addToList = async (
  req: Request<{ id: string }, {}, Item>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id

    const updateList = await listModel.findByIdAndUpdate(
      id,
      {
        $addToSet: { items: req.body },
      },
      { new: true, runValidators: true }
    )
    if (!updateList) throw createHttpError(404, 'List not found!')
    res.send({
      success: true,
      message: `${req.body.name} added to the list`,
      item: updateList.items,
    })
  } catch (error) {
    next(error)
  }
}

// @description Remove list
// @route DELETE /lists/:id
// @access Private
export const removeList = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const removedlist = await listModel.findByIdAndDelete(req.params.id)

    if (removedlist) {
      res.status(204).send({
        success: true,
        message: `${removedlist.title} list removed`,
      })
    } else {
      throw createHttpError(404, 'List not found!')
    }
  } catch (error) {
    next(error)
  }
}

// @description Remove item from the list
// @route DELETE /lists/:id/item/:itemId
// @access Private
export const removeFromList = async (
  req: Request<{ id: string; itemId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id
    const item = req.params.itemId

    const removeItem = await listModel.findByIdAndUpdate(
      id,
      {
        $pull: { items: { _id: item } },
      },
      { new: true, runValidators: true }
    )

    if (!removeItem) throw createHttpError(404, 'List not found!')
    res.send({
      success: true,
      message: 'Item removed',
    })
  } catch (error) {
    next(error)
  }
}

// @description Update list
// @route PUT /lists/:id
// @access Private
export const updateList = async (
  req: Request<{ id: string }, {}, List>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id

    const updateList = await listModel.findByIdAndUpdate(
      id,
      {
        $set: {
          title: req.body.title,
          icon: req.body.icon,
        },
      },

      { new: true, runValidators: true }
    )

    if (!updateList) throw createHttpError(404, 'List not found!')
    res.send({
      success: true,
      message: `List updated`,
    })
  } catch (error) {
    next(error)
  }
}

// @description Update item in the list
// @route PUT /lists/:id/item/:itemId
// @access Private
export const updateItem = async (
  req: Request<{ id: string; itemId: string }, {}, Item>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id
    const item = req.params.itemId

    const updateItem = await listModel.findOneAndUpdate(
      { _id: id, 'items._id': item },
      {
        $set: {
          'items.$.name': req.body.name,
          'items.$.unit': req.body.unit,
          'items.$.category': req.body.category,
          'items.$.price': req.body.price,
          'items.$.quantity': req.body.quantity,
          'items.$.isFavorite': req.body.isFavorite,
          'items.$.isPinned': req.body.isPinned,
          'items.$.isCrossedOff': req.body.isCrossedOff,
        },
      },

      { new: true, runValidators: true }
    )

    if (!updateItem) throw createHttpError(404, 'List not found!')

    res.send({
      success: true,
      message: `Item updated`,
      items: updateItem.items,
    })
  } catch (error) {
    next(error)
  }
}

// @description Invite to the list
// @route POST /lists/:id/invited
// @access Private
export const addInvitedToList = async (
  req: Request<{ id: string }, {}, Pick<User, 'email'>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id
    const findUser = await userModel.findOne({ email: req.body.email })
    if (!findUser) throw createHttpError(404, 'No user found!')

    const updateList = await listModel.findByIdAndUpdate(
      id,
      {
        $addToSet: { invited: findUser._id },
      },
      { new: true, runValidators: true }
    )
    if (updateList) {
      res.send({
        message: `${req.body.email} added to the list`,
      })
    } else {
      throw createHttpError(404, 'List not found!')
    }
  } catch (error) {
    next(error)
  }
}

// @description Remove invited user from the list
// @route PUT /lists/:id/invited
// @access Private
export const removeInvited = async (
  req: Request<{ id: string }, {}, Pick<User, 'email'>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id
    const findUser = await userModel.findOne({ email: req.body.email })
    if (findUser) {
      const removeInvited = await listModel.findByIdAndUpdate(
        id,
        {
          $pull: { invited: findUser._id },
        },
        { new: true, runValidators: true }
      )

      if (removeInvited) {
        res.send({
          message: `${req.body.email} removed`,
        })
      } else {
        next(createHttpError(404, 'List not found!'))
      }
    } else {
      next(createHttpError(404, 'No user found!'))
    }
  } catch (error) {
    next(error)
  }
}

// @description Checking if user is the owner of the current list
// @route POST-PUT-DELETE users owned lists
// @access Private
export const ownsList: MiddlewareFunction = async (req, res, next) => {
  try {
    const isValidId = isValidObjectId(req.params.id)
    if (!isValidId) throw createHttpError(400, 'Invalid ID')

    const userList = await listModel.findOne({
      _id: req.params.id,
      user: req.user!._id,
    })

    if (userList) {
      next()
    } else {
      next(createHttpError(403, 'Not allowed!'))
    }
  } catch (error) {
    next(error)
  }
}
