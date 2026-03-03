"use client";

const platforms = [
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "HelloWork", color: "#FF6B35" },
  { name: "Indeed", color: "#2164F3" },
  { name: "Welcome to the Jungle", color: "#FFCD00" },
];

// On duplique 4x pour un défilement fluide sans trou
const items = [...platforms, ...platforms, ...platforms, ...platforms];

export const PlatformCarousel = () => (
  <section id="platforms" className="relative z-10 py-16 overflow-hidden">
    <p className="mb-10 text-center text-[12px] font-medium uppercase tracking-[0.2em] text-white/50">
      Offres agrégées depuis
    </p>

    {/* Masques de fondu sur les bords */}
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#060611] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#060611] to-transparent" />

      {/* Piste du carrousel */}
      <div className="flex animate-[scroll_30s_linear_infinite] w-max items-center gap-20">
        {items.map((p, i) => (
          <span
            key={`${p.name}-${i}`}
            className="shrink-0 font-[family-name:var(--font-syne)] text-xl font-bold opacity-70 transition-opacity hover:opacity-100"
            style={{ color: p.color }}
          >
            {p.name}
          </span>
        ))}
      </div>
    </div>
  </section>
);
