import { describe, it, expect } from "vitest";
import type { ScrapedOffer } from "../types";

describe("Types des scrapers", () => {
  it("doit accepter une offre scrapée valide", () => {
    const offer: ScrapedOffer = {
      title: "Chef de projet junior",
      company: "Acme Corp",
      description: "Description du poste",
      applyUrl: "https://example.com/apply",
      platform: "hellowork",
      location: "Rennes",
      contractType: "Alternance",
    };

    expect(offer.title).toBe("Chef de projet junior");
    expect(offer.platform).toBe("hellowork");
  });

  it("doit accepter location et contractType à null", () => {
    const offer: ScrapedOffer = {
      title: "Chef de projet",
      company: "Corp",
      description: "Desc",
      applyUrl: "https://example.com",
      platform: "indeed",
      location: null,
      contractType: null,
    };

    expect(offer.location).toBeNull();
  });
});
