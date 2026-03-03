import { db } from "@/lib/db";
import { favorites, jobOffers } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { OfferCard } from "@/components/ui/offer-card";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userFavorites = await db
    .select({ jobOffer: jobOffers })
    .from(favorites)
    .innerJoin(jobOffers, eq(favorites.jobOfferId, jobOffers.id))
    .where(eq(favorites.userId, session.user.id));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mes favoris</h2>
      <div className="grid gap-4">
        {userFavorites.length === 0 ? (
          <p className="py-12 text-center text-gray-500">
            Aucun favori pour l&apos;instant.
          </p>
        ) : (
          userFavorites.map(({ jobOffer }) => (
            <OfferCard
              key={jobOffer.id}
              id={jobOffer.id}
              title={jobOffer.title}
              company={jobOffer.company}
              description={jobOffer.description}
              applyUrl={jobOffer.applyUrl}
              platform={jobOffer.platform}
              location={jobOffer.location}
              contractType={jobOffer.contractType}
              scrapedAt={jobOffer.scrapedAt.toISOString()}
              isFavorite
            />
          ))
        )}
      </div>
    </div>
  );
}
