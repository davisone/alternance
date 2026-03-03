import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, jobOffers } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userApplications = await db
    .select({
      application: applications,
      jobOffer: jobOffers,
    })
    .from(applications)
    .innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
    .where(eq(applications.userId, session.user.id));

  return NextResponse.json(userApplications);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { jobOfferId, status, notes } = await request.json();

  const [created] = await db
    .insert(applications)
    .values({
      userId: session.user.id,
      jobOfferId,
      status: status ?? "not_applied",
      notes: notes ?? null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
