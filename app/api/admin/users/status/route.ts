import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, status } = await request.json();

  if (!userId || !status) {
    return NextResponse.json({ error: "userId and status required" }, { status: 400 });
  }

  const validStatuses = ["approved", "rejected", "disabled", "pending"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const updateData: Record<string, unknown> = { status };
  if (status === "approved") {
    updateData.approved_at = new Date().toISOString();
  }

  const { error } = await adminClient
    .from("profiles")
    .update(updateData)
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
