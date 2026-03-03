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
