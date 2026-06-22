import { createClient, createAdminClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import CompleteButton from "@/components/video/CompleteButton";
import ResourceLink from "@/components/video/ResourceLink";

interface Props {
  params: Promise<{ videoId: string }>;
}

// Tier required per module sort_order
function getTierRequired(moduleSortOrder: number): number {
  if (moduleSortOrder <= 2) return 1; // Modules 1-2 (Stratégie, Immobilier)
  if (moduleSortOrder <= 4) return 2; // Modules 3-4 (Bourse, Budget)
  return 3;                            // Module 5 (Salaire)
}

function getQuestionnairePath(moduleSortOrder: number): string {
  if (moduleSortOrder <= 2) return "/formation/questionnaire/immobilier";
  if (moduleSortOrder <= 4) return "/formation/questionnaire/bourse";
  return "/formation/questionnaire/salaire";
}

export default async function VideoPage({ params }: Props) {
  const { videoId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const adminClient = createAdminClient();
  const { data: video, error } = await adminClient
    .from("videos")
    .select("*, modules(title, sort_order)")
    .eq("id", videoId)
    .single();

  if (error || !video) notFound();

  // Check tier access
  const moduleSortOrder = (video.modules as { sort_order: number })?.sort_order ?? 1;
  const tierRequired = getTierRequired(moduleSortOrder);

  if (tierRequired > 1) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, role")
      .eq("id", user!.id)
      .single();

    const userTier = profile?.tier ?? 1;
    if (userTier < tierRequired && profile?.role !== "admin") {
      // Check if already submitted questionnaire (waiting approval)
      const { data: pendingSubmission } = await supabase
        .from("questionnaire_submissions")
        .select("id, status")
        .eq("user_id", user!.id)
        .eq("module_number", moduleSortOrder <= 4 ? 2 : 3)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pendingSubmission) {
        redirect("/formation/questionnaire/en-attente");
      }
      redirect(getQuestionnairePath(moduleSortOrder));
    }
  }

  // Fetch resources separately to bypass any RLS join issues
  const { data: videoResources } = await adminClient
    .from("resources")
    .select("id, title, file_path, file_type, file_size")
    .eq("video_id", videoId);

  const { data: allVideos } = await adminClient
    .from("videos")
    .select("id, title")
    .order("title", { ascending: true });

  const sortedVideos = (allVideos || []).sort((a, b) =>
    a.title.localeCompare(b.title, "fr")
  );

  const currentIndex = sortedVideos.findIndex((v) => v.id === videoId);
  const nextVideo =
    currentIndex >= 0 && currentIndex < sortedVideos.length - 1
      ? sortedVideos[currentIndex + 1]
      : null;

  const { data: progressRecord } = await supabase
    .from("progress")
    .select("id")
    .eq("user_id", user!.id)
    .eq("video_id", videoId)
    .single();

  const isCompleted = !!progressRecord;

  const resources = (videoResources || []) as Array<{
    id: string;
    title: string;
    file_path: string;
    file_type: string;
    file_size: number | null;
  }>;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-6 lg:py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-navy">
            Vidéo {video.title}
          </h1>
        </div>

        {/* Video player */}
        <div className="mb-10">
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

        {/* Complete button */}
        <div className="flex justify-center py-4">
          <CompleteButton videoId={video.id} isCompleted={isCompleted} nextVideoId={nextVideo?.id} />
        </div>
      </div>
    </div>
  );
}
