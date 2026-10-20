// RelatedServices — grille des autres services (exclut le courant). Obligatoire en bas de chaque page service.
import Container from "../Container/Container";
import ServiceCard from "../ServiceCard/ServiceCard";
import styles from "./RelatedServices.module.css";
import { LucideIcon } from "lucide-react";

interface ServiceData {
  title: string;
  shortDescription: string;
  href: string;
  Icon?: LucideIcon;
  audience: "pro" | "perso";
  tag?: string;
}

interface RelatedServicesProps {
  currentHref: string;
  services: ServiceData[];
}

export default function RelatedServices({ currentHref, services }: RelatedServicesProps) {
  // Les cartes mises en avant (étiquette personnalisée, ex. Le Fil Conducteur)
  // apparaissent toujours, seules sur une ligne sous les autres ; les autres
  // complètent jusqu'à 4 cartes au total.
  const path = (href: string) => href.split("#")[0];
  const others = services.filter((s) => path(s.href) !== path(currentHref));
  const featured = others.filter((s) => s.tag);
  const related = others.filter((s) => !s.tag).slice(0, 4 - featured.length);

  return (
    <section className={styles.section} aria-labelledby="related-title" data-fb-container="Section Autres services">
      <Container>
        <div className={styles.header}>
          <p className="eyebrow">Nos autres services</p>
          <h2 className={styles.title} id="related-title">Découvrir l'ensemble de nos accompagnements</h2>
        </div>
        <div className={`${styles.grid} ${featured.length ? styles.gridThree : ""}`}>
          {related.map((s) => (
            <ServiceCard key={s.href} {...s} />
          ))}
        </div>
        {featured.map((s) => (
          <div key={s.href} className={styles.featured}>
            <ServiceCard {...s} />
          </div>
        ))}
      </Container>
    </section>
  );
}
