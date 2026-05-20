import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CompleteButton from "@/components/video/CompleteButton";
import ResourceLink from "@/components/video/ResourceLink";

interface Props {
  params: Promise<{ videoId: string }>;
}

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

  const resources = (video.resources as Array<{ id: string; title: string; file_path: string; file_type: string; file_size: number | null }> || []);

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
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-6 lg:py-8">
        {/* Title */}
        <div className="mb-4">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-navy">
            Vidéo {video.title}
          </h1>
        </div>

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

        {/* Points clés */}
        {video.summary && (
          <div className="mb-6" style={{background:"white",borderRadius:"12px",padding:"24px",boxShadow:"0 1px 2px rgba(0,0,0,0.05)",borderTop:"1px solid #C0603A",borderRight:"1px solid #C0603A",borderBottom:"1px solid #C0603A",borderLeft:"4px solid #C0603A"}}>
            <h2 className="font-display text-lg font-semibold mb-4 pb-2 border-b border-orange-100" style={{color:"#C0603A"}}>
              Points clés
            </h2>
            <div className="summary-content" dangerouslySetInnerHTML={{ __html: video.summary }} />
          </div>
        )}

        {/* Exercices */}
        {video.exercices && (
          <div className="mb-6" style={{background:"white",borderRadius:"12px",padding:"24px",boxShadow:"0 1px 2px rgba(0,0,0,0.05)",borderTop:"1px solid #C0603A",borderRight:"1px solid #C0603A",borderBottom:"1px solid #C0603A",borderLeft:"4px solid #C0603A"}}>
            <h2 className="font-display text-lg font-semibold mb-4 pb-2 border-b border-orange-100" style={{color:"#C0603A"}}>
              Exercices
            </h2>
            <div className="summary-content" dangerouslySetInnerHTML={{ __html: video.exercices }} />
          </div>
        )}

        {/* Resources */}
        {resources.length > 0 && (
          <div className="mb-6" style={{background:"white",borderRadius:"12px",padding:"24px",boxShadow:"0 1px 2px rgba(0,0,0,0.05)",borderTop:"1px solid #C0603A",borderRight:"1px solid #C0603A",borderBottom:"1px solid #C0603A",borderLeft:"4px solid #C0603A"}}>
            <h2 className="font-display text-lg font-semibold mb-4 pb-2 border-b border-orange-100" style={{color:"#C0603A"}}>
              Ressources à télécharger
            </h2>
            <ul className="space-y-2">
              {resources.map((resource) => (
                <li key={resource.id}>
                  <ResourceLink
                    resourceId={resource.id}
                    title={resource.title}
                    fileType={resource.file_type}
                    fileSize={resource.file_size}
                  />
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
