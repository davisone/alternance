# Agrégateur d'alternances — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Application web multi-utilisateurs qui agrège les offres d'alternance depuis LinkedIn, HelloWork, Indeed et WTTJ, avec suivi de candidatures et notifications.

**Architecture:** Next.js 15 App Router avec API Routes pour le backend, Drizzle ORM connecté à Neon (PostgreSQL serverless), Auth.js v5 pour l'authentification, Vercel Cron pour le scraping automatique toutes les 6h, Resend pour les notifications email.

**Tech Stack:** Next.js 15, TypeScript strict, Tailwind CSS, Drizzle ORM, Neon, Auth.js v5, Cheerio, Resend, Vitest

---

## Task 1 : Initialisation du projet Next.js

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/styles/globals.css`

**Step 1: Créer le projet Next.js**

```bash
cd /Users/evandavison/IdeaProjects/alternance
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Répondre "Yes" aux prompts pour Turbopack.

**Step 2: Vérifier que le projet démarre**

```bash
npm run dev
```

Ouvrir `http://localhost:3000` — la page par défaut Next.js doit s'afficher.

**Step 3: Nettoyer le boilerplate**

Vider `src/app/page.tsx` pour ne garder qu'un simple placeholder :

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">Alternance Tracker</h1>
    </main>
  );
}
```

Nettoyer `src/styles/globals.css` pour ne garder que les directives Tailwind.

**Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: initialisation du projet Next.js"
```

---

## Task 2 : Installer les dépendances

**Files:**
- Modify: `package.json`

**Step 1: Installer les dépendances de production**

```bash
npm install drizzle-orm @neondatabase/serverless next-auth@beta @auth/drizzle-adapter cheerio resend
```

**Step 2: Installer les dépendances de développement**

```bash
npm install -D drizzle-kit dotenv vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @types/node
```

**Step 3: Créer le fichier de config Vitest**

Create: `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 4: Ajouter le script test dans package.json**

Ajouter dans `scripts` :

```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 5: Créer le `.env.local`**

Create: `.env.local`

```
DATABASE_URL=postgresql://...
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
RESEND_API_KEY=
CRON_SECRET=
```

**Step 6: Vérifier que `.env*` est dans `.gitignore`**

Vérifier la présence de `.env*` dans `.gitignore` (Next.js le met par défaut).

**Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: ajout des dépendances (drizzle, auth.js, cheerio, resend, vitest)"
```

---

## Task 3 : Schéma de base de données (Drizzle)

**Files:**
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/index.ts`
- Create: `drizzle.config.ts`
- Test: `src/lib/db/__tests__/schema.test.ts`

**Step 1: Écrire le test du schéma**

Create: `src/lib/db/__tests__/schema.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  jobOffers,
  applications,
  favorites,
  searchProfiles,
  platformEnum,
  applicationStatusEnum,
} from "../schema";

describe("Schema de base de données", () => {
  it("doit exporter la table users avec les colonnes requises", () => {
    const columns = Object.keys(users);
    expect(columns).toContain("id");
    expect(columns).toContain("name");
    expect(columns).toContain("email");
    expect(columns).toContain("image");
  });

  it("doit exporter la table jobOffers avec les colonnes requises", () => {
    const columns = Object.keys(jobOffers);
    expect(columns).toContain("id");
    expect(columns).toContain("title");
    expect(columns).toContain("company");
    expect(columns).toContain("description");
    expect(columns).toContain("applyUrl");
    expect(columns).toContain("platform");
    expect(columns).toContain("location");
    expect(columns).toContain("scrapedAt");
  });

  it("doit exporter la table applications avec les colonnes requises", () => {
    const columns = Object.keys(applications);
    expect(columns).toContain("id");
    expect(columns).toContain("userId");
    expect(columns).toContain("jobOfferId");
    expect(columns).toContain("status");
    expect(columns).toContain("notes");
  });

  it("doit exporter la table favorites", () => {
    const columns = Object.keys(favorites);
    expect(columns).toContain("userId");
    expect(columns).toContain("jobOfferId");
  });

  it("doit exporter la table searchProfiles", () => {
    const columns = Object.keys(searchProfiles);
    expect(columns).toContain("userId");
    expect(columns).toContain("keywords");
    expect(columns).toContain("location");
    expect(columns).toContain("platforms");
    expect(columns).toContain("notifyEmail");
  });

  it("doit exporter les enums platform et applicationStatus", () => {
    expect(platformEnum.enumValues).toEqual([
      "linkedin",
      "hellowork",
      "indeed",
      "wttj",
    ]);
    expect(applicationStatusEnum.enumValues).toEqual([
      "not_applied",
      "applied",
      "interview",
      "rejected",
      "accepted",
    ]);
  });
});
```

**Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
npx vitest run src/lib/db/__tests__/schema.test.ts
```

Attendu : FAIL — les imports n'existent pas encore.

**Step 3: Implémenter le schéma**

Create: `src/lib/db/schema.ts`

```typescript
import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  boolean,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// --- Enums ---

export const platformEnum = pgEnum("platform", [
  "linkedin",
  "hellowork",
  "indeed",
  "wttj",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "not_applied",
  "applied",
  "interview",
  "rejected",
  "accepted",
]);

// --- Tables Auth.js (requises par DrizzleAdapter) ---

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

// --- Tables métier ---

export const jobOffers = pgTable("job_offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  applyUrl: text("apply_url").unique().notNull(),
  platform: platformEnum("platform").notNull(),
  location: text("location"),
  contractType: text("contract_type"),
  scrapedAt: timestamp("scraped_at", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  sourceUrl: text("source_url"),
});

export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jobOfferId: uuid("job_offer_id")
    .notNull()
    .references(() => jobOffers.id, { onDelete: "cascade" }),
  status: applicationStatusEnum("status").default("not_applied").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobOfferId: uuid("job_offer_id")
      .notNull()
      .references(() => jobOffers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (favorite) => [
    primaryKey({
      columns: [favorite.userId, favorite.jobOfferId],
    }),
  ]
);

export const searchProfiles = pgTable("search_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  keywords: text("keywords").notNull(),
  location: text("location"),
  platforms: text("platforms")
    .array()
    .default(["linkedin", "hellowork", "indeed", "wttj"])
    .notNull(),
  notifyEmail: boolean("notify_email").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
```

**Step 4: Implémenter le client DB**

Create: `src/lib/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL!, { schema });
```

**Step 5: Créer la config Drizzle Kit**

Create: `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Step 6: Lancer le test pour vérifier qu'il passe**

```bash
npx vitest run src/lib/db/__tests__/schema.test.ts
```

Attendu : PASS — tous les tests passent.

**Step 7: Commit**

```bash
git add src/lib/db/ drizzle.config.ts
git commit -m "feat(db): ajout du schéma drizzle (users, job_offers, applications, favorites, search_profiles)"
```

---

