// AboutTeaser — photo Mireille + bio courte + CTA vers /a-propos. Layout split asymétrique.
import Image from "next/image";
import Container from "../Container/Container";
import Button from "../Button/Button";
import styles from "./AboutTeaser.module.css";

export default function AboutTeaser() {
  return (
    <section id="a-propos" className={styles.section} aria-labelledby="about-teaser-title">
      <Container>
        <div className={styles.inner}>
          <div className={styles.imageWrap}>
            <div className={styles.imageBackdrop} aria-hidden="true" />
            <div className={styles.imageTexture} aria-hidden="true" />
            <Image
              src="https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/image.png"
              alt="Mireille Dayer, fondatrice de Swiss Serenity Plus"
              width={520}
              height={680}
              className={styles.photo}
              priority
            />
            <div className={styles.imageFade} aria-hidden="true" />
          </div>
          <div className={styles.content}>
            <p className="eyebrow">À propos</p>
            <h2 className={styles.title} id="about-teaser-title">
              Mireille Dayer,
              <br />
              votre bras droit stratégique
            </h2>
            <p className={styles.text}>
              Forte d'une expérience étendue dans le business development et la gestion opérationnelle, j'ai fondé Swiss Serenity Plus pour offrir aux dirigeants suisses romands un soutien sur mesure, sans les contraintes d'un poste interne.
            </p>
            <p className={styles.text}>
              Mon approche: écouter, comprendre, agir. Avec rigueur, discrétion et un engagement total envers votre réussite.
            </p>
            <div className={styles.cta}>
              <Button href="/a-propos" variant="secondary" size="md">
                En savoir plus sur mon parcours
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
