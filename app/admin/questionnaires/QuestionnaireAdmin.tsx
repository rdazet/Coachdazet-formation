"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

const MODULE_NAMES: Record<number, string> = {
  2: "Immobilier",
  3: "Bourse",
  5: "Épargne",
};

const FIELD_LABELS: Record<string, string> = {
  statut: "Statut",
  loyer_mensuel: "Loyer mensuel (€)",
  nb_annees: "Nombre d'années",
  taux: "Taux (%)",
  budget_souhaite: "Budget souhaité RP (€)",
  epargne_supplementaire: "Épargne supplémentaire (€/mois)",
  endt_max_rp: "Endettement max — nouvelle RP (%)",
  endt_max_loc: "Endettement max — investissement loc. (%)",
  endt_max_deux: "Endettement max — les deux (%)",
  budget_rp: "Budget RP (€)",
  nb_annees_loc: "Nb années — investissement loc.",
  taux_loc: "Taux — investissement loc. (%)",
  nb_annees_rp: "Nb années — nouvelle RP",
  taux_rp: "Taux — nouvelle RP (%)",
  rentabilite_loc: "Rentabilité attendue — loc. (%)",
  rentabilite_deux: "Rentabilité attendue — les deux (%)",
  nb_annees_deux: "Nb années — les deux",
  taux_deux: "Taux — les deux (%)",
};

interface Submission {
  id: string;
  user_id: string;
  module_number: number;
  form_type: string | null;
  form_data: Record<string, string>;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
}

interface Props {
  submissions: Submission[];
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span className="badge-approved flex items-center gap-1">
        <CheckCircle size={12} /> Validé
      </span>
    );
  if (status === "rejected")
    return (
      <span className="badge-rejected flex items-center gap-1">
        <XCircle size={12} /> Refusé
      </span>
    );
  return (
    <span className="badge-pending flex items-center gap-1">
      <Clock size={12} /> En attente
    </span>
  );
}

export default function QuestionnaireAdmin({ submissions }: Props) {
  const [items, setItems] = useState(submissions);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pending = items.filter((s) => s.status === "pending");
  const reviewed = items.filter((s) => s.status !== "pending");

  async function handleAction(id: string, action: "approve" | "reject") {
    setLoadingId(id);
    try {
      const res = await fetch("/api/questionnaire/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: id, action }),
      });
      if (!res.ok) throw new Error("Erreur");
      setItems((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: action === "approve" ? "approved" : "rejected", reviewed_at: new Date().toISOString() }
            : s
        )
      );
    } catch {
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoadingId(null);
    }
  }

  function SubmissionRow({ s }: { s: Submission }) {
    const isOpen = expanded === s.id;
    const userName = s.profiles?.full_name || s.profiles?.email || "Inconnu";
    const userEmail = s.profiles?.email || "";
    const date = new Date(s.submitted_at).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm mb-3">
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          onClick={() => setExpanded(isOpen ? null : s.id)}
        >
          <div className="flex items-center gap-4 text-left">
            <div>
              <p className="font-medium text-gray-900 text-sm">{userName}</p>
              <p className="text-xs text-gray-400">{userEmail}</p>
            </div>
            <div className="hidden sm:flex flex-col items-start gap-1">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {MODULE_NAMES[s.module_number] || `Module ${s.module_number}`}
              </span>
              {s.form_type && (
                <span className="text-xs text-gray-400 capitalize">{s.form_type}</span>
              )}
            </div>
            <div className="text-xs text-gray-400 hidden md:block">{date}</div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={s.status} />
            {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-gray-100 px-5 py-4">
            {/* Données du formulaire */}
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Réponses du client
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
              {Object.entries(s.form_data).map(([key, val]) => (
                <div key={key} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-500 text-xs">{FIELD_LABELS[key] || key}</span>
                  <span className="font-medium text-gray-800 text-xs">{val}</span>
                </div>
              ))}
            </div>

            {/* Rappel paiement */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-5 flex gap-2">
              <Clock size={16} className="text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Rappel :</strong> Vérifiez que le virement pour la partie{" "}
                <strong>{MODULE_NAMES[s.module_number + 1] || "suivante"}</strong> a bien été reçu avant de valider.
              </p>
            </div>

            {/* Actions */}
            {s.status === "pending" && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(s.id, "approve")}
                  disabled={loadingId === s.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Valider l&apos;accès
                </button>
                <button
                  onClick={() => handleAction(s.id, "reject")}
                  disabled={loadingId === s.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Refuser
                </button>
              </div>
            )}

            {s.status !== "pending" && s.reviewed_at && (
              <p className="text-xs text-gray-400 text-center">
                Traité le{" "}
                {new Date(s.reviewed_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Pending */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold text-gray-800">En attente</h2>
          {pending.length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune demande en attente.</p>
        ) : (
          pending.map((s) => <SubmissionRow key={s.id} s={s} />)
        )}
      </div>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-800 mb-4">Historique</h2>
          {reviewed.map((s) => <SubmissionRow key={s.id} s={s} />)}
        </div>
      )}
    </div>
  );
}
