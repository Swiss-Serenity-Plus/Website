"use client";

// Gestion des retours envoyes (tickets Notion) dans la zone d'apercu.
//   - Vue liste : indicateurs (total / a traiter / en cours / traites),
//     recherche, grille de cartes, squelettes de chargement.
//   - Vue detail : pop-up centre facon Notion (infos, retour, image,
//     commentaires) avec edition et suppression.
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft, RefreshCw, Search, X, ExternalLink, Pencil, Trash2, Check,
  MessageSquare, Inbox, Loader, CircleCheck,
} from "lucide-react";
import { ACTION_OPTIONS } from "../../lib/fbResolve";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
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
}

interface Comment { id: string; text: string; createdTime: string; author?: string }

const STATUS_OPTIONS = ["À traiter", "En cours", "Traité", "Bloqué", "Refusé", "À clarifier"];
const STATUS_SELECT = STATUS_OPTIONS.map((s) => ({ value: s, label: s }));
const ACTION_SELECT = [{ value: "", label: "Aucune action" }, ...ACTION_OPTIONS.map((a) => ({ value: a, label: a }))];

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
    return new Date(iso).toLocaleString("fr-CH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
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

  // Fermeture du detail avec Echap
  useEffect(() => {
    if (!selectedId && !lightboxUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lightboxUrl) setLightboxUrl(null);
      else { setSelectedId(null); setEditMode(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId, lightboxUrl]);

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
              {shown.map((t) => (
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
              ))}
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
