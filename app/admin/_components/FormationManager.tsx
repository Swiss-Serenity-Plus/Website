"use client";

// Gestionnaire de formations : liste les items de la base Notion
// (Notion_Training_Database_ID) et affiche, dans le même layout, le détail d'une
// ressource (vidéo Tella + corps de page converti en HTML).
//
// La ressource ouverte est pilotée par `openId` (fourni par AdminConsole, qui
// synchronise l'URL /admin/formation/<id>). Ce composant ne décide pas de l'URL :
// il remonte les intentions de navigation (ouvrir un item, revenir à la liste,
// fermer) via les callbacks, et reflète l'état `openId` reçu.
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bookmark, ArrowLeft, X, Play, Loader, AlertCircle, ExternalLink,
} from "lucide-react";
import styles from "./FormationManager.module.css";

interface FormationItem {
  id: string;
  title: string;
  tellaUrl: string;
  createdTime: string;
}

interface Props {
  openId: string | null;
  onOpenItem: (id: string) => void;
  onBack: () => void;
  onClose: () => void;
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-CH", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

// URL de partage Tella → URL embed iframe.
// Ex : https://www.tella.tv/video/{id} → https://www.tella.tv/video/{id}/embed
function toEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("/embed")) return url;
  return url.replace(/\/$/, "") + "/embed";
}

export default function FormationManager({ openId, onOpenItem, onBack, onClose }: Props) {
  const [items, setItems] = useState<FormationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyLoading, setBodyLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // La ressource ouverte est dérivée de openId + des items chargés.
  const selected = openId ? items.find((i) => i.id === openId) ?? null : null;

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/training-posts");
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadItems(); }, [loadItems]);

  // Charge le corps de la ressource quand openId change.
  const loadBody = useCallback(async (id: string) => {
    setBodyHtml("");
    setBodyLoading(true);
    try {
      const res = await fetch(`/api/training-posts?${new URLSearchParams({ id })}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBodyHtml(data.html ?? "");
    } catch {
      setBodyHtml("");
    } finally {
      setBodyLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (openId) loadBody(openId);
    else setBodyHtml("");
  }, [openId, loadBody]);

  // Délégation d'événement pour les boutons « Copier » dans les blocs de code
  // injectés via dangerouslySetInnerHTML. Feedback visuel 1,5 s.
  useEffect(() => {
    const container = bodyRef.current;
    if (!container || !bodyHtml) return;
    function handleClick(e: MouseEvent) {
      const btn = (e.target as Element).closest<HTMLElement>("[data-copy]");
      if (!btn) return;
      const text = btn.dataset.copy ?? "";
      navigator.clipboard.writeText(text).catch(() => {});
      const prev = btn.textContent;
      btn.textContent = "✓";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = prev; btn.classList.remove("copied"); }, 1500);
    }
    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [bodyHtml]);

  return (
    <div className={styles.panel}>
      {/* En-tête */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          {selected && (
            <button className={styles.backBtn} onClick={onBack} aria-label="Retour à la liste">
              <ArrowLeft size={15} />
            </button>
          )}
          <Bookmark size={17} className={styles.headerIcon} aria-hidden />
          <h2 className={styles.title}>
            {selected ? selected.title : "Formation"}
          </h2>
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
          <X size={18} />
        </button>
      </div>

      {/* Corps */}
      <div className={styles.body}>
        {/* Vue liste */}
        {!selected && (
          <>
            {loading && (
              <div className={styles.centered}>
                <Loader size={22} className={styles.spin} />
                <p className={styles.hint}>Chargement des formations…</p>
              </div>
            )}
            {!loading && error && (
              <div className={styles.centered}>
                <AlertCircle size={22} className={styles.errorIcon} />
                <p className={styles.hint}>{error}</p>
                <button className={styles.retryBtn} onClick={loadItems}>Réessayer</button>
              </div>
            )}
            {!loading && !error && items.length === 0 && (
              <div className={styles.centered}>
                <Bookmark size={32} className={styles.emptyIcon} />
                <p className={styles.hint}>Aucune formation disponible.</p>
              </div>
            )}
            {!loading && !error && items.length > 0 && (
              <ul className={styles.list}>
                {items.map((item) => (
                  <li key={item.id}>
                    <button className={styles.card} onClick={() => onOpenItem(item.id)}>
                      <span className={styles.cardIconWrap}>
                        <Play size={16} strokeWidth={1.8} className={styles.cardIcon} />
                      </span>
                      <span className={styles.cardContent}>
                        <span className={styles.cardTitle}>{item.title}</span>
                        <span className={styles.cardMeta}>{fmtDate(item.createdTime)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* Vue détail */}
        {selected && (
          <div className={styles.detail}>
            {/* Vidéo Tella principale (propriété Notion) */}
            {selected.tellaUrl && (
              <TellaVideo url={selected.tellaUrl} title={selected.title} />
            )}

            {/* Corps de la page (blocs Notion → HTML, avec iframes inline pour les
                autres vidéos embarquées dans le corps) */}
            <div className={styles.bodySection}>
              {bodyLoading && (
                <div className={styles.centered}>
                  <Loader size={18} className={styles.spin} />
                </div>
              )}
              {!bodyLoading && bodyHtml && (
                <div
                  ref={bodyRef}
                  className={styles.bodyContent}
                  // Contenu Notion admin uniquement, jamais soumis par des visiteurs
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              )}
              {!bodyLoading && !bodyHtml && !selected.tellaUrl && (
                <p className={styles.hint}>Aucun contenu disponible pour cette formation.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant vidéo Tella : squelette shimmer pendant le chargement, puis
// affiche l'iframe. L'iframe reste dans le DOM (visibility:hidden) pendant
// le chargement pour que onLoad se déclenche correctement.
function TellaVideo({ url, title }: { url: string; title: string }) {
  const embedUrl = toEmbedUrl(url);
  const [loaded, setLoaded] = useState(false);

  return (
    <div>
      <div className={styles.videoWrap}>
        {!loaded && <div className={`${styles.skeleton} ${styles.skVideo}`} />}
        <iframe
          src={embedUrl}
          className={styles.video}
          style={loaded ? undefined : { visibility: "hidden", position: "absolute", inset: 0 }}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.videoLink}
      >
        <ExternalLink size={13} />
        Ouvrir dans Tella
      </a>
    </div>
  );
}
