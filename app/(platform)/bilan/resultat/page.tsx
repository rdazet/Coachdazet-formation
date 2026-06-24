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
    <div className="flex flex-col overflow-hidden h-[calc(100vh-3.5rem)] lg:h-screen">
      <iframe
        src={iframeSrc}
        className="flex-1 w-full border-0"
        title="Bilan Patrimonial — Résultats"
      />
    </div>
  );
}