## Task 4 : Configuration Auth.js

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/middleware.ts`

**Step 1: Configurer Auth.js**

Create: `src/lib/auth.ts`

```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
```

**Step 2: Créer le route handler Auth.js**

Create: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

**Step 3: Créer le middleware de protection des routes**

Create: `src/middleware.ts`

```typescript
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**Step 4: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/middleware.ts
git commit -m "feat(auth): configuration Auth.js avec Google provider et middleware"
```

---

## Task 5 : Types partagés et interface des scrapers

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/scrapers/types.ts`
- Test: `src/lib/scrapers/__tests__/types.test.ts`

**Step 1: Écrire le test des types**

Create: `src/lib/scrapers/__tests__/types.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import type { ScrapedOffer, Platform } from "../types";

describe("Types des scrapers", () => {
  it("doit accepter une offre scrapée valide", () => {
    const offer: ScrapedOffer = {
      title: "Chef de projet junior",
      company: "Acme Corp",
      description: "Description du poste",
      applyUrl: "https://example.com/apply",
      platform: "hellowork",
      location: "Rennes",
      contractType: "Alternance",
    };

    expect(offer.title).toBe("Chef de projet junior");
    expect(offer.platform).toBe("hellowork");
  });

  it("doit accepter location et contractType à null", () => {
    const offer: ScrapedOffer = {
      title: "Chef de projet",
      company: "Corp",
      description: "Desc",
      applyUrl: "https://example.com",
      platform: "indeed",
      location: null,
      contractType: null,
    };

    expect(offer.location).toBeNull();
  });
});
```

**Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
npx vitest run src/lib/scrapers/__tests__/types.test.ts
```

**Step 3: Implémenter les types**

Create: `src/types/index.ts`

```typescript
export type Platform = "linkedin" | "hellowork" | "indeed" | "wttj";

export type ApplicationStatus =
  | "not_applied"
  | "applied"
  | "interview"
  | "rejected"
  | "accepted";
```

Create: `src/lib/scrapers/types.ts`

```typescript
import type { Platform } from "@/types";

export type { Platform };

export interface ScrapedOffer {
  title: string;
  company: string;
  description: string;
  applyUrl: string;
  platform: Platform;
  location: string | null;
  contractType: string | null;
}

export interface Scraper {
  name: Platform;
  scrape(keywords: string, location: string): Promise<ScrapedOffer[]>;
}
```

**Step 4: Lancer le test pour vérifier qu'il passe**

```bash
npx vitest run src/lib/scrapers/__tests__/types.test.ts
```

**Step 5: Commit**

```bash
git add src/types/ src/lib/scrapers/types.ts src/lib/scrapers/__tests__/
git commit -m "feat(scrapers): ajout des types partagés et interface Scraper"
```

---

## Task 6 : Scraper HelloWork

**Files:**
- Create: `src/lib/scrapers/hellowork.ts`
- Test: `src/lib/scrapers/__tests__/hellowork.test.ts`
- Create: `src/lib/scrapers/__tests__/fixtures/hellowork.html` (fixture HTML pour les tests)

**Step 1: Écrire la fixture HTML**

Create: `src/lib/scrapers/__tests__/fixtures/hellowork.html`

Récupérer un extrait réel de page de résultats HelloWork (recherche "alternance gestion de projet"). Sauvegarder le HTML pertinent (la liste de résultats) dans ce fichier pour les tests.

> **Note pour l'implémenteur** : Ouvrir `https://www.hellowork.com/fr-fr/emploi/recherche.html?k=alternance+gestion+de+projet&l=Rennes` dans un navigateur, inspecter la structure HTML des résultats, et sauvegarder un extrait représentatif de 2-3 offres.

**Step 2: Écrire le test du scraper**

Create: `src/lib/scrapers/__tests__/hellowork.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { helloworkScraper } from "../hellowork";
import { readFileSync } from "fs";
import { join } from "path";

// Charger la fixture HTML
const fixtureHtml = readFileSync(
  join(__dirname, "fixtures/hellowork.html"),
  "utf-8"
);

describe("Scraper HelloWork", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("doit avoir le nom 'hellowork'", () => {
    expect(helloworkScraper.name).toBe("hellowork");
  });

  it("doit parser les offres depuis le HTML", async () => {
    // Mock du fetch global
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(fixtureHtml),
      })
    );

    const offers = await helloworkScraper.scrape(
      "alternance gestion de projet",
      "Rennes"
    );

    expect(offers.length).toBeGreaterThan(0);

    const firstOffer = offers[0];
    expect(firstOffer.title).toBeTruthy();
    expect(firstOffer.company).toBeTruthy();
    expect(firstOffer.applyUrl).toContain("http");
    expect(firstOffer.platform).toBe("hellowork");
  });

  it("doit retourner un tableau vide si la requête échoue", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    );

    const offers = await helloworkScraper.scrape("test", "Paris");
    expect(offers).toEqual([]);
  });
});
```

**Step 3: Lancer le test pour vérifier qu'il échoue**

```bash
npx vitest run src/lib/scrapers/__tests__/hellowork.test.ts
```

**Step 4: Implémenter le scraper HelloWork**

Create: `src/lib/scrapers/hellowork.ts`

```typescript
import * as cheerio from "cheerio";
import type { Scraper, ScrapedOffer } from "./types";

const BASE_URL = "https://www.hellowork.com/fr-fr/emploi/recherche.html";

function buildUrl(keywords: string, location: string): string {
  const params = new URLSearchParams({
    k: keywords,
    l: location,
  });
  return `${BASE_URL}?${params.toString()}`;
}

function parseOffers(html: string): ScrapedOffer[] {
  const $ = cheerio.load(html);
  const offers: ScrapedOffer[] = [];

  // Sélecteurs à adapter selon la structure réelle de HelloWork
  // L'implémenteur devra inspecter le HTML réel et ajuster
  $("[data-cy='offer-card'], .offer-card, article[class*='offer']").each(
    (_, element) => {
      const $el = $(element);

      const title =
        $el.find("h2, h3, [data-cy='offer-title']").first().text().trim() || "";
      const company =
        $el
          .find("[data-cy='company-name'], .company-name, [class*='company']")
          .first()
          .text()
          .trim() || "";
      const link =
        $el.find("a").first().attr("href") ||
        $el.find("[data-cy='offer-link']").attr("href") ||
        "";
      const description =
        $el
          .find(
            "[data-cy='offer-description'], .offer-description, p"
          )
          .first()
          .text()
          .trim() || "";
      const location =
        $el
          .find("[data-cy='offer-location'], [class*='location']")
          .first()
          .text()
          .trim() || null;
      const contractType =
        $el
          .find("[data-cy='contract-type'], [class*='contract']")
          .first()
          .text()
          .trim() || null;

      if (title && company && link) {
        const applyUrl = link.startsWith("http")
          ? link
          : `https://www.hellowork.com${link}`;

        offers.push({
          title,
          company,
          description,
          applyUrl,
          platform: "hellowork",
          location,
          contractType,
        });
      }
    }
  );

  return offers;
}

