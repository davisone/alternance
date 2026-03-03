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
