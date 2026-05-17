"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Video,
  X,
  Check,
  Loader2,
} from "lucide-react";
import type { Module, Video as VideoType } from "@/types";

interface ContentManagerProps {
  modules: Module[];
}

export default function ContentManager({ modules }: ContentManagerProps) {
  const router = useRouter();
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [addVideoFor, setAddVideoFor] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // New video form state
  const [newVideo, setNewVideo] = useState({
    title: "",
    bunny_url: "",
    summary: "",
  });

  function toggleModule(id: string) {
    setExpandedModules((p) => ({ ...p, [id]: !p[id] }));
  }

  async function handleAddVideo(moduleId: string) {
    if (!newVideo.title || !newVideo.bunny_url) return;
    setLoading(true);

    await fetch("/api/admin/content/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        module_id: moduleId,
        title: newVideo.title,
        bunny_url: newVideo.bunny_url,
        summary: newVideo.summary,
      }),
    });

    setNewVideo({ title: "", bunny_url: "", summary: "" });
    setAddVideoFor(null);
    setLoading(false);
    router.refresh();
  }

  async function handleDeleteVideo(videoId: string) {
    if (!confirm("Supprimer cette vidéo ? Cette action est irréversible.")) return;
    setLoading(true);

    await fetch(`/api/admin/content/videos/${videoId}`, {
      method: "DELETE",
    });

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {modules.map((module, index) => {
        const isOpen = expandedModules[module.id] ?? false;
        const videoCount = module.videos?.length || 0;

        return (
          <div key={module.id} className="card p-0 overflow-hidden">
            {/* Module header */}
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F5F5F5] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-navy text-white text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="text-left">
                  <h3 className="font-display font-semibold text-navy">{module.title}</h3>
                  <p className="text-xs text-gray-400">{videoCount} vidéo{videoCount > 1 ? "s" : ""}</p>
                </div>
              </div>
              {isOpen ? (
                <ChevronDown size={18} className="text-gray-400" />
              ) : (
                <ChevronRight size={18} className="text-gray-400" />
              )}
            </button>

            {isOpen && (
              <div className="border-t border-gray-100">
                {/* Video list */}
                {(module.videos || []).length === 0 && (
                  <p className="px-5 py-4 text-sm text-gray-400">Aucune vidéo dans ce module.</p>
                )}

                {(module.videos || []).map((video) => (
                  <div
                    key={video.id}
                    className="flex items-start gap-3 px-5 py-3 border-b border-gray-50 hover:bg-[#F9F9F9] group"
                  >
                    <Video size={16} className="text-gray-300 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{video.title}</p>
                      <p className="text-xs text-gray-400 truncate">{video.bunny_url}</p>
                      {(video.resources || []).length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <FileText size={11} className="text-gray-300" />
                          <span className="text-xs text-gray-400">
                            {video.resources!.length} ressource{video.resources!.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add video form */}
                {addVideoFor === module.id ? (
                  <div className="px-5 py-4 bg-[#F5F5F5] border-t border-gray-100">
                    <p className="text-sm font-semibold text-navy mb-3">Ajouter une vidéo</p>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Titre de la vidéo *"
                        value={newVideo.title}
                        onChange={(e) =>
                          setNewVideo((p) => ({ ...p, title: e.target.value }))
                        }
                        className="input text-sm py-2"
                      />
                      <input
                        type="url"
                        placeholder="URL Bunny Stream (embed) *"
                        value={newVideo.bunny_url}
                        onChange={(e) =>
                          setNewVideo((p) => ({ ...p, bunny_url: e.target.value }))
                        }
                        className="input text-sm py-2"
                      />
                      <textarea
                        placeholder="Résumé / points clés (optionnel)"
                        value={newVideo.summary}
                        onChange={(e) =>
                          setNewVideo((p) => ({ ...p, summary: e.target.value }))
                        }
                        className="input text-sm py-2 resize-none"
                        rows={3}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddVideo(module.id)}
                          disabled={loading || !newVideo.title || !newVideo.bunny_url}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          {loading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Ajouter
                        </button>
                        <button
                          onClick={() => {
                            setAddVideoFor(null);
                            setNewVideo({ title: "", bunny_url: "", summary: "" });
                          }}
                          className="btn-ghost text-sm py-2 px-3"
                        >
                          <X size={14} />
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-3 border-t border-gray-100">
                    <button
                      onClick={() => setAddVideoFor(module.id)}
                      className="flex items-center gap-2 text-sm text-navy hover:text-terracotta transition-colors font-medium"
                    >
                      <Plus size={16} />
                      Ajouter une vidéo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
