"use client";

// Gestion des retours envoyes (tickets Notion) dans la zone d'apercu.
//   - Vue liste : indicateurs (total / a traiter / en cours / traites),
//     recherche, grille de cartes, squelettes de chargement.
//   - Vue detail : pop-up centre facon Notion (infos, retour, image,
//     commentaires) avec edition et suppression.
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft, RefreshCw, Search, X, ExternalLink, Pencil, Trash2, Check,
  MessageSquare, Inbox, Loader, CircleCheck, Replace, ImagePlus, Ban,
} from "lucide-react";
import { ACTION_OPTIONS } from "../../lib/fbResolve";
import { uploadImageToR2 } from "../../lib/uploadImageClient";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import styles from "./TicketsManager.module.css";

type ToastType = "success" | "error" | "partial";

interface Props {
  onClose: () => void;
  showToast: (message: string, type: ToastType) => void;
  onCount?: (n: number) => void;
  autoOpenTicketId?: string | null;
}

interface Ticket {
  notionId: string;
  ticketId: string;
  title: string;
  element: string;
  action: string;
  page: string;
  text: string;
  status: string;
  format?: string;
  url?: string;
  timestamp: string;
  imageUrl?: string;
  json?: string;
}

interface Comment { id: string; text: string; createdTime: string; author?: string }

