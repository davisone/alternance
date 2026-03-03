import { db } from "@/lib/db";
import { jobOffers, favorites } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { desc, ilike, eq, and, SQL } from "drizzle-orm";
import { redirect } from "next/navigation";
import { OfferCard } from "@/components/ui/offer-card";
import { SearchFilters } from "@/components/ui/search-filters";
import type { Platform } from "@/types";

interface DashboardPageProps {
  searchParams: Promise<{ q?: string; platform?: string; page?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];
  if (params.q) {
    conditions.push(ilike(jobOffers.title, `%${params.q}%`));
  }
  if (params.platform) {
    conditions.push(eq(jobOffers.platform, params.platform as Platform));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const offers = await db
    .select()
    .from(jobOffers)
    .where(where)
    .orderBy(desc(jobOffers.scrapedAt))
    .limit(limit)
    .offset(offset);

  const userFavorites = await db
    .select({ jobOfferId: favorites.jobOfferId })
    .from(favorites)
    .where(eq(favorites.userId, session.user.id));

  const favoriteIds = new Set(userFavorites.map((f) => f.jobOfferId));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Offres d&apos;alternance</h2>
      <SearchFilters />
      <div className="grid gap-4">
        {offers.length === 0 ? (
          <p className="py-12 text-center text-gray-500">
            Aucune offre trouvée. Les offres apparaîtront après le prochain
            scraping.
          </p>
        ) : (
          offers.map((offer) => (
            <OfferCard
              key={offer.id}
              id={offer.id}
              title={offer.title}
              company={offer.company}
              description={offer.description}
              applyUrl={offer.applyUrl}
              platform={offer.platform}
              location={offer.location}
              contractType={offer.contractType}
              scrapedAt={offer.scrapedAt.toISOString()}
              isFavorite={favoriteIds.has(offer.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
