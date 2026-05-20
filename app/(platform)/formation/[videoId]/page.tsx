import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import CompleteButton from "@/components/video/CompleteButton";

interface Props {
  params: Promise<{ videoId: string }>;
}

const FILE_ICONS: Record<string, string> = {
  pdf: "📄",
  pptx: "📊",
  xlsx: "📈",
};

export default async function VideoPage({ params }: Props) {
  const { videoId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: video, error } = await supabase
    .from("videos")
    .select("*, resources(*), modules(title)")
    .eq("id", videoId)
    .single();

  if (error || !video) notFound();

  const { data: allVideos } = await supabase
    .from("videos")
    .select("id, title, module_id, sort_order, modules(sort_order)")
    .order("sort_order", { ascending: true });

  const sortedVideos = (allVideos || []).sort((a, b) => {
    const aModuleOrder = (a.modules as unknown as { sort_order: number })?.sort_order ?? 0;
    const bModuleOrder = (b.modules as unknown as { sort_order: number })?.sort_order ?? 0;
    if (aModuleOrder !== bModuleOrder) return aModuleOrder - bModuleOrder;
    return a.sort_order - b.sort_order;
  });

  const currentIndex = sortedVideos.findIndex((v) => v.id === videoId);
  const prevVideo = currentIndex > 0 ? sortedVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex < sortedVideos.length - 1 ? sortedVideos[currentIndex + 1] : null;

  const { data: progressRecord } = await supabase
    .from("progress")
    .select("id")
    .eq("user_id", user!.id)
    .eq("video_id", videoId)
    .single();

  const isCompleted = !!progressRecord;

  // Build download URLs via our API route (same-origin = download attribute works)
  const resourcesWithUrls = (
    video.resources as Array<{ id: string; title: string; file_path: string; file_type: string; file_size: number | null }> || []
  ).map((resource) => ({
    ...resource,
    downloadUrl: `/api/download?path=${encodeURIComponent(resource.file_path)}&name=${encodeURIComponent(`${resource.title}.${resource.file_type}`)}`,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
      <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-navy transition-colors">
            Formation
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-400">{(video.modules as unknown as { title: string })?.title}</span>
          <ChevronRight size={14} />
          <span className="text-navy font-medium truncate max-w-48">Vidéo {video.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {prevVideo && (
            <Link href={`/formation/${prevVideo.id}`} className="btn-ghost text-sm">
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Précédent</span>
            </Link>
          )}
          {nextVideo && (
            <Link href={`/formation/${nextVideo.id}`} className="btn-ghost text-sm">
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 lg:py-8">
        {/* Video player */}
        <div className="mb-6">
          <div
            className="relative w-full bg-black rounded-xl overflow-hidden shadow-lg"
            style={{ paddingBottom: "56.25%" }}
          >
            <iframe
              src={video.bunny_url}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-navy">
            Vidéo {video.title}
          </h1>
        </div>

        {/* Points clés */}
        {video.summary && (
          <div className="card-orange mb-6">
            <h2 className="font-display text-lg font-semibold mb-4 pb-2 border-b border-orange-100" style={{color:"#C0603A"}}>
              Points clés
            </h2>
            <div className="summary-content" dangerouslySetInnerHTML={{ __html: video.summary }} />
          </div>
        )}

        {/* Exercices */}
        {video.exercices && (
          <div className="card-orange mb-6">
            <h2 className="font-display text-lg font-semibold mb-4 pb-2 border-b border-orange-100" style={{color:"#C0603A"}}>
              Exercices
            </h2>
            <div className="summary-content" dangerouslySetInnerHTML={{ __html: video.exercices }} />
          </div>
        )}

        {/* Resources */}
        {resourcesWithUrls.length > 0 && (
          <div className="card-orange mb-6">
            <h2 className="font-display text-lg font-semibold mb-4 pb-2 border-b border-orange-100" style={{color:"#C0603A"}}>
              Ressources à télécharger
            </h2>
            <ul className="space-y-2">
              {resourcesWithUrls.map((resource) => (
                <li key={resource.id}>
                  {resource.downloadUrl ? (
                    <a
                      href={resource.downloadUrl}
                      download={`${resource.title}.${resource.file_type}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-navy hover:bg-[#f8f9fc] transition-all group"
                    >
                      <span className="text-2xl">{FILE_ICONS[resource.file_type] || "📎"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-navy truncate">
                          {resource.title}
                        </p>
                        <p className="text-xs text-gray-400 uppercase">
                          {resource.file_type}
                          {resource.file_size ? ` · ${(resource.file_size / 1024 / 1024).toFixed(1)} Mo` : ""}
                        </p>
                      </div>
                      <Download size={16} className="text-gray-400 group-hover:text-navy shrink-0" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 opacity-50 cursor-not-allowed">
                      <span className="text-2xl">{FILE_ICONS[resource.file_type] || "📎"}</span>
                      <p className="text-sm text-gray-500">{resource.title}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Complete button — no card border */}
        <div className="flex justify-center py-4">
          <CompleteButton videoId={video.id} isCompleted={isCompleted} nextVideoId={nextVideo?.id} />
        </div>
      </div>
    </div>
  );
}
