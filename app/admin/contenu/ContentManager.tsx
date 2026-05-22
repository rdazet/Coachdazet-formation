"use client";

import { useRef, useState } from "react";
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
  Upload,
  Save,
  Bold,
} from "lucide-react";
import type { Module, Video as VideoType, Resource } from "@/types";

interface ContentManagerProps {
  modules: Module[];
}

// Convert plain text to HTML paragraphs, with **bold** support
function textToHtml(text: string): string {
  if (!text.trim()) return "";
  // If already wrapped in <p>, return as-is (already processed)
  if (/^\s*<p[\s>]/i.test(text.trim())) return text;
  return text
    .split(/\n\n+/)
    .map((para) => {
      const line = para
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      return `<p>${line}</p>`;
    })
    .join("");
}

// Convert stored HTML back to plain readable text for textarea
function htmlToText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<[^>]+>/g, "")
    .trim();
}

const FILE_ICONS: Record<string, string> = { pdf: "📄", pptx: "📊", xlsx: "📈" };


export default function ContentManager({ modules }: ContentManagerProps) {
  const router = useRouter();
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [addVideoFor, setAddVideoFor] = useState<string | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);

  // New video form
  const [newVideo, setNewVideo] = useState({ title: "", bunny_url: "", summary: "", exercices: "" });

  // Edit video form
  const [editForm, setEditForm] = useState({ title: "", bunny_url: "", summary: "", exercices: "" });

  // New resource form
  const [newResource, setNewResource] = useState<{ title: string; file: File | null }>({
    title: "",
    file: null,
  });

  // Refs for bold button
  const editSummaryRef = useRef<HTMLTextAreaElement>(null);
  const editExercicesRef = useRef<HTMLTextAreaElement>(null);
  const newSummaryRef = useRef<HTMLTextAreaElement>(null);
  const newExercicesRef = useRef<HTMLTextAreaElement>(null);

  function applyBold(
    ref: React.RefObject<HTMLTextAreaElement | null>,
    getValue: () => string,
    setValue: (v: string) => void
  ) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = getValue();
    const newVal = val.slice(0, start) + "**" + val.slice(start, end) + "**" + val.slice(end);
    setValue(newVal);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + 2, end + 2); }, 0);
  }

  function toggleModule(id: string) {
    setExpandedModules((p) => ({ ...p, [id]: !p[id] }));
  }

  function openEditVideo(video: VideoType) {
    if (editingVideoId === video.id) {
      setEditingVideoId(null);
      return;
    }
    setEditingVideoId(video.id);
    setEditForm({
      title: video.title,
      bunny_url: video.bunny_url,
      summary: htmlToText(video.summary || ""),
      exercices: htmlToText(video.exercices || ""),
    });
    setNewResource({ title: "", file: null });
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
        summary: textToHtml(newVideo.summary),
        exercices: textToHtml(newVideo.exercices),
      }),
    });
    setNewVideo({ title: "", bunny_url: "", summary: "", exercices: "" });
    setAddVideoFor(null);
    setLoading(false);
    router.refresh();
  }

  async function handleSaveVideo(videoId: string) {
    setLoading(true);
    await fetch(`/api/admin/content/videos/${videoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title,
        bunny_url: editForm.bunny_url,
        summary: textToHtml(editForm.summary),
        exercices: textToHtml(editForm.exercices),
      }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDeleteVideo(videoId: string) {
    if (!confirm("Supprimer cette vidéo ? Cette action est irréversible.")) return;
    setLoading(true);
    await fetch(`/api/admin/content/videos/${videoId}`, { method: "DELETE" });
    setEditingVideoId(null);
    setLoading(false);
    router.refresh();
  }

  async function handleUploadResource(videoId: string) {
    if (!newResource.file || !newResource.title) return;
    setUploadingResource(true);
    const fd = new FormData();
    fd.append("file", newResource.file);
    fd.append("title", newResource.title);
    const res = await fetch(`/api/admin/content/videos/${videoId}/resources`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const { error } = await res.json();
      alert(`Erreur upload : ${error}`);
    }
    setNewResource({ title: "", file: null });
    setUploadingResource(false);
    router.refresh();
  }

  async function handleDeleteResource(resourceId: string) {
    if (!confirm("Supprimer cette ressource ?")) return;
    await fetch(`/api/admin/content/resources/${resourceId}`, { method: "DELETE" });
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
              {isOpen ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
            </button>

            {isOpen && (
              <div className="border-t border-gray-100">
                {(module.videos || []).length === 0 && (
                  <p className="px-5 py-4 text-sm text-gray-400">Aucune vidéo dans ce module.</p>
                )}

                {(module.videos || []).map((video) => (
                  <div key={video.id} className="border-b border-gray-50">
                    {/* Video row */}
                    <div
                      className="flex items-start gap-3 px-5 py-3 hover:bg-[#F9F9F9] group cursor-pointer"
                      onClick={() => openEditVideo(video)}
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
                      <div className="flex items-center gap-1 shrink-0">
                        <Pencil size={13} className={`transition-colors ${editingVideoId === video.id ? "text-navy" : "text-gray-300 group-hover:text-gray-400"}`} />
                      </div>
                    </div>

                    {/* Edit panel */}
                    {editingVideoId === video.id && (
                      <div className="px-5 py-5 bg-[#F8F9FC] border-t border-gray-100 space-y-5">
                        {/* === VIDEO INFO === */}
                        <div>
                          <p className="text-xs font-semibold text-navy uppercase tracking-wider mb-3">Informations de la vidéo</p>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Titre *"
                              value={editForm.title}
                              onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                              className="input text-sm py-2"
                            />
                            <input
                              type="url"
                              placeholder="URL Bunny Stream *"
                              value={editForm.bunny_url}
                              onChange={(e) => setEditForm((p) => ({ ...p, bunny_url: e.target.value }))}
                              className="input text-sm py-2"
                            />

                            {/* Points clés */}
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Points clés <span className="text-gray-400">(affiché sous la vidéo)</span>
                              </label>
                              <div className="flex gap-1 mb-1">
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); applyBold(editSummaryRef, () => editForm.summary, (v) => setEditForm((p) => ({ ...p, summary: v }))); }} className="flex items-center justify-center w-7 h-7 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100 text-gray-700" title="Gras (**texte**)"><Bold size={13} /></button>
                              </div>
                              <textarea
                                ref={editSummaryRef}
                                placeholder={"Résumé des points clés...\n\nHTML supporté : <strong>gras</strong>, <u>souligné</u>"}
                                value={editForm.summary}
                                onChange={(e) => setEditForm((p) => ({ ...p, summary: e.target.value }))}
                                className="input text-sm py-2 resize-none w-full"
                                rows={24}
                              />
                            </div>

                            {/* Exercices */}
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Exercices <span className="text-gray-400">(affiché sous les points clés)</span>
                              </label>
                              <div className="flex gap-1 mb-1">
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); applyBold(editExercicesRef, () => editForm.exercices, (v) => setEditForm((p) => ({ ...p, exercices: v }))); }} className="flex items-center justify-center w-7 h-7 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100 text-gray-700" title="Gras (**texte**)"><Bold size={13} /></button>
                              </div>
                              <textarea
                                ref={editExercicesRef}
                                placeholder={"Exercices pratiques...\n\nEx : <ul><li>Exercice 1</li><li>Exercice 2</li></ul>"}
                                value={editForm.exercices}
                                onChange={(e) => setEditForm((p) => ({ ...p, exercices: e.target.value }))}
                                className="input text-sm py-2 resize-none w-full"
                                rows={20}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveVideo(video.id)}
                                disabled={loading}
                                className="btn-primary text-sm py-2 px-4"
                              >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Enregistrer
                              </button>
                              <button
                                onClick={() => handleDeleteVideo(video.id)}
                                disabled={loading}
                                className="btn-ghost text-sm py-2 px-3 text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                                Supprimer la vidéo
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* === RESOURCES === */}
                        <div className="border-t border-gray-200 pt-5">
                          <p className="text-xs font-semibold text-navy uppercase tracking-wider mb-3">Ressources téléchargeables</p>

                          {/* Existing resources */}
                          {(video.resources || []).length > 0 ? (
                            <ul className="space-y-2 mb-4">
                              {(video.resources || []).map((resource: Resource) => (
                                <li key={resource.id} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-200">
                                  <span className="text-lg">{FILE_ICONS[resource.file_type] || "📎"}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{resource.title}</p>
                                    <p className="text-xs text-gray-400 uppercase">
                                      {resource.file_type}
                                      {resource.file_size ? ` · ${(resource.file_size / 1024 / 1024).toFixed(1)} Mo` : ""}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteResource(resource.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-400 mb-4">Aucune ressource pour l'instant.</p>
                          )}

                          {/* Upload new resource */}
                          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-4 space-y-3">
                            <p className="text-xs font-medium text-gray-600">Ajouter un fichier (PDF, PowerPoint, Excel)</p>
                            <input
                              type="text"
                              placeholder="Nom de la ressource *"
                              value={newResource.title}
                              onChange={(e) => setNewResource((p) => ({ ...p, title: e.target.value }))}
                              className="input text-sm py-2"
                            />
                            <input
                              type="file"
                              accept=".pdf,.pptx,.xlsx,.ppt,.xls"
                              onChange={(e) =>
                                setNewResource((p) => ({
                                  ...p,
                                  file: e.target.files?.[0] || null,
                                  title: p.title || e.target.files?.[0]?.name.replace(/\.[^.]+$/, "") || "",
                                }))
                              }
                              className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-navy file:text-white file:text-xs file:cursor-pointer"
                            />
                            {newResource.file && (
                              <p className="text-xs text-gray-500">
                                📎 {newResource.file.name} ({(newResource.file.size / 1024 / 1024).toFixed(1)} Mo)
                              </p>
                            )}
                            <button
                              onClick={() => handleUploadResource(video.id)}
                              disabled={uploadingResource || !newResource.file || !newResource.title}
                              className="btn-primary text-sm py-2 px-4"
                            >
                              {uploadingResource ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                              Uploader
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
                        onChange={(e) => setNewVideo((p) => ({ ...p, title: e.target.value }))}
                        className="input text-sm py-2"
                      />
                      <input
                        type="url"
                        placeholder="URL Bunny Stream (embed) *"
                        value={newVideo.bunny_url}
                        onChange={(e) => setNewVideo((p) => ({ ...p, bunny_url: e.target.value }))}
                        className="input text-sm py-2"
                      />
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Points clés</label>
                        <div className="flex gap-1 mb-1">
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); applyBold(newSummaryRef, () => newVideo.summary, (v) => setNewVideo((p) => ({ ...p, summary: v }))); }} className="flex items-center justify-center w-7 h-7 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100 text-gray-700" title="Gras (**texte**)"><Bold size={13} /></button>
                        </div>
                        <textarea
                          ref={newSummaryRef}
                          placeholder="Résumé / points clés (optionnel)"
                          value={newVideo.summary}
                          onChange={(e) => setNewVideo((p) => ({ ...p, summary: e.target.value }))}
                          className="input text-sm py-2 resize-none"
                          rows={12}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Exercices</label>
                        <div className="flex gap-1 mb-1">
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); applyBold(newExercicesRef, () => newVideo.exercices, (v) => setNewVideo((p) => ({ ...p, exercices: v }))); }} className="flex items-center justify-center w-7 h-7 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100 text-gray-700" title="Gras (**texte**)"><Bold size={13} /></button>
                        </div>
                        <textarea
                          ref={newExercicesRef}
                          placeholder="Exercices pratiques (optionnel)"
                          value={newVideo.exercices}
                          onChange={(e) => setNewVideo((p) => ({ ...p, exercices: e.target.value }))}
                          className="input text-sm py-2 resize-none"
                          rows={12}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddVideo(module.id)}
                          disabled={loading || !newVideo.title || !newVideo.bunny_url}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          Ajouter
                        </button>
                        <button
                          onClick={() => { setAddVideoFor(null); setNewVideo({ title: "", bunny_url: "", summary: "", exercices: "" }); }}
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
