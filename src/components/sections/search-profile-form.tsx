"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const platformOptions = [
  { value: "hellowork", label: "HelloWork" },
  { value: "indeed", label: "Indeed" },
  { value: "wttj", label: "Welcome to the Jungle" },
  { value: "linkedin", label: "LinkedIn" },
];

export const SearchProfileForm = () => {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "hellowork",
    "indeed",
    "wttj",
    "linkedin",
  ]);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/search-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keywords,
        location: location || null,
        platforms: selectedPlatforms,
        notifyEmail,
      }),
    });

    setKeywords("");
    setLocation("");
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Nouveau profil de recherche
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mots-clés
        </label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="ex: alternance gestion de projet"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Localisation
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="ex: Rennes"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Plateformes
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {platformOptions.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => togglePlatform(p.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedPlatforms.includes(p.value)
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="notifyEmail"
          checked={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="notifyEmail" className="text-sm text-gray-700">
          Recevoir des notifications par email
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !keywords}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Création..." : "Créer le profil"}
      </button>
    </form>
  );
};
