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
