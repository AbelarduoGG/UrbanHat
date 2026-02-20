export interface Product {
  id: string
  sellerId: string
  sellerName: string
  name: string
  brand: string
  price: number
  image: string
  images: string[]
  category: string
  description: string
  stock: number
}

export const defaultProducts: Product[] = []
