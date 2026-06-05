"use client";

// Console d'administration : affiche le site dans une fenetre-navigateur (iframe
// same-origin) et porte les controles de retours autour. Reutilise la logique de
// resolution de libelle (app/lib/fbResolve) et les styles du widget legacy pour
// les modales (formulaire, grille de tickets). Le widget flottant n'est plus
// injecte dans les pages publiques.

import { useState, useEffect, useRef, useCallback, useId } from "react";
import {
  MousePointer, Globe, Send, X, Trash2, RefreshCw, Pencil,
  ExternalLink, Upload, FileImage, Check, LogOut, Info, MessageSquarePlus,
  ArrowLeft, Newspaper, MessagesSquare,
} from "lucide-react";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import RichTextEditor from "../../components/RichTextEditor/RichTextEditor";
import {
  PAGE_OPTIONS, pageNameForPath, ACTION_OPTIONS, PLACEHOLDERS, type ActionOption,
  getElementLabel, getElementUrl,
} from "../../lib/fbResolve";
import BrowserFrame, { type Format } from "./BrowserFrame";
import fb from "../../components/FeedbackWidget/FeedbackWidget.module.css";
import styles from "./AdminConsole.module.css";

const DESKTOP_MIN = 1024;

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  "À traiter": { dot: "#F59E0B", bg: "rgba(245,158,11,0.1)", text: "#92400E" },
  "En cours":  { dot: "#3B82F6", bg: "rgba(59,130,246,0.1)", text: "#1E40AF" },
  "Traité":    { dot: "#5A7A4F", bg: "rgba(90,122,79,0.1)",  text: "#3B5E32" },
  "Résolu":    { dot: "#5A7A4F", bg: "rgba(90,122,79,0.1)",  text: "#3B5E32" },
  "Refusé":    { dot: "#B42C2A", bg: "rgba(180,44,42,0.1)",  text: "#7F1D1D" },
  "Bloqué":    { dot: "#F97316", bg: "rgba(249,115,22,0.1)", text: "#9A3412" },
};

type TicketTab = "tous" | "À traiter" | "En cours" | "Traité" | "Bloqué";
const TICKET_TABS: { key: TicketTab; label: string }[] = [
  { key: "tous",      label: "Tous" },
  { key: "À traiter", label: "À traiter" },
  { key: "En cours",  label: "En cours" },
  { key: "Traité",    label: "Traité" },
  { key: "Bloqué",    label: "Bloqué" },
];

type Mode = "navigate" | "annotate";
type View = "hub" | "form";
// Ce qui occupe la zone d'apercu a droite : la fenetre-navigateur, la gestion
// des articles de blog, ou la gestion des retours envoyes.
type StageView = "browser" | "blog" | "tickets";
type ToastType = "success" | "error" | "partial";

const BLOG_CATEGORY_OPTIONS = [
  { value: "conseils-dirigeants", label: "Conseils dirigeants" },
  { value: "temoignages", label: "Témoignages" },
  { value: "actualites", label: "Actualités" },
  { value: "ressources-particuliers", label: "Ressources particuliers" },
  { value: "autre", label: "Autre" },
];
const BLOG_TAGS = [
  "PME", "Entrepreneurs", "Particuliers", "Suisse romande",
  "Organisation", "Stratégie", "Discrétion",
] as const;
const SEO_DESC_MIN = 120;
const SEO_DESC_MAX = 160;
const SITE_DOMAIN = "swiss-serenity-plus.ch";

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

interface Draft {
  id: string;
  element: string;
  elementUrl: string;
  action: string;
  page: string;
  text: string;
  timestamp: string;
  format: Format;
  isGeneral?: boolean;
  imageUrl?: string;
}

interface NotionTicket {
  notionId: string;
  ticketId: string;
  element: string;
  action: string;
  page: string;
  text: string;
  status: string;
  format?: string;
  timestamp: string;
  imageUrl?: string;
}

