// ServiceSection — grille unifiée de services avec tags audience sur chaque card.
import Container from "../Container/Container";
import ServiceCard from "../ServiceCard/ServiceCard";
import AtmosphericAccent from "../AtmosphericAccent/AtmosphericAccent";
import styles from "./ServiceSection.module.css";
import { LucideIcon } from "lucide-react";

interface ServiceCardData {
  title: string;
  shortDescription: string;
  href: string;
  Icon?: LucideIcon;
  iconImage?: string;
  audience: "pro" | "perso";
  cta?: string;
}

interface ServiceSectionProps {
  eyebrow: string;
  title: string;
  intro: string;
  cards: ServiceCardData[];
  id?: string;
}

export default function ServiceSection({
  eyebrow,
  title,
  intro,
  cards,
  id,
}: ServiceSectionProps) {
  return (
    <section
      className={styles.section}
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <AtmosphericAccent side="left" tone="warm" intensity="subtle" />
      <Container>
        <div className={styles.header}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className={styles.title} id={id ? `${id}-title` : undefined}>{title}</h2>
          <p className={styles.intro}>{intro}</p>
        </div>
        <div className={styles.grid}>
          {cards.map((card) => (
            <ServiceCard key={card.href} {...card} />
          ))}
        </div>
      </Container>
    </section>
  );
}
