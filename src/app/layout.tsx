import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Alternance Tracker — Toutes vos offres en un seul endroit",
  description:
    "Agrégez automatiquement les offres d'alternance de LinkedIn, HelloWork, Indeed et Welcome to the Jungle. Suivez vos candidatures et ne ratez plus aucune opportunité.",
  openGraph: {
    title: "Alternance Tracker",
    description:
      "Trouvez votre alternance sans effort. 4 plateformes, 1 seul dashboard.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${syne.variable} ${dmSans.variable} font-[family-name:var(--font-dm-sans)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
