"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import styles from "./AboutHero.module.css";

interface AboutHeroProps {
  photoUrl?: string;
  photoAlt?: string;
}

export default function AboutHero({
  photoUrl,
  photoAlt = "Mireille Dayer, fondatrice de Swiss Serenity Plus",
}: AboutHeroProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const photo = photoRef.current;
    if (!card || !photo) return;

    const raf = requestAnimationFrame(() => {
      card.classList.add(styles.visible);
      setTimeout(() => photo.classList.add(styles.visible), 120);
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.breadcrumbWrap}>
        <Breadcrumb
          items={[{ label: "Accueil", href: "/" }, { label: "À propos" }]}
        />
      </div>

      <div className={styles.heroGrid}>
        <div className={`${styles.textCard} ${styles.animate}`} ref={cardRef}>
          <h1 className={styles.h1}>Mireille Dayer</h1>
          <p className={styles.tagline}>
            votre bras droit de confiance pour le développement et
            l&apos;organisation de vos activités
          </p>
        </div>

        <div className={`${styles.photoWrap} ${styles.animate}`} ref={photoRef}>
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={photoAlt}
              fill
              className={styles.photo}
              priority
            />
          ) : (
            <div className={styles.placeholder} aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  );
}
