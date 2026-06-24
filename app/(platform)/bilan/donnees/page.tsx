"use client";
import { useEffect } from "react";

export default function BilanDonneesPage() {
  useEffect(() => {
    document.body.classList.add("bilan-iframe-active");
    return () => {
      document.body.classList.remove("bilan-iframe-active");
    };
  }, []);

  return (
    <div className="h-[calc(100vh-3.5rem)] lg:h-screen">
      <iframe
        src="/bilan/donnees.html"
        className="w-full border-0 h-full"
        title="Vos Données — Bilan Patrimonial"
      />
    </div>
  );
}
