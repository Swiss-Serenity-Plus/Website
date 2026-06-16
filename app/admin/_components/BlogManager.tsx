"use client";

// Gestion des articles de blog dans la zone d'apercu.
//   - Vue liste : tous les articles existants (statut, cover, edition).
//   - Vue editeur : creation / modification, design compact facon article.
//   - Apercu : fenetre rendant l'article tel qu'il sera publie.
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft, Plus, Eye, Save, X, Upload, Check, Pencil, Newspaper, Clock, Calendar,
  ChevronDown, Trash2, RefreshCw,
} from "lucide-react";
import ArticleEditor from "./ArticleEditor";
import { tiptapDocToHtml } from "../../lib/tiptapHtml";
import { uploadImageToR2 } from "../../lib/uploadImageClient";
import type { JSONContent } from "@tiptap/react";
import CategorySelect, { type CategoryItem } from "./CategorySelect";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import styles from "./BlogManager.module.css";

type ToastType = "success" | "error" | "partial";

interface Props {
  onClose: () => void;
  showToast: (message: string, type: ToastType) => void;
}

interface BlogPost {
  id: string;
  articleId: string;
  url: string;
  lastEdited: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverUrl: string;
  author: string;
  publishDate: string;
  readingMinutes: number | null;
  metaDescription: string;
  bodyJson: JSONContent | null;
  status: string;
}

const SITE_DOMAIN = "swiss-serenity-plus.ch";
const SEO_DESC_MIN = 120;
const SEO_DESC_MAX = 160;
const BLOG_TAGS = [
  "PME", "Entrepreneurs", "Particuliers", "Suisse romande",
  "Organisation", "Stratégie", "Discrétion",
] as const;
const DEFAULT_CATEGORIES = [
  "Conseils dirigeants", "Témoignages", "Actualités", "Ressources particuliers", "Autre",
];

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Brouillon": { bg: "rgba(245,158,11,0.12)", text: "#92400E", dot: "#F59E0B" },
  "À relire":  { bg: "rgba(59,130,246,0.12)", text: "#1E40AF", dot: "#3B82F6" },
  "Publié":    { bg: "rgba(90,122,79,0.14)",  text: "#3B5E32", dot: "#5A7A4F" },
  "Archivé":   { bg: "rgba(156,163,175,0.16)", text: "#4B5563", dot: "#9CA3AF" },
};
const STATUS_OPTIONS = ["Brouillon", "À relire", "Publié", "Archivé"];