export const helloworkScraper: Scraper = {
  name: "hellowork",
  async scrape(keywords: string, location: string): Promise<ScrapedOffer[]> {
    const url = buildUrl(keywords, location);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
      });

      if (!response.ok) {
        console.error(
          `HelloWork: erreur HTTP ${response.status}`
        );
        return [];
      }

      const html = await response.text();
      return parseOffers(html);
    } catch (error) {
      console.error("HelloWork: erreur de scraping", error);
      return [];
    }
  },
};
```

> **Note pour l'implémenteur** : Les sélecteurs CSS dans `parseOffers` sont approximatifs. Il faut inspecter la page réelle de HelloWork et ajuster les sélecteurs. Utiliser Playwright (navigateur) pour inspecter la structure exacte.

**Step 5: Lancer le test pour vérifier qu'il passe**

```bash
npx vitest run src/lib/scrapers/__tests__/hellowork.test.ts
```

**Step 6: Commit**

```bash
git add src/lib/scrapers/hellowork.ts src/lib/scrapers/__tests__/
git commit -m "feat(scrapers): ajout du scraper HelloWork"
```

---

## Task 7 : Scraper Indeed (RSS)

**Files:**
- Create: `src/lib/scrapers/indeed.ts`
- Test: `src/lib/scrapers/__tests__/indeed.test.ts`
- Create: `src/lib/scrapers/__tests__/fixtures/indeed-rss.xml`

**Step 1: Écrire la fixture RSS**

Create: `src/lib/scrapers/__tests__/fixtures/indeed-rss.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Indeed - alternance gestion de projet - Rennes</title>
    <item>
      <title>Alternant Chef de Projet Digital - Acme Corp</title>
      <link>https://fr.indeed.com/viewjob?jk=abc123</link>
      <description>Nous recherchons un alternant en gestion de projet digital pour rejoindre notre équipe marketing.</description>
      <pubDate>Mon, 02 Mar 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Assistant Gestion de Projet IT - TechCo</title>
      <link>https://fr.indeed.com/viewjob?jk=def456</link>
      <description>Poste en alternance pour un assistant gestion de projet au sein de la DSI.</description>
      <pubDate>Sun, 01 Mar 2026 08:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>
```

**Step 2: Écrire le test**

Create: `src/lib/scrapers/__tests__/indeed.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { indeedScraper } from "../indeed";
import { readFileSync } from "fs";
import { join } from "path";

const fixtureXml = readFileSync(
  join(__dirname, "fixtures/indeed-rss.xml"),
  "utf-8"
);

describe("Scraper Indeed", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("doit avoir le nom 'indeed'", () => {
    expect(indeedScraper.name).toBe("indeed");
  });

  it("doit parser les offres depuis le flux RSS", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(fixtureXml),
      })
    );

    const offers = await indeedScraper.scrape(
      "alternance gestion de projet",
      "Rennes"
    );

    expect(offers).toHaveLength(2);

    expect(offers[0].title).toContain("Alternant Chef de Projet Digital");
    expect(offers[0].company).toBe("Acme Corp");
    expect(offers[0].applyUrl).toContain("indeed.com");
    expect(offers[0].platform).toBe("indeed");

    expect(offers[1].company).toBe("TechCo");
  });

  it("doit retourner un tableau vide si la requête échoue", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403 })
    );

    const offers = await indeedScraper.scrape("test", "Paris");
    expect(offers).toEqual([]);
  });
});
```

**Step 3: Lancer le test pour vérifier qu'il échoue**

```bash
npx vitest run src/lib/scrapers/__tests__/indeed.test.ts
```

**Step 4: Implémenter le scraper Indeed**

Create: `src/lib/scrapers/indeed.ts`

```typescript
import * as cheerio from "cheerio";
import type { Scraper, ScrapedOffer } from "./types";

const RSS_BASE = "https://fr.indeed.com/rss";

function buildUrl(keywords: string, location: string): string {
  const params = new URLSearchParams({
    q: keywords,
    l: location,
    sort: "date",
  });
  return `${RSS_BASE}?${params.toString()}`;
}

function extractCompanyFromTitle(title: string): {
  jobTitle: string;
  company: string;
} {
  // Indeed RSS met souvent le format "Titre du poste - Entreprise"
  const parts = title.split(" - ");
  if (parts.length >= 2) {
    const company = parts.pop()!.trim();
    const jobTitle = parts.join(" - ").trim();
    return { jobTitle, company };
  }
  return { jobTitle: title, company: "Entreprise non spécifiée" };
}

function parseRss(xml: string): ScrapedOffer[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const offers: ScrapedOffer[] = [];

  $("item").each((_, element) => {
    const $item = $(element);
    const rawTitle = $item.find("title").text().trim();
    const link = $item.find("link").text().trim();
    const description = $item.find("description").text().trim();

    if (rawTitle && link) {
      const { jobTitle, company } = extractCompanyFromTitle(rawTitle);

      offers.push({
        title: jobTitle,
        company,
        description,
        applyUrl: link,
        platform: "indeed",
        location: null,
        contractType: null,
      });
    }
  });

  return offers;
}

export const indeedScraper: Scraper = {
  name: "indeed",
  async scrape(keywords: string, location: string): Promise<ScrapedOffer[]> {
    const url = buildUrl(keywords, location);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/rss+xml, application/xml, text/xml",
        },
      });

      if (!response.ok) {
        console.error(`Indeed: erreur HTTP ${response.status}`);
        return [];
      }

      const xml = await response.text();
      return parseRss(xml);
    } catch (error) {
      console.error("Indeed: erreur de scraping", error);
      return [];
    }
  },
};
```

**Step 5: Lancer le test pour vérifier qu'il passe**

```bash
npx vitest run src/lib/scrapers/__tests__/indeed.test.ts
```

**Step 6: Commit**

```bash
git add src/lib/scrapers/indeed.ts src/lib/scrapers/__tests__/
git commit -m "feat(scrapers): ajout du scraper Indeed (RSS)"
```

---

## Task 8 : Scraper Welcome to the Jungle

**Files:**
- Create: `src/lib/scrapers/wttj.ts`
- Test: `src/lib/scrapers/__tests__/wttj.test.ts`
- Create: `src/lib/scrapers/__tests__/fixtures/wttj-response.json`

**Step 1: Écrire la fixture JSON**

Create: `src/lib/scrapers/__tests__/fixtures/wttj-response.json`

```json
{
  "jobs": [
    {
      "id": 12345,
      "name": "Alternant Gestion de Projet",
      "slug": "alternant-gestion-de-projet-12345",
      "company": {
        "name": "StartupCo"
      },
      "description": "Rejoignez notre équipe en tant qu'alternant en gestion de projet.",
      "contract_type": {
        "fr": "Alternance"
      },
      "office": {
        "city": "Rennes"
      }
    },
    {
      "id": 67890,
      "name": "Chef de Projet Junior - Alternance",
      "slug": "chef-de-projet-junior-67890",
      "company": {
        "name": "BigCorp"
      },
      "description": "Poste en alternance pour un chef de projet junior.",
      "contract_type": {
        "fr": "Alternance"
      },
      "office": {
        "city": "Paris"
      }
    }
  ],
  "total": 2
}
```

**Step 2: Écrire le test**

Create: `src/lib/scrapers/__tests__/wttj.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { wttjScraper } from "../wttj";
import fixtureData from "./fixtures/wttj-response.json";

