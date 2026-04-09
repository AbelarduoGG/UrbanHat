import Image from "next/image"

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >

        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          className="hidden md:block object-cover"
          priority
        />
        <Image
          src="/hero-mobile.jpg"
          alt=""
          fill
          className="block md:hidden object-cover"
          priority
        />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/75" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-32 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
          EST. FEB. 2026
        </p>
        <h1 className="font-display text-5xl font-bold uppercase leading-tight tracking-tight text-foreground md:text-7xl lg:text-8xl">
          <span className="text-balance">Define tu estilo urbano</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Gorras de alta calidad para quienes viven la calle. Cada pieza esta
          hecha para marcar tendencia.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#productos"
            className="inline-flex items-center justify-center bg-accent px-8 py-4 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
          >
            Ver Coleccion
          </a>
          <a
            href="#nosotros"
            className="inline-flex items-center justify-center border border-foreground/30 px-8 py-4 text-sm font-bold uppercase tracking-widest text-foreground transition-colors hover:border-foreground hover:bg-foreground/5"
          >
            Conocenos
          </a>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="h-12 w-[1px] animate-pulse bg-muted-foreground/50" />
      </div>
    </section>
  )
}
