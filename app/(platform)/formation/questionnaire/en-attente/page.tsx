import Link from "next/link";

export default function QuestionnaireEnAttentePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-semibold text-navy mb-3">
          Questionnaire envoyé
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Vos réponses ont bien été reçues.
        </p>
        <p className="text-gray-600 leading-relaxed mb-6">
          Vous recevrez un email de confirmation dès que votre accès à la partie suivante sera activé.
        </p>
        <div className="border-t border-gray-100 pt-5">
          <Link href="/dashboard" className="text-navy hover:underline text-sm font-medium">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
