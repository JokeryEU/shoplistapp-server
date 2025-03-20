import { Schema, model } from 'mongoose'
import type { List, ListModel, Item } from './types'

const itemSchema = new Schema<Item>(
  {
    name: { type: String, trim: true, required: true },
    category: { type: String },
    unit: { type: String },
    quantity: { type: Number, default: 1 },
    price: { type: Number },
    isFavorite: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    isCrossedOff: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const ListSchema = new Schema<List, ListModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    icon: String,
    title: { type: String, trim: true, required: true },
    items: [itemSchema],
    invited: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

export default model<List, ListModel>('Lists', ListSchema)
