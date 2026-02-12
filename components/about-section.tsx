import Image from "next/image"

export function AboutSection() {
  const stats = [
    { value: "500+", label: "Gorras Vendidas" },
    { value: "6", label: "Estilos Unicos" },
    { value: "100%", label: "Calidad Premium" },
    { value: "2026", label: "Fundacion" },
  ]

  return (
    <section id="nosotros" className="bg-card px-4 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/about-bg.jpg"
              alt="Estilo urbano Urban Hat"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-primary/30" />
            <div className="absolute bottom-6 left-6">
              <Image
                src="/logo.jpeg"
                alt="Urban Hat"
                width={80}
                height={80}
                className="rounded-full border-2 border-foreground/20"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Sobre Nosotros
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
              Nacidos en <br />
              la calle
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
              <p className="leading-relaxed">
                Urban Hat nacio en febrero de 2026 con una vision clara: crear
                gorras que representen la cultura urbana autentica. No somos solo
                una marca, somos un movimiento.
              </p>
              <p className="leading-relaxed">
                Cada gorra esta disenada con atencion al detalle, materiales de
                alta calidad y un estilo que habla por si mismo. Desde las calles
                hasta las pasarelas, Urban Hat es para quienes no siguen
                tendencias, las crean.
              </p>
              <p className="leading-relaxed">
                Nuestro compromiso es con la comunidad, la creatividad y la
                autenticidad. Si buscas una gorra que cuente tu historia, estas
                en el lugar correcto.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
