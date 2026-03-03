# Design — Agrégateur d'offres d'alternance

## Résumé

Application web multi-utilisateurs qui agrège les offres d'alternance depuis LinkedIn, HelloWork, Indeed et Welcome to the Jungle. Centralise les données (entreprise, description, lien de candidature) et permet le suivi des candidatures.

## Stack technique

- **Frontend + API** : Next.js 15 (App Router) — TypeScript strict — Tailwind CSS
- **Base de données** : Neon (PostgreSQL serverless) + Drizzle ORM
- **Auth** : Auth.js (NextAuth v5) — providers Google + email magic link
- **Scraping** : API Routes + Vercel Cron (toutes les 6h)
- **Notifications** : Resend (emails)
- **Hébergement** : Vercel

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Vercel                         │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Next.js  │  │ API      │  │ Cron Jobs    │  │
│  │ Frontend │  │ Routes   │  │ (toutes 6h)  │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │               │           │
│       └──────────────┼───────────────┘           │
│                      │                           │
└──────────────────────┼───────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Neon (PgSQL)  │
              └────────────────┘
```

### Flux de scraping

1. Vercel Cron déclenche `/api/cron/scrape` toutes les 6h
2. L'API Route itère sur les `search_profiles` actifs
3. Pour chaque profil, appelle les scrapers des plateformes sélectionnées
4. Chaque scraper retourne un tableau d'offres normalisées
5. Déduplication par `applyUrl` — insertion des nouvelles offres
6. Envoi d'email de notification aux utilisateurs concernés (via Resend)

## Modèle de données

### users
| Colonne    | Type      | Description              |
|------------|-----------|--------------------------|
| id         | uuid (PK) | Identifiant unique       |
| name       | text      | Nom de l'utilisateur     |
| email      | text (UQ) | Email                    |
| image      | text      | Photo de profil (OAuth)  |
| createdAt  | timestamp | Date de création         |

### job_offers
| Colonne      | Type      | Description                              |
|--------------|-----------|------------------------------------------|
| id           | uuid (PK) | Identifiant unique                       |
| title        | text      | Titre du poste                           |
| company      | text      | Nom de l'entreprise                      |
| description  | text      | Description du poste                     |
| applyUrl     | text (UQ) | Lien pour postuler (clé de déduplication)|
| platform     | enum      | linkedin / hellowork / indeed / wttj     |
| location     | text      | Localisation                             |
| contractType | text      | Type de contrat (alternance, stage, etc.)|
| scrapedAt    | timestamp | Date du scraping                         |
| expiresAt    | timestamp | Date d'expiration estimée                |
| sourceUrl    | text      | URL de la page source scrapée            |

### applications
| Colonne    | Type      | Description                                         |
|------------|-----------|-----------------------------------------------------|
| id         | uuid (PK) | Identifiant unique                                  |
| userId     | uuid (FK) | Référence vers users                                |
| jobOfferId | uuid (FK) | Référence vers job_offers                           |
| status     | enum      | not_applied / applied / interview / rejected / accepted |
| notes      | text      | Notes personnelles                                  |
| createdAt  | timestamp | Date de création                                    |
| updatedAt  | timestamp | Date de mise à jour                                 |

### favorites
| Colonne    | Type      | Description                |
|------------|-----------|----------------------------|
| userId     | uuid (FK) | Référence vers users       |
| jobOfferId | uuid (FK) | Référence vers job_offers  |
| createdAt  | timestamp | Date d'ajout en favoris    |

*Clé primaire composite : (userId, jobOfferId)*

### search_profiles
| Colonne     | Type       | Description                              |
|-------------|------------|------------------------------------------|
| id          | uuid (PK)  | Identifiant unique                       |
| userId      | uuid (FK)  | Référence vers users                     |
| keywords    | text       | Mots-clés de recherche                   |
| location    | text       | Localisation souhaitée                   |
| platforms   | text[]     | Plateformes à surveiller                 |
| notifyEmail | boolean    | Recevoir des notifications par email     |
| createdAt   | timestamp  | Date de création                         |

## Stratégie de scraping par plateforme

| Plateforme              | Méthode                 | Détails                                                                 |
|-------------------------|-------------------------|-------------------------------------------------------------------------|
| HelloWork               | Scraping HTML (cheerio) | Pages de résultats parsées avec fetch + cheerio                         |
| Indeed                  | RSS + scraping léger    | Flux RSS par recherche, complété par parsing HTML                       |
| Welcome to the Jungle   | API publique            | API de recherche d'offres accessible publiquement                       |
| LinkedIn                | Google Jobs / agrégation| Résultats Google Jobs (`site:linkedin.com/jobs`) — couverture partielle |

### Interface commune des scrapers

```typescript
interface ScrapedOffer {
  title: string;
  company: string;
  description: string;
  applyUrl: string;
  platform: Platform;
  location: string | null;
  contractType: string | null;
}

interface Scraper {
  name: Platform;
  scrape(keywords: string, location: string): Promise<ScrapedOffer[]>;
}
```

Chaque scraper est un module isolé dans `src/lib/scrapers/`. Si un scraper échoue, les autres continuent.

## Pages

| Route                     | Description                                                        |
|---------------------------|--------------------------------------------------------------------|
| `/`                       | Landing page — présentation, CTA inscription                       |
| `/login`                  | Connexion Google / email magic link                                |
| `/dashboard`              | Liste des offres filtrables (plateforme, date, mot-clé, lieu)      |
| `/dashboard/favorites`    | Offres mises en favoris                                            |
| `/dashboard/applications` | Suivi des candidatures avec statuts et notes                       |
| `/dashboard/settings`     | Profil de recherche + préférences notifications                    |

## Fonctionnalités

- **Recherche et filtres** : texte libre, filtre par plateforme / date / localisation
- **Favoris** : ajout/retrait en un clic
- **Suivi candidature** : changement de statut (not_applied → applied → interview → rejected/accepted) + notes
- **Notifications email** : alerte quand de nouvelles offres matchent le profil de recherche
- **Lien direct** : bouton "Postuler" ouvre l'annonce originale dans un nouvel onglet

## Structure du projet

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx              # Layout dashboard (sidebar, nav)
│   │   ├── page.tsx                # Liste des offres
│   │   ├── favorites/page.tsx
│   │   ├── applications/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── cron/scrape/route.ts    # Endpoint cron
│       ├── offers/route.ts         # CRUD offres
│       ├── favorites/route.ts
│       └── applications/route.ts
├── components/
│   ├── ui/                         # Composants réutilisables
│   └── sections/                   # Sections spécifiques
├── lib/
│   ├── db/
│   │   ├── schema.ts               # Schéma Drizzle
│   │   └── index.ts                # Client Drizzle + Neon
│   ├── scrapers/
│   │   ├── index.ts                # Orchestrateur
│   │   ├── hellowork.ts
│   │   ├── indeed.ts
│   │   ├── wttj.ts
│   │   └── linkedin.ts
│   ├── auth.ts                     # Config Auth.js
│   └── email.ts                    # Config Resend
├── hooks/
├── types/
│   └── index.ts
└── styles/
    └── globals.css
```
