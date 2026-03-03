import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobOffers, searchProfiles } from "@/lib/db/schema";
import { scrapeAll } from "@/lib/scrapers";
import type { Platform } from "@/types";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Vérifier le secret pour protéger l'endpoint
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Récupérer tous les profils de recherche actifs
  const profiles = await db.select().from(searchProfiles);

  // Dédupliquer les combinaisons keywords/location/platforms
  const uniqueSearches = new Map<
    string,
    { keywords: string; location: string; platforms: string[] }
  >();

  for (const profile of profiles) {
    const key = `${profile.keywords}|${profile.location ?? ""}`;
    if (!uniqueSearches.has(key)) {
      uniqueSearches.set(key, {
        keywords: profile.keywords,
        location: profile.location ?? "",
        platforms: profile.platforms,
      });
    } else {
      const existing = uniqueSearches.get(key)!;
      const merged = new Set([...existing.platforms, ...profile.platforms]);
      existing.platforms = Array.from(merged);
    }
  }

  let totalInserted = 0;

  for (const search of uniqueSearches.values()) {
    const offers = await scrapeAll(
      search.keywords,
      search.location,
      search.platforms as Platform[]
    );

    for (const offer of offers) {
      try {
        await db
          .insert(jobOffers)
          .values({
            title: offer.title,
            company: offer.company,
            description: offer.description,
            applyUrl: offer.applyUrl,
            platform: offer.platform,
            location: offer.location,
            contractType: offer.contractType,
          })
          .onConflictDoNothing({ target: jobOffers.applyUrl });

        totalInserted++;
      } catch {
        // Doublon ou erreur — on continue
      }
    }
  }

  return NextResponse.json({
    success: true,
    profilesProcessed: uniqueSearches.size,
    offersInserted: totalInserted,
  });
}
