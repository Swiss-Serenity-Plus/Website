"use client";

import { useRef } from "react";
import styles from "./Footer.module.css";

const LIFT     = -8;    // px, vers le haut
const SCALE    = 1.15;
const FALLOFF  = 0.45;
const EASE_IN  = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_OUT = "cubic-bezier(0.34, 3.85, 0.64, 1)";

const FLAGS = [
  {
    title: "Français",
    svg: (
      <svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="1" height="2" fill="#002395"/>
        <rect x="1" width="1" height="2" fill="#EDEDED"/>
        <rect x="2" width="1" height="2" fill="#ED2939"/>
      </svg>
    ),
  },
  {
    title: "Deutsch",
    svg: (
      <svg viewBox="0 0 5 3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="5" height="1" fill="#000000"/>
        <rect y="1" width="5" height="1" fill="#DD0000"/>
        <rect y="2" width="5" height="1" fill="#FFCE00"/>
      </svg>
    ),
  },
  {
    title: "English",
    svg: (
      <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="60" height="30" fill="#012169"/>
        <line x1="0" y1="0" x2="60" y2="30" stroke="white" strokeWidth="9"/>
        <line x1="60" y1="0" x2="0" y2="30" stroke="white" strokeWidth="9"/>
        <line x1="0" y1="0" x2="60" y2="30" stroke="#C8102E" strokeWidth="5"/>
        <line x1="60" y1="0" x2="0" y2="30" stroke="#C8102E" strokeWidth="5"/>
        <rect x="0" y="10" width="60" height="10" fill="white"/>
        <rect x="25" y="0" width="10" height="30" fill="white"/>
        <rect x="0" y="12" width="60" height="6" fill="#C8102E"/>
        <rect x="27" y="0" width="6" height="30" fill="#C8102E"/>
      </svg>
    ),
  },
];

export default function FooterLanguageFlags() {
  const groupRef = useRef<HTMLDivElement>(null);

  function applyHover(activeIdx: number) {
    const items = groupRef.current
      ? (Array.from(groupRef.current.children) as HTMLElement[])
      : [];
    items.forEach((el, i) => {
      const dist = Math.abs(i - activeIdx);
      el.style.transitionTimingFunction = EASE_IN;
      el.style.setProperty("--shift", (LIFT * Math.pow(FALLOFF, dist)).toFixed(3) + "px");
      el.style.setProperty("--scale-active", i === activeIdx ? String(SCALE) : "1");
    });
  }

  function resetHover() {
    const items = groupRef.current
      ? (Array.from(groupRef.current.children) as HTMLElement[])
      : [];
    items.forEach((el) => {
      el.style.transitionTimingFunction = EASE_OUT;
      el.style.setProperty("--shift", "0px");
      el.style.setProperty("--scale-active", "1");
    });
  }

  return (
    <div className={styles.languages} id="b-footer-languages" data-fb-label="Langues parlées (drapeaux)">
      <p className={styles.langLabel}>Langues parlées</p>
      <div className={styles.flags} ref={groupRef} onMouseLeave={resetHover}>
        {FLAGS.map((flag, i) => (
          <span
            key={flag.title}
            className={styles.flag}
            title={flag.title}
            aria-label={flag.title}
            onMouseEnter={() => applyHover(i)}
          >
            {flag.svg}
          </span>
        ))}
      </div>
    </div>
  );
}
