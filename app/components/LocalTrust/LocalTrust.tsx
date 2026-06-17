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
              <h2 className={styles.title}>Basés à Sion, nous intervenons en Valais et en Suisse romande</h2>
              <p className={styles.text}>
                Swiss Serenity Plus® accompagne les Professionnels et les Particuliers dans toute la Suisse romande.<br />Selon vos besoins, les prestations peuvent être réalisées à distance, dans vos locaux ou à votre domicile.
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
