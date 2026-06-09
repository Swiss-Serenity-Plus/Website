"use client";

// Gestionnaire de formations : affiche la liste des items de la base Notion
// Notion_Training_Database_ID et ouvre un pop-up avec l'iframe Tella + le corps
// de la page (markdown converti en HTML par l'API).
import { useState, useEffect, useCallback } from "react";
import {
  Bookmark, ArrowLeft, X, Play, Loader, AlertCircle,
} from "lucide-react";
import styles from "./FormationManager.module.css";

interface FormationItem {
  id: string;
  title: string;
  tellaUrl: string;
  createdTime: string;
}

interface Props {
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

// Convertit une URL de partage Tella en URL d'embed si nécessaire.
function toEmbedUrl(url: string): string {
  if (!url) return "";
  // Déjà une URL d'embed → on la garde
  if (url.includes("/embed")) return url;
  // https://www.tella.tv/video/{id} → https://www.tella.tv/video/{id}/embed
  return url.replace(/\/?$/, "/embed");
}

export default function FormationManager({ onClose }: Props) {
  const [items, setItems] = useState<FormationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<FormationItem | null>(null);
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyLoading, setBodyLoading] = useState(false);

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

  async function openItem(item: FormationItem) {
    setSelected(item);
    setBodyHtml("");
    setBodyLoading(true);
    try {
      const params = new URLSearchParams({ id: item.id, title: item.title });
      const res = await fetch(`/api/training-posts?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setBodyHtml(data.html ?? "");
    } catch {
      setBodyHtml("");
    } finally {
      setBodyLoading(false);
    }
  }

  function closeDetail() {
    setSelected(null);
    setBodyHtml("");
  }

  return (
    <div className={styles.panel}>
      {/* En-tête */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          {selected && (
            <button className={styles.backBtn} onClick={closeDetail} aria-label="Retour à la liste">
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
                    <button className={styles.card} onClick={() => openItem(item)}>
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
            {/* Iframe Tella */}
            {selected.tellaUrl && (
              <div className={styles.videoWrap}>
                <iframe
                  src={toEmbedUrl(selected.tellaUrl)}
                  className={styles.video}
                  title={selected.title}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>
            )}

            {/* Corps de la page */}
            <div className={styles.bodySection}>
              {bodyLoading && (
                <div className={styles.centered}>
                  <Loader size={18} className={styles.spin} />
                </div>
              )}
              {!bodyLoading && bodyHtml && (
                <div
                  className={styles.bodyContent}
                  // Contenu provenant de Notion (admin uniquement), non soumis par des utilisateurs
                  // eslint-disable-next-line react/no-danger
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
