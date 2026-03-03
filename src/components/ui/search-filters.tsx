"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const platforms = [
  { value: "", label: "Toutes" },
  { value: "hellowork", label: "HelloWork" },
  { value: "indeed", label: "Indeed" },
  { value: "wttj", label: "WTTJ" },
  { value: "linkedin", label: "LinkedIn" },
];

export const SearchFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query) params.set("q", query);
    else params.delete("q");
    params.set("page", "1");
    router.push(`/dashboard?${params.toString()}`);
  };

  const handlePlatformChange = (platform: string) => {
    const params = new URLSearchParams(searchParams);
    if (platform) params.set("platform", platform);
    else params.delete("platform");
    params.set("page", "1");
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <form onSubmit={handleSearch} className="flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une offre..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </form>
      <div className="flex gap-2">
        {platforms.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePlatformChange(p.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              (searchParams.get("platform") ?? "") === p.value
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
