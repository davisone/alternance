import Link from "next/link";
import { auth } from "@/lib/auth";
import { PlatformCarousel } from "@/components/sections/platform-carousel";

const PlatformBadge = ({
  name,
  color,
}: {
  name: string;
  color: string;
}) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase"
    style={{ background: `${color}20`, color }}
  >
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{ background: color }}
    />
    {name}
  </span>
);

const OfferCardMockup = () => (
  <div className="glass-strong rounded-2xl p-5 w-[300px] space-y-3.5">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-[13px] font-semibold text-white/90">
          Chef de Projet Digital
        </p>
        <p className="text-[11px] text-white/50">Capgemini</p>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
        <svg
          className="h-4 w-4 text-white/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </div>
    </div>
    <div className="flex flex-wrap gap-1.5">
      <PlatformBadge name="LinkedIn" color="#0A66C2" />
      <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-white/40">
        Rennes
      </span>
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-400">
        Alternance
      </span>
    </div>
    <div className="h-px bg-white/5" />
    <div className="flex items-center justify-between">
      <p className="text-[10px] text-white/30">il y a 2h</p>
      <button className="rounded-lg bg-white/10 px-3 py-1 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/15">
        Postuler
      </button>
    </div>
  </div>
);

const StatsCardMockup = () => (
  <div className="glass-strong rounded-2xl p-5 w-[280px] space-y-4">
    <p className="text-[11px] font-medium uppercase tracking-widest text-white/30">
      Cette semaine
    </p>
    <div className="space-y-1">
      <p className="font-[family-name:var(--font-syne)] text-3xl font-bold text-white">
        1 247
      </p>
      <p className="text-[12px] text-white/40">offres agrégées</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
        +48
      </span>
      <span className="text-[11px] text-white/30">vs semaine dernière</span>
    </div>
    <div className="h-px bg-white/5" />
    <div className="flex gap-1.5">
      <PlatformBadge name="HelloWork" color="#FF6B35" />
      <PlatformBadge name="Indeed" color="#2164F3" />
    </div>
  </div>
);

