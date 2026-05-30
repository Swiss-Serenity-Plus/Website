"use client";

import { useEffect, useRef } from "react";
import { Handshake, Target, Lock, HandHeart } from "lucide-react";
import styles from "./MesValeurs.module.css";

const cards = [
  {
    icon: Handshake,
    title: "Engagement",
    desc: "Une présence impliquée, réactive et pleinement investie.",
  },
  {
    icon: Target,
    title: "Rigueur",
    desc: "Précision, méthode et exigence dans le moindre détail.",
  },
  {
    icon: Lock,
    title: "Discrétion",
    desc: "Discrétion et confidentialité au cœur de tous les échanges.",
  },
  {
    icon: HandHeart,
    title: "Bienveillance",
    desc: "Une approche humaine, attentive et respectueuse.",
  },
];

export default function MesValeurs() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const targets = section.querySelectorAll<HTMLElement>("[data-delay]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.transitionDelay = `${el.dataset.delay ?? "0"}ms`;
            el.classList.add(styles.visible);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.2 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.inner}>
        <div className={`${styles.header} ${styles.animate}`} data-delay="0">
          <span className={styles.traitDore} aria-hidden="true" />
          <h2 className={styles.h2}>Mes valeurs</h2>
          <div className={styles.diamondDivider} aria-hidden="true">
            <span className={styles.line} />
            <span className={styles.diamond} />
            <span className={styles.line} />
          </div>
        </div>

        <div className={styles.grille}>
          {cards.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className={`${styles.card} ${styles.animate}`}
              data-delay={String(80 + i * 80)}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{title}</h3>
                <Icon
                  size={28}
                  strokeWidth={1.5}
                  color="var(--c-accent-secondary)"
                  aria-hidden="true"
                />
              </div>
              <p className={styles.cardDesc}>{desc}</p>
            </div>
          ))}

          <div
            className={`${styles.quoteCard} ${styles.animate}`}
            data-delay="480"
          >
            <span className={styles.guillemet} aria-hidden="true">
              &ldquo;
            </span>
            <div className={styles.quoteBody}>
              <p className={styles.citation}>
                Professionnels comme Particuliers, mon engagement reste le
                même&nbsp;: exigence, attention et implication dans chaque
                collaboration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
