import { db } from "@/lib/db";
import { searchProfiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SearchProfileForm } from "@/components/sections/search-profile-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profiles = await db
    .select()
    .from(searchProfiles)
    .where(eq(searchProfiles.userId, session.user.id));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>

      <SearchProfileForm />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Profils de recherche actifs
        </h3>
        {profiles.length === 0 ? (
          <p className="text-gray-500">
            Aucun profil de recherche. Créez-en un pour commencer à recevoir des
            offres.
          </p>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <p className="font-medium text-gray-900">{profile.keywords}</p>
              {profile.location && (
                <p className="text-sm text-gray-500">{profile.location}</p>
              )}
              <div className="mt-2 flex gap-2">
                {profile.platforms.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Notifications : {profile.notifyEmail ? "activées" : "désactivées"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
