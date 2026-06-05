"use client";

import { RefObject } from "react";
import { Monitor, Smartphone, Lock } from "lucide-react";
import styles from "./BrowserFrame.module.css";

export type Format = "desktop" | "mobile";

interface BrowserFrameProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  format: Format;
  onFormatChange: (f: Format) => void;
  currentPath: string;
  annotating: boolean;
  // Appele a chaque chargement de l'iframe avec le nouveau pathname.
  onLoad: (pathname: string) => void;
}

const SITE_DOMAIN = "swiss-serenity-plus.ch";

export default function BrowserFrame({
  iframeRef, format, onFormatChange, currentPath, annotating, onLoad,
}: BrowserFrameProps) {
  function handleLoad() {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      const path = frame.contentWindow?.location.pathname ?? "/";
      onLoad(path);
    } catch {
      // Same-origin attendu ; en cas d'echec on garde l'etat courant.
    }
  }

  return (
    <div className={`${styles.frame} ${format === "mobile" ? styles.frameMobile : ""}`}>
      <div className={styles.titleBar}>
        <div className={styles.dots} aria-hidden="true">
          <span className={styles.dot} style={{ background: "#FF5F57" }} />
          <span className={styles.dot} style={{ background: "#FEBC2E" }} />
          <span className={styles.dot} style={{ background: "#28C840" }} />
        </div>

        <div className={styles.urlBar}>
          <Lock size={11} className={styles.urlLock} aria-hidden="true" />
          <span className={styles.urlDomain}>{SITE_DOMAIN}</span>
          <span className={styles.urlPath}>{currentPath === "/" ? "" : currentPath}</span>
        </div>

        <div className={styles.formatSwitch} role="group" aria-label="Format d'affichage">
          <button
            type="button"
            className={`${styles.formatBtn} ${format === "desktop" ? styles.formatBtnActive : ""}`}
            onClick={() => onFormatChange("desktop")}
            aria-pressed={format === "desktop"}
            title="Vue ordinateur"
          >
            <Monitor size={15} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            className={`${styles.formatBtn} ${format === "mobile" ? styles.formatBtnActive : ""}`}
            onClick={() => onFormatChange("mobile")}
            aria-pressed={format === "mobile"}
            title="Vue mobile"
          >
            <Smartphone size={15} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div className={styles.viewport}>
        <iframe
          ref={iframeRef}
          src="/"
          title="Aperçu du site"
          className={`${styles.iframe} ${annotating ? styles.iframeAnnotating : ""}`}
          onLoad={handleLoad}
        />
      </div>
    </div>
  );
}
