// ValueProp3Col — 3 piliers transverses de la promesse. Icône + titre + texte court.
import Image from "next/image";
import Container from "../Container/Container";
import AtmosphericAccent from "../AtmosphericAccent/AtmosphericAccent";
import styles from "./ValueProp3Col.module.css";
import type { LucideIcon } from "lucide-react";
import { fbSlug } from "../../lib/fbToken";

interface Pillar {
  icon?: LucideIcon;
  iconImage?: string;
  title: string;
  text: string;
}

const pillars: Pillar[] = [
  {
    iconImage: "/icons/performance-chart.svg",
    title: "Une présence proactive",
    text: "Une approche proactive pensée pour développer votre activité, fluidifier votre organisation et simplifier votre quotidien.",
  },
  {
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/image-removebg-preview%20(1).png",
    title: "Confiance, discrétion & rigueur",
    text: "Discrétion, rigueur et professionnalisme au cœur de chaque mission. Votre confiance est la base de notre partenariat.",
  },
  {
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%22Solutions%20sur%20mesure%22.png",
    title: "Solutions sur mesure",
    text: "Une collaboration efficace, souple et adaptée à vos besoins, sans les contraintes d'un poste interne.",
  },
];

export default function ValueProp3Col() {
  return (
    <section id="valeurs" className={styles.section} data-fb-container="Section Piliers de valeur">
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
              <div key={p.title} className={styles.card} id={`b-pilier-${fbSlug(p.title)}`} data-fb-container={`Encadré pilier « ${p.title} »`}>
                <div className={styles.iconWrap}>
                  {p.iconImage ? (
                    <Image src={p.iconImage} alt="" width={44} height={44} unoptimized aria-hidden="true" />
                  ) : Icon ? (
                    <Icon size={28} color="var(--c-accent-secondary)" strokeWidth={1.5} aria-hidden="true" />
                  ) : null}
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
