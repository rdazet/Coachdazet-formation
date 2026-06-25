import Link from "next/link";
import { Lock } from "lucide-react";

export default function ModuleVerrouillePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Icône */}
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[#1B2B4A]/10 flex items-center justify-center">
          <Lock size={28} className="text-[#1B2B4A]" />
        </div>

        {/* Titre */}
        <h1 className="font-display text-2xl font-semibold text-[#1B2B4A] mb-3">
          Module non débloqué
        </h1>

        {/* Message */}
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Ce module fait partie d&apos;une étape de coaching que vous n&apos;avez pas encore
          débloquée. Pour y accéder, contactez Raphaël afin de convenir de la
          suite de votre accompagnement.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#1B2B4A] text-white text-sm font-medium hover:bg-[#243657] transition-colors"
          >
            Retour au tableau de bord
          </Link>
          <a
            href="mailto:raphael@coachdazet.com"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-[#1B2B4A] text-[#1B2B4A] text-sm font-medium hover:bg-[#1B2B4A]/5 transition-colors"
          >
            Contacter Raphaël
          </a>
        </div>
      </div>
    </div>
  );
}
