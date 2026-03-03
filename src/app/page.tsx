import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Alternance Tracker</h1>
        <Link
          href={session ? "/dashboard" : "/login"}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {session ? "Dashboard" : "Se connecter"}
        </Link>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Toutes vos offres d&apos;alternance en un seul endroit
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Agrégez automatiquement les offres de LinkedIn, HelloWork, Indeed et
          Welcome to the Jungle. Suivez vos candidatures et ne ratez plus aucune
          opportunité.
        </p>
        <div className="mt-10">
          <Link
            href={session ? "/dashboard" : "/login"}
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
          >
            Commencer gratuitement
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-3xl">🔍</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Agrégation automatique
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Scraping automatique toutes les 6h sur 4 plateformes majeures.
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-3xl">📋</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Suivi des candidatures
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Suivez le statut de chaque candidature : postulé, entretien,
              accepté...
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-3xl">🔔</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Recevez un email quand de nouvelles offres correspondent à vos
              critères.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