const TEXT_CLAMP = 200;
function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > TEXT_CLAMP;
  return (
    <div>
      <p className={fb.feedbackText}>
        {isLong && !expanded ? `${text.slice(0, TEXT_CLAMP)}…` : text}
      </p>
      {isLong && (
        <button className={fb.expandBtn} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Voir moins" : `Voir plus (+${text.length - TEXT_CLAMP} car.)`}
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { dot: "#9CA3AF", bg: "rgba(156,163,175,0.1)", text: "#6B7280" };
  return (
    <span className={fb.statusBadge} style={{ background: s.bg, color: s.text }}>
      <span className={fb.statusDot} style={{ background: s.dot }} />
      {status}
    </span>
  );
}

export default function AdminConsole() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sessionId = useRef("");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingFileInputRef = useRef<HTMLInputElement>(null);

  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [format, setFormat] = useState<Format>("desktop");
  const [currentPath, setCurrentPath] = useState("/");
  const [mode, setMode] = useState<Mode>("navigate");
  const [frameLoadKey, setFrameLoadKey] = useState(0);

  const [view, setView] = useState<View>("hub");
  const [stageView, setStageView] = useState<StageView>("browser");

  // Brouillons + formulaire de retour
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingElement, setPendingElement] = useState<string | null>(null);
  const [pendingElementUrl, setPendingElementUrl] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [pendingText, setPendingText] = useState("");
  const [pendingFormat, setPendingFormat] = useState<Format>("desktop");
  const [actionError, setActionError] = useState(false);
  const [isGeneralMode, setIsGeneralMode] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [pendingImageName, setPendingImageName] = useState("");
  const [pendingImageUploading, setPendingImageUploading] = useState(false);
  const [pendingImageError, setPendingImageError] = useState("");
  const [pendingImageDragOver, setPendingImageDragOver] = useState(false);

  // Tickets Notion
  const [notionTickets, setNotionTickets] = useState<NotionTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [ticketTab, setTicketTab] = useState<TicketTab>("tous");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Formulaire article de blog
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogSlugTouched, setBlogSlugTouched] = useState(false);
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogCategory, setBlogCategory] = useState("");
  const [blogTags, setBlogTags] = useState<string[]>([]);
  const [blogCoverUrl, setBlogCoverUrl] = useState("");
  const [blogCoverName, setBlogCoverName] = useState("");
  const [blogCoverUploading, setBlogCoverUploading] = useState(false);
  const [blogCoverError, setBlogCoverError] = useState("");
  const [blogIsDragOver, setBlogIsDragOver] = useState(false);
  const [blogAuthor, setBlogAuthor] = useState("Mireille Dayer");
  const [blogPublishDate, setBlogPublishDate] = useState("");
  const [blogReadingMinutes, setBlogReadingMinutes] = useState("");
  const [blogMetaDesc, setBlogMetaDesc] = useState("");
  const [blogMetaTooltip, setBlogMetaTooltip] = useState(false);
  const [blogBody, setBlogBody] = useState("");
  const [blogSending, setBlogSending] = useState(false);
  const blogMetaTooltipId = useId();
  const blogCoverFileInputRef = useRef<HTMLInputElement>(null);

  // Init session + garde desktop
  useEffect(() => {
    sessionId.current = crypto.randomUUID();
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Synchronise la barre d'URL avec les navigations internes de l'iframe.
  // L'evenement load ne couvre pas les navigations client (Next App Router) :
  // on lit donc periodiquement le pathname same-origin.
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const p = iframeRef.current?.contentWindow?.location.pathname;
        if (p) setCurrentPath((prev) => (p !== prev ? p : prev));
      } catch {
        // cross-origin inattendu : on ignore
      }
    }, 350);
    return () => clearInterval(id);
  }, []);

  // Fermer l'apercu d'image plein ecran avec Echap.
  useEffect(() => {
    if (!lightboxUrl) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxUrl(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxUrl]);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const loadNotionTickets = useCallback(async () => {
    setLoadingTickets(true);
    setTicketsError(null);
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }
      const data = await res.json();
      setNotionTickets(data.tickets ?? []);
    } catch (err) {
      setTicketsError(err instanceof Error ? err.message : "Impossible de charger les tickets Notion.");
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  // Navigation : charge un chemin dans l'iframe (URLs relatives, same-origin).
  const navigateTo = useCallback((path: string) => {
    const frame = iframeRef.current;
    if (frame) frame.src = path;
  }, []);

  function handleFrameLoad(pathname: string) {
    setCurrentPath(pathname);
    setFrameLoadKey((k) => k + 1);
  }

  function resetForm() {
    setPendingElement(null);
    setPendingElementUrl("");
    setPendingAction("");
    setPendingText("");
    setActionError(false);
    setIsGeneralMode(false);
    setPendingImageUrl("");
    setPendingImageName("");
    setPendingImageError("");
    setEditingId(null);
  }

  // Mode annotation : ecouteurs poses dans le contentDocument de l'iframe.
  // Le highlight est un outline injecte (suit nativement scroll, resize et
  // changement de largeur du switcher responsive). Re-attache a chaque navigation.
  useEffect(() => {
    if (mode !== "annotate" || stageView !== "browser") return;
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    const win = frame?.contentWindow;
    if (!doc || !win) return;

    // Curseur personnalise (fleche noire cernee de blanc), inspire d'un pointeur
    // classique, plutot que la croix fine. Encode en data-URI base64.
    const cursorSvg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 24 24'>" +
      "<path d='M18.6 3 L18.6 19.6 L14.1 15.2 L11.3 21 L8.8 19.8 L11.6 14.1 L5.9 14.1 Z' " +
      "fill='#0c0c0c' stroke='#ffffff' stroke-width='1.6' stroke-linejoin='round'/></svg>";
    const cursorUrl = `data:image/svg+xml;base64,${win.btoa(cursorSvg)}`;

    const STYLE_ID = "fb-admin-hover-style";
    let style = doc.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        .fb-admin-hover {
          outline: 2px solid #b42c2a !important;
          outline-offset: 2px !important;
          background-color: rgba(180,44,42,0.08) !important;
        }
        html.fb-admin-annotating, html.fb-admin-annotating * {
          cursor: url("${cursorUrl}") 22 4, auto !important;
        }
      `;
      doc.head.appendChild(style);
    }
    doc.documentElement.classList.add("fb-admin-annotating");

    let hovered: HTMLElement | null = null;
    const clearHover = () => {
      if (hovered) { hovered.classList.remove("fb-admin-hover"); hovered = null; }
    };

    const onOver = (e: Event) => {
      const t = e.target as HTMLElement;
      if (!t || t === doc.body || t === doc.documentElement) return;
      if (hovered === t) return;
      clearHover();
      hovered = t;
      t.classList.add("fb-admin-hover");
    };
    const onOut = () => clearHover();
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      clearHover();
      resetForm();
      setPendingElement(getElementLabel(t, doc));
      setPendingElementUrl(getElementUrl(t, win.location));
      setPendingFormat(format);
      setIsGeneralMode(false);
      setView("form");
      setMode("navigate");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode("navigate");
    };

    doc.addEventListener("mouseover", onOver, true);
    doc.addEventListener("mouseout", onOut, true);
    doc.addEventListener("click", onClick, true);
    doc.addEventListener("keydown", onKey, true);
    window.addEventListener("keydown", onKey);

    return () => {
      doc.removeEventListener("mouseover", onOver, true);
      doc.removeEventListener("mouseout", onOut, true);
      doc.removeEventListener("click", onClick, true);
      doc.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keydown", onKey);
      clearHover();
      doc.documentElement.classList.remove("fb-admin-annotating");
      style?.remove();
    };
  }, [mode, frameLoadKey, format, stageView]);

  // « Modifier un élément » : active/desactive la selection de bloc sur l'apercu.
  function toggleBlockSelect() {
    setStageView("browser");
    setMode((m) => (m === "annotate" ? "navigate" : "annotate"));
  }

  // « Modifier l'ensemble du site » : feedback general sur la page courante.
  function startGeneralFeedback() {
    setStageView("browser");
    setMode("navigate");
    resetForm();
    setPendingElement("Page entière");
    setPendingElementUrl("");
    setPendingFormat(format);
    setIsGeneralMode(true);
    setView("form");
  }

  // « Gérer mes modifications » : ouvre la gestion des retours dans l'apercu.
  function openTickets() {
    setMode("navigate");
    setStageView("tickets");
    loadNotionTickets();
  }

  function closeForm() {
    resetForm();
    setView("hub");
  }

  // « Gérer mes articles de blog » : ouvre l'espace blog dans l'apercu.
  function startBlogCreator() {
    setMode("navigate");
    setStageView("blog");
  }

  function toggleBlogTag(tag: string) {
    setBlogTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function resetBlogForm() {
    setBlogTitle("");
    setBlogSlug("");
    setBlogSlugTouched(false);
    setBlogExcerpt("");
    setBlogCategory("");
    setBlogTags([]);
    setBlogCoverUrl("");
    setBlogCoverName("");
    setBlogCoverError("");
    setBlogAuthor("Mireille Dayer");
    setBlogPublishDate("");
    setBlogReadingMinutes("");
    setBlogMetaDesc("");
    setBlogBody("");
  }

  function closeBlog() {
    resetBlogForm();
    setStageView("browser");
  }

  async function uploadBlogCover(file: File) {
    if (!file.type.startsWith("image/")) return;
    setBlogCoverName(file.name);
    setBlogCoverUrl("");
    setBlogCoverError("");
    setBlogCoverUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
      setBlogCoverUrl(data.url);
    } catch (err) {
      setBlogCoverError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setBlogCoverUploading(false);
    }
  }

  async function submitBlogPost() {
    if (!blogTitle.trim() || blogSending) return;
    setBlogSending(true);
    try {
      const res = await fetch("/api/blog-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blogTitle.trim(),
          slug: blogSlug.trim() || undefined,
          excerpt: blogExcerpt.trim() || undefined,
          category: blogCategory || undefined,
          tags: blogTags.length > 0 ? blogTags : undefined,
          coverUrl: blogCoverUrl.trim() || undefined,
          author: blogAuthor.trim() || undefined,
          publishDate: blogPublishDate || undefined,
          readingMinutes: blogReadingMinutes ? Number(blogReadingMinutes) : undefined,
          metaDescription: blogMetaDesc.trim() || undefined,
          body: blogBody.trim() || undefined,
          status: "Brouillon",
        }),
      });
      if (res.ok) {
        showToast("Article créé dans Notion (statut Brouillon)", "success");
        resetBlogForm();
        setStageView("browser");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "Erreur lors de la création", "error");
      }
    } catch {
      showToast("Erreur réseau, réessayez", "error");
    } finally {
      setBlogSending(false);
    }
  }

  function addFeedback() {
    if (!pendingElement || !pendingText.trim()) return;
    if (!isGeneralMode && !pendingAction) { setActionError(true); return; }

    const draft: Draft = {
      id: editingId ?? crypto.randomUUID(),
      element: pendingElement,
      elementUrl: pendingElementUrl,
      action: pendingAction,
      page: pageNameForPath(currentPath),
      text: pendingText.trim(),
      timestamp: new Date().toISOString(),
      format: pendingFormat,
      isGeneral: isGeneralMode,
      ...(pendingImageUrl ? { imageUrl: pendingImageUrl } : {}),
    };

    if (editingId) {
      setDrafts((prev) => prev.map((d) => (d.id === editingId ? draft : d)));
    } else {
      setDrafts((prev) => [...prev, draft]);
    }
    closeForm();
  }

  function startEdit(draft: Draft) {
    setEditingId(draft.id);
    setPendingElement(draft.element);
    setPendingElementUrl(draft.elementUrl);
    setPendingAction(draft.action);
    setPendingText(draft.text);
    setPendingFormat(draft.format);
    setIsGeneralMode(!!draft.isGeneral);
    setPendingImageUrl(draft.imageUrl ?? "");
    setPendingImageName(draft.imageUrl ? (draft.imageUrl.split("/").pop() ?? "image") : "");
    setPendingImageError("");
    setView("form");
  }

  function deleteDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  async function uploadFeedbackImage(file: File) {
    if (!file.type.startsWith("image/")) return;
    setPendingImageName(file.name);
    setPendingImageUrl("");
    setPendingImageError("");
    setPendingImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
      setPendingImageUrl(data.url);
    } catch (err) {
      setPendingImageError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setPendingImageUploading(false);
    }
  }

  async function sendAll() {
    if (drafts.length === 0 || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId.current,
          feedbacks: drafts.map((d) => ({
            element: d.element, elementUrl: d.elementUrl, action: d.action,
            page: d.page, text: d.text, timestamp: d.timestamp, format: d.format,
            ...(d.imageUrl ? { imageUrl: d.imageUrl } : {}),
          })),
        }),
      });
      const data = await res.json();
      if (res.status === 200 || res.status === 207) {
        setDrafts([]);
        sessionId.current = crypto.randomUUID();
        showToast(
          res.status === 207
            ? `${data.created} retour(s) envoyé(s), ${data.failed} non transmis`
            : "Retours envoyés avec succès",
          res.status === 207 ? "partial" : "success"
        );
        await loadNotionTickets();
      } else {
        showToast("Erreur lors de l'envoi, réessayez ou contactez Théo", "error");
      }
    } catch {
      showToast("Erreur réseau, réessayez ou contactez Théo", "error");
    } finally {
      setIsSending(false);
    }
  }

  const deleteNotionTicket = useCallback(async (notionId: string) => {
    setDeletingId(notionId);
    setNotionTickets((prev) => prev.filter((t) => t.notionId !== notionId));
    try {
      const res = await fetch(`/api/tickets?id=${encodeURIComponent(notionId)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      showToast("Suppression échouée, rechargement...", "error");
      await loadNotionTickets();
    } finally {
      setDeletingId(null);
    }
  }, [showToast, loadNotionTickets]);

  async function logout() {
    try {
      await fetch("/api/admin-login", { method: "DELETE" });
    } finally {
      window.location.reload();
    }
  }

  // Garde desktop-only
  if (viewportWidth !== null && viewportWidth < DESKTOP_MIN) {
    return (
      <div className={styles.desktopGuard}>
        <div className={styles.guardCard}>
          <Globe size={30} strokeWidth={1.4} />
          <h1 className={styles.guardTitle}>Console réservée à l&apos;ordinateur</h1>
          <p className={styles.guardText}>
            Cette console de retours nécessite un écran large. Veuillez vous connecter
            depuis un navigateur sur ordinateur (largeur d&apos;au moins {DESKTOP_MIN} px).
          </p>
        </div>
      </div>
    );
  }

  const currentPlaceholder = PLACEHOLDERS[pendingAction as ActionOption] ?? PLACEHOLDERS.default;
  const pageSelectValue = PAGE_OPTIONS.some((o) => o.value === currentPath) ? currentPath : "";

  const filteredTickets = ticketTab === "tous"
    ? notionTickets
    : ticketTab === "Traité"
      ? notionTickets.filter((t) => ["Traité", "Résolu"].includes(t.status))
      : notionTickets.filter((t) => t.status === ticketTab);
  const ticketTabCount = (tab: TicketTab) => {
    if (tab === "tous") return notionTickets.length;
    if (tab === "Traité") return notionTickets.filter((t) => ["Traité", "Résolu"].includes(t.status)).length;
    return notionTickets.filter((t) => t.status === tab).length;
  };

  return (
    <div className={styles.shell}>
      {/* Panneau de controle */}
      <aside className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.brandEyebrow}>Swiss Serenity Plus</p>
            <h1 className={styles.brandTitle}>Console de retours</h1>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Se déconnecter" aria-label="Se déconnecter">
            <LogOut size={15} />
          </button>
        </div>

        <div className={styles.panelBody}>
          <div className={styles.controlBlock}>
            <label className={styles.controlLabel}>Page affichée</label>
            <CustomSelect
              name="adminPage"
              options={PAGE_OPTIONS}
              placeholder="Choisir une page..."
              value={pageSelectValue}
              onChange={(v) => navigateTo(v)}
            />
          </div>

          <div className={styles.actionsBlock}>
            <h2 className={styles.actionsTitle}>Comment souhaitez-vous améliorer le site&nbsp;?</h2>

            <button
              className={`${styles.actionBtn} ${mode === "annotate" ? styles.actionBtnActive : styles.actionBtnPrimary}`}
              onClick={toggleBlockSelect}
              aria-pressed={mode === "annotate"}
            >
              <MousePointer size={16} strokeWidth={1.6} />
              {mode === "annotate" ? "Sélection active — cliquez un élément" : "Modifier un élément"}
            </button>
            {mode === "annotate" && (
              <p className={styles.controlHint}>
                Cliquez un élément dans l&apos;aperçu pour l&apos;annoter. Échap ou recliquez pour quitter.
              </p>
            )}
            <button className={styles.actionBtn} onClick={startGeneralFeedback}>
              <Globe size={16} strokeWidth={1.6} /> Modifier l&apos;ensemble du site
            </button>
            <button
              className={`${styles.actionBtn} ${stageView === "blog" ? styles.actionBtnOn : ""}`}
              onClick={startBlogCreator}
              aria-pressed={stageView === "blog"}
            >
              <Newspaper size={16} strokeWidth={1.6} /> Gérer mes articles de blog
            </button>
            <button
              className={`${styles.actionBtn} ${stageView === "tickets" ? styles.actionBtnOn : ""}`}
              onClick={openTickets}
              aria-pressed={stageView === "tickets"}
            >
              <MessagesSquare size={16} strokeWidth={1.6} /> Gérer mes modifications
              {notionTickets.length > 0 && (
                <span className={styles.actionBtnCount}>{notionTickets.length}</span>
              )}
            </button>
          </div>

          {/* Brouillons */}
          <div className={styles.draftsBlock}>
            <p className={styles.draftsHeading}>
              Brouillons en attente
              {drafts.length > 0 && <span className={styles.draftsCount}>{drafts.length}</span>}
            </p>
            {drafts.length === 0 ? (
              <p className={styles.draftsEmpty}>Aucune modification en attente. Modifiez un élément ou l&apos;ensemble du site.</p>
            ) : (
              <>
                <ul className={styles.draftsList}>
                  {drafts.map((draft) => (
                    <li key={draft.id} className={styles.draftItem}>
                      <div className={styles.draftItemTop}>
                        <span className={fb.actionTag}>{draft.isGeneral ? "Général" : draft.action}</span>
                        <span className={styles.draftFormat}>{draft.format}</span>
                        <div className={styles.draftItemActions}>
                          <button className={styles.draftEdit} onClick={() => startEdit(draft)} aria-label="Modifier">
                            <Pencil size={13} />
                          </button>
                          <button className={styles.draftDelete} onClick={() => deleteDraft(draft.id)} aria-label="Supprimer">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <p className={styles.draftElement}>{draft.element}</p>
                      <p className={styles.draftText}>{draft.text}</p>
                    </li>
                  ))}
                </ul>
                <button className={styles.sendBtn} onClick={sendAll} disabled={isSending} aria-busy={isSending}>
                  {isSending ? "Envoi en cours..." : <><Send size={15} /> Envoyer {drafts.length} retour{drafts.length > 1 ? "s" : ""}</>}
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Fenetre-navigateur (toujours montee pour preserver l'etat de l'iframe) */}
      <main className={styles.stage}>
        <BrowserFrame
          iframeRef={iframeRef}
          format={format}
          onFormatChange={setFormat}
          currentPath={currentPath}
          annotating={mode === "annotate" && stageView === "browser"}
          onLoad={handleFrameLoad}
        />
      </main>

      {/* Modale formulaire (bloc ou general) */}
      {view === "form" && pendingElement && (
        <div className={fb.backdrop} onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
          <div className={styles.modalSheet} role="dialog" aria-label="Nouveau retour">
            <div className={styles.modalSheetHeader}>
              <p className={styles.modalSheetTitle}>
                {isGeneralMode ? "Feedback général" : editingId ? "Modifier le retour" : "Nouveau retour"}
              </p>
              <button className={fb.closeBtn} onClick={closeForm} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalSheetBody}>
              <div className={fb.pendingCover}>
                <span className={fb.pendingCoverEyebrow}>
                  {isGeneralMode ? "Feedback général sur la page" : editingId ? "Modification" : "Bloc sélectionné"}
                  {" · "}{pendingFormat === "mobile" ? "Vue mobile" : "Vue ordinateur"}
                </span>
                <p className={fb.pendingCoverName}>{pendingElement}</p>
                {pendingElementUrl && !isGeneralMode && (
                  <a href={pendingElementUrl} target="_blank" rel="noopener noreferrer" className={fb.elementLink}>
                    <ExternalLink size={11} />
                    {pendingElementUrl.replace(window.location.origin, "")}
                  </a>
                )}
              </div>

              <div className={fb.field}>
                <label className={fb.fieldLabel}>
                  Type de modification {!isGeneralMode && <span aria-hidden="true">*</span>}
                  {isGeneralMode && <span className={fb.fieldOptional}>(optionnel)</span>}
                </label>
                <div className={`${fb.actionPills} ${actionError ? fb.actionPillsError : ""}`}>
                  {ACTION_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`${fb.actionPill} ${pendingAction === opt ? fb.actionPillActive : ""}`}
                      onClick={() => { setPendingAction(opt); setActionError(false); }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {actionError && !isGeneralMode && (
                  <p className={fb.fieldError}>Sélectionnez un type de modification avant de continuer.</p>
                )}
              </div>

              <div className={fb.field}>
                <label className={fb.fieldLabel}>Détail du retour <span aria-hidden="true">*</span></label>
                <textarea
                  className={fb.textarea}
                  placeholder={currentPlaceholder}
                  value={pendingText}
                  onChange={(e) => setPendingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addFeedback();
                    if (e.key === "Escape") closeForm();
                  }}
                  rows={6}
                  autoFocus
                />
                <span className={fb.fieldHint}>Cmd+Entrée pour ajouter au brouillon</span>
              </div>

              <div className={fb.field}>
                <label className={fb.fieldLabel}>Image <span className={fb.fieldOptional}>(optionnel)</span></label>
                <div
                  className={`${fb.feedbackImageZone} ${pendingImageDragOver ? fb.feedbackImageZoneOver : ""} ${pendingImageName ? fb.feedbackImageZoneFilled : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setPendingImageDragOver(true); }}
                  onDragLeave={() => setPendingImageDragOver(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setPendingImageDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file?.type.startsWith("image/")) await uploadFeedbackImage(file);
                  }}
                >
                  {pendingImageUploading ? (
                    <div className={fb.dropZoneUploading}>
                      <span className={fb.uploadSpinner} aria-hidden="true" />
                      <span>Upload en cours…</span>
                    </div>
                  ) : pendingImageName ? (
                    <div className={fb.dropZoneFile}>
                      <FileImage size={14} className={pendingImageUrl ? fb.dropZoneFileIconOk : fb.dropZoneFileIcon} aria-hidden="true" />
                      <span className={fb.dropZoneFileName}>{pendingImageName}</span>
                      <button
                        type="button"
                        className={fb.dropZoneRemove}
                        onClick={() => { setPendingImageName(""); setPendingImageUrl(""); setPendingImageError(""); }}
                        aria-label="Supprimer l'image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={fb.feedbackImageZoneEmpty}
                      role="button"
                      tabIndex={0}
                      onClick={() => pendingFileInputRef.current?.click()}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") pendingFileInputRef.current?.click(); }}
                    >
                      <Upload size={13} aria-hidden="true" />
                      <span className={fb.feedbackImageZoneLabel}>Glisser ou choisir une image</span>
                      <span className={fb.feedbackImageZoneBtn}>Parcourir</span>
                    </div>
                  )}
                </div>
                <input
                  ref={pendingFileInputRef}
                  type="file"
                  accept="image/*"
                  className={fb.fileInputHidden}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await uploadFeedbackImage(file);
                    e.target.value = "";
                  }}
                />
                {pendingImageError && <span className={fb.hintWarn}>{pendingImageError}</span>}
                {pendingImageUrl && (
                  <div className={fb.uploadedPreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pendingImageUrl} alt="Photo jointe" className={fb.uploadedPreviewImg} />
                    <div className={fb.uploadedPreviewMsg}>
                      <Check size={14} strokeWidth={2.5} />
                      <span>Nous avons bien reçu votre photo.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalSheetFooter}>
              <button className={fb.cancelBtn} onClick={closeForm}>Annuler</button>
              <button className={fb.addBtn} onClick={addFeedback} disabled={!pendingText.trim()}>
                {editingId ? "Mettre à jour" : "Ajouter au brouillon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Espace de gestion des articles de blog (occupe la zone d'apercu) */}
      {stageView === "blog" && (
        <div className={styles.stageOverlay}>
          <div className={styles.stagePanel} role="region" aria-label="Gestion des articles de blog">
            <div className={styles.stagePanelHeader}>
              <button className={styles.backBtn} onClick={closeBlog}>
                <ArrowLeft size={15} /> Retour à l&apos;aperçu
              </button>
              <div className={styles.stagePanelTitleWrap}>
                <Newspaper size={17} strokeWidth={1.6} />
                <p className={styles.stagePanelTitle}>Mes articles de blog</p>
              </div>
            </div>

            <div className={styles.modalSheetBody}>
              <div className={fb.blogForm}>
                <div className={fb.notionInfo}>
                  <Info size={14} />
                  <span>L&apos;article sera enregistré en <strong>Brouillon</strong> — vous pourrez le réviser avant publication.</span>
                </div>

                <div className={fb.field}>
                  <label className={fb.fieldLabel}>Titre <span aria-hidden="true">*</span></label>
                  <input
                    type="text"
                    className={fb.input}
                    value={blogTitle}
                    onChange={(e) => {
                      setBlogTitle(e.target.value);
                      if (!blogSlugTouched) setBlogSlug(slugify(e.target.value));
                    }}
                    placeholder="Le bras droit externalisé : un levier stratégique pour les PME suisses"
                    maxLength={120}
                  />
                </div>

                <div className={fb.field}>
                  <label className={fb.fieldLabel}>URL de l&apos;article</label>
                  <div className={fb.slugPreview}>
                    <Globe size={12} className={fb.slugGlobe} aria-hidden="true" />
                    <span className={fb.slugDomain}>{SITE_DOMAIN}/blog/</span>
                    <span className={blogSlug ? fb.slugValue : fb.slugPlaceholder}>
                      {blogSlug || "votre-article"}
                    </span>
                  </div>
                  <input
                    type="text"
                    className={`${fb.input} ${fb.inputSmall}`}
                    value={blogSlug}
                    onChange={(e) => { setBlogSlug(slugify(e.target.value)); setBlogSlugTouched(true); }}
                    placeholder="votre-article"
                  />
                </div>

                <div className={fb.field}>
                  <label className={fb.fieldLabel}>Extrait</label>
                  <textarea
                    className={fb.textarea}
                    value={blogExcerpt}
                    onChange={(e) => setBlogExcerpt(e.target.value)}
                    placeholder="Résumé court (1-2 phrases) affiché en prévisualisation."
                    rows={2}
                    maxLength={300}
                  />
                </div>

                <div className={fb.field}>
                  <label className={fb.fieldLabel}>Catégorie</label>
                  <CustomSelect
                    name="blogCategory"
                    options={BLOG_CATEGORY_OPTIONS}
                    placeholder="Sélectionner..."
                    value={blogCategory}
                    onChange={setBlogCategory}
                  />
                </div>

                <div className={fb.field}>
                  <label className={fb.fieldLabel}>Tags</label>
                  <div className={fb.actionPills}>
                    {BLOG_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`${fb.actionPill} ${blogTags.includes(tag) ? fb.actionPillActive : ""}`}
                        onClick={() => toggleBlogTag(tag)}
                      >
                        {blogTags.includes(tag) && <Check size={12} />}
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={fb.field}>
                  <label className={fb.fieldLabel}>Image de couverture</label>
                  <div
                    className={`${fb.dropZone} ${blogIsDragOver ? fb.dropZoneOver : ""} ${blogCoverName ? fb.dropZoneFilled : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setBlogIsDragOver(true); }}
                    onDragLeave={() => setBlogIsDragOver(false)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setBlogIsDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file?.type.startsWith("image/")) await uploadBlogCover(file);
                    }}
                  >
                    {blogCoverUploading ? (
                      <div className={fb.dropZoneUploading}>
                        <span className={fb.uploadSpinner} aria-hidden="true" />
                        <span>Upload en cours…</span>
                      </div>
                    ) : blogCoverName ? (
                      <div className={fb.dropZoneFile}>
                        <FileImage size={16} className={blogCoverUrl ? fb.dropZoneFileIconOk : fb.dropZoneFileIcon} aria-hidden="true" />
                        <span className={fb.dropZoneFileName}>{blogCoverName}</span>
                        <button
                          type="button"
                          className={fb.dropZoneRemove}
                          onClick={() => { setBlogCoverName(""); setBlogCoverUrl(""); setBlogCoverError(""); }}
                          aria-label="Supprimer l'image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={18} className={fb.dropZoneIcon} aria-hidden="true" />
                        <span className={fb.dropZoneText}>Glissez votre image ici</span>
                        <button
                          type="button"
                          className={fb.dropZoneBtn}
                          onClick={() => blogCoverFileInputRef.current?.click()}
                        >
                          Choisir un fichier
                        </button>
                      </>
                    )}
                  </div>
                  <input
                    ref={blogCoverFileInputRef}
                    type="file"
                    accept="image/*"
                    className={fb.fileInputHidden}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await uploadBlogCover(file);
                      e.target.value = "";
                    }}
                  />
                  {blogCoverError && <span className={fb.hintWarn}>{blogCoverError}</span>}
                  {blogCoverUrl && (
                    <div className={fb.uploadedPreview}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={blogCoverUrl} alt="Image de couverture" className={fb.uploadedPreviewImg} />
                      <div className={fb.uploadedPreviewMsg}>
                        <Check size={14} strokeWidth={2.5} />
                        <span>Image bien reçue.</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={fb.fieldRow}>
                  <div className={fb.field}>
                    <label className={fb.fieldLabel}>Auteur</label>
                    <input
                      type="text"
                      className={fb.input}
                      value={blogAuthor}
                      onChange={(e) => setBlogAuthor(e.target.value)}
                    />
                  </div>
                  <div className={fb.field}>
                    <label className={fb.fieldLabel}>Temps de lecture (min)</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      className={fb.input}
                      value={blogReadingMinutes}
                      onChange={(e) => setBlogReadingMinutes(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className={fb.field}>
                  <div className={fb.fieldLabelRow}>
                    <label className={fb.fieldLabel}>Méta description SEO</label>
                    <button
                      type="button"
                      className={fb.seoTooltipTrigger}
                      aria-describedby={blogMetaTooltipId}
                      onMouseEnter={() => setBlogMetaTooltip(true)}
                      onMouseLeave={() => setBlogMetaTooltip(false)}
                      onFocus={() => setBlogMetaTooltip(true)}
                      onBlur={() => setBlogMetaTooltip(false)}
                      aria-label="Aide SEO"
                    >
                      <Info size={13} />
                    </button>
                    {blogMetaTooltip && (
                      <div id={blogMetaTooltipId} role="tooltip" className={fb.seoTooltip}>
                        <strong>120–160 caractères recommandés.</strong> Ce texte s&apos;affiche sous le titre dans Google.
                      </div>
                    )}
                  </div>
                  <textarea
                    className={`${fb.textarea} ${blogMetaDesc.length >= SEO_DESC_MIN && blogMetaDesc.length <= SEO_DESC_MAX ? fb.textareaOk : blogMetaDesc.length > 0 ? fb.textareaWarn : ""}`}
                    value={blogMetaDesc}
                    onChange={(e) => setBlogMetaDesc(e.target.value)}
                    placeholder="Résumé pour les moteurs de recherche (120–160 caractères)"
                    rows={2}
                    maxLength={200}
                  />
                  <span className={`${fb.fieldHint} ${blogMetaDesc.length >= SEO_DESC_MIN && blogMetaDesc.length <= SEO_DESC_MAX ? fb.hintOk : blogMetaDesc.length > SEO_DESC_MAX ? fb.hintWarn : ""}`}>
                    {blogMetaDesc.length}/{SEO_DESC_MAX} car.
                    {blogMetaDesc.length > 0 && blogMetaDesc.length < SEO_DESC_MIN && ` — encore ${SEO_DESC_MIN - blogMetaDesc.length} recommandés`}
                    {blogMetaDesc.length > SEO_DESC_MAX && " — trop long"}
                    {blogMetaDesc.length >= SEO_DESC_MIN && blogMetaDesc.length <= SEO_DESC_MAX && " — idéal"}
                  </span>
                </div>

                <div className={fb.field}>
                  <label className={fb.fieldLabel}>Corps de l&apos;article</label>
                  <RichTextEditor
                    value={blogBody}
                    onChange={setBlogBody}
                    placeholder="Rédigez votre article — utilisez la barre d'outils pour mettre en forme (gras, listes…)."
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalSheetFooter}>
              <button className={fb.cancelBtn} onClick={closeBlog}>Annuler</button>
              <button
                className={fb.addBtn}
                onClick={submitBlogPost}
                disabled={!blogTitle.trim() || blogSending}
                aria-busy={blogSending}
              >
                {blogSending ? "Création..." : <><MessageSquarePlus size={14} />Créer le brouillon</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Espace de gestion des modifications envoyees (occupe la zone d'apercu) */}
      {stageView === "tickets" && (
          <div className={styles.stageOverlay}>
            <div className={styles.stagePanel} role="region" aria-label="Mes modifications">
              <div className={styles.stagePanelHeader}>
                <button className={styles.backBtn} onClick={() => setStageView("browser")}>
                  <ArrowLeft size={15} /> Retour à l&apos;aperçu
                </button>
                <div className={styles.stagePanelTitleWrap}>
                  <MessagesSquare size={17} strokeWidth={1.6} />
                  <p className={styles.stagePanelTitle}>Mes modifications</p>
                </div>
                <button
                  className={fb.refreshBtn}
                  onClick={loadNotionTickets}
                  disabled={loadingTickets}
                  aria-label="Rafraîchir"
                  title="Rafraîchir"
                >
                  <RefreshCw size={13} className={loadingTickets ? fb.spinning : ""} />
                </button>
              </div>

              <div className={styles.modalSheetBody}>
                {!loadingTickets && !ticketsError && notionTickets.length > 0 && (
                  <div className={fb.tabBar} role="tablist">
                    {TICKET_TABS.map((tab) => {
                      const count = ticketTabCount(tab.key);
                      return (
                        <button
                          key={tab.key}
                          role="tab"
                          aria-selected={ticketTab === tab.key}
                          className={`${fb.tab} ${ticketTab === tab.key ? fb.tabActive : ""}`}
                          onClick={() => setTicketTab(tab.key)}
                        >
                          {tab.label}
                          {count > 0 && (
                            <span className={`${fb.tabCount} ${ticketTab === tab.key ? fb.tabCountActive : ""}`}>{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {loadingTickets && notionTickets.length === 0 && (
                  <p className={fb.loadingText}>Chargement des tickets...</p>
                )}
                {!loadingTickets && ticketsError && <p className={fb.errorSmall}>{ticketsError}</p>}
                {!loadingTickets && !ticketsError && notionTickets.length === 0 && (
                  <p className={fb.emptySmall}>Aucun ticket dans Notion pour l&apos;instant.</p>
                )}
                {!loadingTickets && !ticketsError && filteredTickets.length === 0 && notionTickets.length > 0 && (
                  <p className={fb.emptySmall}>Aucun ticket avec ce statut.</p>
                )}

                {filteredTickets.length > 0 && (
                  <div className={fb.ticketsGrid}>
                    {filteredTickets.map((ticket) => (
                      <div key={ticket.notionId} className={`${fb.feedbackItem} ${fb.notionItem}`}>
                        <div className={fb.ticketCardHeader}>
                          {ticket.ticketId && <span className={fb.ticketIdBadge}>{ticket.ticketId}</span>}
                          <StatusBadge status={ticket.status} />
                          <div className={fb.ticketCardActions}>
                            <button
                              className={`${fb.menuTrigger} ${fb.menuTriggerDanger}`}
                              onClick={() => deleteNotionTicket(ticket.notionId)}
                              disabled={deletingId === ticket.notionId}
                              aria-label="Supprimer ce ticket"
                              title="Supprimer de Notion"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <p className={fb.feedbackElement}>{ticket.element || "Sans titre"}</p>
                        {ticket.text && <ExpandableText text={ticket.text} />}
                        {ticket.imageUrl && (
                          <button
                            type="button"
                            className={fb.ticketThumb}
                            onClick={() => setLightboxUrl(ticket.imageUrl!)}
                            aria-label="Agrandir l'image jointe"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ticket.imageUrl} alt="" className={fb.ticketThumbImg} />
                            <span className={fb.ticketThumbHint} aria-hidden="true">Agrandir</span>
                          </button>
                        )}
                        {(ticket.action || ticket.format) && (
                          <div className={fb.notionItemFooter}>
                            {ticket.action && <span className={fb.actionTag}>{ticket.action}</span>}
                            {ticket.format && <span className={styles.draftFormat}>{ticket.format}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
      )}

      {/* Lightbox image : clic sur le fond ou Echap pour fermer */}
      {lightboxUrl && (
        <div className={fb.lightbox} onClick={() => setLightboxUrl(null)} role="button" tabIndex={0} aria-label="Fermer l'aperçu de l'image">
          <button className={styles.lightboxClose} onClick={() => setLightboxUrl(null)} aria-label="Fermer">
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxUrl} alt="Image en plein écran" className={fb.lightboxImg} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`${fb.toast} ${fb[`toast_${toast.type}`]}`} role="alert">
          {toast.message}
        </div>
      )}
    </div>
  );
}
