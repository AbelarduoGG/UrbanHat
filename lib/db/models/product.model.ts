import mongoose, { Schema, type Document } from "mongoose"

export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId
  name: string
  brand: string
  description: string
  price: number
  stock: number
  imageUrl: string
  imageUrls: string[]
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
  brand: { type: String, default: "Sin marca" },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, required: true },
  imageUrls: {
    type: [String],
    default: [],
    validate: {
      validator: (value: string[]) => value.length > 0 && value.length <= 3,
      message: "Se requiere al menos 1 imagen y máximo 3",
    },
  },
  category: { type: String, default: "General" },
  isActive: { type: Boolean, default: true },
})

ProductSchema.pre("validate", function ensurePrimaryImage(next) {
  if ((!this.imageUrls || this.imageUrls.length === 0) && this.imageUrl) {
    this.imageUrls = [this.imageUrl]
  }

  if ((!this.imageUrl || this.imageUrl.length === 0) && this.imageUrls?.length > 0) {
    this.imageUrl = this.imageUrls[0]
  }

  next()
})

export const Product =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema)
