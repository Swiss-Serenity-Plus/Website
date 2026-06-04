// Breadcrumb — fil d'ariane. ex: Accueil > Entreprises > Structuration.
import Link from "next/link";
import styles from "./Breadcrumb.module.css";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'ariane" data-fb-label="Fil d'ariane">
      <ol className={styles.list} role="list">
        {items.map((item, i) => (
          <li key={i} className={styles.item} data-fb-label={`Fil d'ariane — « ${item.label} »`}>
            {i > 0 && <span className={styles.sep} aria-hidden="true">/</span>}
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className={styles.link}>{item.label}</Link>
            ) : (
              <span className={styles.current} aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
