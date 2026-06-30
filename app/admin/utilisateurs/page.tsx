import { createClient, createAdminClient } from "@/lib/supabase/server";
import UserActions from "./UserActions";

export default async function UtilisateursPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, status, role, tier, created_at, approved_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  // Fetch progress counts per user
  const { data: progressData } = await supabase
    .from("progress")
    .select("user_id");

  const progressByUser: Record<string, number> = {};
  (progressData || []).forEach((p) => {
    progressByUser[p.user_id] = (progressByUser[p.user_id] || 0) + 1;
  });

  const { count: totalVideos } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true });

  const statusLabel: Record<string, string> = {
    pending: "En attente",
    approved: "Approuvé",
    rejected: "Refusé",
    disabled: "Désactivé",
  };

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-navy">
          Utilisateurs
        </h1>
        <span className="text-sm text-gray-500">{(users || []).length} client(s)</span>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-[#F5F5F5]">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Nom</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Statut</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Progression</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Inscrit le</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Tier / Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    Aucun utilisateur pour le moment
                  </td>
                </tr>
              ) : (
                (users || []).map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-[#F5F5F5]/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-800">{user.full_name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={
                          user.status === "approved"
                            ? "badge-approved"
                            : user.status === "pending"
                            ? "badge-pending"
                            : user.status === "rejected"
                            ? "badge-rejected"
                            : "badge-disabled"
                        }
                      >
                        {statusLabel[user.status] || user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.status === "approved" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-terracotta rounded-full"
                              style={{
                                width: `${
                                  totalVideos
                                    ? Math.round(
                                        ((progressByUser[user.id] || 0) / totalVideos) * 100
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {progressByUser[user.id] || 0}/{totalVideos || 0}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <UserActions userId={user.id} currentStatus={user.status} currentTier={user.tier ?? 1} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
    
        </div>
      </div>
    </div>
  );
}
