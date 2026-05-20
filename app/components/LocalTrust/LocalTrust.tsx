import Container from "../Container/Container";
import SwitzerlandMap from "../SwitzerlandMap/SwitzerlandMap";
import styles from "./LocalTrust.module.css";

export default function LocalTrust() {
  return (
    <section id="localisation" className={styles.section} aria-label="Localisation">
      <Container>
        <div className={styles.card}>
          <div className={styles.inner}>
            <div className={styles.content}>
              <p className="eyebrow">Localisation</p>
              <h2 className={styles.title}>Basée à Sion, nous intervenons en Valais et en Suisse romande</h2>
              <p className={styles.text}>
                Swiss Serenity Plus accompagne dirigeants et particuliers dans toute la Suisse romande : Valais, Vaud, Fribourg, Genève. Rencontres en présentiel dans le Valais central, accompagnement à distance sur tout le territoire.
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
