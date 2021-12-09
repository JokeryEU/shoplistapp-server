import mongoose from 'mongoose'
import { List, ListModel } from './types'

const { Schema, model } = mongoose

const ListSchema = new Schema<List, ListModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    title: { type: String, required: true, trim: true },
    products: [
      {
        name: { type: String, trim: true, required: true },
        unit: { type: String },
        quantity: { type: Number },
        price: { type: Number },
        isFavorite: { type: Boolean, default: false },
        isPinned: { type: Boolean, default: false },
        isCrossedOff: { type: Boolean, default: false },
      },
    ],
    invited: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

export default model<List, ListModel>('Lists', ListSchema)
