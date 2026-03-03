import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(applications)
    .set({
      ...(body.status && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
      updatedAt: new Date(),
    })
    .where(
      and(eq(applications.id, id), eq(applications.userId, session.user.id))
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
