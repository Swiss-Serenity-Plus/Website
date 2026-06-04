"use client";

// MountainDecor — décor atmosphérique de montagnes alpines ancré aux bords
// gauche/droit du viewport, révélé en douceur au scroll (corps de page, entre
// la hero et le footer). Présence discrète, jamais un contenu.
//
// Réglages visuels (largeur, opacité, flou, fondu) : variables CSS en haut de
// MountainDecor.module.css. Amplitude de parallaxe : constante ci-dessous.
//
// Note architecture : les sections du site ont des fonds opaques ; un calque
// réellement « derrière » serait masqué. Le décor est donc posé juste au-dessus
// des fonds de section (z-index bas), mais son bord intérieur est fondu à ~0 et
// son opacité très basse → le texte reste parfaitement lisible par-dessus.

import { useEffect, useRef } from "react";
import styles from "./MountainDecor.module.css";

const MOUNTAIN_SRC =
  "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/photos-site/Montagne%20-%20Swiss%20Serenity%20Plus.png";

// Amplitude du parallaxe vertical (fraction du scroll) et plafond en px.
const PARALLAX_AMP = 0.05;
const PARALLAX_MAX = 80;

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

export default function MountainDecor() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ticking = false;

    const update = () => {
      ticking = false;

      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight;

      // Enveloppe d'opacité : 0 sur la hero, montée dans le corps, puis
      // disparition une fois la section « À propos » passée → le décor n'est
      // plus visible quand on arrive sur l'encadré « Localisation ».
      const fadeDist = vh * 0.6;          // distance de fondu (~60% d'écran)
      const revealStart = vh * 0.7;       // révélation une fois la hero franchie
      const fadeIn = clamp((scrollY - revealStart) / fadeDist, 0, 1);

      // Disparition calée sur l'arrivée de la section « Localisation » : le
      // fondu se termine avant qu'elle n'atteigne le milieu du viewport.
      const boundary = document.getElementById("localisation");
      let fadeOut: number;
      if (boundary) {
        const top = boundary.getBoundingClientRect().top;
        fadeOut = clamp((top - vh * 0.6) / fadeDist, 0, 1);
      } else {
        const bottomDist = docH - (scrollY + vh);
        fadeOut = clamp(bottomDist / fadeDist, 0, 1);
      }

      root.style.setProperty("--reveal", (fadeIn * fadeOut).toFixed(3));

      // Parallaxe vertical léger (dérive plus lente que le contenu).
      if (!reduceMotion) {
        const py = clamp((revealStart - scrollY) * PARALLAX_AMP, -PARALLAX_MAX, PARALLAX_MAX);
        root.style.setProperty("--py", `${py.toFixed(1)}px`);
      }
    };

    // Throttle scroll/resize via requestAnimationFrame (transform/opacity only).
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.decor} aria-hidden="true">
      <div className={`${styles.side} ${styles.left}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MOUNTAIN_SRC} alt="" className={styles.img} loading="lazy" decoding="async" />
      </div>
      <div className={`${styles.side} ${styles.right}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MOUNTAIN_SRC} alt="" className={styles.img} loading="lazy" decoding="async" />
      </div>
    </div>
  );
}
