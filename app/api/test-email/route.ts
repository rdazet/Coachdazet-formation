import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const to = process.env.ADMIN_EMAIL || "rdazet@hotmail.com";

  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY manquante dans .env.local" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: "Test email — Coachdazet",
    html: "<p>Si vous recevez cet email, Resend fonctionne correctement ✅</p>",
  });

  if (error) {
    return NextResponse.json({
      success: false,
      error,
      config: { apiKey: apiKey.slice(0, 8) + "...", from, to },
    });
  }

  return NextResponse.json({
    success: true,
    data,
    config: { apiKey: apiKey.slice(0, 8) + "...", from, to },
  });
}
