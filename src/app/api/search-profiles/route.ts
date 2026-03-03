import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { searchProfiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const profiles = await db
    .select()
    .from(searchProfiles)
    .where(eq(searchProfiles.userId, session.user.id));

  return NextResponse.json(profiles);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { keywords, location, platforms } = await request.json();

  const [created] = await db
    .insert(searchProfiles)
    .values({
      userId: session.user.id,
      keywords,
      location: location ?? null,
      platforms: platforms ?? ["linkedin", "hellowork", "indeed", "wttj"],
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
