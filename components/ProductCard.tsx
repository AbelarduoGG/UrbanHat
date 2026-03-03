import Image from "next/image"
import Link from "next/link"

interface ProductCardData {
  slug: string
  image: string
  name: string
  price: number
}

interface ProductCardProps {
  product: ProductCardData
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/productos/${product.slug}`}>
      <div className="rounded-xl border p-4 transition hover:shadow-lg">
        <div className="relative h-40 w-full overflow-hidden rounded-lg">
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </div>
        <h2 className="mt-2 font-semibold">{product.name}</h2>
        <p className="text-gray-600">${product.price}</p>
      </div>
    </Link>
  )
}
