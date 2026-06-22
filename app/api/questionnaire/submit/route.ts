import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { module_number, form_type, form_data } = body;

  if (!module_number || !form_data) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  // Retrieve profile name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const userName = profile?.full_name || user.email || "Utilisateur inconnu";
  const userEmail = profile?.email || user.email || "";

  // Insert submission
  const { error: insertError } = await supabase
    .from("questionnaire_submissions")
    .insert({
      user_id: user.id,
      module_number,
      form_type,
      form_data,
      status: "pending",
    });

  if (insertError) {
    console.error("Insert error:", insertError);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }

  // Build a readable summary of the form data
  const moduleNames: Record<number, string> = {
    2: "Immobilier",
    3: "Bourse",
    5: "Épargne",
  };
  const moduleName = moduleNames[module_number] || `Module ${module_number}`;

  const formRows = Object.entries(form_data)
    .filter(([k]) => k !== "statut")
    .map(([k, v]) => `<tr><td style="padding:4px 8px;border:1px solid #ddd;">${k}</td><td style="padding:4px 8px;border:1px solid #ddd;">${v}</td></tr>`)
    .join("");

  const htmlEmail = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1B2B5E;">Nouveau questionnaire — ${moduleName}</h2>

      <p><strong>Client :</strong> ${userName} (${userEmail})</p>
      <p><strong>Type :</strong> ${form_type || "N/A"}</p>
      <p><strong>Date :</strong> ${new Date().toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>

      <h3 style="color:#1B2B5E;margin-top:24px;">Réponses</h3>
      <table style="border-collapse:collapse;width:100%;">
        <thead>
          <tr>
            <th style="padding:6px 8px;border:1px solid #ddd;background:#f5f5f5;text-align:left;">Champ</th>
            <th style="padding:6px 8px;border:1px solid #ddd;background:#f5f5f5;text-align:left;">Valeur</th>
          </tr>
        </thead>
        <tbody>${formRows}</tbody>
      </table>

      <div style="margin-top:32px;padding:16px;background:#FEF9C3;border-left:4px solid #EAB308;border-radius:4px;">
        <p style="margin:0;font-weight:bold;">⚠️ Rappel paiement</p>
        <p style="margin:8px 0 0;">Ce client a soumis le questionnaire <strong>${moduleName}</strong>. Pensez à vérifier si le virement pour la partie suivante a bien été reçu avant de valider son accès.</p>
      </div>

      <p style="margin-top:24px;font-size:13px;color:#888;">Connectez-vous à votre <a href="https://formation.coachdazet.com/admin" style="color:#1B2B5E;">dashboard admin</a> pour valider ou refuser cet accès.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Formation <hello@coachdazet.com>",
      to: "hello@coachdazet.com",
      subject: `[Action requise] Questionnaire ${moduleName} — ${userName}`,
      html: htmlEmail,
    });
  } catch (emailErr) {
    console.error("Email send error:", emailErr);
    // Don't fail the whole request if email fails
  }

  return NextResponse.json({ success: true });
}
