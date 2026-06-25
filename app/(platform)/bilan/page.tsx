import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "rdazet@hotmail.com";

export default async function BilanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isAdmin = user?.email === ADMIN_EMAIL;
  const iframeSrc = isAdmin ? "/bilan/index.html?admin=1" : "/bilan/index.html";

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-display text-xl font-semibold text-navy">Calculateur de Patrimoine</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bilan patrimonial complet — Coach Dazet</p>
        </div>
        <a
          href="/bilan/index.html"
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
        title="Calculateur de Patrimoine"
      />
    </div>
  );
}
