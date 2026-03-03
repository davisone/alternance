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
