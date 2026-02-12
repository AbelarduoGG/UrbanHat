import Image from "next/image"
import Link from "next/link"

const categories = [
  {
    name: "Snapbacks",
    image: "/images/snapback-black.jpg",
    count: "24 Productos",
    href: "#",
  },
  {
    name: "Dad Hats",
    image: "/images/dad-hat-gray.jpg",
    count: "18 Productos",
    href: "#",
  },
  {
    name: "Truckers",
    image: "/images/trucker-cap.jpg",
    count: "15 Productos",
    href: "#",
  },
]

export function Categories() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Categorias
          </p>
          <h3 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
            Elige tu Estilo
          </h3>
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-lg bg-secondary"
            >
              <div className="aspect-square overflow-hidden">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-card">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest opacity-80">
                  {category.count}
                </p>
                <h4 className="font-display text-2xl font-bold uppercase">{category.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
