"use client";
import AutoResizeFrame from "@/components/iframe/AutoResizeFrame";

export default function ResultatFrame({ src }: { src: string }) {
  return <AutoResizeFrame src={src} title="Bilan Patrimonial — Résultats" />;
}
