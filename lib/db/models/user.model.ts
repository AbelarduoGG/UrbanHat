import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "superadmin" | "seller" | "buyer"
  shopName?: string
  isActive: boolean
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["superadmin", "seller", "buyer"],
    default: "buyer",
  },
  shopName: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
