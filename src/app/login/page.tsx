import { AuthForm } from "@/components/sections/auth-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen">
      {/* Panneau gauche — branding dark */}
      <div className="relative hidden w-1/2 overflow-hidden bg-[#060611] lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full bg-cyan-500/15 blur-[80px]" />
        </div>

        {/* Grille subtile */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Formes décoratives */}
        <div className="pointer-events-none absolute top-16 right-20 h-3 w-3 rotate-45 border border-cyan-400/30" />
        <div className="pointer-events-none absolute bottom-24 left-16 h-4 w-4 rounded-full border border-indigo-400/20" />
        <div className="pointer-events-none absolute top-1/3 left-12 h-2 w-2 rounded-full bg-cyan-400/20" />
        <div className="pointer-events-none absolute bottom-1/3 right-16 h-2.5 w-2.5 rotate-45 bg-indigo-400/15" />

        {/* Contenu */}
        <div className="relative z-10 max-w-md px-12 text-center">
          {/* Logo */}
          <div className="mb-10 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <span className="font-[family-name:var(--font-syne)] text-xl font-bold text-white">
              Alternance Tracker
            </span>
          </div>

          {/* Mockup dashboard */}
          <div className="mx-auto mb-10 w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.04] p-1 shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-red-400/60" />
              <div className="h-2 w-2 rounded-full bg-yellow-400/60" />
              <div className="h-2 w-2 rounded-full bg-green-400/60" />
              <div className="ml-3 h-3.5 w-28 rounded-full bg-white/5" />
            </div>
            <div className="rounded-xl bg-white/[0.02] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 rounded-full bg-white/10" />
                <div className="flex gap-1.5">
                  <div className="h-5 w-14 rounded-md bg-white/5" />
                  <div className="h-5 w-14 rounded-md bg-cyan-500/20" />
                </div>
              </div>
              {[0.1, 0.07, 0.05, 0.03].map((opacity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-lg p-2"
                  style={{ background: `rgba(255,255,255,${opacity})` }}
                >
                  <div className="h-7 w-7 rounded-md bg-white/10 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2 rounded-full bg-white/15" style={{ width: `${75 - i * 12}%` }} />
                    <div className="h-1.5 rounded-full bg-white/[0.06]" style={{ width: `${55 - i * 10}%` }} />
                  </div>
                  <div className="h-4 w-10 rounded-full bg-cyan-500/15 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white">
            Toutes vos offres en un seul endroit
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Agrégez les offres de LinkedIn, HelloWork, Indeed et Welcome to the
            Jungle. Suivez vos candidatures sans effort.
          </p>

          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="h-1.5 w-6 rounded-full bg-cyan-400/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/15" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/15" />
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 lg:w-1/2">
        <AuthForm />
      </div>
    </main>
  );
}
