"use client";
import { useEffect } from "react";

export default function ResultatFrame({ src }: { src: string }) {
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const prev = main.style.overflowY;
    main.style.overflowY = "hidden";
    return () => {
      main.style.overflowY = prev;
    };
  }, []);

  return (
    <div className="h-[calc(100vh-3.5rem)] lg:h-screen">
      <iframe
        src={src}
        className="w-full border-0 h-full"
        title="Bilan Patrimonial — Résultats"
      />
    </div>
  );
}