describe("Scraper Welcome to the Jungle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("doit avoir le nom 'wttj'", () => {
    expect(wttjScraper.name).toBe("wttj");
  });

  it("doit parser les offres depuis la réponse API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(fixtureData),
      })
    );

    const offers = await wttjScraper.scrape(
      "alternance gestion de projet",
      "Rennes"
    );

    expect(offers).toHaveLength(2);
    expect(offers[0].title).toBe("Alternant Gestion de Projet");
    expect(offers[0].company).toBe("StartupCo");
    expect(offers[0].platform).toBe("wttj");
    expect(offers[0].applyUrl).toContain("welcometothejungle.com");
    expect(offers[0].location).toBe("Rennes");
    expect(offers[0].contractType).toBe("Alternance");
  });

  it("doit retourner un tableau vide si la requête échoue", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    const offers = await wttjScraper.scrape("test", "Paris");
    expect(offers).toEqual([]);
  });
});
```

**Step 3: Lancer le test pour vérifier qu'il échoue**

```bash
npx vitest run src/lib/scrapers/__tests__/wttj.test.ts
```

**Step 4: Implémenter le scraper WTTJ**

Create: `src/lib/scrapers/wttj.ts`

```typescript
import type { Scraper, ScrapedOffer } from "./types";

const API_BASE = "https://api.welcometothejungle.com/api/v1/jobs";

interface WttjJob {
  id: number;
  name: string;
  slug: string;
  company: { name: string };
  description: string;
  contract_type?: { fr: string };
  office?: { city: string };
}

interface WttjResponse {
  jobs: WttjJob[];
  total: number;
}

function buildUrl(keywords: string, location: string): string {
  const params = new URLSearchParams({
    query: keywords,
    page: "1",
    per_page: "30",
    aroundQuery: location,
  });
  return `${API_BASE}?${params.toString()}`;
}

function mapJob(job: WttjJob): ScrapedOffer {
  return {
    title: job.name,
    company: job.company.name,
    description: job.description,
    applyUrl: `https://www.welcometothejungle.com/fr/companies/${job.slug}`,
    platform: "wttj",
    location: job.office?.city ?? null,
    contractType: job.contract_type?.fr ?? null,
  };
}

export const wttjScraper: Scraper = {
  name: "wttj",
  async scrape(keywords: string, location: string): Promise<ScrapedOffer[]> {
    const url = buildUrl(keywords, location);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.error(`WTTJ: erreur HTTP ${response.status}`);
        return [];
      }

      const data: WttjResponse = await response.json();
      return data.jobs.map(mapJob);
    } catch (error) {
      console.error("WTTJ: erreur de scraping", error);
      return [];
    }
  },
};
```

> **Note pour l'implémenteur** : L'URL de l'API WTTJ et la structure de la réponse doivent être vérifiées. Si l'API publique n'est plus disponible, basculer sur du scraping HTML avec Cheerio comme pour HelloWork.

**Step 5: Lancer le test pour vérifier qu'il passe**

```bash
npx vitest run src/lib/scrapers/__tests__/wttj.test.ts
```

**Step 6: Commit**

```bash
git add src/lib/scrapers/wttj.ts src/lib/scrapers/__tests__/
git commit -m "feat(scrapers): ajout du scraper Welcome to the Jungle"
```

---

## Task 9 : Scraper LinkedIn (via Google Jobs)

**Files:**
- Create: `src/lib/scrapers/linkedin.ts`
- Test: `src/lib/scrapers/__tests__/linkedin.test.ts`
- Create: `src/lib/scrapers/__tests__/fixtures/google-jobs-linkedin.html`

**Step 1: Écrire la fixture HTML**

Create: `src/lib/scrapers/__tests__/fixtures/google-jobs-linkedin.html`

> **Note pour l'implémenteur** : Rechercher sur Google `site:linkedin.com/jobs "alternance gestion de projet" "Rennes"`, copier la structure HTML des résultats. Alternative : utiliser le scraping direct des pages de recherche LinkedIn sans connexion (`https://www.linkedin.com/jobs/search/?keywords=...`).

**Step 2: Écrire le test**

Create: `src/lib/scrapers/__tests__/linkedin.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { linkedinScraper } from "../linkedin";

describe("Scraper LinkedIn", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("doit avoir le nom 'linkedin'", () => {
    expect(linkedinScraper.name).toBe("linkedin");
  });

  it("doit parser les offres depuis la page de recherche LinkedIn", async () => {
    // Fixture HTML à compléter après inspection
    const fixtureHtml = `
      <ul class="jobs-search__results-list">
        <li>
          <div class="base-card">
            <h3 class="base-search-card__title">Chef de Projet Alternance</h3>
            <h4 class="base-search-card__subtitle">TechCorp</h4>
            <span class="job-search-card__location">Rennes</span>
            <a class="base-card__full-link" href="https://www.linkedin.com/jobs/view/12345"></a>
          </div>
        </li>
      </ul>
    `;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(fixtureHtml),
      })
    );

    const offers = await linkedinScraper.scrape(
      "alternance gestion de projet",
      "Rennes"
    );

    expect(offers.length).toBeGreaterThan(0);
    expect(offers[0].title).toBe("Chef de Projet Alternance");
    expect(offers[0].company).toBe("TechCorp");
    expect(offers[0].platform).toBe("linkedin");
    expect(offers[0].applyUrl).toContain("linkedin.com");
  });

  it("doit retourner un tableau vide si la requête échoue", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429 })
    );

    const offers = await linkedinScraper.scrape("test", "Paris");
    expect(offers).toEqual([]);
  });
});
```

**Step 3: Lancer le test pour vérifier qu'il échoue**

```bash
npx vitest run src/lib/scrapers/__tests__/linkedin.test.ts
```

**Step 4: Implémenter le scraper LinkedIn**

Create: `src/lib/scrapers/linkedin.ts`