const DashboardMockup = () => (
  <div className="glass rounded-2xl p-1 w-[380px]">
    {/* Barre de titre */}
    <div className="flex items-center gap-1.5 px-3 py-2">
      <div className="h-2 w-2 rounded-full bg-red-400/60" />
      <div className="h-2 w-2 rounded-full bg-yellow-400/60" />
      <div className="h-2 w-2 rounded-full bg-green-400/60" />
      <div className="ml-3 h-4 w-32 rounded-full bg-white/5" />
    </div>
    {/* Contenu */}
    <div className="rounded-xl bg-white/[0.02] p-4 space-y-3">
      {/* Header mockup */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded-full bg-white/10" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-md bg-white/5" />
          <div className="h-6 w-16 rounded-md bg-cyan-500/20" />
        </div>
      </div>
      {/* Liste d'offres mockup */}
      {[0.12, 0.08, 0.06, 0.04].map((opacity, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg p-2"
          style={{ background: `rgba(255,255,255,${opacity})` }}
        >
          <div className="h-8 w-8 rounded-lg bg-white/10 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div
              className="h-2 rounded-full bg-white/20"
              style={{ width: `${70 - i * 10}%` }}
            />
            <div
              className="h-1.5 rounded-full bg-white/8"
              style={{ width: `${50 - i * 8}%` }}
            />
          </div>
          <div className="h-5 w-12 rounded-full bg-cyan-500/15 shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
    title: "Agrégation automatique",
    description:
      "Scraping toutes les 6h sur LinkedIn, HelloWork, Indeed et Welcome to the Jungle. Toutes les offres, centralisées.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    title: "Suivi des candidatures",
    description:
      "Suivez chaque candidature étape par étape : postulé, entretien, accepté, refusé. Ne perdez plus le fil.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    title: "Favoris intelligents",
    description:
      "Sauvegardez les offres qui vous intéressent d'un clic. Retrouvez-les instantanément dans votre espace dédié.",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060611]">
      {/* Gradient orbs de fond */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-pulse-glow absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div
          className="animate-pulse-glow absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[100px]"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="animate-pulse-glow absolute -bottom-32 left-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[100px]"
          style={{ animationDelay: "3.5s" }}
        />
      </div>

      {/* Grille subtile en fond */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>
          <span className="font-[family-name:var(--font-syne)] text-base font-bold tracking-tight text-white">
            Alternance Tracker
          </span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-[13px] text-white/60 transition-colors hover:text-white/90">
            Fonctionnalités
          </a>
          <a href="#platforms" className="text-[13px] text-white/60 transition-colors hover:text-white/90">
            Plateformes
          </a>
          <a href="#how" className="text-[13px] text-white/60 transition-colors hover:text-white/90">
            Comment ça marche
          </a>
        </nav>

        <Link
          href={session ? "/dashboard" : "/login"}
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[13px] font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
        >
          {session ? "Dashboard" : "Se connecter"}
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-8 text-center md:pt-28">
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.1s", opacity: 0 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] text-white/60">
              4 plateformes agrégées en temps réel
            </span>
          </div>
        </div>

        <h1
          className="animate-fade-in-up font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.1] tracking-tight text-white md:text-7xl"
          style={{ animationDelay: "0.25s", opacity: 0 }}
        >
          Trouvez votre alternance.
          <br />
          <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Sans effort.
          </span>
        </h1>

        <p
          className="animate-fade-in-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 md:text-lg"
          style={{ animationDelay: "0.4s", opacity: 0 }}
        >
          Agrégez automatiquement les offres de LinkedIn, HelloWork, Indeed et
          Welcome to the Jungle. Suivez vos candidatures depuis un seul dashboard.
        </p>

        <div
          className="animate-fade-in-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          style={{ animationDelay: "0.55s", opacity: 0 }}
        >
          <Link
            href={session ? "/dashboard" : "/login"}
            className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-xl hover:shadow-cyan-500/30"
          >
            Commencer gratuitement
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Cartes flottantes */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-24">
        <div className="relative flex flex-col items-center justify-center gap-6 md:flex-row md:items-end">
          {/* Carte offre - gauche */}
          <div
            className="animate-slide-in-left animate-float-slow hidden md:block"
            style={{ animationDelay: "0.7s", opacity: 0 }}
          >
            <OfferCardMockup />
          </div>

          {/* Dashboard mockup - centre */}
          <div
            className="animate-fade-in-up animate-float z-10"
            style={{ animationDelay: "0.6s", opacity: 0 }}
          >
            <DashboardMockup />
          </div>

          {/* Carte stats - droite */}
          <div
            className="animate-slide-in-right animate-float-reverse hidden md:block"
            style={{ animationDelay: "0.8s", opacity: 0 }}
          >
            <StatsCardMockup />
          </div>
        </div>

        {/* Ligne de brillance sous les cartes */}
        <div className="mx-auto mt-12 h-px max-w-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* Section Plateformes — Carrousel */}
      <PlatformCarousel />

      {/* Section Fonctionnalités */}
      <section id="features" className="relative z-10 mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-white/50">
            Fonctionnalités
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-bold text-white md:text-4xl">
            Tout ce qu&apos;il vous faut
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass group rounded-2xl p-6 transition-all hover:bg-white/[0.06]"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 text-cyan-400 transition-colors group-hover:from-cyan-500/20 group-hover:to-indigo-500/20">
                {feature.icon}
              </div>
              <h3 className="font-[family-name:var(--font-syne)] text-base font-bold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/60">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section id="how" className="relative z-10 mx-auto max-w-4xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-white/50">
            Comment ça marche
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-bold text-white md:text-4xl">
            3 étapes, c&apos;est tout
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Connectez-vous",
              desc: "Créez votre compte en un clic avec Google. Rien d'autre à configurer.",
            },
            {
              step: "02",
              title: "Définissez vos critères",
              desc: "Mots-clés, localisation, plateformes. Personnalisez votre recherche.",
            },
            {
              step: "03",
              title: "Suivez vos candidatures",
              desc: "Consultez les offres, postulez, et trackez l'avancement de chaque candidature.",
            },
          ].map((item, i) => (
            <div key={i} className="text-center md:text-left">
              <span className="font-[family-name:var(--font-syne)] text-4xl font-extrabold text-white/[0.08]">
                {item.step}
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-syne)] text-base font-bold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/60">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="glass rounded-3xl px-8 py-14 md:px-14">
          <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-white md:text-4xl">
            Prêt à trouver votre alternance ?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/60">
            Rejoignez Alternance Tracker et accédez à toutes les offres
            d&apos;alternance en un seul endroit.
          </p>
          <Link
            href={session ? "/dashboard" : "/login"}
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-xl hover:shadow-cyan-500/30"
          >
            {session ? "Aller au dashboard" : "Commencer gratuitement"}
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-indigo-500">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <span className="text-[12px] text-white/50">
              Alternance Tracker
            </span>
          </div>
          <p className="text-[11px] text-white/40">
            &copy; {new Date().getFullYear()} Alternance Tracker. Tous droits réservés.
          </p>
        </div>
      </footer>
    </main>
  );
}
