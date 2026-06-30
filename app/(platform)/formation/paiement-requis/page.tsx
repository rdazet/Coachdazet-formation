import Link from "next/link";
import { Lock, CopyIcon } from "lucide-react";

interface Props {
  searchParams: Promise<{ niveau?: string }>;
}

const IBAN = "GB08 REVO 2301 2041 1490 20";

const MESSAGES: Record<number, { ordinal: string; montant: string }> = {
  0: { ordinal: "premier",  montant: "330" },
  1: { ordinal: "second",   montant: "330" },
  2: { ordinal: "dernier",  montant: "330" },
};

export default async function PaiementRequisPage({ searchParams }: Props) {
  const { niveau: niveauStr } = await searchParams;
  const niveau = parseInt(niveauStr ?? "0", 10);
  const msg = MESSAGES[niveau] ?? MESSAGES[0];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full">
        {/* Icône */}
        <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-[#1B2B4A]/10 flex items-center justify-center">
          <Lock size={24} className="text-[#1B2B4A]" />
        </div>

        {/* Message principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-4">
          <p className="text-[#1B2B4A] text-base leading-relaxed mb-6">
            Pour accéder à cette vidéo, merci de procéder au{" "}
            <strong>{msg.ordinal} paiement de {msg.montant} euros</strong>.
          </p>

          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Coordonnées bancaires
          </p>

          {/* Coordonnées bancaires */}
          <div className="bg-[#F8F9FB] rounded-xl p-5 space-y-3 text-sm">
            <BankRow label="Titulaire" value="COACHDAZET LTD" />
            <BankRow label="Banque"    value="Revolut Ltd" />
            <BankRow label="BIC"       value="REVOGB21" />
            <BankRow label="IBAN"      value={IBAN} copyable />
          </div>

          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Une fois le virement effectué, envoyez une confirmation à Raphaël.
            Votre accès sera débloqué dans les plus brefs délais.
          </p>
        </div>

        {/* Retour */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-[#1B2B4A] transition-colors underline underline-offset-2"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}

function BankRow({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-400 shrink-0 w-20">{label}</span>
      <span className="font-mono font-medium text-[#1B2B4A] text-right break-all">
        {value}
      </span>
      {copyable && (
        <CopyIBANButton value={value} />
      )}
    </div>
  );
}

// Client component for copy button
import CopyIBANButton from "./CopyIBANButton";
