import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { subject, text } = await request.json();

  if (!subject || !text) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const to   = process.env.ADMIN_EMAIL || "rdazet@hotmail.com";

  const { error } = await resend.emails.send({ from, to, subject, text });

  if (error) {
    console.error("Resend error:", JSON.stringify(error));
    return NextResponse.json({ error: "Erreur lors de l'envoi", detail: error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
