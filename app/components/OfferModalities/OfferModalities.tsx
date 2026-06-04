// OfferModalities — bloc « modalités & réassurance » affiché sous le process.
import { HandHelping, CalendarDays, Wallet, MessagesSquare, Lock, Feather } from "lucide-react";
import Container from "../Container/Container";
import styles from "./OfferModalities.module.css";

const options = [
  { Icon: CalendarDays, label: "Intervention ponctuelle ou soutien régulier" },
  { Icon: Wallet, label: "Formule au forfait ou accompagnement horaire" },
];

const reassurances = [
  { Icon: MessagesSquare, label: "Premier échange offert" },
  { Icon: Lock, label: "En toute confidentialité" },
  { Icon: Feather, label: "Sans engagement" },
];

export default function OfferModalities() {
  return (
    <section className={styles.section} aria-label="Modalités d'accompagnement" data-fb-label="Section Modalités & réassurance">
      <Container>
        <div className={styles.card}>
          <div className={styles.top}>
            <div className={styles.intro}>
              <HandHelping className={styles.introIcon} size={56} strokeWidth={1.3} aria-hidden="true" />
              <div className={styles.introText}>
                <h3 className={styles.introTitle}>Une solution adaptée à votre situation</h3>
                <p className={styles.quote}>
                  Chaque besoin étant unique, nous prenons le temps d&rsquo;échanger ensemble
                  autour de votre projet, de vos priorités et des solutions les plus adaptées
                  à votre situation.
                </p>
              </div>
            </div>

            <ul className={styles.options}>
              {options.map(({ Icon, label }) => (
                <li key={label} className={styles.item} data-fb-label={`Modalité « ${label} »`}>
                  <span className={styles.badge} aria-hidden="true">
                    <Icon size={22} strokeWidth={1.5} />
                  </span>
                  <span className={styles.label}>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <ul className={styles.reassure}>
            {reassurances.map(({ Icon, label }) => (
              <li key={label} className={`${styles.item} ${styles.reassureItem}`} data-fb-label={`Réassurance « ${label} »`}>
                <span className={styles.badge} aria-hidden="true">
                  <Icon size={20} strokeWidth={1.5} />
                </span>
                <span className={styles.label}>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
