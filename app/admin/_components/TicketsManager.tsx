"use client";

// Gestion des retours envoyes (tickets Notion) dans la zone d'apercu.
//   - Vue liste : indicateurs (total / a traiter / en cours / traites),
//     recherche, filtres par avancement, liste dense.
//   - Vue detail : disposition facon Notion (infos, retour, image, commentaires)
//     avec edition et suppression.
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft, RefreshCw, Search, X, ExternalLink, Pencil, Trash2, Check,
  MessageSquare, Inbox, Loader, CircleCheck, Image as ImageIcon,
} from "lucide-react";
import { ACTION_OPTIONS } from "../../lib/fbResolve";
import styles from "./TicketsManager.module.css";

type ToastType = "success" | "error" | "partial";

interface Props {
  onClose: () => void;
  showToast: (message: string, type: ToastType) => void;
  onCount?: (n: number) => void;
}

interface Ticket {
  notionId: string;
  ticketId: string;
  element: string;
  action: string;
  page: string;
  text: string;
  status: string;
  format?: string;
  url?: string;
  timestamp: string;
  imageUrl?: string;
}

interface Comment { id: string; text: string; createdTime: string; author?: string }

const STATUS_OPTIONS = ["À traiter", "En cours", "Traité", "Bloqué", "Refusé", "À clarifier"];
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "À traiter": { bg: "rgba(245,158,11,0.12)", text: "#92400E", dot: "#F59E0B" },
  "En cours":  { bg: "rgba(59,130,246,0.12)", text: "#1E40AF", dot: "#3B82F6" },
  "Traité":    { bg: "rgba(90,122,79,0.14)",  text: "#3B5E32", dot: "#5A7A4F" },
  "Résolu":    { bg: "rgba(90,122,79,0.14)",  text: "#3B5E32", dot: "#5A7A4F" },
  "Refusé":    { bg: "rgba(180,44,42,0.12)",  text: "#7F1D1D", dot: "#B42C2A" },
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
    return new Date(iso).toLocaleString("fr-CH", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}
