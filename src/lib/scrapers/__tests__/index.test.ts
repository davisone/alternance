import { describe, it, expect, vi } from "vitest";
import { scrapeAll } from "../index";
import type { Scraper } from "../types";

vi.mock("../hellowork", () => ({
  helloworkScraper: {
    name: "hellowork",
    scrape: vi.fn().mockResolvedValue([
      {
        title: "Offre HW",
        company: "HW Corp",
        description: "Desc",
        applyUrl: "https://hellowork.com/1",
        platform: "hellowork",
        location: "Rennes",
        contractType: "Alternance",
      },
    ]),
  } satisfies Scraper,
}));

vi.mock("../indeed", () => ({
  indeedScraper: {
    name: "indeed",
    scrape: vi.fn().mockResolvedValue([
      {
        title: "Offre Indeed",
        company: "Indeed Corp",
        description: "Desc",
        applyUrl: "https://indeed.com/1",
        platform: "indeed",
        location: "Paris",
        contractType: null,
      },
    ]),
  } satisfies Scraper,
}));

vi.mock("../wttj", () => ({
  wttjScraper: {
    name: "wttj",
    scrape: vi.fn().mockResolvedValue([]),
  } satisfies Scraper,
}));

vi.mock("../linkedin", () => ({
  linkedinScraper: {
    name: "linkedin",
    scrape: vi.fn().mockRejectedValue(new Error("Rate limited")),
  } satisfies Scraper,
}));

describe("Orchestrateur de scraping", () => {
  it("doit agréger les résultats de toutes les plateformes demandées", async () => {
    const offers = await scrapeAll(
      "gestion de projet",
      "Rennes",
      ["hellowork", "indeed"]
    );

    expect(offers).toHaveLength(2);
    expect(offers[0].platform).toBe("hellowork");
    expect(offers[1].platform).toBe("indeed");
  });

  it("doit continuer même si un scraper échoue", async () => {
    const offers = await scrapeAll(
      "gestion de projet",
      "Rennes",
      ["hellowork", "linkedin"]
    );

    expect(offers).toHaveLength(1);
    expect(offers[0].platform).toBe("hellowork");
  });

  it("doit filtrer par les plateformes spécifiées", async () => {
    const offers = await scrapeAll(
      "gestion de projet",
      "Rennes",
      ["wttj"]
    );

    expect(offers).toHaveLength(0);
  });
});
