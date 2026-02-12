'use client';

export function MarqueeBanner() {
  const text =
    "URBAN HAT \u00B7 STREETWEAR \u00B7 GORRAS URBANAS \u00B7 ESTILO CALLEJERO \u00B7 NUEVA COLECCION \u00B7 "

  return (
    <div className="overflow-hidden border-y border-border bg-primary py-3">
      <div className="flex animate-marquee whitespace-nowrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="mx-4 font-display text-sm font-bold uppercase tracking-[0.25em] text-primary-foreground"
          >
            {text}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  )
}
