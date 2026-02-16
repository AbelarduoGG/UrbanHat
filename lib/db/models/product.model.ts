import mongoose, { Schema, type Document } from "mongoose"

export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  category: string
  isActive: boolean
}

const ProductSchema = new Schema<IProduct>({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, required: true },
  category: { type: String, default: "General" },
  isActive: { type: Boolean, default: true },
})

export const Product =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema)
