import { createClient, createAdminClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import CompleteButton from "@/components/video/CompleteButton";
import ResourceLink from "@/components/video/ResourceLink";

interface Props {
  params: Promise<{ videoId: string }>;
}

// Payment level limits (max unique videos the user may watch)
const PAYMENT_LIMITS: Record<number, number> = {
  0: 0,   // no access
  1: 5,   // first payment — up to 5 videos
  2: 10,  // second payment — up to 10 videos
  3: Infinity, // full access
};

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

  // --- Payment access check ---
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, role")
    .eq("id", user!.id)
    .single();

  const paymentLevel: number = profile?.tier ?? 0;
  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    const limit = PAYMENT_LIMITS[paymentLevel] ?? 0;

    // Fetch all watched video IDs for this user
    const { data: progressRows } = await supabase
      .from("progress")
      .select("video_id")
      .eq("user_id", user!.id);

    const watchedIds = new Set((progressRows || []).map((p) => p.video_id));
    const alreadyWatched = watchedIds.has(videoId);

    // If already watched: always allow re-watch (unless payment=0)
    // If not watched: check against the limit
    if (paymentLevel === 0) {
      redirect("/formation/paiement-requis?niveau=0");
    } else if (!alreadyWatched && watchedIds.size >= limit) {
      redirect(`/formation/paiement-requis?niveau=${paymentLevel}`);
    }
  }

  // Fetch resources
  const { data: videoResources } = await adminClient
    .from("resources")
    .select("id, title, file_path, file_type, file_size")
    .eq("video_id", videoId);

  const { data: allVideos } = await adminClient
    .from("videos")
    .select("id, title")
    .order("title", { ascending: true });

  const sortedVideos = (allVideos || []).sort((a, b) =>
    a.title.localeCompare(b.title, "fr", { numeric: true })
  );

  const currentIndex = sortedVideos.findIndex((v) => v.id === videoId);
  const nextVideo =
    currentIndex >= 0 && currentIndex < sortedVideos.length - 1
      ? sortedVideos[currentIndex + 1]
      : null;

  // Vidéos qui redirigent vers un plan plutôt que la vidéo suivante
  const PLAN_REDIRECTS: Record<number, { path: string; label: string }> = {
    2:  { path: "/plan-epargne", label: "Aller au Plan Épargne →" },
    6:  { path: "/plan-immo",    label: "Aller au Plan Immobilier →" },
    12: { path: "/plan-bourse",  label: "Aller au Plan Bourse →" },
    15: { path: "/plan-budget",  label: "Aller au Plan Budget →" },
    17: { path: "/plan-salaire", label: "Aller au Plan Salaire →" },
  };

  const videoPosition = currentIndex + 1;
  const planRedirect = PLAN_REDIRECTS[videoPosition];

  const nextPath  = planRedirect?.path  ?? (nextVideo ? `/formation/${nextVideo.id}` : undefined);
  const nextLabel = planRedirect?.label ?? "Vidéo suivante →";

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
          <CompleteButton videoId={video.id} isCompleted={isCompleted} nextPath={nextPath} nextLabel={nextLabel} />
        </div>
      </div>
    </div>
  );
}