```typescript
import * as cheerio from "cheerio";
import type { Scraper, ScrapedOffer } from "./types";

// LinkedIn expose une page de recherche publique (sans connexion)
const SEARCH_BASE = "https://www.linkedin.com/jobs/search/";

function buildUrl(keywords: string, location: string): string {
  const params = new URLSearchParams({
    keywords,
    location,
    f_TPR: "r604800", // 7 derniers jours
  });
  return `${SEARCH_BASE}?${params.toString()}`;
}

function parseOffers(html: string): ScrapedOffer[] {
  const $ = cheerio.load(html);
  const offers: ScrapedOffer[] = [];

  $(".base-card, .job-search-card").each((_, element) => {
    const $el = $(element);

    const title =
      $el
        .find(
          ".base-search-card__title, h3"
        )
        .first()
        .text()
        .trim() || "";
    const company =
      $el
        .find(
          ".base-search-card__subtitle, h4"
        )
        .first()
        .text()
        .trim() || "";
    const link =
      $el.find("a.base-card__full-link, a").first().attr("href") || "";
    const location =
      $el
        .find(
          ".job-search-card__location, span[class*='location']"
        )
        .first()
        .text()
        .trim() || null;

    if (title && company && link) {
      offers.push({
        title,
        company,
        description: "",
        applyUrl: link.split("?")[0],
        platform: "linkedin",
        location,
        contractType: null,
      });
    }
  });

  return offers;
}

export const linkedinScraper: Scraper = {
  name: "linkedin",
  async scrape(keywords: string, location: string): Promise<ScrapedOffer[]> {
    const url = buildUrl(keywords, location);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
      });

      if (!response.ok) {
        console.error(`LinkedIn: erreur HTTP ${response.status}`);
        return [];
      }

      const html = await response.text();
      return parseOffers(html);
    } catch (error) {
      console.error("LinkedIn: erreur de scraping", error);
      return [];
    }
  },
};
```

**Step 5: Lancer le test pour vérifier qu'il passe**

```bash
npx vitest run src/lib/scrapers/__tests__/linkedin.test.ts
```

**Step 6: Commit**

```bash
git add src/lib/scrapers/linkedin.ts src/lib/scrapers/__tests__/
git commit -m "feat(scrapers): ajout du scraper LinkedIn (page publique)"
```

---

## Task 10 : Orchestrateur de scraping

**Files:**
- Create: `src/lib/scrapers/index.ts`
- Test: `src/lib/scrapers/__tests__/index.test.ts`

**Step 1: Écrire le test de l'orchestrateur**

Create: `src/lib/scrapers/__tests__/index.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";
import { scrapeAll } from "../index";
import type { ScrapedOffer, Scraper } from "../types";

// Mock des scrapers individuels
vi.mock("../hellowork", () => ({
  helloworkScraper: {
    name: "hellowork",
    scrape: vi.fn().mockResolvedValue([
      {
        title: "Offre HW",
        company: "HW Corp",
        description: "Desc",
        applyUrl: "https://hellowork.com/1",
        platform: "hellowork",
        location: "Rennes",
        contractType: "Alternance",
      },
    ]),
  } satisfies Scraper,
}));

vi.mock("../indeed", () => ({
  indeedScraper: {
    name: "indeed",
    scrape: vi.fn().mockResolvedValue([
      {
        title: "Offre Indeed",
        company: "Indeed Corp",
        description: "Desc",
        applyUrl: "https://indeed.com/1",
        platform: "indeed",
        location: "Paris",
        contractType: null,
      },
    ]),
  } satisfies Scraper,
}));

vi.mock("../wttj", () => ({
  wttjScraper: {
    name: "wttj",
    scrape: vi.fn().mockResolvedValue([]),
  } satisfies Scraper,
}));

vi.mock("../linkedin", () => ({
  linkedinScraper: {
    name: "linkedin",
    scrape: vi.fn().mockRejectedValue(new Error("Rate limited")),
  } satisfies Scraper,
}));

describe("Orchestrateur de scraping", () => {
  it("doit agréger les résultats de toutes les plateformes demandées", async () => {
    const offers = await scrapeAll(
      "gestion de projet",
      "Rennes",
      ["hellowork", "indeed"]
    );

    expect(offers).toHaveLength(2);
    expect(offers[0].platform).toBe("hellowork");
    expect(offers[1].platform).toBe("indeed");
  });

  it("doit continuer même si un scraper échoue", async () => {
    const offers = await scrapeAll(
      "gestion de projet",
      "Rennes",
      ["hellowork", "linkedin"]
    );

    // LinkedIn échoue mais HelloWork réussit
    expect(offers).toHaveLength(1);
    expect(offers[0].platform).toBe("hellowork");
  });

  it("doit filtrer par les plateformes spécifiées", async () => {
    const offers = await scrapeAll(
      "gestion de projet",
      "Rennes",
      ["wttj"]
    );

    expect(offers).toHaveLength(0);
  });
});
```

**Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
npx vitest run src/lib/scrapers/__tests__/index.test.ts
```

**Step 3: Implémenter l'orchestrateur**

Create: `src/lib/scrapers/index.ts`

```typescript
import { helloworkScraper } from "./hellowork";
import { indeedScraper } from "./indeed";
import { wttjScraper } from "./wttj";
import { linkedinScraper } from "./linkedin";
import type { Scraper, ScrapedOffer, Platform } from "./types";

const scrapers: Record<Platform, Scraper> = {
  hellowork: helloworkScraper,
  indeed: indeedScraper,
  wttj: wttjScraper,
  linkedin: linkedinScraper,
};

export async function scrapeAll(
  keywords: string,
  location: string,
  platforms: Platform[]
): Promise<ScrapedOffer[]> {
  const results = await Promise.allSettled(
    platforms.map((platform) => scrapers[platform].scrape(keywords, location))
  );

  const offers: ScrapedOffer[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      offers.push(...result.value);
    }
    // Les erreurs sont ignorées (déjà loguées dans chaque scraper)
  }

  return offers;
}

export { type ScrapedOffer, type Platform } from "./types";
```

**Step 4: Lancer le test pour vérifier qu'il passe**

```bash
npx vitest run src/lib/scrapers/__tests__/index.test.ts
```

**Step 5: Commit**

```bash
git add src/lib/scrapers/index.ts src/lib/scrapers/__tests__/index.test.ts
git commit -m "feat(scrapers): ajout de l'orchestrateur scrapeAll"
```

---

## Task 11 : API Route — Cron de scraping

**Files:**
- Create: `src/app/api/cron/scrape/route.ts`
- Create: `vercel.json` (config cron)

**Step 1: Implémenter la route cron**

Create: `src/app/api/cron/scrape/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobOffers, searchProfiles } from "@/lib/db/schema";
import { scrapeAll } from "@/lib/scrapers";
import { eq } from "drizzle-orm";

