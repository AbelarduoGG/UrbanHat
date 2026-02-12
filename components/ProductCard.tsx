import Link from "next/link";

export default function ProductCard({ product }: any) {
  return (
    <Link href={`/productos/${product.slug}`}>
      <div className="border rounded-xl p-4 hover:shadow-lg transition">
        <img src={product.image} alt={product.name} />
        <h2 className="font-semibold mt-2">{product.name}</h2>
        <p className="text-gray-600">${product.price}</p>
      </div>
    </Link>
  );
}
