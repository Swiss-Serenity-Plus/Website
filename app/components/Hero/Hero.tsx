// Hero — photo paysage R2 (nette) a droite, fond creme opaque a gauche sous le texte.
import Image from "next/image";
import Button from "../Button/Button";
import styles from "./Hero.module.css";

const LANDSCAPE_SRC =
  "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/Paysage%20-%20Swiss%20Serenity%20Plus%20-%20Mireille%20Dayer.png";

export default function Hero() {
  return (
    <section id="hero" className={styles.hero} aria-label="Présentation Swiss Serenity Plus" data-fb-container="Section Hero">

      {/* Photo paysage R2 — nette, voile creme opaque a gauche (voir CSS) */}
      <div className={styles.imageWrap} aria-hidden="true">
        <Image
          src={LANDSCAPE_SRC}
          alt=""
          fill
          sizes="(max-width: 1023px) 100vw, 54vw"
          className={styles.mountainImg}
          priority
        />
      </div>

      {/* Texte — avant-plan */}
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className="eyebrow">Votre partenaire de confiance au&nbsp;quotidien</p>
          <h1 className={styles.title}>
            Sérénité · Succès · Performance
          </h1>
          <p className={styles.subtitle}>
            Swiss Serenity Plus® accompagne les PME, Indépendants, Institutions, PPE ainsi que les Particuliers avec des solutions sur mesure visant à optimiser leur organisation, gagner en efficacité, simplifier leur quotidien et favoriser la croissance de leurs activités.
          </p>
          <div className={styles.ctas}>
            <Button href="/contact" variant="dark" size="lg" className={styles.heroCtaPrimary} id="b-hero-cta-contact" fbLabel="Bouton « Parlons de votre projet »">
              Parlons de votre projet
            </Button>
            <Button href="/#services" variant="ghost" size="lg" className={styles.heroCtaSecondary} id="b-hero-cta-services" fbLabel="Bouton « Découvrir notre accompagnement »">
              Découvrir notre accompagnement
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
