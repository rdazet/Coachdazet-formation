import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Try to find existing profile first
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!profile) {
      // Profile not created by trigger — create manually with auto-approval
      const { error: createError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email,
          full_name: fullName,
          role: "client",
          status: "approved",
          tier: 1,
        });

      if (createError) {
        console.error("Failed to create profile:", createError);
        return NextResponse.json({ error: "Failed to create profile", details: createError.message }, { status: 500 });
      }
    } else {
      // Profile exists (from trigger) — ensure approved + tier 1
      await supabase
        .from("profiles")
        .update({ status: "approved", tier: 1 })
        .eq("id", userId);
    }

    // Notify admin (info only, no action required)
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "rdazet@hotmail.com",
      subject: `Nouvelle inscription — ${fullName}`,
      html: `
        <p style="font-family:sans-serif">
          Nouveau compte créé sur Coachdazet Formation :<br><br>
          <strong>${fullName}</strong> — ${email}<br><br>
          Accès automatique accordé (5 premières vidéos, tier 1).
        </p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notify signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
