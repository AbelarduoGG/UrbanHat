import { Truck, Shield, Repeat, Headphones } from "lucide-react"

const features = [
  {
    icon: Truck,
    title: "Envio Gratis",
    description: "En pedidos mayores a $999 MXN. Envios a toda la republica.",
  },
  {
    icon: Shield,
    title: "Calidad Garantizada",
    description: "Materiales premium en cada gorra. Garantia de satisfaccion.",
  },
  {
    icon: Repeat,
    title: "Cambios Faciles",
    description: "30 dias para cambios y devoluciones sin complicaciones.",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description: "Estamos aqui para ti. Contactanos cuando lo necesites.",
  },
]

export function FeaturesSection() {
  return (
    <section className="border-y border-border bg-background px-4 py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-border">
              <feature.icon className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              {feature.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
