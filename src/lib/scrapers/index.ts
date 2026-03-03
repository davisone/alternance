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
  }

  return offers;
}

export { type ScrapedOffer, type Platform } from "./types";
