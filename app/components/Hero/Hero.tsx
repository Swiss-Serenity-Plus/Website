// Hero — photo paysage R2 droite (incrustation premium) + montagnes SVG décoratives.
import Image from "next/image";
import Button from "../Button/Button";
import styles from "./Hero.module.css";

const LANDSCAPE_SRC =
  "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/Paysage%20-%20Swiss%20Serenity%20Plus%20-%20Mireille%20Dayer.png";

export default function Hero() {
  return (
    <section id="hero" className={styles.hero} aria-label="Présentation Swiss Serenity Plus">

      {/* SVG montagnes — couche décorative bords gauche + droite */}
      <svg
        className={styles.mountainsSvg}
        viewBox="0 0 1440 800"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="lmg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e6e1dc" />
            <stop offset="100%" stopColor="#cfc9c2" />
          </linearGradient>
          <linearGradient id="rmg" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e4e7e3" />
            <stop offset="100%" stopColor="#8fa3a8" />
          </linearGradient>
          <filter id="bsoft">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="bstrong">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Montagnes gauche — douces, atmosphériques */}
        <g filter="url(#bstrong)" opacity="0.55">
          <path d="M0 500 C150 350, 300 350, 400 500 C300 450, 150 480, 0 520 Z" fill="url(#lmg)" />
        </g>
        <g filter="url(#bsoft)" opacity="0.7">
          <path d="M0 550 C180 420, 350 430, 500 550 C350 500, 200 530, 0 580 Z" fill="url(#lmg)" />
        </g>

        {/* Silhouette droite — harmonisation avec la photo */}
        <g filter="url(#bsoft)" opacity="0.28">
          <path d="M1440 280 L1300 460 L1220 400 L1120 540 L1440 540 Z" fill="url(#rmg)" />
        </g>
      </svg>

      {/* Photo paysage R2 — incrustation progressive, fondue dans le fond crème */}
      <div className={styles.imageWrap} aria-hidden="true">
        <Image
          src={LANDSCAPE_SRC}
          alt=""
          fill
          sizes="(max-width: 1023px) 100vw, 54vw"
          className={styles.mountainImg}
          priority
        />
        {/* Couche givrée — flou progressif sur la couture photo/crème */}
        <div className={styles.edgeBlur} />
      </div>

      {/* Texte — avant-plan */}
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className="eyebrow">Votre partenaire de confiance au quotidien</p>
          <h1 className={styles.title}>
            Une expertise pensée pour allier<br />Sérénité · Succès · Performance
          </h1>
          <p className={styles.subtitle}>
            Swiss Serenity Plus® accompagne les PME, Indépendants, Institutions, PPE ainsi que les Particuliers avec des solutions sur mesure visant à optimiser leur organisation, gagner en efficacité, simplifier leur quotidien et favoriser la croissance de leurs activités.
          </p>
          <div className={styles.ctas}>
            <Button href="/contact" variant="primary" size="lg" className={styles.heroCtaPrimary}>
              Parlons de votre projet
            </Button>
            <Button href="/#services" variant="ghost" size="lg" className={styles.heroCtaSecondary}>
              Découvrir notre accompagnement
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
