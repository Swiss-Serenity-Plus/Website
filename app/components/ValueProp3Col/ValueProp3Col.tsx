// ValueProp3Col — 3 piliers transverses de la promesse. Icône + titre + texte court.
import Image from "next/image";
import Container from "../Container/Container";
import AtmosphericAccent from "../AtmosphericAccent/AtmosphericAccent";
import styles from "./ValueProp3Col.module.css";
import type { LucideIcon } from "lucide-react";
import { HeartHandshake } from "lucide-react";
import { fbSlug } from "../../lib/fbToken";

interface Pillar {
  icon?: LucideIcon;
  iconImage?: string;
  iconScale?: number;
  title: string;
  text: string;
}

const pillars: Pillar[] = [
  {
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%3A%20Coordination%20%26%20Optimisation%20%3A%20Swiss%20Serenity%20Plus.png",
    iconScale: 1.5,
    title: "Dirigeants et RH",
    text: "Une prestation externalisée qui prend en charge les démarches privées de vos collaborateurs : moins d'absences, des équipes plus disponibles, un atout pour votre politique RH et RSE.",
  },
  {
    icon: HeartHandshake,
    title: "Salariés et proches aidants",
    text: "Dossiers AVS ou AI, entrée en EMS d'un parent : tout est mené à votre place, en toute confidentialité vis-à-vis de l'employeur.",
  },
  {
    iconImage: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20%22Accomapgnemnt%20au%20particulier%22.png",
    iconScale: 1.6,
    title: "Particuliers, en Suisse et en France",
    text: "Retraités, familles, personnes qui s'installent en Suisse ou partent vivre en France : formalités, installation, recherche d'emploi, chaque étape est organisée et suivie avec soin.",
  },
];

export default function ValueProp3Col() {
  return (
    <section id="valeurs" className={styles.section} data-fb-container="Section Piliers de valeur">
      <AtmosphericAccent side="right" tone="cool" intensity="subtle" />
      <Container>
        <div className={styles.header}>
          <p className="eyebrow">L&rsquo;Esprit Swiss Serenity Plus&reg;</p>
          <h2 className={styles.title}>Une réponse pour chaque situation</h2>
        </div>
        <div className={styles.grid}>
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className={styles.card} id={`b-pilier-${fbSlug(p.title)}`} data-fb-container={`Encadré pilier « ${p.title} »`}>
                <div className={styles.iconWrap}>
                  {p.iconImage ? (
                    <Image src={p.iconImage} alt="" width={44} height={44} unoptimized aria-hidden="true" style={p.iconScale ? { transform: `scale(${p.iconScale})` } : undefined} />
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
