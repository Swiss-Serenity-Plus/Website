// FilloutForm — formulaire Fillout embarqué (embed standard, resize dynamique).
// Le script Fillout n'initialise l'embed qu'au moment où il s'exécute. Avec
// next/script (dédupliqué) ou un script global déjà chargé, une navigation
// client (SPA) monte l'embed APRÈS le scan → le cadre reste vide (ticket MIR-359).
// On (ré)injecte donc le script à chaque montage pour forcer un nouveau scan,
// avec un état de chargement et un repli si le formulaire ne s'affiche pas.
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FilloutForm.module.css";

const FILLOUT_ID = "c9GoPSnHwvus";
const FILLOUT_SRC = "https://server.fillout.com/embed/v1/";

export default function FilloutForm() {
  const embedRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const embed = embedRef.current;
    if (!embed) return;

    // Masque le loader dès que Fillout a injecté son iframe dans l'embed.
    const observer = new MutationObserver(() => {
      if (embed.querySelector("iframe")) {
        setLoaded(true);
        observer.disconnect();
      }
    });
    observer.observe(embed, { childList: true, subtree: true });

    // (Ré)injection du script → nouveau scan de l'embed monté.
    const script = document.createElement("script");
    script.src = FILLOUT_SRC;
    script.async = true;
    document.body.appendChild(script);

    // Filet de sécurité : propose un repli si rien ne s'affiche.
    const timeout = window.setTimeout(() => {
      if (!embed.querySelector("iframe")) setFailed(true);
    }, 8000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
      script.remove();
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <div
        ref={embedRef}
        className={styles.embed}
        data-fillout-id={FILLOUT_ID}
        data-fillout-embed-type="standard"
        data-fillout-inherit-parameters=""
        data-fillout-dynamic-resize=""
      />
      {!loaded && (
        <div className={styles.state} aria-live="polite">
          {failed ? (
            <p className={styles.fallback}>
              Le formulaire met du temps à s&rsquo;afficher.{" "}
              <a href={`https://forms.fillout.com/t/${FILLOUT_ID}`} target="_blank" rel="noopener noreferrer">
                Ouvrir le formulaire de contact
              </a>{" "}
              ou écrivez-nous directement à{" "}
              <a href="mailto:mireille.dayer@swiss-serenity-plus.ch">mireille.dayer@swiss-serenity-plus.ch</a>.
            </p>
          ) : (
            <p className={styles.loading}>
              <span className={styles.spinner} aria-hidden="true" />
              Chargement du formulaire&hellip;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
