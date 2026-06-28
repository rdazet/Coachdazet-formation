import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CheckCircle, Circle, ChevronRight, PlayCircle } from "lucide-react";
import type { Module } from "@/types";
import BilanLinks from "@/components/dashboard/BilanLinks";
import PlanImmoLink from "@/components/dashboard/PlanImmoLink";
import PlanBourseLink from "@/components/dashboard/PlanBourseLink";
import PlanEpargneLink from "@/components/dashboard/PlanEpargneLink";
import PlanBudgetLink from "@/components/dashboard/PlanBudgetLink";
import PlanSalaireLink from "@/components/dashboard/PlanSalaireLink";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const { data: modulesRaw } = await supabase
    .from("modules")
    .select("*, videos(*, resources(*))")
    .order("sort_order", { ascending: true });

  const modules = (modulesRaw || []).map((mod) => ({
    ...mod,
    videos: [...(mod.videos || [])].sort((a, b) =>
      a.title.localeCompare(b.title, "fr", { numeric: true })
    ),
  }));

  const { data: progress } = await supabase
    .from("progress")
    .select("video_id")
    .eq("user_id", user!.id);

  const completedVideoIds = new Set((progress || []).map((p) => p.video_id));
  const allModules = (modules || []) as Module[];
  const totalVideos = allModules.reduce((s, m) => s + (m.videos?.length || 0), 0);
  const completedCount = completedVideoIds.size;
  const progressPercent = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

  // Find the first incomplete video to resume
  let resumeVideoId: string | null = null;
  for (const mod of allModules) {
    for (const video of mod.videos || []) {
      if (!completedVideoIds.has(video.id)) {
        resumeVideoId = video.id;
        break;
      }
    }
    if (resumeVideoId) break;
  }

  const firstName = profile?.full_name?.split(" ")[0] || "là";

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 lg:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-navy mb-1">
          Bonjour, {firstName} 👋
        </h1>
        <p className="text-gray-500">
          {completedCount === 0
            ? "Bienvenue dans votre formation ! Commencez par remplir vos données."
            : completedCount === totalVideos
            ? "Félicitations ! Vous avez terminé toute la formation 🎉"
            : `Vous avez complété ${completedCount} vidéo${completedCount > 1 ? "s" : ""} sur ${totalVideos}.`}
        </p>
      </div>

      {/* CTA button */}
      {completedCount === 0 ? (
        <div className="mb-6">
          <Link href="/bilan/donnees" className="btn-cta">
            <PlayCircle size={18} />
            Commencer
          </Link>
        </div>
      ) : resumeVideoId ? (
        <div className="mb-6">
          <Link href={`/formation/${resumeVideoId}`} className="btn-cta">
            <PlayCircle size={18} />
            Reprendre
          </Link>
        </div>
      ) : null}

      {/* Progress card */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Progression globale</span>
          <span className="text-lg font-bold text-navy">{progressPercent}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {completedCount} / {totalVideos} vidéos complétées
        </p>
      </div>

      {/* Bilan section */}
      <h2 className="font-display text-xl font-semibold text-navy mb-4">
        Votre bilan
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <BilanLinks dashboard />
      </div>

      {/* Modules grid */}
      <h2 className="font-display text-xl font-semibold text-navy mb-4">
        Les 5 modules
      </h2>

      <div className="space-y-4">
        {allModules.map((module, index) => {
          const moduleVideos = module.videos || [];
          const moduleCompleted = moduleVideos.filter((v) => completedVideoIds.has(v.id)).length;
          const modulePercent =
            moduleVideos.length > 0
              ? Math.round((moduleCompleted / moduleVideos.length) * 100)
              : 0;
          const firstVideoId = moduleVideos[0]?.id;

          return (
            <div key={module.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-navy text-white font-bold font-display text-lg flex items-center justify-center shrink-0">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display text-lg font-semibold text-navy">
                      {module.title}
                    </h3>
                    <span className="text-sm text-gray-500 shrink-0 ml-2">
                      {moduleCompleted}/{moduleVideos.length}
                    </span>
                  </div>

                  {module.description && (
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                      {module.description}
                    </p>
                  )}

                  {/* Mini progress */}
                  <div className="progress-bar mb-3" style={{ height: "4px" }}>
                    <div
                      className="h-full bg-terracotta rounded-full transition-all"
                      style={{ width: `${modulePercent}%` }}
                    />
                  </div>

                  {/* Video list preview */}
                  <ul className="space-y-1">
                    {moduleVideos.map((video) => (
                      <li key={video.id}>
                        <Link
                          href={`/formation/${video.id}`}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors py-0.5 group"
                        >
                          {completedVideoIds.has(video.id) ? (
                            <CheckCircle size={14} className="text-terracotta shrink-0" />
                          ) : (
                            <Circle size={14} className="text-gray-300 shrink-0" />
                          )}
                          <span className="group-hover:underline truncate">{video.title}</span>
                        </Link>
                      </li>
                    ))}
                    {index === 0 && <PlanEpargneLink />}
                    {index === 1 && <PlanImmoLink />}
                    {index === 2 && <PlanBourseLink />}
                    {index === 3 && <PlanBudgetLink />}
                    {index === 4 && <PlanSalaireLink />}
                  </ul>
                </div>

                {firstVideoId && (
                  <Link
                    href={`/formation/${firstVideoId}`}
                    className="text-navy hover:text-terracotta transition-colors shrink-0 self-center"
                  >
                    <ChevronRight size={20} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
