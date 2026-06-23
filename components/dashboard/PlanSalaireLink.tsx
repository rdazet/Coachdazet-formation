"use client";

import Link from "next/link";
import { CheckCircle, Circle } from "lucide-react";
import { useEffect, useState } from "react";

export default function PlanSalaireLink() {
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    setHasData(!!localStorage.getItem("plan_salaire_data"));
  }, []);

  return (
    <li>
      <Link
        href="/plan-salaire"
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors py-0.5 group"
      >
        {hasData ? (
          <CheckCircle size={14} className="text-terracotta shrink-0" />
        ) : (
          <Circle size={14} className="text-gray-300 shrink-0" />
        )}
        <span className="group-hover:underline truncate">Plan Salaire</span>
      </Link>
    </li>
  );
}