export const maxDuration = 60; // Vercel Pro: 60s max

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
      // Fusionner les plateformes
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
      search.platforms as ("linkedin" | "hellowork" | "indeed" | "wttj")[]
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

  // TODO (Task 16) : envoyer les notifications email

  return NextResponse.json({
    success: true,
    profilesProcessed: uniqueSearches.size,
    offersInserted: totalInserted,
  });
}
```

**Step 2: Créer la config Vercel Cron**

Create: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Step 3: Commit**

```bash
git add src/app/api/cron/ vercel.json
git commit -m "feat(cron): ajout de la route cron de scraping automatique"
```

---

## Task 12 : API Routes — Offres, favoris, candidatures

**Files:**
- Create: `src/app/api/offers/route.ts`
- Create: `src/app/api/favorites/route.ts`
- Create: `src/app/api/applications/route.ts`
- Create: `src/app/api/applications/[id]/route.ts`
- Create: `src/app/api/search-profiles/route.ts`

**Step 1: API des offres (lecture + filtres)**

Create: `src/app/api/offers/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobOffers } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { desc, ilike, eq, and, SQL } from "drizzle-orm";

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
    conditions.push(
      eq(
        jobOffers.platform,
        platform as "linkedin" | "hellowork" | "indeed" | "wttj"
      )
    );
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
```

**Step 2: API des favoris**

Create: `src/app/api/favorites/route.ts`

```typescript
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
```

**Step 3: API des candidatures**

Create: `src/app/api/applications/route.ts`

```typescript
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
```

Create: `src/app/api/applications/[id]/route.ts`

```typescript
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
```

**Step 4: API des profils de recherche**

Create: `src/app/api/search-profiles/route.ts`

```typescript
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

  const { keywords, location, platforms, notifyEmail } = await request.json();

  const [created] = await db
    .insert(searchProfiles)
    .values({
      userId: session.user.id,
      keywords,
      location: location ?? null,
      platforms: platforms ?? ["linkedin", "hellowork", "indeed", "wttj"],
      notifyEmail: notifyEmail ?? true,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
```

**Step 5: Commit**

```bash
git add src/app/api/
git commit -m "feat(api): ajout des routes offres, favoris, candidatures et profils de recherche"
```

---

## Task 13 : Page de login

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/components/ui/sign-in-button.tsx`

**Step 1: Créer le bouton de connexion**

Create: `src/components/ui/sign-in-button.tsx`

```tsx
"use client";

import { signIn } from "next-auth/react";

export const SignInButton = () => {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="flex items-center gap-3 rounded-lg bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-md transition-colors hover:bg-gray-50"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Se connecter avec Google
    </button>
  );
};
```

**Step 2: Créer la page de login**

Create: `src/app/login/page.tsx`

```tsx
import { SignInButton } from "@/components/ui/sign-in-button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Alternance Tracker
          </h1>
          <p className="mt-2 text-gray-600">
            Centralisez vos recherches d&apos;alternance
          </p>
        </div>
        <div className="flex justify-center">
          <SignInButton />
        </div>
      </div>
    </main>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/login/ src/components/ui/sign-in-button.tsx
git commit -m "feat(auth): ajout de la page de connexion Google"
```

---

## Task 14 : Layout dashboard et navigation

**Files:**
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/components/sections/sidebar.tsx`
- Create: `src/components/ui/user-menu.tsx`

**Step 1: Créer le menu utilisateur**

Create: `src/components/ui/user-menu.tsx`

```tsx
"use client";

import { signOut, useSession } from "next-auth/react";

export const UserMenu = () => {
  const { data: session } = useSession();

  return (
    <div className="flex items-center gap-3">
      {session?.user?.image && (
        <img
          src={session.user.image}
          alt=""
          className="h-8 w-8 rounded-full"
        />
      )}
      <span className="text-sm font-medium text-gray-700">
        {session?.user?.name}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Déconnexion
      </button>
    </div>
  );
};
```

**Step 2: Créer la sidebar**

Create: `src/components/sections/sidebar.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Offres", icon: "🔍" },
  { href: "/dashboard/favorites", label: "Favoris", icon: "⭐" },
  { href: "/dashboard/applications", label: "Candidatures", icon: "📋" },
  { href: "/dashboard/settings", label: "Paramètres", icon: "⚙️" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Alternance Tracker</h1>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
```

> **Note** : Les icônes emoji sont temporaires. L'implémenteur peut les remplacer par des icônes SVG (lucide-react par exemple) lors du polish.

**Step 3: Créer le layout dashboard**

Create: `src/app/dashboard/layout.tsx`

```tsx
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/sections/sidebar";
import { UserMenu } from "@/components/ui/user-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-end border-b border-gray-200 bg-white px-6">
            <UserMenu />
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/dashboard/layout.tsx src/components/sections/ src/components/ui/user-menu.tsx
git commit -m "feat(dashboard): ajout du layout avec sidebar et menu utilisateur"
```

---

## Task 15 : Page dashboard — Liste des offres

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/sections/offer-list.tsx`
- Create: `src/components/ui/offer-card.tsx`
- Create: `src/components/ui/search-filters.tsx`

**Step 1: Créer le composant de filtres**

Create: `src/components/ui/search-filters.tsx`

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const platforms = [
  { value: "", label: "Toutes" },
  { value: "hellowork", label: "HelloWork" },
  { value: "indeed", label: "Indeed" },
  { value: "wttj", label: "WTTJ" },
  { value: "linkedin", label: "LinkedIn" },
];

export const SearchFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query) params.set("q", query);
    else params.delete("q");
    params.set("page", "1");
    router.push(`/dashboard?${params.toString()}`);
  };

  const handlePlatformChange = (platform: string) => {
    const params = new URLSearchParams(searchParams);
    if (platform) params.set("platform", platform);
    else params.delete("platform");
    params.set("page", "1");
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <form onSubmit={handleSearch} className="flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une offre..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </form>
      <div className="flex gap-2">
        {platforms.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePlatformChange(p.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              (searchParams.get("platform") ?? "") === p.value
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
```

**Step 2: Créer le composant carte d'offre**

Create: `src/components/ui/offer-card.tsx`

```tsx
"use client";

import { useState } from "react";

interface OfferCardProps {
  id: string;
  title: string;
  company: string;
  description: string;
  applyUrl: string;
  platform: string;
  location: string | null;
  contractType: string | null;
  scrapedAt: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const platformColors: Record<string, string> = {
  hellowork: "bg-orange-100 text-orange-700",
  indeed: "bg-blue-100 text-blue-700",
  wttj: "bg-yellow-100 text-yellow-700",
  linkedin: "bg-sky-100 text-sky-700",
};

export const OfferCard = ({
  id,
  title,
  company,
  description,
  applyUrl,
  platform,
  location,
  contractType,
  scrapedAt,
  isFavorite = false,
  onToggleFavorite,
}: OfferCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavorite = async () => {
    const method = favorite ? "DELETE" : "POST";
    await fetch("/api/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobOfferId: id }),
    });
    setFavorite(!favorite);
    onToggleFavorite?.(id);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${platformColors[platform] ?? "bg-gray-100 text-gray-600"}`}
            >
              {platform}
            </span>
            {contractType && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {contractType}
              </span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm font-medium text-gray-600">{company}</p>
          {location && (
            <p className="mt-1 text-sm text-gray-500">{location}</p>
          )}
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
            {description}
          </p>
        </div>
        <button
          onClick={handleFavorite}
          className="ml-4 text-xl"
          aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {favorite ? "★" : "☆"}
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {new Date(scrapedAt).toLocaleDateString("fr-FR")}
        </span>
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Postuler
        </a>
      </div>
    </div>
  );
};
```

**Step 3: Créer la page dashboard**

Create: `src/app/dashboard/page.tsx`

```tsx
import { db } from "@/lib/db";
import { jobOffers, favorites } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { desc, ilike, eq, and, SQL } from "drizzle-orm";
import { redirect } from "next/navigation";
import { OfferCard } from "@/components/ui/offer-card";
import { SearchFilters } from "@/components/ui/search-filters";

interface DashboardPageProps {
  searchParams: Promise<{ q?: string; platform?: string; page?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];
  if (params.q) {
    conditions.push(ilike(jobOffers.title, `%${params.q}%`));
  }
  if (params.platform) {
    conditions.push(
      eq(
        jobOffers.platform,
        params.platform as "linkedin" | "hellowork" | "indeed" | "wttj"
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const offers = await db
    .select()
    .from(jobOffers)
    .where(where)
    .orderBy(desc(jobOffers.scrapedAt))
    .limit(limit)
    .offset(offset);

  // Récupérer les favoris de l'utilisateur
  const userFavorites = await db
    .select({ jobOfferId: favorites.jobOfferId })
    .from(favorites)
    .where(eq(favorites.userId, session.user.id));

  const favoriteIds = new Set(userFavorites.map((f) => f.jobOfferId));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Offres d&apos;alternance</h2>
      <SearchFilters />
      <div className="grid gap-4">
        {offers.length === 0 ? (
          <p className="py-12 text-center text-gray-500">
            Aucune offre trouvée. Les offres apparaîtront après le prochain
            scraping.
          </p>
        ) : (
          offers.map((offer) => (
            <OfferCard
              key={offer.id}
              id={offer.id}
              title={offer.title}
              company={offer.company}
              description={offer.description}
              applyUrl={offer.applyUrl}
              platform={offer.platform}
              location={offer.location}
              contractType={offer.contractType}
              scrapedAt={offer.scrapedAt.toISOString()}
              isFavorite={favoriteIds.has(offer.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx src/components/
git commit -m "feat(dashboard): ajout de la page des offres avec filtres et favoris"
```

---

## Task 16 : Pages favoris et candidatures

**Files:**
- Create: `src/app/dashboard/favorites/page.tsx`
- Create: `src/app/dashboard/applications/page.tsx`
- Create: `src/components/ui/application-card.tsx`

**Step 1: Page des favoris**

Create: `src/app/dashboard/favorites/page.tsx`

```tsx
import { db } from "@/lib/db";
import { favorites, jobOffers } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { OfferCard } from "@/components/ui/offer-card";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userFavorites = await db
    .select({ jobOffer: jobOffers })
    .from(favorites)
    .innerJoin(jobOffers, eq(favorites.jobOfferId, jobOffers.id))
    .where(eq(favorites.userId, session.user.id));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mes favoris</h2>
      <div className="grid gap-4">
        {userFavorites.length === 0 ? (
          <p className="py-12 text-center text-gray-500">
            Aucun favori pour l&apos;instant.
          </p>
        ) : (
          userFavorites.map(({ jobOffer }) => (
            <OfferCard
              key={jobOffer.id}
              id={jobOffer.id}
              title={jobOffer.title}
              company={jobOffer.company}
              description={jobOffer.description}
              applyUrl={jobOffer.applyUrl}
              platform={jobOffer.platform}
              location={jobOffer.location}
              contractType={jobOffer.contractType}
              scrapedAt={jobOffer.scrapedAt.toISOString()}
              isFavorite
            />
          ))
        )}
      </div>
    </div>
  );
}
```

**Step 2: Composant carte de candidature**

Create: `src/components/ui/application-card.tsx`

```tsx
"use client";

import { useState } from "react";
import type { ApplicationStatus } from "@/types";

interface ApplicationCardProps {
  applicationId: string;
  title: string;
  company: string;
  applyUrl: string;
  platform: string;
  status: ApplicationStatus;
  notes: string | null;
}

const statusLabels: Record<ApplicationStatus, string> = {
  not_applied: "Pas postulé",
  applied: "Postulé",
  interview: "Entretien",
  rejected: "Refusé",
  accepted: "Accepté",
};

const statusColors: Record<ApplicationStatus, string> = {
  not_applied: "bg-gray-100 text-gray-700",
  applied: "bg-blue-100 text-blue-700",
  interview: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
  accepted: "bg-green-100 text-green-700",
};

const allStatuses: ApplicationStatus[] = [
  "not_applied",
  "applied",
  "interview",
  "rejected",
  "accepted",
];

export const ApplicationCard = ({
  applicationId,
  title,
  company,
  applyUrl,
  platform,
  status: initialStatus,
  notes: initialNotes,
}: ApplicationCardProps) => {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isEditing, setIsEditing] = useState(false);

  const updateStatus = async (newStatus: ApplicationStatus) => {
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatus(newStatus);
  };

  const saveNotes = async () => {
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{company}</p>
        </div>
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Voir l&apos;offre
        </a>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {allStatuses.map((s) => (
          <button
            key={s}
            onClick={() => updateStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              status === s
                ? statusColors[s]
                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="Notes personnelles..."
            />
            <button
              onClick={saveNotes}
              className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {notes ? notes : "Ajouter des notes..."}
          </button>
        )}
      </div>
    </div>
  );
};
```

**Step 3: Page des candidatures**

Create: `src/app/dashboard/applications/page.tsx`

```tsx
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
```

**Step 4: Commit**

```bash
git add src/app/dashboard/favorites/ src/app/dashboard/applications/ src/components/ui/application-card.tsx
git commit -m "feat(dashboard): ajout des pages favoris et candidatures"
```

---

## Task 17 : Page paramètres (profils de recherche)

**Files:**
- Create: `src/app/dashboard/settings/page.tsx`
- Create: `src/components/sections/search-profile-form.tsx`

**Step 1: Créer le formulaire de profil de recherche**

Create: `src/components/sections/search-profile-form.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const platformOptions = [
  { value: "hellowork", label: "HelloWork" },
  { value: "indeed", label: "Indeed" },
  { value: "wttj", label: "Welcome to the Jungle" },
  { value: "linkedin", label: "LinkedIn" },
];

export const SearchProfileForm = () => {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "hellowork",
    "indeed",
    "wttj",
    "linkedin",
  ]);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/search-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keywords,
        location: location || null,
        platforms: selectedPlatforms,
        notifyEmail,
      }),
    });

    setKeywords("");
    setLocation("");
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Nouveau profil de recherche
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mots-clés
        </label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="ex: alternance gestion de projet"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Localisation
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="ex: Rennes"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Plateformes
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {platformOptions.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => togglePlatform(p.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedPlatforms.includes(p.value)
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="notifyEmail"
          checked={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="notifyEmail" className="text-sm text-gray-700">
          Recevoir des notifications par email
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !keywords}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Création..." : "Créer le profil"}
      </button>
    </form>
  );
};
```

**Step 2: Créer la page paramètres**

Create: `src/app/dashboard/settings/page.tsx`

```tsx
import { db } from "@/lib/db";
import { searchProfiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SearchProfileForm } from "@/components/sections/search-profile-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profiles = await db
    .select()
    .from(searchProfiles)
    .where(eq(searchProfiles.userId, session.user.id));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>

      <SearchProfileForm />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Profils de recherche actifs
        </h3>
        {profiles.length === 0 ? (
          <p className="text-gray-500">
            Aucun profil de recherche. Créez-en un pour commencer à recevoir des
            offres.
          </p>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <p className="font-medium text-gray-900">{profile.keywords}</p>
              {profile.location && (
                <p className="text-sm text-gray-500">{profile.location}</p>
              )}
              <div className="mt-2 flex gap-2">
                {profile.platforms.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Notifications : {profile.notifyEmail ? "activées" : "désactivées"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/dashboard/settings/ src/components/sections/search-profile-form.tsx
git commit -m "feat(settings): ajout de la page paramètres avec gestion des profils de recherche"
```

---

## Task 18 : Landing page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Créer la landing page**

Modifier `src/app/page.tsx` :

```tsx
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Alternance Tracker</h1>
        <Link
          href={session ? "/dashboard" : "/login"}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {session ? "Dashboard" : "Se connecter"}
        </Link>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Toutes vos offres d&apos;alternance en un seul endroit
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Agrégez automatiquement les offres de LinkedIn, HelloWork, Indeed et
          Welcome to the Jungle. Suivez vos candidatures et ne ratez plus aucune
          opportunité.
        </p>
        <div className="mt-10">
          <Link
            href={session ? "/dashboard" : "/login"}
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
          >
            Commencer gratuitement
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-3xl">🔍</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Agrégation automatique
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Scraping automatique toutes les 6h sur 4 plateformes majeures.
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-3xl">📋</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Suivi des candidatures
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Suivez le statut de chaque candidature : postulé, entretien,
              accepté...
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-3xl">🔔</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Recevez un email quand de nouvelles offres correspondent à vos
              critères.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: ajout de la landing page"
```

---

## Task 19 : Notifications email (Resend)

**Files:**
- Create: `src/lib/email.ts`
- Modify: `src/app/api/cron/scrape/route.ts`

**Step 1: Configurer Resend**

Create: `src/lib/email.ts`

```typescript
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
    from: "Alternance Tracker <notifications@votredomaine.fr>",
    to,
    subject: `${offers.length} nouvelle(s) offre(s) pour "${keywords}"`,
    html: `
      <h2>Bonjour ${userName},</h2>
      <p>${offers.length} nouvelle(s) offre(s) correspondent à votre recherche "<strong>${keywords}</strong>" :</p>
      <ul>${offersList}</ul>
      <p><a href="https://votredomaine.fr/dashboard">Voir toutes les offres</a></p>
    `,
  });
}
```

**Step 2: Intégrer les notifications dans le cron**

Modifier `src/app/api/cron/scrape/route.ts` — ajouter l'envoi d'emails après l'insertion des offres. Ajouter les imports nécessaires et la logique de notification à la fin de la fonction GET :

```typescript
// Après la boucle d'insertion, ajouter :
import { users } from "@/lib/db/schema";
import { sendNewOffersEmail } from "@/lib/email";

// Dans la logique après insertion :
// Collecter les nouvelles offres insérées par profil
// Pour chaque profil avec notifyEmail === true, envoyer un email
```

> **Note pour l'implémenteur** : La logique exacte de notification dépendra de la façon dont on track quelles offres sont "nouvelles" pour chaque utilisateur. Approche simple : comparer `scrapedAt` avec le dernier run du cron (stocker la date du dernier run dans une table `cron_runs` ou utiliser un `scrapedAt > Date.now() - 6h`).

**Step 3: Commit**

```bash
git add src/lib/email.ts src/app/api/cron/scrape/route.ts
git commit -m "feat(notifications): ajout des emails de notification via Resend"
```

---

## Task 20 : Migrations et déploiement initial

**Files:**
- Modify: `package.json` (scripts)

**Step 1: Ajouter les scripts de migration**

Ajouter dans `package.json` `scripts` :

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio"
```

**Step 2: Générer et appliquer les migrations**

```bash
npx dotenv -e .env.local -- npx drizzle-kit generate
npx dotenv -e .env.local -- npx drizzle-kit migrate
```

**Step 3: Vérifier le build**

```bash
npm run build
```

**Step 4: Vérifier le lint**

```bash
npm run lint
```

**Step 5: Lancer tous les tests**

```bash
npm run test:run
```

**Step 6: Commit final**

```bash
git add .
git commit -m "chore: ajout des scripts de migration et vérification build"
```

**Step 7: Déployer sur Vercel**

1. Créer le projet sur Vercel (via CLI ou dashboard)
2. Configurer les variables d'environnement (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `RESEND_API_KEY`, `CRON_SECRET`)
3. Déployer

```bash
npx vercel --prod
```

---

## Récapitulatif des tâches

| # | Tâche | Fichiers principaux |
|---|-------|-------------------|
| 1 | Init projet Next.js | `package.json`, `src/app/` |
| 2 | Dépendances | `package.json`, `vitest.config.ts` |
| 3 | Schéma DB (Drizzle) | `src/lib/db/schema.ts` |
| 4 | Auth.js | `src/lib/auth.ts`, `src/middleware.ts` |
| 5 | Types scrapers | `src/types/`, `src/lib/scrapers/types.ts` |
| 6 | Scraper HelloWork | `src/lib/scrapers/hellowork.ts` |
| 7 | Scraper Indeed | `src/lib/scrapers/indeed.ts` |
| 8 | Scraper WTTJ | `src/lib/scrapers/wttj.ts` |
| 9 | Scraper LinkedIn | `src/lib/scrapers/linkedin.ts` |
| 10 | Orchestrateur scraping | `src/lib/scrapers/index.ts` |
| 11 | Cron API route | `src/app/api/cron/scrape/route.ts` |
| 12 | API Routes CRUD | `src/app/api/offers/`, `favorites/`, `applications/` |
| 13 | Page login | `src/app/login/page.tsx` |
| 14 | Layout dashboard | `src/app/dashboard/layout.tsx` |
| 15 | Page offres | `src/app/dashboard/page.tsx` |
| 16 | Pages favoris + candidatures | `src/app/dashboard/favorites/`, `applications/` |
| 17 | Page paramètres | `src/app/dashboard/settings/page.tsx` |
| 18 | Landing page | `src/app/page.tsx` |
| 19 | Notifications email | `src/lib/email.ts` |
| 20 | Migrations + déploiement | `drizzle/`, `vercel.json` |
