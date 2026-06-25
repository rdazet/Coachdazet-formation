"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LEVEL_LABELS: Record<number, string> = {
  0: "0 — Aucun accès",
  1: "1 — 5 vidéos",
  2: "2 — 10 vidéos",
  3: "3 — Accès complet",
};

export default function PaymentSelector({
  userId,
  currentTier,
}: {
  userId: string;
  currentTier: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(currentTier);

  async function handleChange(newTier: number) {
    setValue(newTier);
    setLoading(true);
    await fetch("/api/admin/users/tier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, tier: newTier }),
    });
    setLoading(false);
    router.refresh();
  }

  const color =
    value === 0
      ? "text-red-600 border-red-200 bg-red-50"
      : value === 3
      ? "text-green-700 border-green-200 bg-green-50"
      : "text-[#C0603A] border-orange-200 bg-orange-50";

  return (
    <select
      value={value}
      onChange={(e) => handleChange(Number(e.target.value))}
      disabled={loading}
      className={`text-xs font-semibold border px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 ${color}`}
    >
      {[0, 1, 2, 3].map((t) => (
        <option key={t} value={t}>
          {loading && value === t ? "..." : LEVEL_LABELS[t]}
        </option>
      ))}
    </select>
  );
}
