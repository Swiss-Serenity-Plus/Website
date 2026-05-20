// ServiceCard — card signature pour chaque pilier. Cliquable, hover avec élévation et bordure taupe.
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import styles from "./ServiceCard.module.css";

interface ServiceCardProps {
  title: string;
  shortDescription: string;
  href: string;
  Icon?: LucideIcon;
  audience: "pro" | "perso";
  cta?: string;
}

export default function ServiceCard({
  title,
  shortDescription,
  href,
  Icon,
  audience,
  cta = "En savoir plus",
}: ServiceCardProps) {
  return (
    <Link href={href} className={styles.card} aria-label={`${title} — ${cta}`}>
      <div className={styles.cardTop}>
        {Icon && (
          <div className={styles.iconWrap} aria-hidden="true">
            <Icon size={28} color="var(--c-accent-secondary)" strokeWidth={1.5} />
          </div>
        )}
        <span className={`${styles.tag} ${audience === "perso" ? styles.tagPerso : styles.tagPro}`}>
          {audience === "pro" ? "Entreprises" : "Particuliers"}
        </span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{shortDescription}</p>
      <span className={styles.cta}>
        {cta} <ArrowRight size={15} className={styles.arrow} aria-hidden="true" strokeWidth={2} />
      </span>
    </Link>
  );
}
