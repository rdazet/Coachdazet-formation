"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyIBANButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencieux
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-[#1B2B4A] hover:bg-white transition-colors"
      title="Copier l'IBAN"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}
