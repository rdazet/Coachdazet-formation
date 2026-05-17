import { createClient } from "@/lib/supabase/server";
import { Users, UserCheck, Clock, BookOpen } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Stats
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "client");

  const { count: pendingUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: approvedUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  const { count: totalVideos } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true });

  // Recent pending users
  const { data: pendingList } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  // Recent signups
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, status, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    {
      label: "Total clients",
      value: totalUsers || 0,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "En attente",
      value: pendingUsers || 0,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Approuvés",
      value: approvedUsers || 0,
      icon: UserCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Vidéos",
      value: totalVideos || 0,
      icon: BookOpen,
      color: "bg-terracotta/10 text-terracotta",
    },
  ];

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-2xl font-semibold text-navy mb-6">
        Tableau de bord
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending approvals */}
        <div className="card">
          <h2 className="font-display text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <Clock size={18} className="text-yellow-500" />
            Inscriptions en attente
          </h2>
          {(pendingList || []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucune inscription en attente</p>
          ) : (
            <ul className="space-y-3">
              {(pendingList || []).map((u) => (
                <li key={u.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{u.full_name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <a
                    href="/admin/utilisateurs"
                    className="text-xs text-navy hover:underline font-medium"
                  >
                    Gérer →
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent signups */}
        <div className="card">
          <h2 className="font-display text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <Users size={18} className="text-navy" />
            Derniers inscrits
          </h2>
          {(recentUsers || []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun client pour le moment</p>
          ) : (
            <ul className="space-y-3">
              {(recentUsers || []).map((u) => (
                <li key={u.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{u.full_name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <span
                    className={
                      u.status === "approved"
                        ? "badge-approved"
                        : u.status === "pending"
                        ? "badge-pending"
                        : "badge-disabled"
                    }
                  >
                    {u.status === "approved"
                      ? "Approuvé"
                      : u.status === "pending"
                      ? "En attente"
                      : u.status === "rejected"
                      ? "Refusé"
                      : "Désactivé"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
