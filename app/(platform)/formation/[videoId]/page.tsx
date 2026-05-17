import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText, Download } from "lucide-react";
import CompleteButton from "@/components/video/CompleteButton";
import type { Module, Video } from "@/types";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get current video with resources
  const { data: video, error } = await supabase
    .from("videos")
    .select("*, resources(*), modules(title)")
    .eq("id", videoId)
    .single();

  if (error || !video) {
    notFound();
  }

  // Get all videos in order to find prev/next
  const { data: allVideos } = await supabase
    .from("videos")
    .select("id, title, module_id, sort_order, modules(sort_order)")
    .order("sort_order", { ascending: true });

  // Sort by module order then video order
  const sortedVideos = (allVideos || []).sort((a, b) => {
    const aModuleOrder = (a.modules as unknown as { sort_order: number })?.sort_order ?? 0;
    const bModuleOrder = (b.modules as unknown as { sort_order: number })?.sort_order ?? 0;
    if (aModuleOrder !== bModuleOrder) return aModuleOrder - bModuleOrder;
    return a.sort_order - b.sort_order;
  });

  const currentIndex = sortedVideos.findIndex((v) => v.id === videoId);
  const prevVideo = currentIndex > 0 ? sortedVideos[currentIndex - 1] : null;
  const nextVideo =
    currentIndex < sortedVideos.length - 1 ? sortedVideos[currentIndex + 1] : null;

  // Check if this video is completed by the user
  const { data: progressRecord } = await supabase
    .from("progress")
    .select("id")
    .eq("user_id", user!.id)
    .eq("video_id", videoId)
    .single();

  const isCompleted = !!progressRecord;

  // Get signed download URLs for resources
  const resourcesWithUrls = await Promise.all(
    (video.resources || []).map(async (resource) => {
      const { data } = await supabase.storage
        .from("resources")
        .createSignedUrl(resource.file_path, 60 * 60); // 1 hour
      return { ...resource, signedUrl: data?.signedUrl || null };
    })
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
      <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-10 lg:top-0">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-navy transition-colors">
            Formation
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-400">{(video.modules as unknown as { title: string })?.title}</span>
          <ChevronRight size={14} />
          <span className="text-navy font-medium truncate max-w-48">{video.title}</span>
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
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 lg:py-8">
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

        {/* Title and module */}
        <div className="mb-6">
          <p className="text-sm text-terracotta font-medium mb-1">
            {(video.modules as unknown as { title: string })?.title}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-navy">
            {video.title}
          </h1>
        </div>

        {/* Summary */}
        {video.summary && (
          <div className="card mb-6">
            <h2 className="font-display text-lg font-semibold text-navy mb-3">
              Points clés
            </h2>
            <div
              className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: video.summary }}
            />
          </div>
        )}

        {/* Resources */}
        {resourcesWithUrls.length > 0 && (
          <div className="card mb-6">
            <h2 className="font-display text-lg font-semibold text-navy mb-4">
              Ressources à télécharger
            </h2>
            <ul className="space-y-2">
              {resourcesWithUrls.map((resource) => (
                <li key={resource.id}>
                  {resource.signedUrl ? (
                    <a
                      href={resource.signedUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-navy hover:bg-navy-50 transition-all group"
                    >
                      <span className="text-2xl">
                        {FILE_ICONS[resource.file_type] || "📎"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-navy truncate">
                          {resource.title}
                        </p>
                        <p className="text-xs text-gray-400 uppercase">
                          {resource.file_type}
                          {resource.file_size
                            ? ` · ${(resource.file_size / 1024 / 1024).toFixed(1)} Mo`
                            : ""}
                        </p>
                      </div>
                      <Download
                        size={16}
                        className="text-gray-400 group-hover:text-navy shrink-0"
                      />
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

        {/* Complete button */}
        <div className="card">
          <CompleteButton
            videoId={video.id}
            isCompleted={isCompleted}
            nextVideoId={nextVideo?.id}
          />
        </div>
      </div>
    </div>
  );
}