function fmtDate(iso: string): string {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("fr-CH", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
}

type Tab = "tous" | "À traiter" | "En cours" | "Traité";

export default function TicketsManager({ onClose, showToast, onCount }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("tous");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, { data: Comment[]; loading: boolean; error?: string }>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edition
  const [editMode, setEditMode] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editAction, setEditAction] = useState("");
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  const onCountRef = useRef(onCount);
  useEffect(() => { onCountRef.current = onCount; }, [onCount]);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Erreur ${res.status}`);
      }
      const data = await res.json();
      const list: Ticket[] = data.tickets ?? [];
      setTickets(list);
      onCountRef.current?.(list.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadTickets(); }, [loadTickets]);

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

  function openDetail(t: Ticket) {
    setSelectedId(t.notionId);
    setEditMode(false);
    if (!comments[t.notionId]) loadComments(t.notionId);
  }
  function closeDetail() { setSelectedId(null); setEditMode(false); }

  function startEdit(t: Ticket) {
    setEditStatus(t.status);
    setEditAction(t.action);
    setEditText(t.text);
    setEditMode(true);
  }

  async function saveEdit(id: string) {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, action: editAction, text: editText }),
      });
      if (!res.ok) throw new Error();
      setTickets((prev) => prev.map((t) => (t.notionId === id ? { ...t, status: editStatus, action: editAction, text: editText } : t)));
      setEditMode(false);
      showToast("Ticket mis à jour.", "success");
    } catch {
      showToast("Mise à jour échouée.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTicket(id: string) {
    setDeletingId(id);
    setTickets((prev) => prev.filter((t) => t.notionId !== id));
    onCountRef.current?.(tickets.length - 1);
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
  };

  const q = search.trim().toLowerCase();
  const filtered = tickets.filter((t) => {
    const matchTab =
      tab === "tous" ? true :
      tab === "Traité" ? ["Traité", "Résolu"].includes(t.status) :
      t.status === tab;
    const matchSearch = !q ||
      t.element.toLowerCase().includes(q) ||
      t.text.toLowerCase().includes(q) ||
      t.ticketId.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const selected = tickets.find((t) => t.notionId === selectedId) ?? null;

  const stats: { key: Tab; label: string; value: number; icon: React.ReactNode; color: string }[] = [
    { key: "tous", label: "Total", value: counts.total, icon: <Inbox size={16} />, color: "#062445" },
    { key: "À traiter", label: "À traiter", value: counts.aTraiter, icon: <Inbox size={16} />, color: "#F59E0B" },
    { key: "En cours", label: "En cours", value: counts.enCours, icon: <Loader size={16} />, color: "#3B82F6" },
    { key: "Traité", label: "Traités", value: counts.traite, icon: <CircleCheck size={16} />, color: "#5A7A4F" },
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
        <button className={styles.iconBtn} onClick={loadTickets} disabled={loading} title="Rafraîchir" aria-label="Rafraîchir">
          <RefreshCw size={14} className={loading ? styles.spin : ""} />
        </button>
      </div>

      <div className={styles.body}>
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
              <span className={styles.statValue}>{s.value}</span>
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
            placeholder="Rechercher un retour, un élément, un n° de ticket…"
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch("")} aria-label="Effacer"><X size={14} /></button>
          )}
        </div>

        {loading && tickets.length === 0 && <p className={styles.muted}>Chargement des tickets…</p>}
        {!loading && error && <p className={styles.errorText}>{error}</p>}
        {!loading && !error && tickets.length === 0 && <p className={styles.muted}>Aucun ticket pour l&apos;instant.</p>}
        {!loading && !error && tickets.length > 0 && filtered.length === 0 && (
          <p className={styles.muted}>Aucun ticket ne correspond à ce filtre.</p>
        )}

        {filtered.length > 0 && (
          <>
            <p className={styles.resultCount}>{filtered.length} ticket{filtered.length > 1 ? "s" : ""}</p>
            <ul className={styles.list}>
              {filtered.map((t) => {
                const c = statusColor(t.status);
                return (
                  <li key={t.notionId}>
                    <button className={styles.row} onClick={() => openDetail(t)}>
                      <span className={styles.rowDot} style={{ background: c.dot }} />
                      {t.ticketId && <span className={styles.rowId}>{t.ticketId}</span>}
                      <span className={styles.rowMain}>
                        <span className={styles.rowTitle}>{t.element || "Sans titre"}</span>
                        <span className={styles.rowSub}>{t.text}</span>
                      </span>
                      {t.imageUrl && <ImageIcon size={13} className={styles.rowImg} aria-hidden="true" />}
                      <span className={styles.rowStatus}><StatusBadge status={t.status} /></span>
                      <span className={styles.rowDate}>{fmtDate(t.timestamp)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {/* Detail ticket */}
      {selected && (
        <div className={styles.detailOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeDetail(); }}>
          <div className={styles.detail} role="dialog" aria-label="Détail du ticket">
            <div className={styles.detailBar}>
              <div className={styles.detailBarActions}>
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
              <h2 className={styles.detailTitle}>{selected.element || "Sans titre"}</h2>

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
                    <select className={styles.miniSelect} value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : <StatusBadge status={selected.status} />}
                </div>
                {selected.format && (
                  <div className={styles.metaItem}><span className={styles.metaKey}>Format</span><span className={styles.metaTag}>{selected.format}</span></div>
                )}
                {selected.url && (
                  <a className={styles.openLink} href={selected.url} target="_blank" rel="noopener noreferrer">
                    Ouvrir le bloc <ExternalLink size={13} />
                  </a>
                )}
              </div>

              {/* Action editable */}
              {editMode && (
                <div className={styles.editField}>
                  <label className={styles.editLabel}>Action</label>
                  <select className={styles.miniSelect} value={editAction} onChange={(e) => setEditAction(e.target.value)}>
                    <option value="">—</option>
                    {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
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
              {selected.imageUrl && (
                <div className={styles.section}>
                  <p className={styles.sectionLabel}>Files &amp; media</p>
                  <button className={styles.mediaThumb} onClick={() => setLightboxUrl(selected.imageUrl!)} aria-label="Agrandir l'image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selected.imageUrl} alt="" className={styles.mediaThumbImg} />
                  </button>
                </div>
              )}

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
                  <p className={styles.sectionLabel}>
                    <MessageSquare size={13} /> Commentaires
                  </p>
                  {comments[selected.notionId]?.loading && <p className={styles.muted}>Chargement…</p>}
                  {comments[selected.notionId]?.error && <p className={styles.errorText}>{comments[selected.notionId].error}</p>}
                  {!comments[selected.notionId]?.loading && (comments[selected.notionId]?.data.length ?? 0) === 0 && (
                    <p className={styles.muted}>Aucun commentaire sur ce ticket.</p>
                  )}
                  {(comments[selected.notionId]?.data.length ?? 0) > 0 && (
                    <ul className={styles.thread}>
                      {comments[selected.notionId].data.map((cm) => (
                        <li key={cm.id} className={styles.threadItem}>
                          <div className={styles.threadHead}>
                            <span className={styles.threadAuthor}>{cm.author || "Équipe"}</span>
                            <span className={styles.threadDate}>{fmtDateTime(cm.createdTime)}</span>
                          </div>
                          <p className={styles.threadText}>{cm.text}</p>
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