function slugify(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
function fmtDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-CH", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
}
// Date du jour au format ISO (YYYY-MM-DD), calee sur le fuseau local.
function todayISO(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function docHasContent(doc: JSONContent | null | undefined): boolean {
  return !!doc && Array.isArray(doc.content) && doc.content.length > 0;
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS["Brouillon"];
  return (
    <span className={styles.statusBadge} style={{ background: s.bg, color: s.text }}>
      <span className={styles.statusDot} style={{ background: s.dot }} />
      {status}
    </span>
  );
}

// Tag de visibilite editable (style Notion) — adosse a la propriete "Statut".
function StatusTagSelect({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const s = STATUS_COLORS[value] ?? STATUS_COLORS["Brouillon"];
  return (
    <div className={styles.statusSelect} ref={rootRef}>
      <button
        type="button"
        className={styles.statusTrigger}
        style={{ background: s.bg, color: s.text }}
        onClick={() => { if (!disabled) setOpen((o) => !o); }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.statusDot} style={{ background: s.dot }} />
        {value}
        <ChevronDown size={13} className={open ? styles.statusChevronOpen : styles.statusChevron} />
      </button>
      {open && (
        <ul className={styles.statusMenu} role="listbox">
          {STATUS_OPTIONS.map((opt) => {
            const o = STATUS_COLORS[opt] ?? STATUS_COLORS["Brouillon"];
            return (
              <li
                key={opt}
                role="option"
                aria-selected={opt === value}
                className={styles.statusOption}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                <span className={styles.statusBadge} style={{ background: o.bg, color: o.text }}>
                  <span className={styles.statusDot} style={{ background: o.dot }} />{opt}
                </span>
                {opt === value && <Check size={14} className={styles.statusOptionCheck} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Empreinte des champs de l'editeur, pour detecter les modifications non enregistrees.
interface EditorFields {
  title: string; slug: string; excerpt: string; category: string; tags: string[];
  coverUrl: string; author: string; publishDate: string; readingMinutes: string;
  metaDesc: string; bodyDoc: JSONContent | null;
}
function editorSignature(v: EditorFields): string {
  return JSON.stringify([
    v.title, v.slug, v.excerpt, v.category, v.tags, v.coverUrl,
    v.author, v.publishDate, v.readingMinutes, v.metaDesc, v.bodyDoc,
  ]);
}

export default function BlogManager({ onClose, showToast }: Props) {
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Champs editeur
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>("Brouillon");
  const [editorKey, setEditorKey] = useState(0);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const initialSigRef = useRef("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<CategoryItem[]>(() =>
    DEFAULT_CATEGORIES.map((c) => ({ id: c, label: c, value: c }))
  );
  const [tags, setTags] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [savedCoverUrl, setSavedCoverUrl] = useState(""); // couverture deja enregistree dans Notion
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [coverDragOver, setCoverDragOver] = useState(false);
  const [author, setAuthor] = useState("Mireille Dayer");
  const [publishDate, setPublishDate] = useState("");
  const [dateMode, setDateMode] = useState<"today" | "custom">("custom");
  const [readingMinutes, setReadingMinutes] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [bodyDoc, setBodyDoc] = useState<JSONContent | null>(null);
  const [bodyLoading, setBodyLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blog-posts");
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Erreur ${res.status}`);
      }
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les articles.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement initial de la liste (fetch au montage).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Enrichit la liste des categories avec celles deja presentes sur les articles.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategories((prev) => {
      const known = new Set(prev.map((c) => c.value));
      const extra = posts
        .map((p) => p.category)
        .filter((c) => c && !known.has(c))
        .map((c) => ({ id: c, label: c, value: c }));
      return extra.length ? [...prev, ...extra] : prev;
    });
  }, [posts]);

  async function deletePost(post: BlogPost) {
    setDeleting(true);
    try {
      const params = new URLSearchParams({ id: post.id });
      if (post.coverUrl) params.set("coverUrl", post.coverUrl);
      const res = await fetch(`/api/blog-posts?${params}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Erreur ${res.status}`);
      }
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      showToast("Article supprimé", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur lors de la suppression", "error");
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  }

  function resetEditor() {
    setTitle(""); setSlug(""); setSlugTouched(false); setExcerpt(""); setCategory("");
    setTags([]); setCoverUrl(""); setSavedCoverUrl(""); setCoverError("");
    setAuthor("Mireille Dayer"); setPublishDate(""); setDateMode("custom");
    setReadingMinutes(""); setMetaDesc(""); setBodyDoc(null); setBodyLoading(false);
  }

  function openNew() {
    resetEditor();
    setEditingId(null);
    setEditingStatus("Brouillon");
    setConfirmLeave(false);
    initialSigRef.current = editorSignature({
      title: "", slug: "", excerpt: "", category: "", tags: [], coverUrl: "",
      author: "Mireille Dayer", publishDate: "", readingMinutes: "", metaDesc: "", bodyDoc: null,
    });
    setEditorKey((k) => k + 1);
    setMode("editor");
  }

  async function openEdit(p: BlogPost) {
    const base = {
      title: p.title, slug: p.slug, excerpt: p.excerpt, category: p.category, tags: p.tags,
      coverUrl: p.coverUrl, author: p.author || "Mireille Dayer", publishDate: p.publishDate,
      readingMinutes: p.readingMinutes ? String(p.readingMinutes) : "", metaDesc: p.metaDescription,
    };
    setEditingId(p.id);
    setEditingStatus(p.status || "Brouillon");
    setConfirmLeave(false);
    setTitle(p.title);
    setSlug(p.slug);
    setSlugTouched(true);
    setExcerpt(p.excerpt);
    setCategory(p.category);
    setTags(p.tags);
    setCoverUrl(p.coverUrl);
    setSavedCoverUrl(p.coverUrl);
    setCoverError("");
    setAuthor(p.author || "Mireille Dayer");
    setPublishDate(p.publishDate);
    setDateMode(p.publishDate && p.publishDate === todayISO() ? "today" : "custom");
    setReadingMinutes(p.readingMinutes ? String(p.readingMinutes) : "");
    setMetaDesc(p.metaDescription);

    const initialDoc = p.bodyJson ?? null;
    setBodyDoc(initialDoc);
    initialSigRef.current = editorSignature({ ...base, bodyDoc: initialDoc });
    setEditorKey((k) => k + 1);
    setMode("editor");

    // Si le JSON TipTap n'est pas stocke (article cree/modifie dans Notion),
    // on reconstruit le corps depuis les blocs de la page.
    if (!docHasContent(initialDoc)) {
      setBodyLoading(true);
      try {
        const res = await fetch(`/api/blog-posts/${encodeURIComponent(p.id)}/content`);
        if (res.ok) {
          const data = await res.json();
          if (docHasContent(data.doc)) {
            setBodyDoc(data.doc);
            initialSigRef.current = editorSignature({ ...base, bodyDoc: data.doc });
            setEditorKey((k) => k + 1);
          }
        }
      } catch { /* on garde l'editeur vide */ }
      finally { setBodyLoading(false); }
    }
  }

  // Retour a la liste : si des modifications sont en cours, on demande confirmation.
  function requestBackToList() {
    const current = editorSignature({
      title, slug, excerpt, category, tags, coverUrl, author, publishDate, readingMinutes, metaDesc, bodyDoc,
    });
    if (current !== initialSigRef.current) setConfirmLeave(true);
    else setMode("list");
  }

  // Quitter sans enregistrer : on oublie les modifications et on revient a la liste.
  function discardAndLeave() {
    if (sending) return;
    setConfirmLeave(false);
    setMode("list");
  }

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  // Supprime un fichier de couverture de R2 (best-effort, fire-and-forget).
  function deleteCoverFromR2(url: string) {
    if (!url) return;
    fetch(`/api/upload-image?url=${encodeURIComponent(url)}`, { method: "DELETE" }).catch(() => {});
  }

  async function uploadCover(file: File, replacingPrev?: string) {
    if (!file.type.startsWith("image/")) return;
    setCoverUrl("");
    setCoverError("");
    setCoverUploading(true);
    try {
      const url = await uploadImageToR2(file, "blog");
      setCoverUrl(url);
      // L'ancien fichier de cette session (non encore enregistre dans Notion) est
      // supprime de R2. La couverture deja enregistree sera nettoyee a la sauvegarde.
      if (replacingPrev && replacingPrev !== savedCoverUrl && replacingPrev !== url) {
        deleteCoverFromR2(replacingPrev);
      }
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setCoverUploading(false);
    }
  }

  // Retire la couverture : vide le champ (la propriete Notion est mise a null a la
  // sauvegarde, qui nettoie aussi le fichier R2 cote serveur). Un upload de session
  // non enregistre est supprime de R2 immediatement.
  function removeCover() {
    const prev = coverUrl;
    setCoverUrl("");
    setCoverError("");
    if (prev && prev !== savedCoverUrl) deleteCoverFromR2(prev);
  }

  async function save(status: string) {
    if (!title.trim() || sending) return;
    setConfirmLeave(false);
    setSending(status);
    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim(),
      category: category || undefined,
      tags,
      coverUrl: coverUrl.trim(),
      author: author.trim(),
      publishDate: publishDate || undefined,
      readingMinutes: readingMinutes ? Number(readingMinutes) : undefined,
      metaDescription: metaDesc.trim(),
      bodyJson: bodyDoc,
      status,
    };
    try {
      const url = editingId ? `/api/blog-posts?id=${encodeURIComponent(editingId)}` : "/api/blog-posts";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast(
          status === "Publié" ? "Article publié." : `Article enregistré · ${status}.`,
          "success"
        );
        await loadPosts();
        setMode("list");
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error ?? "Erreur lors de l'enregistrement", "error");
      }
    } catch {
      showToast("Erreur réseau, réessayez", "error");
    } finally {
      setSending(null);
    }
  }

  const descLen = metaDesc.length;
  const descOk = descLen >= SEO_DESC_MIN && descLen <= SEO_DESC_MAX;

  // ── VUE LISTE ──────────────────────────────────────────────────────────────
  if (mode === "list") {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onClose}>
            <ArrowLeft size={15} /> Retour à l&apos;aperçu
          </button>
          <div className={styles.titleWrap}>
            <Newspaper size={17} strokeWidth={1.6} />
            <p className={styles.title}>Mes articles de blog</p>
          </div>
          <button className={styles.primaryBtn} onClick={openNew}>
            <Plus size={15} /> Nouvel article
          </button>
        </div>

        <div className={styles.body}>
          {loading && posts.length === 0 && (
            <div className={styles.grid} aria-hidden>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skelCard}>
                  <div className={styles.skelCover} />
                  <div className={styles.skelBody}>
                    <div className={styles.skelLine} style={{ width: "38%", height: 14 }} />
                    <div className={styles.skelLine} style={{ width: "85%", height: 18 }} />
                    <div className={styles.skelLine} style={{ width: "95%" }} />
                    <div className={styles.skelLine} style={{ width: "70%" }} />
                    <div className={styles.skelFoot}>
                      <div className={styles.skelLine} style={{ width: "30%" }} />
                      <div className={styles.skelLine} style={{ width: "22%", height: 22 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && error && <p className={styles.errorText}>{error}</p>}
          {!loading && !error && posts.length === 0 && (
            <div className={styles.empty}>
              <Newspaper size={30} strokeWidth={1.3} />
              <p>Aucun article pour l&apos;instant.</p>
              <button className={styles.primaryBtn} onClick={openNew}>
                <Plus size={15} /> Créer le premier article
              </button>
            </div>
          )}

          {posts.length > 0 && (
            <div className={styles.grid}>
              {posts.map((p) => (
                <article key={p.id} className={styles.card}>
                  <div className={styles.cardCover}>
                    {p.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverUrl} alt="" className={styles.cardCoverImg} />
                    ) : (
                      <div className={styles.cardCoverEmpty}><Newspaper size={22} strokeWidth={1.3} /></div>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <StatusBadge status={p.status} />
                      {p.articleId && <span className={styles.cardId}>{p.articleId}</span>}
                      {p.category && <span className={styles.cardCat}>{p.category}</span>}
                    </div>
                    <h3 className={styles.cardTitle}>{p.title || "Sans titre"}</h3>
                    {p.excerpt && <p className={styles.cardExcerpt}>{p.excerpt}</p>}
                    <div className={styles.cardFoot}>
                      <span className={styles.cardMeta}>
                        {p.publishDate ? fmtDate(p.publishDate) : `Modifié ${fmtDate(p.lastEdited)}`}
                      </span>
                      <div className={styles.cardActions}>
                        {confirmDeleteId === p.id ? (
                          <>
                            <button
                              className={`${styles.cardActionBtn} ${styles.cardActionConfirm}`}
                              onClick={() => deletePost(p)}
                              disabled={deleting}
                            >
                              {deleting ? "…" : <><Check size={12} /> Confirmer</>}
                            </button>
                            <button
                              className={styles.cardActionBtn}
                              onClick={() => setConfirmDeleteId(null)}
                              disabled={deleting}
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className={`${styles.cardActionBtn} ${styles.cardActionDanger}`}
                              onClick={() => setConfirmDeleteId(p.id)}
                              aria-label="Supprimer l'article"
                            >
                              <Trash2 size={13} />
                            </button>
                            <button className={styles.cardEdit} onClick={() => openEdit(p)}>
                              <Pencil size={13} /> Modifier
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── VUE EDITEUR ────────────────────────────────────────────────────────────
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={requestBackToList}>
          <ArrowLeft size={15} /> Retour à la liste
        </button>
        <div className={styles.titleWrap}>
          <p className={styles.title}>{editingId ? "Modifier l'article" : "Nouvel article"}</p>
        </div>
        <div className={styles.headerActions}>
          <StatusTagSelect value={editingStatus} onChange={setEditingStatus} disabled={sending !== null} />
          <button className={styles.ghostBtn} onClick={() => setPreviewOpen(true)} disabled={!title.trim()}>
            <Eye size={15} /> Aperçu
          </button>
          <button className={styles.primaryBtn} onClick={() => save(editingStatus)} disabled={!title.trim() || sending !== null}>
            <Save size={15} /> {sending !== null ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.editor}>
          {/* Titre + URL unifies */}
          <div className={styles.docHead}>
            <input
              className={styles.titleInput}
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }}
              placeholder="Titre de l'article"
              maxLength={120}
            />
            <div className={styles.slugRow}>
              <span className={styles.slugDomain}>{SITE_DOMAIN}/blog/</span>
              <input
                className={styles.slugInput}
                value={slug}
                onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
                placeholder="votre-article"
                spellCheck={false}
                aria-label="Identifiant URL"
              />
            </div>
          </div>

          {/* Meta compacte sur deux colonnes */}
          <div className={styles.metaGrid}>
            <div className={styles.metaCol}>
              <label className={styles.fieldLabel}>Extrait</label>
              <textarea
                className={styles.textarea}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Résumé court affiché en prévisualisation."
                rows={3}
                maxLength={300}
              />
              <label className={styles.fieldLabel}>Catégorie</label>
              <CategorySelect
                categories={categories}
                onCategoriesChange={setCategories}
                value={category}
                onChange={setCategory}
              />
              <label className={styles.fieldLabel}>Tags</label>
              <div className={styles.pills}>
                {BLOG_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`${styles.pill} ${tags.includes(tag) ? styles.pillOn : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tags.includes(tag) && <Check size={11} />}{tag}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.metaCol}>
              <label className={styles.fieldLabel}>Image de couverture</label>
              <div
                className={`${styles.coverZone} ${coverDragOver ? styles.coverZoneOver : ""} ${coverUrl ? styles.coverZoneFilled : ""}`}
                onDragOver={(e) => { e.preventDefault(); setCoverDragOver(true); }}
                onDragLeave={() => setCoverDragOver(false)}
                onDrop={async (e) => {
                  e.preventDefault(); setCoverDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f?.type.startsWith("image/")) await uploadCover(f, coverUrl);
                }}
                role={coverUrl ? undefined : "button"}
                tabIndex={coverUrl ? undefined : 0}
                onClick={() => { if (!coverUrl && !coverUploading) coverInputRef.current?.click(); }}
                onKeyDown={(e) => { if (!coverUrl && (e.key === "Enter" || e.key === " ")) coverInputRef.current?.click(); }}
              >
                {coverUploading ? (
                  <span className={styles.coverHint}>Upload…</span>
                ) : coverUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverUrl} alt="Couverture" className={styles.coverImg} />
                    <div className={styles.coverActions}>
                      <button
                        type="button"
                        className={styles.coverActionBtn}
                        onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}
                      >
                        <RefreshCw size={14} /> Remplacer
                      </button>
                      <button
                        type="button"
                        className={`${styles.coverActionBtn} ${styles.coverActionDanger}`}
                        onClick={(e) => { e.stopPropagation(); removeCover(); }}
                      >
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  </>
                ) : (
                  <span className={styles.coverHint}><Upload size={16} /> Image carrée</span>
                )}
              </div>
              {coverError && <span className={styles.errorTextSm}>{coverError}</span>}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className={styles.fileHidden}
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadCover(f, coverUrl); e.target.value = ""; }}
              />

              <div className={styles.inlineFields}>
                <div className={styles.inlineField}>
                  <label className={styles.fieldLabel}>Auteur</label>
                  <input className={styles.input} value={author} onChange={(e) => setAuthor(e.target.value)} />
                </div>
                <div className={styles.inlineField}>
                  <label className={styles.fieldLabel}><Clock size={11} /> Lecture (min)</label>
                  <input className={styles.input} type="number" min={1} max={60}
                    value={readingMinutes} onChange={(e) => setReadingMinutes(e.target.value)} placeholder="5" />
                </div>
              </div>
              <label className={styles.fieldLabel}><Calendar size={11} /> Date de publication</label>
              <div className={styles.dateField}>
                <CustomSelect
                  name="dateMode"
                  size="sm"
                  options={[
                    { value: "today", label: "Aujourd'hui" },
                    { value: "custom", label: "Une date précise" },
                  ]}
                  value={dateMode}
                  onChange={(v) => {
                    setDateMode(v as "today" | "custom");
                    if (v === "today") setPublishDate(todayISO());
                  }}
                />
                {dateMode === "custom" ? (
                  <input className={styles.input} type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
                ) : (
                  <p className={styles.dateResolved}>{fmtDate(publishDate || todayISO())}</p>
                )}
              </div>
            </div>
          </div>

          {/* Corps */}
          <div className={styles.bodyField}>
            <label className={styles.fieldLabel}>
              Contenu de l&apos;article
              {bodyLoading && <span className={styles.bodyLoadingHint}>Chargement du contenu depuis Notion…</span>}
            </label>
            <ArticleEditor key={editorKey} initialContent={bodyDoc} onChange={setBodyDoc} />
          </div>

          {/* SEO compact */}
          <div className={styles.seoField}>
            <label className={styles.fieldLabel}>Méta description SEO</label>
            <textarea
              className={`${styles.textarea} ${descOk ? styles.okBorder : descLen > 0 ? styles.warnBorder : ""}`}
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              placeholder="Résumé pour Google (120–160 caractères)"
              rows={2}
              maxLength={200}
            />
            <span className={`${styles.counter} ${descOk ? styles.okText : descLen > SEO_DESC_MAX ? styles.warnText : ""}`}>
              {descLen}/{SEO_DESC_MAX} car.{descOk ? " — idéal" : descLen > SEO_DESC_MAX ? " — trop long" : descLen > 0 ? ` — encore ${SEO_DESC_MIN - descLen}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation : modifications non enregistrees */}
      {confirmLeave && (
        <div className={styles.confirmOverlay} onClick={(e) => { if (e.target === e.currentTarget && !sending) setConfirmLeave(false); }}>
          <div className={styles.confirmBox} role="dialog" aria-label="Modifications non enregistrées">
            <button
              className={styles.confirmClose}
              onClick={() => setConfirmLeave(false)}
              disabled={sending !== null}
              aria-label="Fermer et continuer l'édition"
            >
              <X size={18} />
            </button>
            <p className={styles.confirmTitle}>Modifications non enregistrées</p>
            <p className={styles.confirmText}>
              Vous avez des modifications en cours sur cet article. Souhaitez-vous les enregistrer avant de revenir à la liste&nbsp;?
            </p>
            {!title.trim() && (
              <p className={styles.confirmHint}>Un titre est requis pour pouvoir enregistrer.</p>
            )}
            <div className={styles.confirmActions}>
              <button className={styles.ghostBtn} onClick={discardAndLeave} disabled={sending !== null}>
                Quitter sans enregistrer
              </button>
              <button className={styles.primaryBtn} onClick={() => save(editingStatus)} disabled={sending !== null || !title.trim()}>
                {sending !== null ? "Enregistrement…" : "Enregistrer et quitter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apercu de l'article publie */}
      {previewOpen && (
        <div className={styles.previewOverlay} onClick={(e) => { if (e.target === e.currentTarget) setPreviewOpen(false); }}>
          <div className={styles.previewWindow} role="dialog" aria-label="Aperçu de l'article">
            <div className={styles.previewBar}>
              <span className={styles.previewBarLabel}>Aperçu — tel qu&apos;il sera publié</span>
              <button className={styles.previewClose} onClick={() => setPreviewOpen(false)} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <article className={styles.previewArticle}>
              {coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="" className={styles.previewCover} />
              )}
              {category && <p className={styles.previewCat}>{category}</p>}
              <h1 className={styles.previewTitle}>{title || "Titre de l'article"}</h1>
              <p className={styles.previewMeta}>
                {author}
                {readingMinutes && ` · ${readingMinutes} min de lecture`}
                {publishDate && ` · ${fmtDate(publishDate)}`}
              </p>
              {excerpt && <p className={styles.previewLead}>{excerpt}</p>}
              {bodyDoc ? (
                <div className={styles.previewBody} dangerouslySetInnerHTML={{ __html: tiptapDocToHtml(bodyDoc) }} />
              ) : (
                <p className={styles.previewEmpty}>Le contenu de l&apos;article apparaîtra ici.</p>
              )}
            </article>
          </div>
        </div>
      )}
    </div>
  );
}
