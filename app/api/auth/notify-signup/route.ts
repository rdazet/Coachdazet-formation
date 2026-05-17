import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { approvalRequestEmail } from "@/lib/email/templates";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Try to find existing profile first
    let { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    // If profile doesn't exist (trigger not fired), create it manually
    if (!profile) {
      console.log("Profile not found — creating manually for userId:", userId);
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email,
          full_name: fullName,
          role: "client",
          status: "pending",
        })
        .select("id")
        .single();

      if (createError || !newProfile) {
        console.error("Failed to create profile:", createError);
        return NextResponse.json({ error: "Failed to create profile", details: createError?.message }, { status: 500 });
      }
      profile = newProfile;
      console.log("Profile created manually ✅");
    }

    // Create approve and reject tokens
    const approveToken = uuidv4();
    const rejectToken = uuidv4();

    const { error: insertError } = await supabase.from("approval_tokens").insert([
      { user_id: userId, token: approveToken, action: "approve" },
      { user_id: userId, token: rejectToken, action: "reject" },
    ]);

    if (insertError) {
      console.error("Token insert error:", insertError);
      return NextResponse.json({ error: "Failed to create tokens", details: insertError.message }, { status: 500 });
    }

    const approveUrl = `${appUrl}/api/auth/approve?token=${approveToken}`;
    const rejectUrl = `${appUrl}/api/auth/reject?token=${rejectToken}`;

    // Send notification to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "rdazet@hotmail.com",
      subject: `Nouvelle inscription — ${fullName}`,
      html: approvalRequestEmail({
        clientName: fullName,
        clientEmail: email,
        approveUrl,
        rejectUrl,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notify signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
