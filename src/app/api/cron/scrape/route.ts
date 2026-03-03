import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobOffers, searchProfiles, users } from "@/lib/db/schema";
import { scrapeAll } from "@/lib/scrapers";
import { sendNewOffersEmail } from "@/lib/email";
import { eq, and, gte } from "drizzle-orm";
import type { Platform } from "@/types";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Vérifier le secret pour protéger l'endpoint
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const scrapeStart = new Date();

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

  // Scraper et insérer les offres
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

  // Envoyer les notifications email
  let emailsSent = 0;

  for (const profile of profiles) {
    if (!profile.notifyEmail) continue;

    // Récupérer l'utilisateur
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, profile.userId));

    if (!user?.email) continue;

    // Récupérer les offres insérées pendant ce run
    const newOffers = await db
      .select()
      .from(jobOffers)
      .where(gte(jobOffers.scrapedAt, scrapeStart));

    if (newOffers.length === 0) continue;

    try {
      await sendNewOffersEmail({
        to: user.email,
        userName: user.name ?? "utilisateur",
        offers: newOffers.map((o) => ({
          title: o.title,
          company: o.company,
          applyUrl: o.applyUrl,
        })),
        keywords: profile.keywords,
      });
      emailsSent++;
    } catch {
      // Erreur d'envoi — on continue
    }
  }

  return NextResponse.json({
    success: true,
    profilesProcessed: uniqueSearches.size,
    offersInserted: totalInserted,
    emailsSent,
  });
}
