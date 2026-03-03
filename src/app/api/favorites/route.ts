import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { favorites, jobOffers } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userFavorites = await db
    .select({
      jobOffer: jobOffers,
      createdAt: favorites.createdAt,
    })
    .from(favorites)
    .innerJoin(jobOffers, eq(favorites.jobOfferId, jobOffers.id))
    .where(eq(favorites.userId, session.user.id));

  return NextResponse.json(userFavorites);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { jobOfferId } = await request.json();

  await db.insert(favorites).values({
    userId: session.user.id,
    jobOfferId,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { jobOfferId } = await request.json();

  await db
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, session.user.id),
        eq(favorites.jobOfferId, jobOfferId)
      )
    );

  return NextResponse.json({ success: true });
}
