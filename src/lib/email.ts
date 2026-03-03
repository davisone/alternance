import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface NewOffersEmailParams {
  to: string;
  userName: string;
  offers: { title: string; company: string; applyUrl: string }[];
  keywords: string;
}

export async function sendNewOffersEmail({
  to,
  userName,
  offers,
  keywords,
}: NewOffersEmailParams) {
  const offersList = offers
    .map(
      (o) =>
        `<li><strong>${o.title}</strong> chez ${o.company} — <a href="${o.applyUrl}">Postuler</a></li>`
    )
    .join("");

  await resend.emails.send({
    from: "Alternance Tracker <onboarding@resend.dev>",
    to,
    subject: `${offers.length} nouvelle(s) offre(s) pour "${keywords}"`,
    html: `
      <h2>Bonjour ${userName},</h2>
      <p>${offers.length} nouvelle(s) offre(s) correspondent à votre recherche "<strong>${keywords}</strong>" :</p>
      <ul>${offersList}</ul>
      <p><a href="${process.env.NEXTAUTH_URL ?? "https://alternance.vercel.app"}/dashboard">Voir toutes les offres</a></p>
    `,
  });
}
