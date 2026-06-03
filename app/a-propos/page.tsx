import { Metadata } from "next";
import Image from "next/image";
import { TrendingUp, HandHeart } from "lucide-react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import Divider from "../components/Divider/Divider";
import ContactCTA from "../components/ContactCTA/ContactCTA";
import Container from "../components/Container/Container";
import styles from "./page.module.css";
import { SITE_URL, OG_IMAGE, OG_DEFAULTS } from "../lib/seo";

const PORTRAIT_SRC = "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/image.png";

const PAGE_URL = `${SITE_URL}/a-propos`;

export const metadata: Metadata = {
  title: "Mireille Dayer — Bras droit externalisé à Sion, Valais — Swiss Serenity Plus",
  description: "Mireille Dayer, bras droit externalisé à Sion. Fondatrice de Swiss Serenity Plus — parcours, valeurs, engagement. Accompagnement dirigeants et particuliers en Valais.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Mireille Dayer — Bras droit externalisé à Sion, Valais",
    description: "Fondatrice de Swiss Serenity Plus. Parcours, valeurs et engagement au service des dirigeants et particuliers en Suisse romande.",
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mireille Dayer — Bras droit externalisé à Sion — Swiss Serenity Plus",
    description: "Fondatrice de Swiss Serenity Plus. Parcours, valeurs et engagement en Suisse romande.",
    images: [OG_IMAGE.url],
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/a-propos/#mireille`,
  "name": "Mireille Dayer",
  "jobTitle": "Fondatrice & Bras droit externalisé",
  "image": OG_IMAGE.url,
  "url": PAGE_URL,
  "worksFor": { "@type": "Organization", "@id": `${SITE_URL}/#business`, "name": "Swiss Serenity Plus" },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Sion",
    "addressRegion": "Valais",
    "addressCountry": "CH",
  },
  "knowsAbout": [
    "Office management stratégique",
    "Gestion opérationnelle externalisée",
    "Accompagnement des dirigeants de PME",
    "Sourcing et gestion de partenaires",
    "Accompagnement administratif des particuliers",
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": SITE_URL },
    { "@type": "ListItem", "position": 2, "name": "À propos", "item": PAGE_URL },
  ],
};

export default function AProposPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main>
        <section className={styles.hero} aria-labelledby="page-title">
          <Container>
            <Breadcrumb
              items={[
                { label: "Accueil", href: "/" },
                { label: "À propos" },
              ]}
            />

            <div className={styles.heroCard}>
              <div className={styles.heroText}>
                <span className={styles.accent} aria-hidden="true">
                  <span className={styles.accentLine} />
                  <svg className={styles.accentDiamond} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1.5 13.4 10.6 22.5 12 13.4 13.4 12 22.5 10.6 13.4 1.5 12 10.6 10.6Z" />
                  </svg>
                  <span className={styles.accentLine} />
                </span>
                <h1 className={styles.title} id="page-title">
                  <span className={styles.name}>Mireille Dayer</span>
                  <span className={styles.tagline}>
                    Votre bras droit de confiance pour le développement et l&rsquo;organisation de vos activités
                  </span>
                </h1>
              </div>

              <div className={styles.portraitWrap}>
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

            <div className={styles.cards}>
              <article className={styles.infoCard}>
                <span className={styles.iconCircle} aria-hidden="true">
                  <TrendingUp size={30} strokeWidth={1.5} />
                </span>
                <Divider />
                <p className={styles.cardText}>
                  J&rsquo;ai fondé Swiss Serenity Plus<sup>®</sup> afin d&rsquo;offrir aux{" "}
                  <strong className={styles.highlight}>Professionnels</strong> un soutien opérationnel et efficace pour renforcer leur développement commercial et fluidifier leur organisation avec une approche fondée sur la rigueur et le sens du résultat.
                </p>
              </article>

              <article className={styles.infoCard}>
                <span className={styles.iconCircle} aria-hidden="true">
                  <HandHeart size={30} strokeWidth={1.5} />
                </span>
                <Divider />
                <p className={styles.cardText}>
                  J&rsquo;ai également souhaité que Swiss Serenity Plus<sup>®</sup> accompagne les{" "}
                  <strong className={styles.highlight}>Particuliers</strong> dans leurs démarches administratives ainsi que dans celles liées aux étapes importantes de leur parcours afin de leur apporter davantage de sérénité et une meilleure qualité de vie.
                </p>
              </article>
            </div>

            <div className={styles.bottomDivider}>
              <Divider />
            </div>
          </Container>
        </section>
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
