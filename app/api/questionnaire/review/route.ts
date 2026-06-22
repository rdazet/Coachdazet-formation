import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Maps module_number to the tier that gets unlocked when approved
const MODULE_TO_TIER: Record<number, number> = {
  2: 2, // approved immobilier → unlock tier 2 (bourse modules)
  3: 3, // approved bourse → unlock tier 3 (épargne modules)
  5: 3, // épargne is the last, tier stays 3
};

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Verify admin role
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (adminProfile?.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { submission_id, action } = await request.json();

  if (!submission_id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  // Fetch submission
  const { data: submission } = await supabase
    .from("questionnaire_submissions")
    .select("*, profiles(full_name, email)")
    .eq("id", submission_id)
    .maybeSingle();

  if (!submission) {
    return NextResponse.json({ error: "Soumission introuvable" }, { status: 404 });
  }

  const newStatus = action === "approve" ? "approved" : "rejected";

  // Update submission status
  const { error: updateError } = await supabase
    .from("questionnaire_submissions")
    .update({
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", submission_id);

  if (updateError) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }

  // If approved, upgrade user's tier
  if (action === "approve") {
    const newTier = MODULE_TO_TIER[submission.module_number] ?? 2;
    await supabase
      .from("profiles")
      .update({ tier: newTier })
      .eq("id", submission.user_id);
  }

  // Send confirmation email to the client
  const userEmail = submission.profiles?.email;
  const userName = submission.profiles?.full_name || userEmail || "cher(e) client(e)";

  const moduleNames: Record<number, string> = {
    2: "Immobilier",
    3: "Bourse",
    5: "Épargne",
  };
  const moduleName = moduleNames[submission.module_number] || `Module ${submission.module_number}`;

  if (userEmail) {
    const approvedHtml = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#1B2B5E;">Votre accès a été activé</h2>
        <p>Bonjour ${userName},</p>
        <p>Votre questionnaire <strong>${moduleName}</strong> a été validé. Vous pouvez maintenant accéder à la partie suivante de la formation.</p>
        <p style="margin-top:24px;">
          <a href="https://formation.coachdazet.com/dashboard" style="background:#1B2B5E;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Accéder à la formation →
          </a>
        </p>
        <p style="margin-top:24px;font-size:13px;color:#888;">À bientôt,<br/>L&apos;équipe Coachdazet</p>
      </div>
    `;

    const rejectedHtml = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#1B2B5E;">Votre accès est en attente</h2>
        <p>Bonjour ${userName},</p>
        <p>Votre demande d&apos;accès pour la partie <strong>${moduleName}</strong> n&apos;a pas pu être validée pour le moment.</p>
        <p>Pour toute question, contactez-nous à <a href="mailto:hello@coachdazet.com">hello@coachdazet.com</a>.</p>
        <p style="margin-top:24px;font-size:13px;color:#888;">À bientôt,<br/>L&apos;équipe Coachdazet</p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "Formation <hello@coachdazet.com>",
        to: userEmail,
        subject: action === "approve"
          ? `✅ Accès ${moduleName} activé — Formation Coachdazet`
          : `Formation Coachdazet — Mise à jour de votre accès`,
        html: action === "approve" ? approvedHtml : rejectedHtml,
      });
    } catch (emailErr) {
      console.error("Email error:", emailErr);
    }
  }

  return NextResponse.json({ success: true, status: newStatus });
}
