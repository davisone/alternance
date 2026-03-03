import { describe, it, expect, vi, beforeEach } from "vitest";
import { linkedinScraper } from "../linkedin";

describe("Scraper LinkedIn", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("doit avoir le nom 'linkedin'", () => {
    expect(linkedinScraper.name).toBe("linkedin");
  });

  it("doit parser les offres depuis la page de recherche LinkedIn", async () => {
    const fixtureHtml = `
      <ul class="jobs-search__results-list">
        <li>
          <div class="base-card">
            <h3 class="base-search-card__title">Chef de Projet Alternance</h3>
            <h4 class="base-search-card__subtitle">TechCorp</h4>
            <span class="job-search-card__location">Rennes</span>
            <a class="base-card__full-link" href="https://www.linkedin.com/jobs/view/12345"></a>
          </div>
        </li>
        <li>
          <div class="base-card">
            <h3 class="base-search-card__title">Assistant Gestion de Projet</h3>
            <h4 class="base-search-card__subtitle">BigCorp</h4>
            <span class="job-search-card__location">Paris</span>
            <a class="base-card__full-link" href="https://www.linkedin.com/jobs/view/67890"></a>
          </div>
        </li>
      </ul>
    `;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(fixtureHtml),
      })
    );

    const offers = await linkedinScraper.scrape(
      "alternance gestion de projet",
      "Rennes"
    );

    expect(offers).toHaveLength(2);
    expect(offers[0].title).toBe("Chef de Projet Alternance");
    expect(offers[0].company).toBe("TechCorp");
    expect(offers[0].platform).toBe("linkedin");
    expect(offers[0].applyUrl).toContain("linkedin.com");
    expect(offers[0].location).toBe("Rennes");

    expect(offers[1].company).toBe("BigCorp");
  });

  it("doit retourner un tableau vide si la requête échoue", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429 })
    );

    const offers = await linkedinScraper.scrape("test", "Paris");
    expect(offers).toEqual([]);
  });
});
