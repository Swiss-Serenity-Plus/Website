import Container from "../Container/Container";
import SwitzerlandMap from "../SwitzerlandMap/SwitzerlandMap";
import styles from "./LocalTrust.module.css";

export default function LocalTrust() {
  return (
    <section id="localisation" className={styles.section} aria-label="Localisation" data-fb-container="Section Localisation">
      <Container>
        <div className={styles.card}>
          <div className={styles.inner}>
            <div className={styles.content}>
              <p className="eyebrow">Localisation</p>
              <h2 className={styles.title}>Swiss Serenity Plus<sup style={{ fontSize: "0.45em", lineHeight: 0 }}>®</sup>, le Tiers de confiance basé à Sion, actif en Suisse romande et en région franco‑suisse</h2>
              <p className={styles.text}>
                Sur le terrain ou à distance, en toute confidentialité&nbsp;: démarches administratives réalisées à votre place et appui sur mesure à votre entreprise pour renforcer son efficacité commerciale.<br />Moins de charge mentale, davantage de temps et de bien‑être.
              </p>
            </div>
            <div className={styles.mapWrap}>
              <SwitzerlandMap />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