const CLAUDE_ICON = "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/claude-color.svg";
const STATUS_OPTIONS = ["À traiter", "En cours", "Traité", "À review", "Refusé", "À clarifier"];
const STATUS_SELECT = STATUS_OPTIONS.map((s) => ({ value: s, label: s }));
// Statuts « bloqués » : regroupés dans une vue dédiée.
const BLOCKED_STATUSES = ["À clarifier", "Refusé", "À review"];
const ACTION_SELECT = [{ value: "", label: "Aucune action" }, ...ACTION_OPTIONS.map((a) => ({ value: a, label: a }))];

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "À traiter": { bg: "rgba(245,158,11,0.12)", text: "#92400E", dot: "#F59E0B" },
  "En cours":  { bg: "rgba(59,130,246,0.12)", text: "#1E40AF", dot: "#3B82F6" },
  "Traité":    { bg: "rgba(90,122,79,0.14)",  text: "#3B5E32", dot: "#5A7A4F" },
  "Résolu":    { bg: "rgba(90,122,79,0.14)",  text: "#3B5E32", dot: "#5A7A4F" },
  "Refusé":    { bg: "rgba(180,44,42,0.12)",  text: "#7F1D1D", dot: "#B42C2A" },
  "À review":  { bg: "rgba(168,85,247,0.12)", text: "#6B21A8", dot: "#A855F7" },
  "Bloqué":    { bg: "rgba(249,115,22,0.12)", text: "#9A3412", dot: "#F97316" },
  "À clarifier": { bg: "rgba(168,85,247,0.12)", text: "#6B21A8", dot: "#A855F7" },
};
function statusColor(s: string) {
  return STATUS_COLORS[s] ?? { bg: "rgba(156,163,175,0.16)", text: "#4B5563", dot: "#9CA3AF" };
}
function StatusBadge({ status }: { status: string }) {
  const c = statusColor(status);
  return (
    <span className={styles.badge} style={{ background: c.bg, color: c.text }}>
      <span className={styles.badgeDot} style={{ background: c.dot }} />{status}
    </span>
  );
}
function fmtDateTime(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-CH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}
function fmtDate(iso: string): string {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("fr-CH", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
}

type Tab = "tous" | "À traiter" | "En cours" | "Traité" | "Bloqués";

// Cache memoire (persiste tant que l'onglet n'est pas recharge) : evite de
// recharger les 320+ tickets a chaque ouverture de la vue.
let ticketsCache: Ticket[] | null = null;

export default function TicketsManager({ onClose, showToast, onCount, autoOpenTicketId }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>(ticketsCache ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("tous");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(15); // affichage progressif
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, { data: Comment[]; loading: boolean; error?: string }>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editAction, setEditAction] = useState("");
  const [editText, setEditText] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  // Modale « Copier pour Claude Code »
  const [claudeOpen, setClaudeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCountRef = useRef(onCount);
  useEffect(() => { onCountRef.current = onCount; }, [onCount]);

  // Garde une trace si l'auto-ouverture a déjà été déclenchée (évite les répétitions).
  const autoOpenDone = useRef(false);

  // Garde le cache et la pastille de comptage synchronises.
  const commitTickets = useCallback((list: Ticket[]) => {
    ticketsCache = list;
    setTickets(list);
    onCountRef.current?.(list.length);
  }, []);

  // silent = rafraichissement en arriere-plan (pas de squelette) quand le cache existe.
  const loadTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Erreur ${res.status}`);
      }
      const data = await res.json();
      commitTickets((data.tickets ?? []) as Ticket[]);
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : "Impossible de charger les tickets.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [commitTickets]);

  // Au montage : si autoOpenTicketId est fourni, on vide le cache pour inclure
  // le ticket qui vient d'être créé ; sinon on utilise le cache s'il existe.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (autoOpenTicketId) {
      ticketsCache = null;
      loadTickets(false);
    } else {
      loadTickets(ticketsCache !== null);
    }
  }, [loadTickets]); // autoOpenTicketId lu une seule fois au montage

  // Affichage progressif : on repart a 15 quand le filtre ou la recherche change.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setVisibleCount(15); bodyRef.current?.scrollTo({ top: 0 }); }, [tab, search]);

  // Charge 15 cartes de plus quand la sentinelle entre dans la zone de scroll.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) setVisibleCount((c) => c + 15); },
      { root: bodyRef.current, rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visibleCount, tab, search, tickets.length]);

  const loadComments = useCallback(async (id: string) => {
    setComments((p) => ({ ...p, [id]: { data: p[id]?.data ?? [], loading: true } }));
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(id)}/comments`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments((p) => ({ ...p, [id]: { data: data.comments ?? [], loading: false } }));
    } catch {
      setComments((p) => ({ ...p, [id]: { data: [], loading: false, error: "Commentaires indisponibles." } }));
    }
  }, []);

  // Auto-ouverture : dès que le ticket cible apparaît dans la liste chargée,
  // attend 1 s puis ouvre sa carte détail (animation popIn existante).
  useEffect(() => {
    if (!autoOpenTicketId || autoOpenDone.current) return;
    const normalized = autoOpenTicketId.replace(/-/g, "");
    const ticket = tickets.find((t) => t.notionId.replace(/-/g, "") === normalized);
    if (!ticket) return;
    autoOpenDone.current = true;
    const timer = setTimeout(() => {
      setSelectedId(ticket.notionId);
      setEditMode(false);
      loadComments(ticket.notionId);
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoOpenTicketId, tickets, loadComments]);

  // Fermeture du detail avec Echap
  useEffect(() => {
    if (!selectedId && !lightboxUrl && !claudeOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (claudeOpen) setClaudeOpen(false);
      else if (lightboxUrl) setLightboxUrl(null);
      else { setSelectedId(null); setEditMode(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId, lightboxUrl, claudeOpen]);

  // Nettoyage du timer de réinitialisation de l'état « copié ».
  useEffect(() => () => { if (copyResetTimer.current) clearTimeout(copyResetTimer.current); }, []);

  function openDetail(t: Ticket) {
    setSelectedId(t.notionId);
    setEditMode(false);
    if (!comments[t.notionId]) loadComments(t.notionId);
  }
  function closeDetail() { setSelectedId(null); setEditMode(false); setClaudeOpen(false); }

  // Copie la commande (propriete formule « JSON » du ticket) et ouvre la modale
  // d'instructions pour la coller dans Claude Code.
  async function copyForClaude(cmd: string) {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
      copyResetTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false); // l'utilisateur pourra copier depuis l'encadré de la modale
    }
    setClaudeOpen(true);
  }

  function startEdit(t: Ticket) {
    // Un ticket bloqué (À clarifier / Refusé / À review) repasse à « À traiter »
    // dès qu'on l'édite (modifiable ensuite si besoin).
    setEditStatus(BLOCKED_STATUSES.includes(t.status) ? "À traiter" : t.status);
    setEditAction(t.action);
    setEditText(t.text);
    setEditImageUrl(t.imageUrl ?? "");
    setEditMode(true);
  }

  async function uploadEditImage(file: File) {
    if (!file.type.startsWith("image/")) return;
    setEditImageUploading(true);
    try {
      const url = await uploadImageToR2(file, "feedback");
      setEditImageUrl(url);
    } catch {
      showToast("L'image n'a pas pu être envoyée.", "error");
    } finally {
      setEditImageUploading(false);
    }
  }

  async function saveEdit(id: string) {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, action: editAction, text: editText, imageUrl: editImageUrl }),
      });
      if (!res.ok) throw new Error();
      commitTickets(
        tickets.map((t) => (t.notionId === id ? { ...t, status: editStatus, action: editAction, text: editText, imageUrl: editImageUrl } : t))
      );
      setEditMode(false);
      showToast("Ticket mis à jour.", "success");
    } catch {
      showToast("Mise à jour échouée.", "error");
    } finally {
      setSaving(false);
    }
  }

  // Édition inline du statut (vue « Bloqués ») : met à jour l'état choisi.
  async function updateStatusInline(t: Ticket, newStatus: string) {
    if (!newStatus || newStatus === t.status) return;
    const prev = tickets;
    commitTickets(tickets.map((x) => (x.notionId === t.notionId ? { ...x, status: newStatus } : x)));
    try {
      const res = await fetch(`/api/tickets?id=${encodeURIComponent(t.notionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      showToast(`${t.ticketId || "Ticket"} · ${newStatus}.`, "success");
    } catch {
      commitTickets(prev);
      showToast("Mise à jour échouée.", "error");
    }
  }

  async function deleteTicket(id: string) {
    setDeletingId(id);
    commitTickets(tickets.filter((t) => t.notionId !== id));
    closeDetail();
    try {
      const res = await fetch(`/api/tickets?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Ticket supprimé.", "success");
    } catch {
      showToast("Suppression échouée, rechargement…", "error");
      await loadTickets();
    } finally {
      setDeletingId(null);
    }
  }

  const counts = {
    total: tickets.length,
    aTraiter: tickets.filter((t) => t.status === "À traiter").length,
    enCours: tickets.filter((t) => t.status === "En cours").length,
    traite: tickets.filter((t) => ["Traité", "Résolu"].includes(t.status)).length,
    bloques: tickets.filter((t) => BLOCKED_STATUSES.includes(t.status)).length,
  };

  const q = search.trim().toLowerCase();
  const filtered = tickets.filter((t) => {
    const matchTab =
      tab === "tous" ? true :
      tab === "Traité" ? ["Traité", "Résolu"].includes(t.status) :
      tab === "Bloqués" ? BLOCKED_STATUSES.includes(t.status) :
      t.status === tab;
    // Recherche : Ticket ID, Titre, Retour
    const matchSearch = !q ||
      t.ticketId.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.element.toLowerCase().includes(q) ||
      t.text.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const shown = filtered.slice(0, visibleCount);
  const selected = tickets.find((t) => t.notionId === selectedId) ?? null;
  const isInitialLoading = loading && tickets.length === 0;
  const cmt = selected ? comments[selected.notionId] : undefined;

  const stats: { key: Tab; label: string; value: number; icon: React.ReactNode; color: string }[] = [
    { key: "tous", label: "Total", value: counts.total, icon: <Inbox size={16} />, color: "#062445" },
    { key: "À traiter", label: "À traiter", value: counts.aTraiter, icon: <Inbox size={16} />, color: "#F59E0B" },
    { key: "En cours", label: "En cours", value: counts.enCours, icon: <Loader size={16} />, color: "#3B82F6" },
    { key: "Traité", label: "Traités", value: counts.traite, icon: <CircleCheck size={16} />, color: "#5A7A4F" },
    { key: "Bloqués", label: "Bloqués", value: counts.bloques, icon: <Ban size={16} />, color: "#A855F7" },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onClose}>
          <ArrowLeft size={15} /> Retour à l&apos;aperçu
        </button>
        <div className={styles.titleWrap}>
          <MessageSquare size={17} strokeWidth={1.6} />
          <p className={styles.title}>Mes modifications</p>
        </div>
        <button className={styles.iconBtn} onClick={() => loadTickets()} disabled={loading} title="Rafraîchir" aria-label="Rafraîchir">
          <RefreshCw size={14} className={loading ? styles.spin : ""} />
        </button>
      </div>

      <div className={styles.body} ref={bodyRef}>
        {/* Indicateurs */}
        <div className={styles.stats}>
          {stats.map((s) => (
            <button
              key={s.key}
              className={`${styles.statCard} ${tab === s.key ? styles.statCardActive : ""}`}
              onClick={() => setTab(s.key)}
              style={tab === s.key ? { borderColor: s.color } : undefined}
            >
              <span className={styles.statIcon} style={{ color: s.color }}>{s.icon}</span>
              {isInitialLoading
                ? <span className={`${styles.skeleton} ${styles.skNum}`} />
                : <span className={styles.statValue}>{s.value}</span>}
              <span className={styles.statLabel}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div className={styles.searchRow}>
          <Search size={15} className={styles.searchIcon} aria-hidden="true" />
          <input
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par n° de ticket, titre ou retour…"
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch("")} aria-label="Effacer"><X size={14} /></button>
          )}
        </div>

        {/* Squelettes */}
        {isInitialLoading && (
          <div className={styles.grid} aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={styles.cardSkeleton}>
                <span className={`${styles.skeleton} ${styles.skBadge}`} />
                <span className={`${styles.skeleton} ${styles.skTitle}`} />
                <span className={`${styles.skeleton} ${styles.skLine}`} />
                <span className={`${styles.skeleton} ${styles.skLineShort}`} />
                <span className={`${styles.skeleton} ${styles.skDate}`} />
              </div>
            ))}
          </div>
        )}

        {!loading && error && <p className={styles.errorText}>{error}</p>}
        {!loading && !error && tickets.length === 0 && <p className={styles.muted}>Aucun ticket pour l&apos;instant.</p>}
        {!loading && !error && tickets.length > 0 && filtered.length === 0 && (
          <p className={styles.muted}>Aucun ticket ne correspond à ce filtre.</p>
        )}

        {!isInitialLoading && filtered.length > 0 && (
          <>
            <p className={styles.resultCount}>
              {filtered.length} ticket{filtered.length > 1 ? "s" : ""}
              {shown.length < filtered.length && ` · ${shown.length} affichés`}
            </p>
            <div className={styles.grid}>
              {shown.map((t) =>
                tab === "Bloqués" ? (
                  <div key={t.notionId} className={styles.card}>
                    <button className={styles.cardOpen} onClick={() => openDetail(t)}>
                      <div className={styles.cardTop}>
                        <StatusBadge status={t.status} />
                        {t.ticketId && <span className={styles.cardId}>{t.ticketId}</span>}
                      </div>
                      <p className={styles.cardTitle}>{t.title || t.element || "Sans titre"}</p>
                      {t.element && <span className={styles.targetTag}>{t.element}</span>}
                      {t.text && <p className={styles.cardText}>{t.text}</p>}
                      {t.imageUrl && (
                        <span className={styles.cardThumb}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={t.imageUrl} alt="" className={styles.cardThumbImg} />
                        </span>
                      )}
                      <div className={styles.cardFoot}>
                        <span className={styles.cardDate}>{fmtDate(t.timestamp)}</span>
                      </div>
                    </button>
                    <div className={styles.cardStatusEdit}>
                      <span className={styles.cardStatusLabel}>État</span>
                      <div className={styles.cardStatusSelect}>
                        <CustomSelect
                          name={`status-${t.notionId}`}
                          size="sm"
                          options={STATUS_SELECT}
                          value={t.status}
                          onChange={(v) => updateStatusInline(t, v)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <button key={t.notionId} className={styles.card} onClick={() => openDetail(t)}>
                    <div className={styles.cardTop}>
                      <StatusBadge status={t.status} />
                      {t.ticketId && <span className={styles.cardId}>{t.ticketId}</span>}
                    </div>
                    <p className={styles.cardTitle}>{t.title || t.element || "Sans titre"}</p>
                    {t.element && <span className={styles.targetTag}>{t.element}</span>}
                    {t.text && <p className={styles.cardText}>{t.text}</p>}
                    {t.imageUrl && (
                      <span className={styles.cardThumb}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={t.imageUrl} alt="" className={styles.cardThumbImg} />
                      </span>
                    )}
                    <div className={styles.cardFoot}>
                      <span className={styles.cardDate}>{fmtDate(t.timestamp)}</span>
                    </div>
                  </button>
                )
              )}
            </div>
            {shown.length < filtered.length && (
              <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true">
                <span className={`${styles.skeleton} ${styles.skMore}`} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail ticket — pop-up centre */}
      {selected && (
        <div className={styles.detailOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeDetail(); }}>
          <div className={styles.detail} role="dialog" aria-label="Détail du ticket">
            <div className={styles.detailBar}>
              <div className={styles.detailBarActions}>
                {!editMode && selected.json && (
                  <button className={`${styles.detailBtn} ${styles.detailBtnClaude}`} onClick={() => copyForClaude(selected.json!)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={CLAUDE_ICON} alt="" className={styles.claudeIcon} />
                    Copier pour Claude Code
                  </button>
                )}
                {!editMode && (
                  <button className={styles.detailBtn} onClick={() => startEdit(selected)}>
                    <Pencil size={14} /> Éditer
                  </button>
                )}
                <button
                  className={`${styles.detailBtn} ${styles.detailBtnDanger}`}
                  onClick={() => deleteTicket(selected.notionId)}
                  disabled={deletingId === selected.notionId}
                >
                  <Trash2 size={14} /> Supprimer
                </button>
                <button className={styles.detailClose} onClick={closeDetail} aria-label="Fermer">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className={styles.detailScroll}>
              <h2 className={styles.detailTitle}>{selected.title || selected.element || "Sans titre"}</h2>

              {/* Ligne 1 : meta */}
              <div className={styles.metaRow}>
                {selected.ticketId && (
                  <div className={styles.metaItem}><span className={styles.metaKey}>N°</span><span className={styles.metaIdVal}>{selected.ticketId}</span></div>
                )}
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Date</span>
                  <span className={styles.metaVal}>{fmtDateTime(selected.timestamp)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Statut</span>
                  {editMode ? (
                    <div className={styles.editSelect}>
                      <CustomSelect name="ticketStatus" size="sm" options={STATUS_SELECT} value={editStatus} onChange={setEditStatus} />
                    </div>
                  ) : <StatusBadge status={selected.status} />}
                </div>
                {selected.format && (
                  <div className={styles.metaItem}><span className={styles.metaKey}>Format</span><span className={styles.metaTag}>{selected.format}</span></div>
                )}
                {selected.url && (
                  <a className={styles.openLink} href={selected.url} target="_blank" rel="noopener noreferrer" title="Ouvrir le bloc dans un nouvel onglet">
                    <ExternalLink size={13} /> Ouvrir
                  </a>
                )}
              </div>

              {/* Élément ciblé (tag premium) */}
              {selected.element && (
                <div className={styles.targetRow}>
                  <span className={styles.metaKey}>Élément ciblé</span>
                  <span className={styles.targetTagLg}>{selected.element}</span>
                </div>
              )}

              {/* Action editable */}
              {editMode && (
                <div className={styles.editField}>
                  <label className={styles.editLabel}>Action</label>
                  <div className={styles.editSelect}>
                    <CustomSelect name="ticketAction" size="sm" options={ACTION_SELECT} value={editAction} onChange={setEditAction} placeholder="Aucune action" />
                  </div>
                </div>
              )}

              {/* Ligne 2 : Retour */}
              <div className={styles.section}>
                <p className={styles.sectionLabel}>Retour</p>
                {editMode ? (
                  <textarea className={styles.editArea} value={editText} onChange={(e) => setEditText(e.target.value)} rows={5} />
                ) : (
                  <div className={styles.retourBox}>{selected.text || <span className={styles.muted}>Aucun texte.</span>}</div>
                )}
              </div>

              {/* Ligne 3 : Files & media */}
              {editMode ? (
                <div className={styles.section}>
                  <p className={styles.sectionLabel}>Image jointe</p>
                  <input
                    ref={editImageInputRef}
                    type="file"
                    accept="image/*"
                    className={styles.fileHidden}
                    onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadEditImage(f); e.target.value = ""; }}
                  />
                  {editImageUploading ? (
                    <div className={styles.imageEditBox}><span className={styles.muted}>Upload…</span></div>
                  ) : editImageUrl ? (
                    <div className={styles.imageEditWrap}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editImageUrl} alt="" className={styles.imageEditImg} />
                      <div className={styles.imageEditOverlay}>
                        <button type="button" className={styles.imageEditBtn} onClick={() => editImageInputRef.current?.click()}>
                          <Replace size={14} /> Remplacer
                        </button>
                        <button type="button" className={`${styles.imageEditBtn} ${styles.imageEditBtnDanger}`} onClick={() => setEditImageUrl("")}>
                          <Trash2 size={14} /> Supprimer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className={styles.addImageBox} onClick={() => editImageInputRef.current?.click()}>
                      <ImagePlus size={20} />
                      <span>Ajouter une image</span>
                    </button>
                  )}
                </div>
              ) : selected.imageUrl ? (
                <div className={styles.section}>
                  <p className={styles.sectionLabel}>Files &amp; media</p>
                  <button className={styles.mediaThumb} onClick={() => setLightboxUrl(selected.imageUrl!)} aria-label="Agrandir l'image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selected.imageUrl} alt="" className={styles.mediaThumbImg} />
                  </button>
                </div>
              ) : null}

              {editMode && (
                <div className={styles.editActions}>
                  <button className={styles.cancelBtn} onClick={() => setEditMode(false)} disabled={saving}>Annuler</button>
                  <button className={styles.saveBtn} onClick={() => saveEdit(selected.notionId)} disabled={saving}>
                    {saving ? "Enregistrement…" : <><Check size={14} /> Enregistrer</>}
                  </button>
                </div>
              )}

              {/* Ligne 4 : commentaires */}
              {!editMode && (
                <div className={styles.section}>
                  <p className={styles.sectionLabel}><MessageSquare size={13} /> Commentaires</p>
                  {cmt?.loading && <p className={styles.muted}>Chargement…</p>}
                  {cmt?.error && <p className={styles.errorText}>{cmt.error}</p>}
                  {!cmt?.loading && (cmt?.data.length ?? 0) === 0 && !cmt?.error && (
                    <p className={styles.muted}>Aucun commentaire sur ce ticket.</p>
                  )}
                  {(cmt?.data.length ?? 0) > 0 && (
                    <ul className={styles.thread}>
                      {cmt!.data.map((c) => (
                        <li key={c.id} className={styles.threadItem}>
                          <div className={styles.threadHead}>
                            <span className={styles.threadAuthor}>{c.author || "Équipe"}</span>
                            <span className={styles.threadDate}>{fmtDateTime(c.createdTime)}</span>
                          </div>
                          <p className={styles.threadText}>{c.text}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale d'instructions : coller la commande dans Claude Code */}
      {claudeOpen && selected && (
        <div className={styles.claudeOverlay} onClick={(e) => { if (e.target === e.currentTarget) setClaudeOpen(false); }}>
          <div className={styles.claudeModal} role="dialog" aria-label="Coller dans Claude Code">
            <button className={styles.claudeClose} onClick={() => setClaudeOpen(false)} aria-label="Fermer"><X size={18} /></button>
            <div className={styles.claudeHead}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CLAUDE_ICON} alt="Claude Code" className={styles.claudeHeadIcon} />
              <div>
                <p className={styles.claudeTitle}>Coller dans Claude&nbsp;Code</p>
                <p className={styles.claudeSubtitle}>
                  {copied ? "Commande copiée dans le presse-papiers ✓" : "Copiez la commande ci-dessous, puis collez-la dans Claude Code."}
                </p>
              </div>
            </div>

            <ol className={styles.claudeSteps}>
              <li><span className={styles.claudeStepNum}>1</span> Ouvrez <strong>Claude&nbsp;Code</strong> (terminal, application ou claude.ai/code).</li>
              <li><span className={styles.claudeStepNum}>2</span> Collez la commande (<kbd>Cmd/Ctrl</kbd> + <kbd>V</kbd>) puis validez.</li>
              <li><span className={styles.claudeStepNum}>3</span> Claude implémente le changement décrit par ce ticket.</li>
            </ol>

            <pre className={styles.claudeCmd}>{selected.json}</pre>

            <div className={styles.claudeActions}>
              <button className={styles.claudeCopyBtn} onClick={() => copyForClaude(selected.json!)}>
                {copied ? <><Check size={14} /> Copié</> : <><Replace size={14} /> Copier la commande</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className={styles.lightbox} onClick={() => setLightboxUrl(null)} role="button" tabIndex={0} aria-label="Fermer l'image">
          <button className={styles.lightboxClose} onClick={() => setLightboxUrl(null)} aria-label="Fermer"><X size={20} /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxUrl} alt="" className={styles.lightboxImg} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
