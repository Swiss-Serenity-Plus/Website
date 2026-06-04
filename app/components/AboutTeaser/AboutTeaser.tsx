// AboutTeaser — bloc unifié (encadré premium) : texte + portrait intégré dans le cadre.
// Reprend le design de la page À propos. CTA vers /a-propos.
import Image from "next/image";
import Container from "../Container/Container";
import Button from "../Button/Button";
import styles from "./AboutTeaser.module.css";

const PORTRAIT_SRC = "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/image.png";

export default function AboutTeaser() {
  return (
    <section id="a-propos" className={styles.section} aria-labelledby="about-teaser-title" data-fb-label="Section À propos (aperçu)">
      <Container>
        <div className={styles.card}>
          <div className={styles.content}>
            <p className="eyebrow">À propos</p>
            <h2 className={styles.title} id="about-teaser-title">
              Mireille Dayer,
              <br />
              votre bras droit stratégique
            </h2>
            <p className={styles.text}>
              Forte d&rsquo;une expérience étendue dans le business development et la gestion opérationnelle, j&rsquo;ai fondé Swiss Serenity Plus pour offrir aux dirigeants suisses romands un soutien sur mesure, sans les contraintes d&rsquo;un poste interne.
            </p>
            <p className={styles.text}>
              Mon approche&nbsp;: écouter, comprendre, agir. Avec rigueur, discrétion et un engagement total envers votre réussite.
            </p>
            <div className={styles.cta}>
              <Button href="/a-propos" variant="secondary" size="md" id="b-about-teaser-cta" fbLabel="Bouton « En savoir plus sur mon parcours »">
                En savoir plus sur mon parcours
              </Button>
            </div>
          </div>

          <div className={styles.portraitWrap} id="b-about-teaser-portrait" data-fb-label="Photo portrait de Mireille Dayer">
            <Image
              src={PORTRAIT_SRC}
              alt="Mireille Dayer, fondatrice de Swiss Serenity Plus"
              fill
              sizes="(max-width: 899px) 70vw, 32vw"
              className={styles.portrait}
              priority
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
