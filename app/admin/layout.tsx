import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, BookOpen, LogOut, LayoutDashboard, ClipboardList, FlaskConical, Database, BarChart2 } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-navy flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/admin">
            <span className="font-display text-xl font-semibold text-white">Coachdazet</span>
            <span className="font-serif italic text-terracotta text-base ml-1">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <LayoutDashboard size={18} />
            Tableau de bord
          </Link>
          <Link
            href="/admin/utilisateurs"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <Users size={18} />
            Utilisateurs
          </Link>
          <Link
            href="/admin/contenu"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <BookOpen size={18} />
            Contenu
          </Link>
          <Link
            href="/admin/questionnaires"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <ClipboardList size={18} />
            Questionnaires
          </Link>
          <Link
            href="/admin/clients"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <FlaskConical size={18} />
            Test clients
          </Link>

          <div className="mt-3 mb-1 px-1">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Bilan</span>
          </div>
          <Link
            href="/bilan/donnees"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <Database size={18} />
            Vos données
          </Link>
          <Link
            href="/bilan/resultat"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <BarChart2 size={18} />
            Bilan patrimonial
          </Link>
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/70 truncate">{profile.full_name}</p>
            <form action="/api/auth/signout" method="POST">
              <button className="text-white/50 hover:text-white transition-colors ml-2">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
