"use client";

// Vue d'une ressource de formation sur sa route dédiée /admin/formation/[id].
// Réutilise les styles de FormationManager (vidéo Tella + corps HTML Notion) et
// la délégation des boutons « Copier » injectés via dangerouslySetInnerHTML.
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import fm from "../../_components/FormationManager.module.css";
import styles from "./resource.module.css";

interface Props {
  title: string;
  tellaUrl: string;
  html: string;
}

// URL de partage Tella → URL embed iframe.
function toEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("/embed")) return url;
  return url.replace(/\/$/, "") + "/embed";
}

export default function FormationResourceView({ title, tellaUrl, html }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Délégation d'événement pour les boutons « Copier » dans les blocs de code
  // injectés via dangerouslySetInnerHTML. Feedback visuel 1,5 s.
  useEffect(() => {
    const container = bodyRef.current;
    if (!container || !html) return;
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
  }, [html]);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <a href="/admin" className={styles.backLink}>
          <ArrowLeft size={15} />
          Retour à la console
        </a>

        <h1 className={styles.title}>{title || "Formation"}</h1>

        <div className={fm.detail}>
          {tellaUrl && <TellaVideo url={tellaUrl} title={title} />}

          <div className={fm.bodySection}>
            {html ? (
              <div
                ref={bodyRef}
                className={fm.bodyContent}
                // Contenu Notion admin uniquement, jamais soumis par des visiteurs
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              !tellaUrl && (
                <p className={fm.hint}>Aucun contenu disponible pour cette formation.</p>
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Vidéo Tella : squelette shimmer pendant le chargement, puis l'iframe.
function TellaVideo({ url, title }: { url: string; title: string }) {
  const embedUrl = toEmbedUrl(url);
  const [loaded, setLoaded] = useState(false);

  return (
    <div>
      <div className={fm.videoWrap}>
        {!loaded && <div className={`${fm.skeleton} ${fm.skVideo}`} />}
        <iframe
          src={embedUrl}
          className={fm.video}
          style={loaded ? undefined : { visibility: "hidden", position: "absolute", inset: 0 }}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className={fm.videoLink}>
        <ExternalLink size={13} />
        Ouvrir dans Tella
      </a>
    </div>
  );
}
