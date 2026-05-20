// ValueProp3Col — 3 piliers transverses de la promesse. Icône + titre + texte court.
import Container from "../Container/Container";
import AtmosphericAccent from "../AtmosphericAccent/AtmosphericAccent";
import styles from "./ValueProp3Col.module.css";
import { Target, Shield, Zap } from "lucide-react";

const pillars = [
  {
    icon: Target,
    title: "Approche proactive",
    text: "Une approche proactive pensée pour développer votre activité, fluidifier votre organisation et simplifier votre quotidien.",
  },
  {
    icon: Shield,
    title: "Discrétion & rigueur",
    text: "Discrétion, rigueur et professionnalisme au cœur de chaque mission. Votre confiance est la base de notre partenariat.",
  },
  {
    icon: Zap,
    title: "Flexibilité",
    text: "Une collaboration efficace, souple et adaptée à vos besoins, sans les contraintes d'un poste interne.",
  },
];

export default function ValueProp3Col() {
  return (
    <section id="valeurs" className={styles.section}>
      <AtmosphericAccent side="right" tone="cool" intensity="subtle" />
      <Container>
        <div className={styles.header}>
          <p className="eyebrow">Notre engagement</p>
          <h2 className={styles.title}>La signature Swiss Serenity Plus</h2>
        </div>
        <div className={styles.grid}>
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className={styles.card}>
                <div className={styles.iconWrap}>
                  <Icon size={28} color="var(--c-accent-secondary)" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <p className={styles.cardText}>{p.text}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
