import { db } from "@/lib/db";
import { applications, jobOffers } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ApplicationCard } from "@/components/ui/application-card";
import type { ApplicationStatus } from "@/types";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userApplications = await db
    .select({
      application: applications,
      jobOffer: jobOffers,
    })
    .from(applications)
    .innerJoin(jobOffers, eq(applications.jobOfferId, jobOffers.id))
    .where(eq(applications.userId, session.user.id));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mes candidatures</h2>
      <div className="grid gap-4">
        {userApplications.length === 0 ? (
          <p className="py-12 text-center text-gray-500">
            Aucune candidature suivie pour l&apos;instant.
          </p>
        ) : (
          userApplications.map(({ application, jobOffer }) => (
            <ApplicationCard
              key={application.id}
              applicationId={application.id}
              title={jobOffer.title}
              company={jobOffer.company}
              applyUrl={jobOffer.applyUrl}
              platform={jobOffer.platform}
              status={application.status as ApplicationStatus}
              notes={application.notes}
            />
          ))
        )}
      </div>
    </div>
  );
}
