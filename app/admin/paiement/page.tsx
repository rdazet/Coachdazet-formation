import { createClient } from "@/lib/supabase/server";
import PaymentSelector from "./PaymentSelector";

const VIDEOS_ALLOWED: Record<number, string> = {
  0: "0",
  1: "5",
  2: "10",
  3: "Illimitées",
};

export default async function PaiementPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, status, tier")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  const { data: progressData } = await supabase
    .from("progress")
    .select("user_id, video_id");

  const videosByUser: Record<string, Set<string>> = {};
  (progressData || []).forEach(({ user_id, video_id }) => {
    if (!videosByUser[user_id]) videosByUser[user_id] = new Set();
    videosByUser[user_id].add(video_id);
  });

  const clientList = users || [];

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1B2B4A]">Paiements</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez manuellement le niveau d&apos;accès de chaque client après réception du paiement.
          </p>
        </div>
        <span className="text-sm text-gray-400">{clientList.length} client(s)</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F8F9FB]">
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nom</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Email</th>
              <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Paiement</th>
              <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Vidéos autorisées</th>
              <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Vidéos vues</th>
            </tr>
          </thead>
          <tbody>
            {clientList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  Aucun client pour le moment
                </td>
              </tr>
            ) : (
              clientList.map((user) => {
                const tier = user.tier ?? 0;
                const videosWatched = videosByUser[user.id]?.size ?? 0;
                const limit = tier === 0 ? 0 : tier === 1 ? 5 : tier === 2 ? 10 : Infinity;
                const atLimit = isFinite(limit) && videosWatched >= limit;

                return (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#1B2B4A]">
                      {user.full_name}
                      {user.status !== "approved" && (
                        <span className="ml-2 text-xs text-gray-400">({user.status})</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{user.email}</td>
                    <td className="px-5 py-3.5 text-center">
                      <PaymentSelector userId={user.id} currentTier={tier} />
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-[#1B2B4A]">
                      {VIDEOS_ALLOWED[tier] ?? "0"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`font-bold ${atLimit ? "text-[#C0603A]" : "text-[#1B2B4A]"}`}>
                        {videosWatched}
                      </span>
                      {atLimit && (
                        <div className="text-xs text-[#C0603A] mt-0.5">limite atteinte</div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
