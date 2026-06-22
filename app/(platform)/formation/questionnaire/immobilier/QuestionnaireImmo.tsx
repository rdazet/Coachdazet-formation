"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DARK = "#44546A";
const DARK_TEXT = "white";

function Row({ label, value, isInput = false, name, unit }: {
  label: string;
  value?: string | number;
  isInput?: boolean;
  name?: string;
  unit?: string;
}) {
  return (
    <tr>
      <td
        className="px-3 py-2 text-sm border border-gray-300"
        style={{ backgroundColor: DARK, color: DARK_TEXT, width: "60%" }}
      >
        {label}
      </td>
      <td className="border border-gray-300" style={{ width: "30%" }}>
        {isInput ? (
          <div className="flex items-center">
            <input
              type="number"
              name={name}
              className="w-full px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-navy"
              defaultValue={typeof value === "number" ? value : ""}
            />
            {unit && <span className="px-2 text-xs text-gray-500 bg-gray-50 border-l border-gray-300 py-1.5">{unit}</span>}
          </div>
        ) : (
          <div
            className="px-3 py-1.5 text-sm"
            style={{ backgroundColor: DARK, color: DARK_TEXT }}
          >
            {value ?? "—"}
          </div>
        )}
      </td>
    </tr>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <tr>
      <td
        colSpan={2}
        className="px-3 py-2 text-sm font-bold border border-gray-300"
        style={{ backgroundColor: DARK, color: DARK_TEXT }}
      >
        {title}
      </td>
    </tr>
  );
}

function FormLocataire() {
  return (
    <div>
      <h3 className="font-display text-lg font-semibold text-navy mb-4">
        Quand pourras-tu acheter ta résidence principale ?
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" style={{ maxWidth: 560 }}>
          <tbody>
            <SectionHeader title="CAS 1 — AVEC TES FINANCES ACTUELLES" />
            <Row label="Revenus" value="(données)" />
            <Row label="Loyer mensuel" isInput name="loyer_mensuel" value={1000} unit="€" />
            <Row label="Dépenses hors loyer" value="(calculé)" />
            <Row label="Épargne" value="(calculé)" />
            <Row label="Capacité de remboursement" value="(calculé)" />
            <Row label="Saut de charge" value="(calculé)" />
            <Row label="Nombre d'années" isInput name="nb_annees" value={25} />
            <Row label="Taux" isInput name="taux" value={4} unit="%" />
            <Row label="Capacité d'endettement" value="(calculé)" />
            <Row label="Apport actuel" value="(données)" />
            <Row label="Budget total" value="(calculé)" />
            <Row label="Budget résidence principale" value="(calculé)" />
            <Row label="Budget souhaité pour résidence principale" isInput name="budget_souhaite" value={200000} unit="€" />
            <Row label="Apport supplémentaire requis" value="(calculé)" />
            <Row label="Nombre d'années pour se constituer cet apport" value="(calculé)" />
            <Row label="Manque à gagner" value="(calculé)" />

            <tr><td colSpan={2} className="py-2" /></tr>
            <SectionHeader title="CAS 2 — TU AUGMENTES TON ÉPARGNE" />
            <Row label="Épargne supplémentaire" isInput name="epargne_supplementaire" value={100} unit="€/mois" />
            <Row label="Nouvelle épargne" value="(calculé)" />
            <Row label="Nombre d'années pour se constituer cet apport" value="(calculé)" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ColHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <th
      className="px-3 py-2 text-xs font-bold text-left border border-gray-300 align-top"
      style={{ backgroundColor: DARK, color: DARK_TEXT, minWidth: 180 }}
    >
      <div>{title}</div>
      {subtitle && <div className="font-normal opacity-80 mt-0.5">{subtitle}</div>}
    </th>
  );
}

function Cell({ value, isInput = false, name, unit }: {
  value?: string | number;
  isInput?: boolean;
  name?: string;
  unit?: string;
}) {
  return (
    <td className="border border-gray-300 p-0" style={{ minWidth: 140 }}>
      {isInput ? (
        <div className="flex items-center">
          <input
            type="number"
            name={name}
            className="w-full px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-navy"
            defaultValue={typeof value === "number" ? value : ""}
          />
          {unit && <span className="px-1.5 text-xs text-gray-500 bg-gray-50 border-l border-gray-300 py-1.5">{unit}</span>}
        </div>
      ) : (
        <div
          className="px-2 py-1.5 text-sm"
          style={{ backgroundColor: DARK, color: DARK_TEXT }}
        >
          {value ?? "—"}
        </div>
      )}
    </td>
  );
}

