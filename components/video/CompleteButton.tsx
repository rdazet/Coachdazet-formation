"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

interface CompleteButtonProps {
  videoId: string;
  isCompleted: boolean;
  nextPath?: string;        // full path: /formation/<id>  OR  /plan-epargne  etc.
  nextLabel?: string;       // label for the "next" button
}

export default function CompleteButton({
  videoId,
  isCompleted: initialCompleted,
  nextPath,
  nextLabel = "Vidéo suivante →",
}: CompleteButtonProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const newCompleted = !completed;

    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, completed: newCompleted }),
    });

    setCompleted(newCompleted);
    setLoading(false);
    router.refresh();

    // If just completed and there's a next destination, navigate to it
    if (newCompleted && nextPath) {
      setTimeout(() => {
        router.push(nextPath);
      }, 800);
    }
  }

  if (completed) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-green-600 font-medium">
          <CheckCircle size={20} />
          <span>Vidéo complétée</span>
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className="btn-ghost text-sm"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Marquer comme non terminée
        </button>
        {nextPath && (
          <button
            onClick={() => router.push(nextPath)}
            className="btn-primary"
          >
            {nextLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="btn-cta"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <CheckCircle size={18} />
      )}
      Marquer comme terminé
    </button>
  );
}
