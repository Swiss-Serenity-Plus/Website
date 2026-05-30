import { Metadata } from "next";
import Image from "next/image";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import PageHero from "../components/PageHero/PageHero";
import ContactCTA from "../components/ContactCTA/ContactCTA";
import Container from "../components/Container/Container";
import styles from "./page.module.css";
import { SITE_URL, OG_IMAGE, OG_DEFAULTS } from "../lib/seo";

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
        <PageHero
          eyebrow="À propos"
          title="Mireille Dayer, votre bras droit stratégique"
          subtitle="Fondatrice de Swiss Serenity Plus®, j'accompagne dirigeants et particuliers en Suisse romande avec rigueur, discrétion et engagement."
          breadcrumbs={[
            { label: "Accueil", href: "/" },
            { label: "À propos" },
          ]}
        />
        <section className={styles.intro}>
          <Container>
            <div className={styles.introGrid}>
              <div className={styles.introText}>
                <p className="eyebrow">Parcours</p>
                <h2 className={styles.h2}>Une expertise construite sur le terrain</h2>
                <p>
                  Franco-Suisse et ayant suivi mes études et mes formations professionnelles en Suisse et en France, j'évolue depuis plus de vingt ans dans des environnements exigeants mêlant développement commercial, coordination opérationnelle et relation client.
                </p>
                <p>
                  Mon expérience dans les secteurs de la Banque, des Compléments Alimentaires et des Dispositifs Médicaux m'a permis de développer une approche à la fois rigoureuse, humaine et orientée résultats, avec une compréhension concrète des réalités du terrain et des exigences propres aux environnements français et suisses.
                </p>
                <p>
                  Swiss Serenity Plus® est née de cette conviction : les Entreprises comme les Particuliers ont besoin d'un véritable bras droit de confiance capable d'apporter structure, fluidité et sérénité.
                </p>
              </div>
              <div className={styles.portraitWrap}>
                <Image
                  src="https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/image.png"
                  alt="Mireille Dayer, fondatrice de Swiss Serenity Plus"
                  width={520}
                  height={680}
                  className={styles.portrait}
                  priority
                />
              </div>
            </div>
          </Container>
        </section>
        <section className={styles.section}>
          <Container narrow>
            <div className={styles.content}>
              <h2 className={styles.h2}>Notre Engagement</h2>
              <p>
                Rigueur, discrétion, fiabilité. Ce ne sont pas des mots pour moi, ce sont les fondations de chaque mission. Votre confiance est précieuse; je la traite comme telle.
              </p>
              <p>
                J'accompagne aussi bien des PME en pleine croissance que des particuliers qui traversent des étapes administratives complexes. Dans les deux cas, mon engagement est le même: être présente, disponible, et pleinement investie dans votre réussite.
              </p>
            </div>
          </Container>
        </section>
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
