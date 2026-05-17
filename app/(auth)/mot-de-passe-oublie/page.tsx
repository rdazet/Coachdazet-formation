"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/api/auth/reset-password`,
      }
    );

    if (resetError) {
      setError("Une erreur est survenue. Vérifiez l'adresse email.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="card text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-semibold text-navy mb-3">Email envoyé !</h2>
        <p className="text-gray-600 mb-6">
          Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte de réception (et les spams).
        </p>
        <Link href="/connexion" className="text-navy font-semibold hover:underline text-sm">
          ← Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="font-display text-2xl font-semibold text-navy mb-2">
        Mot de passe oublié
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Entrez votre adresse email pour recevoir un lien de réinitialisation.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="input-label">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="vous@exemple.com"
            required
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Envoi...
            </>
          ) : (
            "Envoyer le lien"
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link href="/connexion" className="text-sm text-gray-500 hover:text-navy">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
