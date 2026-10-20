// AboutTeaser — bloc unifié (encadré premium) : texte + portrait intégré dans le cadre.
// Reprend le design de la page À propos. CTA vers /a-propos.
import Image from "next/image";
import Container from "../Container/Container";
import Button from "../Button/Button";
import styles from "./AboutTeaser.module.css";

const PORTRAIT_SRC = "/images/mireille-dayer-accueil.jpg";
// Sur téléphone : même photo, cadrée plus serrée sur le visage (comme sur ordinateur).
const PORTRAIT_MOBILE_SRC = "/images/mireille-dayer-accueil-mobile.jpg";

export default function AboutTeaser() {
  return (
    <section id="a-propos" className={styles.section} aria-labelledby="about-teaser-title" data-fb-container="Section À propos">
      <Container>
        <div className={styles.card}>
          <div className={styles.content}>
            <p className="eyebrow">À propos</p>
            <h2 className={styles.title} id="about-teaser-title">
              Mireille Dayer,
              <br />
              un accompagnement sur mesure pour les entreprises et les familles
            </h2>
            <p className={styles.text}>
              Valaisanne, ayant étudié et exercé mon activité professionnelle en Suisse et en France, j&rsquo;évolue depuis plus de vingt ans dans des environnements mêlant développement commercial, coordination stratégique et relations clients.
            </p>
            <p className={styles.text}>
              Mon expérience m&rsquo;a ainsi permis de développer une méthode de travail à la fois rigoureuse, bienveillante et orientée résultats.
            </p>
            <p className={styles.text}>
              Avec Swiss Serenity Plus®, j&rsquo;accompagne aussi bien les professionnels dans leur développement commercial et l&rsquo;optimisation de leur organisation que les particuliers dans leurs démarches administratives, leurs projets et les formalités liées aux étapes importantes de leur vie.
            </p>
            <div className={styles.cta}>
              <Button href="/a-propos" variant="secondary" size="md" id="b-about-teaser-cta" fbLabel="Bouton « En savoir plus sur mon parcours »">
                En savoir plus sur mon parcours
              </Button>
            </div>
          </div>

          <div className={styles.portraitWrap} id="b-about-teaser-portrait" data-fb-label="Image avec le portrait de Mireille Dayer">
            <Image
              src={PORTRAIT_SRC}
              alt="Mireille Dayer, fondatrice de Swiss Serenity Plus"
              fill
              sizes="32vw"
              className={`${styles.portrait} ${styles.portraitDesktop}`}
              priority
            />
            <Image
              src={PORTRAIT_MOBILE_SRC}
              alt="Mireille Dayer, fondatrice de Swiss Serenity Plus"
              fill
              sizes="70vw"
              className={`${styles.portrait} ${styles.portraitMobile}`}
              priority
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
