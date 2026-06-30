import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { rejectionEmail } from "@/lib/email/templates";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(renderPage("Lien invalide", "Ce lien est invalide.", false), {
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabase = createAdminClient();

  const { data: approvalToken, error: tokenError } = await supabase
    .from("approval_tokens")
    .select("*, profiles(*)")
    .eq("token", token)
    .eq("action", "reject")
    .single();

  if (tokenError || !approvalToken) {
    return new NextResponse(renderPage("Lien invalide", "Ce lien de refus est invalide ou a expiré.", false), {
      headers: { "Content-Type": "text/html" },
    });
  }

  if (approvalToken.used) {
    return new NextResponse(renderPage("Déjà traité", "Ce lien a déjà été utilisé.", false), {
      headers: { "Content-Type": "text/html" },
    });
  }

  const profile = approvalToken.profiles as { id: string; email: string; full_name: string };

  // Mark token as used
  await supabase
    .from("approval_tokens")
    .update({ used: true })
    .eq("id", approvalToken.id);

  // Reject user
  await supabase
    .from("profiles")
    .update({ status: "rejected" })
    .eq("id", profile.id);

  // Invalidate approve token too
  await supabase
    .from("approval_tokens")
    .update({ used: true })
    .eq("user_id", profile.id)
    .eq("action", "approve")
    .eq("used", false);

  // Send rejection email to client
  try {
    await sendEmail({
      to: profile.email,
      subject: "Information concernant votre inscription Coachdazet Formation",
      html: rejectionEmail({ clientName: profile.full_name }),
    });
  } catch (e) {
    console.error("Failed to send rejection email:", e);
  }

  return new NextResponse(
    renderPage(
      "Accès refusé",
      `Le compte de <strong>${profile.full_name}</strong> (${profile.email}) a été refusé. Un email d'information lui a été envoyé.`,
      true
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

function renderPage(title: string, message: string, success: boolean) {
  const iconColor = success ? "#C0603A" : "#dc2626";
  const bgColor = success ? "#FBF0EC" : "#fee2e2";
  const icon = success
    ? `<svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="${iconColor}"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>`
    : `<svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="${iconColor}"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

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
  </div>
</body>
</html>`;
}
