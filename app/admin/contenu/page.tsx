import { createClient } from "@/lib/supabase/server";
import ContentManager from "./ContentManager";
import type { Module } from "@/types";

export default async function ContenuPage() {
  const supabase = await createClient();

  const { data: modules } = await supabase
    .from("modules")
    .select("*, videos(*, resources(*))")
    .order("sort_order", { ascending: true });

  // Sort videos alphabetically within each module (Supabase nested order is unreliable)
  const sortedModules = (modules || []).map((mod) => ({
    ...mod,
    videos: [...(mod.videos || [])].sort((a: { title: string }, b: { title: string }) =>
      a.title.localeCompare(b.title, "fr", { numeric: true })
    ),
  }));

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-navy">
          Gestion du contenu
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les modules, vidéos et ressources de la formation.
        </p>
      </div>
      <ContentManager modules={sortedModules as Module[]} />
    </div>
  );
}
