// PageHero — breadcrumb + eyebrow + H1 + sous-titre. Fond beige, utilisé sur toutes les pages intérieures.
import type { ReactNode } from "react";
import Container from "../Container/Container";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import styles from "./PageHero.module.css";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
}

export default function PageHero({ eyebrow, title, subtitle, breadcrumbs }: PageHeroProps) {
  return (
    <section className={styles.section} aria-labelledby="page-title">
      <Container>
        <Breadcrumb items={breadcrumbs} />
        <div className={styles.content}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className={styles.title} id="page-title">{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </Container>
    </section>
  );
}
