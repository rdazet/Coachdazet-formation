import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import type { Module } from "@/types";

async function getFormationData(userId: string) {
  const supabase = await createClient();

  const { data: modules } = await supabase
    .from("modules")
    .select("*, videos(*, resources(*))")
    .order("sort_order", { ascending: true });

  // Natural numeric sort for videos within each module (handles "10" after "9")
  const sortedModules = (modules || []).map((mod) => ({
    ...mod,
    videos: [...(mod.videos || [])].sort((a, b) =>
      a.title.localeCompare(b.title, "fr", { numeric: true })
    ),
  }));

  const { data: progress } = await supabase
    .from("progress")
    .select("video_id")
    .eq("user_id", userId);

  const completedVideoIds = (progress || []).map((p) => p.video_id);
  const totalVideos = sortedModules.reduce(
    (sum, mod) => sum + (mod.videos?.length || 0),
    0
  );

  return {
    modules: sortedModules as Module[],
    completedVideoIds,
    totalVideos,
  };
}

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("status, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status === "rejected" || profile.status === "disabled") {
    redirect("/connexion");
  }

  if (profile.role === "admin") {
    // Admins have their own layout
  }

  const { modules, completedVideoIds, totalVideos } = await getFormationData(user.id);

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar
          modules={modules}
          completedVideoIds={completedVideoIds}
          totalVideos={totalVideos}
          profileName={profile.full_name}
        />
      </div>

      <MobileSidebar
        modules={modules}
        completedVideoIds={completedVideoIds}
        totalVideos={totalVideos}
        profileName={profile.full_name}
      />

      <main className="flex-1 lg:h-screen lg:overflow-y-auto bg-[#F5F5F5]">
        <div className="pt-14 lg:pt-0">{children}</div>
      </main>
    </div>
  );
}
