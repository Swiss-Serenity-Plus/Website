"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./AboutHero.module.css";

interface AboutHeroProps {
  photoUrl?: string;
  photoAlt?: string;
}

export default function AboutHero({
  photoUrl = "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/image.png",
  photoAlt = "Mireille Dayer, fondatrice de Swiss Serenity Plus",
}: AboutHeroProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = textRef.current;
    const photo = photoRef.current;
    if (!text || !photo) return;

    const raf = requestAnimationFrame(() => {
      text.classList.add(styles.visible);
      setTimeout(() => photo.classList.add(styles.visible), 120);
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.heroGrid}>
        {/* Colonne texte */}
        <div className={`${styles.textCol} ${styles.animate}`} ref={textRef}>
          <nav aria-label="Fil d'ariane" className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>Accueil</Link>
            <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
            <span className={styles.breadcrumbCurrent} aria-current="page">À propos</span>
          </nav>

          <span className={styles.traitDore} aria-hidden="true" />

          <h1 className={styles.h1}>Mireille<br />Dayer</h1>

          <p className={styles.tagline}>
            votre bras droit de confiance pour le développement et
            l&apos;organisation de vos activités
          </p>
        </div>

        {/* Colonne photo */}
        <div className={`${styles.photoWrap} ${styles.animate}`} ref={photoRef}>
          <Image
            src={photoUrl}
            alt={photoAlt}
            fill
            className={styles.photo}
            priority
          />
        </div>
      </div>
    </section>
  );
}
