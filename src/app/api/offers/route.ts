import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobOffers } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { desc, ilike, eq, and, SQL } from "drizzle-orm";
import type { Platform } from "@/types";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const platform = searchParams.get("platform");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];

  if (query) {
    conditions.push(ilike(jobOffers.title, `%${query}%`));
  }
  if (platform) {
    conditions.push(eq(jobOffers.platform, platform as Platform));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const offers = await db
    .select()
    .from(jobOffers)
    .where(where)
    .orderBy(desc(jobOffers.scrapedAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(offers);
}
