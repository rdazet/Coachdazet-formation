import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";

// GET: Show confirmation page only — do NOT consume the token yet
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!token) {
    return new NextResponse(renderPage("Lien invalide", "Token manquant.", false, null), {
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabase = createAdminClient();

  const { data: approvalToken, error: tokenError } = await supabase
    .from("approval_tokens")
    .select("*, profiles(*)")
    .eq("token", token)
    .eq("action", "approve")
    .single();

  if (tokenError || !approvalToken) {
    return new NextResponse(renderPage("Lien invalide", "Ce lien d'approbation est invalide ou a expiré.", false, null), {
      headers: { "Content-Type": "text/html" },
    });
  }

  if (approvalToken.used) {
    return new NextResponse(renderPage("Déjà traité", "Ce lien a déjà été utilisé.", false, null), {
      headers: { "Content-Type": "text/html" },
    });
  }

  if (new Date(approvalToken.expires_at) < new Date()) {
    return new NextResponse(renderPage("Lien expiré", "Ce lien d'approbation a expiré (validité 7 jours).", false, null), {
      headers: { "Content-Type": "text/html" },
    });
  }

  const profile = approvalToken.profiles as { id: string; email: string; full_name: string };

  // Show confirmation page with a POST button
  return new NextResponse(
    renderPage(
      "Confirmer l'approbation",
      `Voulez-vous approuver l'accès de <strong>${profile.full_name}</strong> (${profile.email}) ?`,
      null,
      token
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

// POST: Actually process the approval
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = formData.get("token") as string;

  if (!token) {
    return new NextResponse(renderPage("Lien invalide", "Token manquant.", false, null), {
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabase = createAdminClient();

  const { data: approvalToken, error: tokenError } = await supabase
    .from("approval_tokens")
    .select("*, profiles(*)")
    .eq("token", token)
    .eq("action", "approve")
    .single();

  if (tokenError || !approvalToken) {
    return new NextResponse(renderPage("Lien invalide", "Ce lien d'approbation est invalide ou a expiré.", false, null), {
      headers: { "Content-Type": "text/html" },
    });
  }

  if (approvalToken.used) {
    return new NextResponse(renderPage("Déjà traité", "Ce lien a déjà été utilisé.", false, null), {
      headers: { "Content-Type": "text/html" },
    });
  }

  if (new Date(approvalToken.expires_at) < new Date()) {
    return new NextResponse(renderPage("Lien expiré", "Ce lien d'approbation a expiré (validité 7 jours).", false, null), {
      headers: { "Content-Type": "text/html" },
    });
  }

  const profile = approvalToken.profiles as { id: string; email: string; full_name: string };

  // Mark token as used
  await supabase
    .from("approval_tokens")
    .update({ used: true })
    .eq("id", approvalToken.id);

  // Approve user
  await supabase
    .from("profiles")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", profile.id);

  // Invalidate reject token
  await supabase
    .from("approval_tokens")
    .update({ used: true })
    .eq("user_id", profile.id)
    .eq("action", "reject")
    .eq("used", false);

  // Send welcome email
  try {
    await sendEmail({
      to: profile.email,
      subject: "Votre accès Coachdazet Formation est activé 🎉",
      html: welcomeEmail({ clientName: profile.full_name }),
    });
  } catch (e) {
    console.error("Failed to send welcome email:", e);
  }

  return new NextResponse(
    renderPage(
      "Accès approuvé ✅",
      `Le compte de <strong>${profile.full_name}</strong> (${profile.email}) a été approuvé. Un email de bienvenue lui a été envoyé.`,
      true,
      null
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

function renderPage(title: string, message: string, success: boolean | null, confirmToken: string | null) {
  const isConfirm = confirmToken !== null;
  const iconColor = success === true ? "#16a34a" : success === false ? "#dc2626" : "#1B2B5E";
  const bgColor = success === true ? "#dcfce7" : success === false ? "#fee2e2" : "#e8eaf6";
  const icon = success === true
    ? `<svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="${iconColor}"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
    : success === false
    ? `<svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="${iconColor}"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`
    : `<svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="${iconColor}"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

  const confirmForm = isConfirm ? `
    <form method="POST" action="/api/auth/approve" style="margin-top:24px;">
      <input type="hidden" name="token" value="${confirmToken}" />
      <button type="submit" style="background:#1B2B5E;color:white;border:none;padding:12px 32px;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">
        ✅ Confirmer l'approbation
      </button>
    </form>` : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Coachdazet Formation — ${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #F5F5F5; font-family: Inter, Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: white; border-radius: 12px; padding: 40px; max-width: 480px; width: 90%; text-align: center; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
    .icon-wrap { width: 72px; height: 72px; border-radius: 50%; background: ${bgColor}; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    h1 { color: #1B2B5E; font-size: 22px; margin: 0 0 12px; }
    p { color: #4B5563; font-size: 15px; line-height: 1.6; margin: 0; }
    .header { background: #1B2B5E; padding: 20px 40px; border-radius: 12px 12px 0 0; margin: -40px -40px 32px; }
    .header span { color: white; font-size: 18px; font-weight: 600; }
    .header em { color: #C0603A; font-style: italic; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header"><span>Coachdazet <em>Formation</em></span></div>
    <div class="icon-wrap">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${confirmForm}
  </div>
</body>
</html>`;
}
