import { describe, it, expect, vi, beforeEach } from "vitest";
import { helloworkScraper } from "../hellowork";
import { readFileSync } from "fs";
import { join } from "path";

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

    expect(offers).toHaveLength(3);

    expect(offers[0].title).toBe("Alternance - Conseiller Gestion Patrimoine H/F");
    expect(offers[0].company).toBe("Ecofac Business School Rennes");
    expect(offers[0].applyUrl).toContain("hellowork.com");
    expect(offers[0].platform).toBe("hellowork");
    expect(offers[0].location).toBe("Rennes - 35");
    expect(offers[0].contractType).toBe("Alternance");

    expect(offers[1].company).toBe("Bridor");
    expect(offers[2].company).toBe("Olga");
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
