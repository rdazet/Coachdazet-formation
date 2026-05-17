import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Mark a video as complete / incomplete
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoId, completed } = await request.json();

  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  if (completed) {
    // Upsert progress record
    const { error } = await supabase.from("progress").upsert(
      {
        user_id: user.id,
        video_id: videoId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,video_id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // Remove progress record (unmark)
    const { error } = await supabase
      .from("progress")
      .delete()
      .eq("user_id", user.id)
      .eq("video_id", videoId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
