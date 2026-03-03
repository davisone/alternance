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
