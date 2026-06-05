"use client";

// Gestion des articles de blog dans la zone d'apercu.
//   - Vue liste : tous les articles existants (statut, cover, edition).
//   - Vue editeur : creation / modification, design compact facon article.
//   - Apercu : fenetre rendant l'article tel qu'il sera publie.
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft, Plus, Eye, Save, Send, X, Upload, FileImage, Check, Pencil, Newspaper, Clock, Calendar,
} from "lucide-react";
import ArticleEditor from "./ArticleEditor";
import { tiptapDocToHtml } from "../../lib/tiptapHtml";
import type { JSONContent } from "@tiptap/react";
import CategorySelect, { type CategoryItem } from "./CategorySelect";
import styles from "./BlogManager.module.css";

type ToastType = "success" | "error" | "partial";

interface Props {
  onClose: () => void;
  showToast: (message: string, type: ToastType) => void;
}

interface BlogPost {
  id: string;
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

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS["Brouillon"];
  return (
    <span className={styles.statusBadge} style={{ background: s.bg, color: s.text }}>
      <span className={styles.statusDot} style={{ background: s.dot }} />
      {status}
    </span>
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
  const [coverName, setCoverName] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [coverDragOver, setCoverDragOver] = useState(false);
  const [author, setAuthor] = useState("Mireille Dayer");
  const [publishDate, setPublishDate] = useState("");
  const [readingMinutes, setReadingMinutes] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [bodyDoc, setBodyDoc] = useState<JSONContent | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
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

  function resetEditor() {
    setTitle(""); setSlug(""); setSlugTouched(false); setExcerpt(""); setCategory("");
    setTags([]); setCoverUrl(""); setCoverName(""); setCoverError("");
    setAuthor("Mireille Dayer"); setPublishDate(""); setReadingMinutes(""); setMetaDesc(""); setBodyDoc(null);
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

  function openEdit(p: BlogPost) {
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
    setCoverName(p.coverUrl ? (p.coverUrl.split("/").pop() ?? "image") : "");
    setCoverError("");
    setAuthor(p.author || "Mireille Dayer");
    setPublishDate(p.publishDate);
    setReadingMinutes(p.readingMinutes ? String(p.readingMinutes) : "");
    setMetaDesc(p.metaDescription);
    setBodyDoc(p.bodyJson ?? null);
    initialSigRef.current = editorSignature({
      title: p.title, slug: p.slug, excerpt: p.excerpt, category: p.category, tags: p.tags,
      coverUrl: p.coverUrl, author: p.author || "Mireille Dayer", publishDate: p.publishDate,
      readingMinutes: p.readingMinutes ? String(p.readingMinutes) : "", metaDesc: p.metaDescription,
      bodyDoc: p.bodyJson ?? null,
    });
    setEditorKey((k) => k + 1);
    setMode("editor");
  }

  // Retour a la liste : si des modifications sont en cours, on demande confirmation.
  function requestBackToList() {
    const current = editorSignature({
      title, slug, excerpt, category, tags, coverUrl, author, publishDate, readingMinutes, metaDesc, bodyDoc,
    });
    if (current !== initialSigRef.current) setConfirmLeave(true);
    else setMode("list");
  }

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function uploadCover(file: File) {
    if (!file.type.startsWith("image/")) return;
    setCoverName(file.name);
    setCoverUrl("");
    setCoverError("");
    setCoverUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
      setCoverUrl(data.url);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setCoverUploading(false);
    }
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
          status === "Publié" ? "Article publié." : "Brouillon enregistré.",
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
          {loading && posts.length === 0 && <p className={styles.muted}>Chargement des articles…</p>}
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
                      {p.category && <span className={styles.cardCat}>{p.category}</span>}
                    </div>
                    <h3 className={styles.cardTitle}>{p.title || "Sans titre"}</h3>
                    {p.excerpt && <p className={styles.cardExcerpt}>{p.excerpt}</p>}
                    <div className={styles.cardFoot}>
                      <span className={styles.cardMeta}>
                        {p.publishDate ? fmtDate(p.publishDate) : `Modifié ${fmtDate(p.lastEdited)}`}
                      </span>
                      <button className={styles.cardEdit} onClick={() => openEdit(p)}>
                        <Pencil size={13} /> Modifier
                      </button>
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
          <button className={styles.ghostBtn} onClick={() => setPreviewOpen(true)} disabled={!title.trim()}>
            <Eye size={15} /> Aperçu
          </button>
          <button className={styles.softBtn} onClick={() => save("Brouillon")} disabled={!title.trim() || sending !== null}>
            <Save size={15} /> {sending === "Brouillon" ? "…" : "Brouillon"}
          </button>
          <button className={styles.primaryBtn} onClick={() => save("Publié")} disabled={!title.trim() || sending !== null}>
            <Send size={15} /> {sending === "Publié" ? "…" : "Publier"}
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
                className={`${styles.coverZone} ${coverDragOver ? styles.coverZoneOver : ""}`}
                onDragOver={(e) => { e.preventDefault(); setCoverDragOver(true); }}
                onDragLeave={() => setCoverDragOver(false)}
                onDrop={async (e) => {
                  e.preventDefault(); setCoverDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f?.type.startsWith("image/")) await uploadCover(f);
                }}
                role="button"
                tabIndex={0}
                onClick={() => coverInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") coverInputRef.current?.click(); }}
              >
                {coverUploading ? (
                  <span className={styles.coverHint}>Upload…</span>
                ) : coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl} alt="Couverture" className={styles.coverImg} />
                ) : (
                  <span className={styles.coverHint}><Upload size={16} /> Image carrée</span>
                )}
              </div>
              {coverName && coverUrl && (
                <div className={styles.coverFileRow}>
                  <FileImage size={12} /> <span className={styles.coverFileName}>{coverName}</span>
                  <button
                    type="button"
                    className={styles.coverRemove}
                    onClick={(e) => { e.stopPropagation(); setCoverName(""); setCoverUrl(""); }}
                    aria-label="Retirer l'image"
                  ><X size={12} /></button>
                </div>
              )}
              {coverError && <span className={styles.errorTextSm}>{coverError}</span>}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className={styles.fileHidden}
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadCover(f); e.target.value = ""; }}
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
              <input className={styles.input} type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
            </div>
          </div>

          {/* Corps */}
          <div className={styles.bodyField}>
            <label className={styles.fieldLabel}>Contenu de l&apos;article</label>
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
            <p className={styles.confirmTitle}>Modifications non enregistrées</p>
            <p className={styles.confirmText}>
              Vous avez des modifications en cours sur cet article. Souhaitez-vous les enregistrer avant de revenir à la liste&nbsp;?
            </p>
            {!title.trim() && (
              <p className={styles.confirmHint}>Un titre est requis pour pouvoir enregistrer.</p>
            )}
            <div className={styles.confirmActions}>
              <button className={styles.ghostBtn} onClick={() => setConfirmLeave(false)} disabled={sending !== null}>
                Continuer les modifications
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
