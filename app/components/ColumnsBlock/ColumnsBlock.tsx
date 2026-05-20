// ColumnsBlock — générique 3 colonnes. Variants: default, numbered (.01 .02...), values, results.
import type { LucideIcon } from "lucide-react";
import Container from "../Container/Container";
import styles from "./ColumnsBlock.module.css";

interface Column {
  title: string;
  text: string;
  icon?: LucideIcon;
}

interface ColumnsBlockProps {
  eyebrow?: string;
  title: string;
  columns: Column[];
  variant?: "default" | "numbered" | "values" | "results";
  background?: "bg" | "surface";
  cols?: 2 | 3 | 4;
}

export default function ColumnsBlock({
  eyebrow,
  title,
  columns,
  variant = "default",
  background = "bg",
  cols,
}: ColumnsBlockProps) {
  const gridClass = cols === 2 ? styles.grid2 : cols === 4 ? styles.grid4 : styles.grid;
  return (
    <section className={`${styles.section} ${styles[`bg_${background}`]}`}>
      <Container>
        <div className={styles.header}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className={styles.title}>{title}</h2>
        </div>
        <div className={gridClass}>
          {columns.map((col, i) => (
            <div key={i} className={`${styles.col} ${styles[`variant_${variant}`]}`}>
              {variant === "numbered" && (
                <span className={styles.number} aria-hidden="true">
                  .{String(i + 1).padStart(2, "0")}
                </span>
              )}
              {variant === "results" && col.icon && (
                <div className={styles.colIcon} aria-hidden="true">
                  <col.icon size={26} color="var(--c-accent-secondary)" strokeWidth={1.5} />
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
