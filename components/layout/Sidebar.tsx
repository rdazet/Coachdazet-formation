"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CheckCircle, Circle, ChevronDown, ChevronRight, BookOpen, LogOut, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Module } from "@/types";
import clsx from "clsx";

interface SidebarProps {
  modules: Module[];
  completedVideoIds: string[];
  totalVideos: number;
  currentVideoId?: string;
  profileName: string;
}

export default function Sidebar({
  modules,
  completedVideoIds,
  totalVideos,
  currentVideoId,
  profileName,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Derive currentVideoId from URL if not passed
  const videoIdFromUrl = pathname.startsWith("/formation/")
    ? pathname.split("/formation/")[1]
    : null;
  const activeVideoId = currentVideoId || videoIdFromUrl || null;

  // Flatten and sort all videos alphabetically for prev/next navigation
  const allVideos = modules
    .flatMap((mod) => mod.videos || [])
    .sort((a, b) => a.title.localeCompare(b.title, "fr"));

  const currentIndex = activeVideoId
    ? allVideos.findIndex((v) => v.id === activeVideoId)
    : -1;
  const prevVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
  const nextVideo =
    currentIndex >= 0 && currentIndex < allVideos.length - 1
      ? allVideos[currentIndex + 1]
      : null;

  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    modules.forEach((mod) => {
      const hasCurrentVideo = mod.videos?.some((v) => v.id === activeVideoId);
      if (hasCurrentVideo) initial[mod.id] = true;
    });
    return initial;
  });

  const progressPercent =
    totalVideos > 0 ? Math.round((completedVideoIds.length / totalVideos) * 100) : 0;

  function toggleModule(moduleId: string) {
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/connexion");
  }

  return (
    <aside className="sidebar w-72 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="bg-navy px-6 py-4">
        <Link href="/dashboard" className="block">
          <Image
            src="/logo-coachdazet.png"
            alt="Coachdazet Formation"
            width={200}
            height={39}
            priority
            className="h-10 w-auto"
          />
        </Link>
      </div>

      {/* Progress */}
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Progression</span>
          <span className="text-sm font-semibold text-navy">{progressPercent}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {completedVideoIds.length} / {totalVideos} vidéos complétées
        </p>
      </div>

      {/* Prev / Next — only on video pages */}
      {activeVideoId && (
        <div className="px-4 py-3 border-b border-gray-200 flex gap-2">
          {prevVideo ? (
            <Link
              href={`/formation/${prevVideo.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-navy hover:text-navy transition-colors"
            >
              <ChevronLeft size={15} />
              Précédent
            </Link>
          ) : (
            <span className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-100 text-sm font-medium text-gray-300 cursor-not-allowed">
              <ChevronLeft size={15} />
              Précédent
            </span>
          )}
          {nextVideo ? (
            <Link
              href={`/formation/${nextVideo.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-navy hover:text-navy transition-colors"
            >
              Suivant
              <ChevronRight size={15} />
            </Link>
          ) : (
            <span className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-100 text-sm font-medium text-gray-300 cursor-not-allowed">
              Suivant
              <ChevronRight size={15} />
            </span>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <Link
          href="/dashboard"
          className={clsx(
            "flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium transition-colors",
            pathname === "/dashboard"
              ? "text-navy bg-white border-l-2 border-navy"
              : "text-gray-600 hover:text-navy hover:bg-white/50"
          )}
        >
          <BookOpen size={16} />
          Vue d&apos;ensemble
        </Link>

        <div className="mt-3 mb-1 px-5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Modules</span>
        </div>

        {modules.map((module, index) => {
          const moduleVideos = module.videos || [];
          const completedInModule = moduleVideos.filter((v) =>
            completedVideoIds.includes(v.id)
          ).length;
          const isOpen = openModules[module.id] ?? false;

          return (
            <div key={module.id}>
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-white/60 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-left leading-tight">{module.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">
                    {completedInModule}/{moduleVideos.length}
                  </span>
                  {isOpen ? (
                    <ChevronDown size={14} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={14} className="text-gray-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <ul className="bg-white/40">
                  {index === 0 && (
                    <>
                      <li>
                        <Link
                          href="/bilan/donnees"
                          className={clsx(
                            "flex items-center gap-2.5 px-5 py-2 pl-12 text-sm transition-colors",
                            pathname === "/bilan/donnees"
                              ? "text-navy font-semibold bg-white border-l-2 border-terracotta"
                              : "text-gray-600 hover:text-navy hover:bg-white/70"
                          )}
                        >
                          <Circle size={14} className="text-gray-300 shrink-0" />
                          <span className="leading-tight">Vos données</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/bilan/resultat"
                          className={clsx(
                            "flex items-center gap-2.5 px-5 py-2 pl-12 text-sm transition-colors",
                            pathname === "/bilan/resultat"
                              ? "text-navy font-semibold bg-white border-l-2 border-terracotta"
                              : "text-gray-600 hover:text-navy hover:bg-white/70"
                          )}
                        >
                          <Circle size={14} className="text-gray-300 shrink-0" />
                          <span className="leading-tight">Bilan patrimonial</span>
                        </Link>
                      </li>
                    </>
                  )}
                  {moduleVideos.map((video) => {
                    const isCompleted = completedVideoIds.includes(video.id);
                    const isCurrent = video.id === activeVideoId;

                    return (
                      <li key={video.id}>
                        <Link
                          href={`/formation/${video.id}`}
                          className={clsx(
                            "flex items-center gap-2.5 px-5 py-2 pl-12 text-sm transition-colors",
                            isCurrent
                              ? "text-navy font-semibold bg-white border-l-2 border-terracotta"
                              : "text-gray-600 hover:text-navy hover:bg-white/70"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle size={14} className="text-terracotta shrink-0" />
                          ) : (
                            <Circle size={14} className="text-gray-300 shrink-0" />
                          )}
                          <span className="leading-tight">{video.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-navy truncate">{profileName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-navy transition-colors ml-3 shrink-0"
            title="Se déconnecter"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
