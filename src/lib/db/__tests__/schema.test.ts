import { describe, it, expect } from "vitest";
import {
  users,
  jobOffers,
  applications,
  favorites,
  searchProfiles,
  platformEnum,
  applicationStatusEnum,
} from "../schema";

describe("Schema de base de données", () => {
  it("doit exporter la table users avec les colonnes requises", () => {
    const columns = Object.keys(users);
    expect(columns).toContain("id");
    expect(columns).toContain("name");
    expect(columns).toContain("email");
    expect(columns).toContain("image");
  });

  it("doit exporter la table jobOffers avec les colonnes requises", () => {
    const columns = Object.keys(jobOffers);
    expect(columns).toContain("id");
    expect(columns).toContain("title");
    expect(columns).toContain("company");
    expect(columns).toContain("description");
    expect(columns).toContain("applyUrl");
    expect(columns).toContain("platform");
    expect(columns).toContain("location");
    expect(columns).toContain("scrapedAt");
  });

  it("doit exporter la table applications avec les colonnes requises", () => {
    const columns = Object.keys(applications);
    expect(columns).toContain("id");
    expect(columns).toContain("userId");
    expect(columns).toContain("jobOfferId");
    expect(columns).toContain("status");
    expect(columns).toContain("notes");
  });

  it("doit exporter la table favorites", () => {
    const columns = Object.keys(favorites);
    expect(columns).toContain("userId");
    expect(columns).toContain("jobOfferId");
  });

  it("doit exporter la table searchProfiles", () => {
    const columns = Object.keys(searchProfiles);
    expect(columns).toContain("userId");
    expect(columns).toContain("keywords");
    expect(columns).toContain("location");
    expect(columns).toContain("platforms");
    expect(columns).toContain("notifyEmail");
  });

  it("doit exporter les enums platform et applicationStatus", () => {
    expect(platformEnum.enumValues).toEqual([
      "linkedin",
      "hellowork",
      "indeed",
      "wttj",
    ]);
    expect(applicationStatusEnum.enumValues).toEqual([
      "not_applied",
      "applied",
      "interview",
      "rejected",
      "accepted",
    ]);
  });
});
