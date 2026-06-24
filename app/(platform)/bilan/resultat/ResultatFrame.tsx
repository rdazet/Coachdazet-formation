"use client";
import { useEffect } from "react";

export default function ResultatFrame({ src }: { src: string }) {
  useEffect(() => {
    const html = document.documentElement;
    const main = document.querySelector("main");
    html.style.overflowY = "hidden";
    if (main) main.style.overflowY = "hidden";
    document.body.classList.add("bilan-iframe-active");
    return () => {
      html.style.overflowY = "";
      if (main) main.style.overflowY = "";
      document.body.classList.remove("bilan-iframe-active");
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
