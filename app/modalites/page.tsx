import { Metadata } from "next";
import { Check, Leaf } from "lucide-react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import PageHero from "../components/PageHero/PageHero";
import Container from "../components/Container/Container";
import OfferModalities from "../components/OfferModalities/OfferModalities";
import Quote from "../components/Quote/Quote";
import Button from "../components/Button/Button";
import styles from "./page.module.css";
import { SITE_URL, OG_IMAGE, OG_DEFAULTS } from "../lib/seo";

const PAGE_URL = `${SITE_URL}/modalites`;

export const metadata: Metadata = {
  title: "Modalités d'intervention — Swiss Serenity Plus",
  description:
    "Découvrez les modalités d'accompagnement de Swiss Serenity Plus : formule au forfait ou à l'heure, intervention ponctuelle ou régulière. Premier échange offert, sans engagement.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Modalités d'intervention — Swiss Serenity Plus",
    description:
      "Formule au forfait ou à l'heure, ponctuelle ou régulière. Premier échange offert, en toute confidentialité et sans engagement.",
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Modalités d'intervention — Swiss Serenity Plus",
    description: "Premier échange offert, sans engagement. Formule adaptée à votre situation.",
    images: [OG_IMAGE.url],
  },
};

const checkItems = [
  "Solutions au forfait ou à l'heure selon vos besoins",
  "Intervention ponctuelle ou accompagnement régulier",
  "Une collaboration adaptée et évolutive",
];

export default function ModalitesPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Notre approche"
          title="Modalités d'intervention"
          subtitle="Des formules souples et transparentes, pensées pour s'adapter à votre situation, vos priorités et votre rythme."
          breadcrumbs={[
            { label: "Accueil", href: "/" },
            { label: "Modalités" },
          ]}
        />

        <OfferModalities />

        <Quote>
          Chaque projet étant unique, nous recherchons ensemble les solutions les plus adaptées
          à vos besoins, vos priorités et à vos situations.
        </Quote>

        <section
          className={styles.premierEchange}
          aria-labelledby="premier-echange-title"
          data-fb-container="Section Premier échange offert"
        >
          <Container>
            <div className={styles.encadre} id="b-encadre-premier-echange">
              <div className={styles.encadreHeader}>
                <h2 className={styles.encadreTitle} id="premier-echange-title">
                  Un premier échange offert
                </h2>
                <div className={styles.encadreSub}>
                  <span className={styles.subRule} aria-hidden="true" />
                  <span className={styles.subText}>
                    En toute confidentialité et sans engagement
                  </span>
                  <span className={styles.subRule} aria-hidden="true" />
                </div>
              </div>

              <ul className={styles.checkList}>
                {checkItems.map((item) => (
                  <li
                    key={item}
                    className={styles.checkItem}
                    data-fb-label={`Point modalité « ${item} »`}
                  >
                    <span className={styles.checkBadge} aria-hidden="true">
                      <Check size={18} strokeWidth={2.2} />
                    </span>
                    <span className={styles.checkSep} aria-hidden="true" />
                    <span className={styles.checkText}>{item}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.encadreCta}>
                <Button
                  href="/contact"
                  variant="primary"
                  id="b-modalites-cta-contact"
                  fbLabel="Bouton CTA « Prendre contact »"
                >
                  Prendre contact
                </Button>
              </div>
            </div>
          </Container>
        </section>

        <section
          className={styles.disclaimer}
          aria-label="Périmètre des prestations"
          data-fb-container="Section Disclaimer prestations"
        >
          <Container>
            <div className={styles.disclaimerInner} id="b-disclaimer-perimetre">
              <span className={styles.disclaimerIcon} aria-hidden="true">
                <Leaf size={48} strokeWidth={1.2} />
              </span>
              <p className={styles.disclaimerText}>
                Les prestations proposées relèvent exclusivement de l&rsquo;accompagnement administratif,
                organisationnel et opérationnel et ne se substituent pas à des prestations juridiques,
                fiscales, comptables ou médicales.
              </p>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
