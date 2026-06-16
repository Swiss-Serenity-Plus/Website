"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./PreviewHighlight.module.css";

export default function PreviewHighlight() {
  const params = useSearchParams();
  const elementId = params.get("fb-preview");
  const note = params.get("fb-note");
  const annotationRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (!elementId || dismissedRef.current) return;

    const target = document.getElementById(elementId);
    if (!target) return;

    // Inject fbSweep keyframes (same as FeedbackWidget)
    if (!document.getElementById("fb-highlight-style")) {
      const style = document.createElement("style");
      style.id = "fb-highlight-style";
      style.textContent = `
        @keyframes fbSweep {
          0%   { transform: translateX(-100%) skewX(-12deg); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateX(350%) skewX(-12deg); opacity: 0; }
        }
        [data-feedback-highlight] {
          position: fixed; pointer-events: none; z-index: 8990;
          border-radius: 14px;
          box-shadow: 0 0 0 2px #977b57, 0 0 0 5px rgba(151,123,87,0.18), 0 0 28px rgba(151,123,87,0.4), inset 0 0 20px rgba(151,123,87,0.06);
          overflow: hidden;
        }
        [data-feedback-highlight]::after {
          content: ''; position: absolute; top: 0; left: 0; width: 45%; height: 100%;
          background: linear-gradient(90deg, transparent 0%, rgba(151,123,87,0.22) 50%, transparent 100%);
          animation: fbSweep 2s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }

    // Create overlay pinned to target element
    const overlay = document.createElement("div");
    overlay.setAttribute("data-feedback-highlight", "true");
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    function positionOverlay() {
      if (!target) return;
      const rect = target.getBoundingClientRect();
      overlay.style.top = `${rect.top - 4}px`;
      overlay.style.left = `${rect.left - 4}px`;
      overlay.style.width = `${rect.width + 8}px`;
      overlay.style.height = `${rect.height + 8}px`;
    }

    // Scroll to element, then position
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => positionOverlay(), 400);

    const onScroll = () => positionOverlay();
    const onResize = () => positionOverlay();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Position annotation bubble relative to target
    function positionAnnotation() {
      if (!annotationRef.current || !target) return;
      const rect = target.getBoundingClientRect();
      const ann = annotationRef.current;
      const annRect = ann.getBoundingClientRect();
      const top = rect.bottom + 16;
      let left = rect.left + rect.width / 2 - annRect.width / 2;
      // Keep within viewport
      const vw = window.innerWidth;
      if (left + annRect.width + 16 > vw) left = vw - annRect.width - 16;
      if (left < 16) left = 16;
      ann.style.top = `${top}px`;
      ann.style.left = `${left}px`;
    }
    setTimeout(() => positionAnnotation(), 450);
    window.addEventListener("scroll", () => positionAnnotation(), { passive: true });
    window.addEventListener("resize", () => positionAnnotation());

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      overlay.remove();
      document.getElementById("fb-highlight-style")?.remove();
    };
  }, [elementId]);

  function dismiss() {
    dismissedRef.current = true;
    overlayRef.current?.remove();
    annotationRef.current?.remove();
    document.getElementById("fb-highlight-style")?.remove();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!elementId) return null;

  return (
    <div
      ref={annotationRef}
      className={styles.annotation}
      role="status"
      aria-live="polite"
    >
      <div className={styles.cursor}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 2L4 17L8 13L11 20L13 19L10 12L15 12L4 2Z" fill="#062445" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className={styles.bubble}>
        <span className={styles.label}>Modification</span>
        {note && <p className={styles.note}>{note}</p>}
      </div>
      <button className={styles.close} onClick={dismiss} aria-label="Fermer">
        ×
      </button>
    </div>
  );
}
