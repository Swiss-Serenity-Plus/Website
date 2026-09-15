// ServiceCard — card signature pour chaque pilier. Cliquable, hover avec élévation et bordure taupe.
import Image from "next/image";
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { fbSlug } from "../../lib/fbToken";
import styles from "./ServiceCard.module.css";

interface ServiceCardProps {
  title: string;
  shortDescription: string;
  href: string;
  Icon?: LucideIcon;
  iconImage?: string;
  iconScale?: number;
  audience: "pro" | "perso";
  cta?: string;
  /** Étiquette personnalisée, à la place du libellé d'audience par défaut. */
  tag?: string;
  /** Identifiant court explicite, pour distinguer deux cartes qui pointent vers la même page. */
  slug?: string;
}

export default function ServiceCard({
  title,
  shortDescription,
  href,
  Icon,
  iconImage,
  iconScale,
  audience,
  cta = "En savoir plus",
  tag,
  slug: slugProp,
}: ServiceCardProps) {
  const slug = slugProp ?? href.split("/").filter(Boolean).pop() ?? fbSlug(title);
  const tagLabel = tag ?? (audience === "pro" ? "Entreprises" : "Particuliers");
  const tagFbLabel = tagLabel.replace(/\n/g, " ");
  return (
    <Link
      href={href}
      className={styles.card}
      aria-label={`${title} — ${cta}`}
      id={`b-service-${slug}`}
      data-fb-container={`Carte service « ${title} »`}
    >
      <div className={styles.cardTop}>
        {(Icon || iconImage) && (
          <div className={styles.iconWrap} aria-hidden="true" data-fb-label="Icône">
            {Icon ? (
              <Icon size={28} color="var(--c-accent-secondary)" strokeWidth={1.5} style={iconScale ? { transform: `scale(${iconScale})` } : undefined} />
            ) : (
              <Image
                src={iconImage!}
                alt=""
                width={40}
                height={40}
                className={styles.iconImg}
                style={iconScale ? { transform: `scale(${iconScale})` } : undefined}
              />
            )}
          </div>
        )}
        <span
          className={`${styles.tag} ${audience === "perso" ? styles.tagPerso : styles.tagPro} ${tag ? styles.tagCustom : ""}`}
          data-fb-label={`Étiquette « ${tagFbLabel} »`}
        >
          {tagLabel}
        </span>
      </div>
      {/* Les cartes portant une étiquette personnalisée sont les cartes mises en
          avant : leur titre est renforcé pour ressortir dans la grille. */}
      <h3 className={`${styles.title} ${tag ? styles.titleFeatured : ""}`}>{title}</h3>
      {shortDescription.split("\n\n").map((paragraph, i) => (
        <p key={i} className={styles.desc}>{paragraph}</p>
      ))}
      <span className={styles.cta} data-fb-label={`Bouton « ${cta} »`}>
        {cta} <ArrowRight size={15} className={styles.arrow} aria-hidden="true" strokeWidth={2} />
      </span>
    </Link>
  );
}
