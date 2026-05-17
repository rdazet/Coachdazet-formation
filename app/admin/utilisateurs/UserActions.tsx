"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  userId: string;
  currentStatus: string;
}

export default function UserActions({ userId, currentStatus }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    await fetch("/api/admin/users/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status: newStatus }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      {currentStatus === "pending" && (
        <>
          <button
            onClick={() => updateStatus("approved")}
            disabled={loading !== null}
            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
          >
            {loading === "approved" ? "..." : "Approuver"}
          </button>
          <button
            onClick={() => updateStatus("rejected")}
            disabled={loading !== null}
            className="text-xs border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 font-medium"
          >
            {loading === "rejected" ? "..." : "Refuser"}
          </button>
        </>
      )}
      {currentStatus === "approved" && (
        <button
          onClick={() => updateStatus("disabled")}
          disabled={loading !== null}
          className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium"
        >
          {loading === "disabled" ? "..." : "Désactiver"}
        </button>
      )}
      {(currentStatus === "disabled" || currentStatus === "rejected") && (
        <button
          onClick={() => updateStatus("approved")}
          disabled={loading !== null}
          className="text-xs bg-navy text-white px-3 py-1.5 rounded-lg hover:bg-navy-600 transition-colors disabled:opacity-50 font-medium"
        >
          {loading === "approved" ? "..." : "Réactiver"}
        </button>
      )}
    </div>
  );
}
