import { connectDB } from "@/lib/db/connection"
import { Product, type IProduct } from "@/lib/db/models"

export async function getAllProducts(onlyActive = true) {
  await connectDB()
  const filter = onlyActive ? { isActive: true } : {}
  return Product.find(filter)
    .populate("sellerId", "name shopName")
    .sort({ _id: -1 })
    .lean()
}

export async function getProductById(id: string) {
  await connectDB()
  return Product.findById(id).lean()
}

export async function getProductsBySeller(sellerId: string) {
  await connectDB()
  return Product.find({ sellerId, isActive: true }).sort({ _id: -1 }).lean()
}

export async function createProduct(data: Partial<IProduct>) {
  await connectDB()
  const product = new Product(data)
  return product.save()
}

export async function updateProduct(
  id: string,
  sellerId: string,
  data: Partial<IProduct>
) {
  await connectDB()
  return Product.findOneAndUpdate(
    { _id: id, sellerId },
    { $set: data },
    { new: true, runValidators: true }
  ).lean()
}

export async function deleteProduct(id: string, sellerId: string) {
  await connectDB()
  // Soft delete
  return Product.findOneAndUpdate(
    { _id: id, sellerId },
    { $set: { isActive: false } },
    { new: true }
  ).lean()
}
