import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function verifyAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await params;
  const supabase = await createClient();
  const user = await verifyAdmin(supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const adminClient = createAdminClient();

  const { data: resource, error: fetchError } = await adminClient
    .from("resources")
    .select("file_path")
    .eq("id", resourceId)
    .single();

  if (fetchError || !resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  await adminClient.storage.from("resources").remove([resource.file_path]);

  const { error } = await adminClient.from("resources").delete().eq("id", resourceId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