function LabelCell({ label }: { label: string }) {
  return (
    <td
      className="px-3 py-1.5 text-xs border border-gray-300"
      style={{ backgroundColor: DARK, color: DARK_TEXT, width: 180 }}
    >
      {label}
    </td>
  );
}

function FormProprietaire() {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ width: 180 }} />
              <ColHeader title="Taux d'endettement actuel" />
              <th style={{ width: 16 }} />
              <ColHeader
                title="Quel est ton budget pour t'acheter une nouvelle RP ?"
                subtitle="Hypothèse : tu vends ta RP actuelle"
              />
              <th style={{ width: 16 }} />
              <ColHeader
                title="Quel est ton budget pour un investissement locatif ?"
                subtitle="Hypothèse : tu gardes ta RP actuelle"
              />
              <th style={{ width: 16 }} />
              <ColHeader
                title="Peux-tu faire les deux ?"
                subtitle="Hypothèse : tu vends ta RP, tu prends un emprunt sur ta future RP et achètes un bien locatif cash"
              />
            </tr>
          </thead>
          <tbody>
            {/* Spacer */}
            <tr><td colSpan={9} className="py-1" /></tr>

            {/* Row: Valeur RP / Endettement max */}
            <tr>
              <LabelCell label="Valeur résidence principale" />
              <Cell value="(données)" />
              <td />
              <LabelCell label="Endettement max" /><Cell isInput name="endt_max_rp" value={33} unit="%" />
              <td />
              <LabelCell label="Endettement max" /><Cell isInput name="endt_max_loc" value={33} unit="%" />
              <td />
              <LabelCell label="Endettement max" /><Cell isInput name="endt_max_deux" value={35} unit="%" />
            </tr>

            <tr>
              <LabelCell label="Capital restant dû" />
              <Cell value="(données)" />
              <td />
              <LabelCell label="Revenus nets mensuels" /><Cell value="(données)" />
              <td />
              <LabelCell label="Apport max" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Budget RP" /><Cell isInput name="budget_rp" value={300000} unit="€" />
            </tr>

            <tr>
              <LabelCell label="Patrimoine immobilier" />
              <Cell value="(calculé)" />
              <td />
              <LabelCell label="Remboursements possibles" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Nombre d'années" /><Cell isInput name="nb_annees_loc" value={20} />
              <td />
              <LabelCell label="Investissement locatif" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <LabelCell label="Montant emprunté" />
              <Cell value="(données)" />
              <td />
              <LabelCell label="Emprunt max" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Taux" /><Cell isInput name="taux_loc" value={3.5} unit="%" />
              <td />
              <LabelCell label="Frais d'achat (notaires…)" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <LabelCell label="Taux" />
              <Cell value="(données)" />
              <td />
              <LabelCell label="Nombre d'années" /><Cell isInput name="nb_annees_rp" value={25} />
              <td />
              <LabelCell label="Emprunt max" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Budget total" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <LabelCell label="Début de l'emprunt" />
              <Cell value="(données)" />
              <td />
              <LabelCell label="Taux" /><Cell isInput name="taux_rp" value={3.15} unit="%" />
              <td />
              <LabelCell label="Frais d'achat (notaires…)" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Rentabilité attendue" /><Cell isInput name="rentabilite_deux" value={4} unit="%" />
            </tr>

            <tr>
              <LabelCell label="Nombre d'années" />
              <Cell value="(calculé)" />
              <td />
              <LabelCell label="Mensualités" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Valeur investissement locatif" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Loyers attendus" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <LabelCell label="Remboursements annuels" />
              <Cell value="(calculé)" />
              <td />
              <LabelCell label="Apport max" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Rentabilité attendue" /><Cell isInput name="rentabilite_loc" value={4} unit="%" />
              <td />
              <LabelCell label="Ratio retenu par les banques" /><Cell value="70%" />
            </tr>

            <tr>
              <LabelCell label="Mensualités" />
              <Cell value="(calculé)" />
              <td />
              <LabelCell label="Emprunt max" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Loyers attendus" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Loyers nets attendus" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <LabelCell label="Revenus nets mensuels" />
              <Cell value="(données)" />
              <td />
              <LabelCell label="Frais d'achat (notaires…)" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Ratio retenu par les banques" /><Cell value="70%" />
              <td />
              <LabelCell label="Revenus nets mensuels" /><Cell value="(données)" />
            </tr>

            <tr>
              <LabelCell label="Taux d'endettement actuel" />
              <Cell value="(calculé)" />
              <td />
              <LabelCell label="Valeur RP" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Loyers nets attendus" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Total revenus" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <td colSpan={9} className="py-1" />
            </tr>

            <tr>
              <td />
              <td />
              <td />
              <td />
              <td />
              <LabelCell label="Revenus nets mensuels" /><Cell value="(données)" />
              <td />
              <LabelCell label="Mensualités possibles" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <td />
              <td />
              <td />
              <td />
              <td />
              <LabelCell label="Total revenus" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Emprunt max" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <td />
              <td />
              <td />
              <td />
              <td />
              <LabelCell label="Mensualités possibles" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Nombre d'années" /><Cell isInput name="nb_annees_deux" value={25} />
            </tr>

            <tr>
              <td />
              <td />
              <td />
              <td />
              <td />
              <LabelCell label="Mensualités actuelles" /><Cell value="(données)" />
              <td />
              <LabelCell label="Taux" /><Cell isInput name="taux_deux" value={3.15} unit="%" />
            </tr>

            <tr>
              <td />
              <td />
              <td />
              <td />
              <td />
              <LabelCell label="Nouvelles mensualités" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Mensualités" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <td />
              <td />
              <td />
              <td />
              <td />
              <LabelCell label="Mensualités totales" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Apport max" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <td />
              <td />
              <td />
              <td />
              <td />
              <LabelCell label="Taux d'endettement futur" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Financement max" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <td />
              <td />
              <td />
              <td />
              <td />
              <LabelCell label="Possibilité de dépasser les 35%" /><Cell value="(calculé)" />
              <td />
              <td />
            </tr>

            <tr><td colSpan={9} className="py-2" /></tr>

            {/* Patrimoine section */}
            <tr>
              <LabelCell label="Patrimoine immobilier brut" />
              <Cell value="(calculé)" />
              <td />
              <LabelCell label="Patrimoine immobilier brut" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Patrimoine immobilier brut" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Patrimoine immobilier brut" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <LabelCell label="Patrimoine immobilier net" />
              <Cell value="(calculé)" />
              <td />
              <LabelCell label="Patrimoine immobilier net" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Patrimoine immobilier net" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Patrimoine immobilier net" /><Cell value="(calculé)" />
            </tr>

            <tr>
              <LabelCell label="Cash flow mensuels" />
              <Cell value="(calculé)" />
              <td />
              <LabelCell label="Cash flow mensuels" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Cash flow mensuels" /><Cell value="(calculé)" />
              <td />
              <LabelCell label="Cash flow mensuels" /><Cell value="(calculé)" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function QuestionnaireImmo() {
  const router = useRouter();
  const [statut, setStatut] = useState<"" | "locataire" | "proprietaire">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!statut) return;
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = { statut };
    formData.forEach((value, key) => { data[key] = value.toString(); });

    try {
      const res = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module_number: 2, form_type: statut, form_data: data }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      router.push("/formation/questionnaire/en-attente");
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-navy mb-2">
          Plan Immobilier
        </h1>
        <p className="text-gray-500 text-sm">
          Module 2 — Répondez aux questions ci-dessous pour accéder à la suite de la formation.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: locataire / propriétaire */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Êtes-vous locataire ou propriétaire de votre résidence principale ?
          </label>
          <select
            className="input max-w-xs"
            value={statut}
            onChange={(e) => setStatut(e.target.value as "locataire" | "proprietaire")}
            required
          >
            <option value="">— Sélectionnez —</option>
            <option value="locataire">Locataire</option>
            <option value="proprietaire">Propriétaire</option>
          </select>
        </div>

        {/* Form based on choice */}
        {statut && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            {statut === "locataire" ? <FormLocataire /> : <FormProprietaire />}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {statut && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                "Envoyer mes réponses →"
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
