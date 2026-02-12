import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.jpeg"
                alt="Urban Hat"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-display text-lg font-bold uppercase tracking-widest text-foreground">
                Urban Hat
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Gorras urbanas de alta calidad. Estilo streetwear para quienes
              marcan tendencia.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">EST. FEB. 2026</p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">
              Navegacion
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Inicio", href: "#inicio" },
                { label: "Productos", href: "#productos" },
                { label: "Nosotros", href: "#nosotros" },
                { label: "Contacto", href: "#contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Iniciar Sesion
                </Link>
              </li>
              <li>
                <Link
                  href="/registro"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Crear Cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">
              Categorias
            </h4>
            <ul className="flex flex-col gap-2">
              {["Snapback", "Fitted", "Trucker", "Flat Brim", "Military"].map(
                (cat) => (
                  <li key={cat}>
                    <a
                      href="#productos"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {cat}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">
              Siguenos
            </h4>
            <ul className="flex flex-col gap-2">
              {["Instagram", "TikTok", "Facebook", "Twitter / X"].map(
                (social) => (
                  <li key={social}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {social}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Urban Hat. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Politica de Privacidad
            </a>
            <a
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terminos y Condiciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
