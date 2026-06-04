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
}

interface RelatedServicesProps {
  currentHref: string;
  services: ServiceData[];
}

export default function RelatedServices({ currentHref, services }: RelatedServicesProps) {
  const related = services.filter((s) => s.href !== currentHref).slice(0, 4);

  return (
    <section className={styles.section} aria-labelledby="related-title" data-fb-container="Section Autres services">
      <Container>
        <div className={styles.header}>
          <p className="eyebrow">Nos autres services</p>
          <h2 className={styles.title} id="related-title">Découvrir l'ensemble de nos accompagnements</h2>
        </div>
        <div className={styles.grid}>
          {related.map((s) => (
            <ServiceCard key={s.href} {...s} />
          ))}
        </div>
      </Container>
    </section>
  );
}
