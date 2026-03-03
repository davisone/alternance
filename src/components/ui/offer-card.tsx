"use client";

import { useState } from "react";

interface OfferCardProps {
  id: string;
  title: string;
  company: string;
  description: string;
  applyUrl: string;
  platform: string;
  location: string | null;
  contractType: string | null;
  scrapedAt: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const platformColors: Record<string, string> = {
  hellowork: "bg-orange-100 text-orange-700",
  indeed: "bg-blue-100 text-blue-700",
  wttj: "bg-yellow-100 text-yellow-700",
  linkedin: "bg-sky-100 text-sky-700",
};

export const OfferCard = ({
  id,
  title,
  company,
  description,
  applyUrl,
  platform,
  location,
  contractType,
  scrapedAt,
  isFavorite = false,
  onToggleFavorite,
}: OfferCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavorite = async () => {
    const method = favorite ? "DELETE" : "POST";
    await fetch("/api/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobOfferId: id }),
    });
    setFavorite(!favorite);
    onToggleFavorite?.(id);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${platformColors[platform] ?? "bg-gray-100 text-gray-600"}`}
            >
              {platform}
            </span>
            {contractType && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {contractType}
              </span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm font-medium text-gray-600">{company}</p>
          {location && (
            <p className="mt-1 text-sm text-gray-500">{location}</p>
          )}
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
            {description}
          </p>
        </div>
        <button
          onClick={handleFavorite}
          className="ml-4 text-xl"
          aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {favorite ? "★" : "☆"}
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {new Date(scrapedAt).toLocaleDateString("fr-FR")}
        </span>
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Postuler
        </a>
      </div>
    </div>
  );
};
