import { createClient } from "@/lib/supabase/server";
import AutoResizeFrame from "@/components/iframe/AutoResizeFrame";

export default async function PlanSalairePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const fullName = profile?.full_name || "";
  const parts  = fullName.trim().split(/\s+/);
  const prenom = encodeURIComponent(parts[0] || "");
  const nom    = encodeURIComponent(parts.slice(1).join(" ") || "");

  const iframeSrc = `/plan-salaire/index.html?prenom=${prenom}&nom=${nom}`;

  return (
    <div className="flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-display text-xl font-semibold text-navy">Plan Salaire</h1>
        </div>
        <a href={iframeSrc} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-navy transition-colors">
          Ouvrir en plein écran ↗
        </a>
      </div>
      <AutoResizeFrame src={iframeSrc} title="Plan Salaire" />
    </div>
  );
}
