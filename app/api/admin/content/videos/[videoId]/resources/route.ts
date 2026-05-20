import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function verifyAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const supabase = await createClient();
  const user = await verifyAdmin(supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;

  if (!file || !title) {
    return NextResponse.json({ error: "Missing file or title" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const fileType = ["pdf", "pptx", "xlsx"].includes(ext) ? ext : "pdf";

  // Sanitize filename: remove accents and special characters
  const safeName = file.name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

  const filePath = `${videoId}/${Date.now()}-${safeName}`;

  const adminClient = createAdminClient();
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await adminClient.storage
    .from("resources")
    .upload(filePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data, error } = await adminClient
    .from("resources")
    .insert({ video_id: videoId, title, file_path: filePath, file_type: fileType, file_size: file.size })
    .select()
    .single();

  if (error) {
    await adminClient.storage.from("resources").remove([filePath]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
