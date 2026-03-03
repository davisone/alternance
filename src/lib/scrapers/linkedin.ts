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

    const title = $el
      .find(".base-search-card__title, h3")
      .first()
      .text()
      .trim();
    const company = $el
      .find(".base-search-card__subtitle, h4")
      .first()
      .text()
      .trim();
    const link =
      $el.find("a.base-card__full-link, a").first().attr("href") || "";
    const location = $el
      .find(".job-search-card__location, span[class*='location']")
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
