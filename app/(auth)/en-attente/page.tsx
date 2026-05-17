import Link from "next/link";

export default function EnAttentePage() {
  return (
    <div className="card text-center">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h2 className="font-display text-2xl font-semibold text-navy mb-3">
        Compte en attente de validation
      </h2>

      <p className="text-gray-600 leading-relaxed mb-4">
        Votre inscription a bien été enregistrée. Nous allons vérifier votre paiement et activer votre accès dans les plus brefs délais.
      </p>

      <p className="text-gray-500 text-sm mb-6">
        Vous recevrez un email de confirmation dès que votre compte sera activé.
      </p>

      <div className="border-t border-gray-100 pt-5 mt-2">
        <p className="text-sm text-gray-500">
          Une question ?{" "}
          <a href="mailto:contact@coachdazet.com" className="text-navy hover:underline font-medium">
            Contactez-nous
          </a>
        </p>
      </div>
    </div>
  );
}
