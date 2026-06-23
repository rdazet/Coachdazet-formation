import { createClient } from "@/lib/supabase/server";

export default async function PlanBoursePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const fullName = profile?.full_name || "";
  const parts = fullName.trim().split(/\s+/);
  const prenom = encodeURIComponent(parts[0] || "");
  const nom    = encodeURIComponent(parts.slice(1).join(" ") || "");

  const iframeSrc = `/plan-bourse/index.html?prenom=${prenom}&nom=${nom}`;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-display text-xl font-semibold text-navy">Plan Bourse</h1>
          <p className="text-sm text-gray-500 mt-0.5">Mesurez vos progrès et définissez votre stratégie d&apos;investissement</p>
        </div>
        <a
          href={iframeSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-navy transition-colors"
        >
          Ouvrir en plein écran ↗
        </a>
      </div>
      <iframe
        src={iframeSrc}
        className="flex-1 w-full border-0"
        style={{ minHeight: "calc(100vh - 8rem)" }}
        title="Plan Bourse"
      />
    </div>
  );
}
