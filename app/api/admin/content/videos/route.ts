import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function verifyAdmin(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? user : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await verifyAdmin(supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { module_id, title, bunny_url, summary, exercices } = body;

  if (!module_id || !title || !bunny_url) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Get the highest sort_order for this module
  const adminClient = createAdminClient();
  const { data: lastVideo } = await adminClient
    .from("videos")
    .select("sort_order")
    .eq("module_id", module_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (lastVideo?.sort_order ?? 0) + 1;

  const { data, error } = await adminClient.from("videos").insert({
    module_id,
    title,
    bunny_url,
    summary: summary || null,
    exercices: exercices || null,
    sort_order: sortOrder,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
