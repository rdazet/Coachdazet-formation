"use client";

import Link from "next/link";
import { CheckCircle, Circle, Database, BarChart2 } from "lucide-react";
import { useEffect, useState } from "react";

interface BilanLinksProps {
  dashboard?: boolean; // true = card layout for dashboard, false = list item layout
}

export default function BilanLinks({ dashboard = false }: BilanLinksProps) {
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    setHasData(!!localStorage.getItem("bilan_donnees"));
  }, []);

  if (dashboard) {
    return (
      <>
        <Link
          href="/bilan/donnees"
          className="card flex items-center gap-4 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
            <Database size={18} className="text-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold text-navy">Vos données</h3>
              {hasData ? (
                <CheckCircle size={14} className="text-terracotta shrink-0" />
              ) : (
                <Circle size={14} className="text-gray-300 shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500">Saisir ou modifier votre patrimoine</p>
          </div>
        </Link>
        <Link
          href="/bilan/resultat"
          className="card flex items-center gap-4 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
            <BarChart2 size={18} className="text-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold text-navy">Bilan patrimonial</h3>
              {hasData ? (
                <CheckCircle size={14} className="text-terracotta shrink-0" />
              ) : (
                <Circle size={14} className="text-gray-300 shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500">Visualiser votre situation patrimoniale</p>
          </div>
        </Link>
      </>
    );
  }

  // List item layout (legacy — kept for compatibility)
  return (
    <>
      <li>
        <Link
          href="/bilan/donnees"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors py-0.5 group"
        >
          {hasData ? (
            <CheckCircle size={14} className="text-terracotta shrink-0" />
          ) : (
            <Circle size={14} className="text-gray-300 shrink-0" />
          )}
          <span className="group-hover:underline truncate">Vos données</span>
        </Link>
      </li>
      <li>
        <Link
          href="/bilan/resultat"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors py-0.5 group"
        >
          {hasData ? (
            <CheckCircle size={14} className="text-terracotta shrink-0" />
          ) : (
            <Circle size={14} className="text-gray-300 shrink-0" />
          )}
          <span className="group-hover:underline truncate">Bilan patrimonial</span>
        </Link>
      </li>
    </>
  );
}
