"use client";

import { useState } from "react";
import type { ApplicationStatus } from "@/types";

interface ApplicationCardProps {
  applicationId: string;
  title: string;
  company: string;
  applyUrl: string;
  platform: string;
  status: ApplicationStatus;
  notes: string | null;
}

const statusLabels: Record<ApplicationStatus, string> = {
  not_applied: "Pas postulé",
  applied: "Postulé",
  interview: "Entretien",
  rejected: "Refusé",
  accepted: "Accepté",
};

const statusColors: Record<ApplicationStatus, string> = {
  not_applied: "bg-gray-100 text-gray-700",
  applied: "bg-blue-100 text-blue-700",
  interview: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
  accepted: "bg-green-100 text-green-700",
};

const allStatuses: ApplicationStatus[] = [
  "not_applied",
  "applied",
  "interview",
  "rejected",
  "accepted",
];

export const ApplicationCard = ({
  applicationId,
  title,
  company,
  applyUrl,
  status: initialStatus,
  notes: initialNotes,
}: ApplicationCardProps) => {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isEditing, setIsEditing] = useState(false);

  const updateStatus = async (newStatus: ApplicationStatus) => {
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatus(newStatus);
  };

  const saveNotes = async () => {
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{company}</p>
        </div>
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Voir l&apos;offre
        </a>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {allStatuses.map((s) => (
          <button
            key={s}
            onClick={() => updateStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              status === s
                ? statusColors[s]
                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="Notes personnelles..."
            />
            <button
              onClick={saveNotes}
              className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {notes ? notes : "Ajouter des notes..."}
          </button>
        )}
      </div>
    </div>
  );
};
