"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  userId: string;
  currentStatus: string;
  currentTier: number;
}

const TIER_LABELS: Record<number, string> = {
  1: "Tier 1 — Stratégie",
  2: "Tier 2 — + Immobilier",
  3: "Tier 3 — Tout accès",
};

export default function UserActions({ userId, currentStatus, currentTier }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [tierLoading, setTierLoading] = useState(false);

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

  async function updateTier(newTier: number) {
    setTierLoading(true);
    await fetch("/api/admin/users/tier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, tier: newTier }),
    });
    setTierLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 justify-end flex-wrap">
      {/* Tier selector — only for approved users */}
      {currentStatus === "approved" && (
        <select
          value={currentTier}
          onChange={(e) => updateTier(Number(e.target.value))}
          disabled={tierLoading}
          className="text-xs border border-gray-200 text-[#1B2B4A] bg-white px-2 py-1.5 rounded-lg cursor-pointer hover:border-[#1B2B4A] transition-colors disabled:opacity-50 font-medium"
          title="Modifier le niveau d'accès"
        >
          {[1, 2, 3].map((t) => (
            <option key={t} value={t}>
              {tierLoading && currentTier === t ? "..." : TIER_LABELS[t]}
            </option>
          ))}
        </select>
      )}

      {/* Status actions */}
      {currentStatus === "pending" && (
        <>
          <button
            onClick={() => updateStatus("approved")}
            disabled={loading !== null}
            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
          >
          