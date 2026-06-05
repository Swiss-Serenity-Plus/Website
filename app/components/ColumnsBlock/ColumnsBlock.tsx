// ColumnsBlock — générique 3 colonnes. Variants: default, numbered (.01 .02...), values, results.
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Container from "../Container/Container";
import { fbSlug } from "../../lib/fbToken";
import styles from "./ColumnsBlock.module.css";

interface Column {
  title: string;
  text: string;
  icon?: LucideIcon;
  image?: string;
}

interface ColumnsBlockProps {
  eyebrow?: string;
  title: string;
  description?: string;
  columns: Column[];
  variant?: "default" | "numbered" | "values" | "results";
  background?: "bg" | "surface";
  cols?: 2 | 3 | 4;
  headerImage?: string;
  wideHeader?: boolean;
}

const FB_BY_VARIANT: Record<string, { section: string; noun: string; prefix: string }> = {
  values: { section: "Section Valeurs", noun: "Valeur", prefix: "b-valeur" },
  numbered: { section: "Section Méthode (étapes)", noun: "Étape", prefix: "b-etape" },
  results: { section: "Section Résultats", noun: "Résultat", prefix: "b-resultat" },
  default: { section: "Section (colonnes)", noun: "Colonne", prefix: "b-colonne" },
};

export default function ColumnsBlock({
  eyebrow,
  title,
  description,
  columns,
  variant = "default",
  background = "bg",
  cols,
  headerImage,
  wideHeader = false,
}: ColumnsBlockProps) {
  const gridClass = cols === 2 ? styles.grid2 : cols === 4 ? styles.grid4 : styles.grid;
  const fb = FB_BY_VARIANT[variant] ?? FB_BY_VARIANT.default;
  return (
    <section className={`${styles.section} ${styles[`bg_${background}`]}`} data-fb-container={fb.section}>
      <Container>
        <div className={`${styles.header} ${wideHeader ? styles.headerWide : ""}`}>
          {headerImage && (
            <div className={styles.headerImageWrap} aria-hidden="true">
              <Image src={headerImage} alt="" width={80} height={80} className={styles.headerImage} unoptimized />
            </div>
          )}
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div className={gridClass}>
          {columns.map((col, i) => (
            <div key={i} className={`${styles.col} ${styles[`variant_${variant}`]}`} id={`${fb.prefix}-${fbSlug(col.title)}`} data-fb-container={`${fb.noun} « ${col.title} »`}>
              {variant === "numbered" && (
                <span className={styles.number} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              {variant === "values" && col.image && (
                <div className={styles.colCardImageWrap} aria-hidden="true">
                  <Image src={col.image} alt="" width={48} height={48} className={styles.colCardImage} unoptimized />
                </div>
              )}
              {variant === "results" && (col.image || col.icon) && (
                <div className={styles.colIcon} aria-hidden="true">
                  {col.image ? (
                    <Image src={col.image} alt="" width={30} height={30} className={styles.colIconImage} unoptimized />
                  ) : col.icon ? (
                    <col.icon size={26} color="var(--c-accent-secondary)" strokeWidth={1.5} />
                  ) : null}
                </div>
              )}
              <h3 className={styles.colTitle}>{col.title}</h3>
              <p className={styles.colText}>{col.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
