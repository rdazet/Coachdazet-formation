import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: resource, error: dbError } = await supabase
    .from("resources")
    .select("file_path, title, file_type")
    .eq("id", resourceId)
    .single();

  if (dbError || !resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("resources")
    .createSignedUrl(resource.file_path, 300, {
      download: `${resource.title}.${resource.file_type}`,
    });

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message || "Failed to create URL" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
