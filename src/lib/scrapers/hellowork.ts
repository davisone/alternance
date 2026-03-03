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

  // Sélecteurs basés sur la structure réelle de HelloWork (mars 2026)
  $("li[data-id-storage-target='item']").each((_, element) => {
    const $el = $(element);

    const $link = $el.find("[data-cy='offerTitle']");
    const href = $link.attr("href") || "";

    // Le titre est dans le premier <p> du <h3>
    const title = $el
      .find("h3 p")
      .first()
      .text()
      .trim();

    // L'entreprise est dans le second <p> du <h3>
    const company = $el
      .find("h3 p")
      .eq(1)
      .text()
      .trim();

    const location = $el
      .find("[data-cy='localisationCard']")
      .first()
      .text()
      .trim() || null;

    const contractType = $el
      .find("[data-cy='contractCard']")
      .first()
      .text()
      .trim() || null;

    if (title && company && href) {
      const applyUrl = href.startsWith("http")
        ? href
        : `https://www.hellowork.com${href}`;

      offers.push({
        title,
        company,
        description: "",
        applyUrl,
        platform: "hellowork",
        location,
        contractType,
      });
    }
  });

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
        console.error(`HelloWork: erreur HTTP ${response.status}`);
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
