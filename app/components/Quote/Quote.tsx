// Quote — citation premium centrée, encadrée d'un filet doré à étoile.
import Container from "../Container/Container";
import styles from "./Quote.module.css";

interface QuoteProps {
  children: React.ReactNode;
}

function Ornament() {
  return (
    <div className={styles.ornament} aria-hidden="true">
      <span className={styles.rule} />
      <svg className={styles.star} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1.5 13.4 10.6 22.5 12 13.4 13.4 12 22.5 10.6 13.4 1.5 12 10.6 10.6Z" />
      </svg>
      <span className={styles.rule} />
    </div>
  );
}

export default function Quote({ children }: QuoteProps) {
  return (
    <section className={styles.section} data-fb-container="Section Citation">
      <Container>
        <div className={styles.inner}>
          <Ornament />
          <blockquote className={styles.quote}>
            <span className={styles.mark} aria-hidden="true">&ldquo;</span>
            <p className={styles.text}>{children}</p>
            <span className={`${styles.mark} ${styles.markClose}`} aria-hidden="true">&rdquo;</span>
          </blockquote>
          <Ornament />
        </div>
      </Container>
    </section>
  );
}
