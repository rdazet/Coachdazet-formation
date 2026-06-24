import { createClient } from "@/lib/supabase/server";

export default async function BilanResultatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  const iframeSrc = `/bilan/resultat.html${isAdmin ? "?admin=1" : ""}`;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
      <iframe
        src={iframeSrc}
        className="flex-1 w-full border-0"
        style={{ minHeight: "calc(100vh - 4rem)" }}
        title="Bilan Patrimonial — Résultats"
      />
    </div>
  );
}
