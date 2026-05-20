// ContactCTA — bandeau fond bleu nuit, CTA bordeaux. Utilisé en fin de toutes les pages.
import Container from "../Container/Container";
import Button from "../Button/Button";
import styles from "./ContactCTA.module.css";

interface ContactCTAProps {
  title?: string;
  subtitle?: string;
}

export default function ContactCTA({
  title = "Prêt à avancer ensemble ?",
  subtitle = "Prenons le temps d'un échange confidentiel pour comprendre vos besoins et envisager un accompagnement sur mesure.",
}: ContactCTAProps) {
  return (
    <section id="contact-cta" className={styles.section} aria-labelledby="cta-title">
      <Container>
        <div className={styles.inner}>
          <p className="eyebrow">Contact</p>
          <h2 className={styles.title} id="cta-title">{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
          <Button href="/contact" variant="primary" size="lg">
            Parlons de votre projet
          </Button>
        </div>
      </Container>
    </section>
  );
}
