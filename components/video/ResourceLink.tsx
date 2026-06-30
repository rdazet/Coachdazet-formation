"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

const FILE_ICONS: Record<string, string> = {
  pdf: "📄",
  pptx: "📊",
  xlsx: "📈",
};

interface Props {
  resourceId: string;
  title: string;
  fileType: string;
  fileSize: number | null;
}

export default function ResourceLink({ resourceId, title, fileType, fileSize }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/resources/${resourceId}/signed-url`);
      if (!res.ok) throw new Error("Failed");
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-navy hover:bg-[#f8f9fc] transition-all group text-left disabled:opacity-70"
    >
      <span className="text-2xl">{FILE_ICONS[fileType] || "📎"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 group-hover:text-navy truncate">
          {title}
        </p>
        <p className="text-xs text-gray-400 uppercase">
          {fileType}
          {fileSize ? ` · ${(fileSize / 1024 / 1024).toFixed(1)} Mo` : ""}
        </p>
        {error && <p className="text-xs text-red-500 mt-0.5">Erreur — réessaie</p>}
      </div>
      {loading
        ? <Loader2 size={16} className="text-gray-400 shrink-0 animate-spin" />
        : <Download size={16} className="text-gray-400 group-hover:text-navy shrink-0" />
      }
    </button>
  );
}
