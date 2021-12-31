import { Document, Model, ObjectId } from 'mongoose'

export interface List {
  user: ObjectId
  title: string
  icon?: string
  items?: Item[]
  invited?: ObjectId[]
}

export interface Item {
  name: string
  category?: string
  unit?: string
  quantity?: number
  price?: number
  isFavorite: boolean
  isPinned: boolean
  isCrossedOff: boolean
}

export interface ListDocument extends List, Document {}

export interface ListModel extends Model<ListDocument> {}
