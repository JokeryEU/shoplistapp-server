import { Document, Model, ObjectId } from 'mongoose'

export interface List {
  user: ObjectId
  title: string
  products?: Product[]
  invited?: ObjectId[]
}

export interface Product {
  name: string
  unit?: string
  quantity?: number
  price?: number
  isFavorite: boolean
  isPinned: boolean
  isCrossedOff: boolean
}

export interface ListDocument extends List, Document {}

export interface ListModel extends Model<ListDocument> {}
