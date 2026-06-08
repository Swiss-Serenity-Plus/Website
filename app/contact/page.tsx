import { Metadata } from "next";
import Image from "next/image";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import PageHero from "../components/PageHero/PageHero";
import Container from "../components/Container/Container";
import FilloutForm from "../components/FilloutForm/FilloutForm";
import Quote from "../components/Quote/Quote";
import styles from "./page.module.css";
import { MapPin, Phone, Mail } from "lucide-react";
import { SITE_URL, OG_IMAGE, OG_DEFAULTS, buildBreadcrumbJsonLd } from "../lib/seo";

const PAGE_URL = `${SITE_URL}/contact`;

const breadcrumbSchema = buildBreadcrumbJsonLd([
  { label: "Accueil", href: "/" },
  { label: "Contact" },
]);

export const metadata: Metadata = {
  title: "Contact — Bras droit externalisé Sion, Valais — Swiss Serenity Plus",
  description: "Prenez contact avec Mireille Dayer pour un échange confidentiel. Bras droit externalisé à Sion, Valais. Sur mesure, sans engagement. Réponse rapide garantie.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Contact — Swiss Serenity Plus, bras droit externalisé à Sion",
    description: "Prenez contact avec Mireille Dayer pour un échange confidentiel. Bras droit externalisé à Sion, Valais. Sur mesure, sans engagement.",
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Swiss Serenity Plus, Sion Valais",
    description: "Échange confidentiel avec Mireille Dayer, bras droit externalisé à Sion.",
    images: [OG_IMAGE.url],
  },
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main>
        <PageHero
          title="Comment pouvons-nous vous accompagner ?"
          subtitle="Un premier échange offert, en toute confidentialité et sans engagement, pour échanger autour de votre projet, de vos priorités et des solutions adaptées à votre situation."
          breadcrumbs={[
            { label: "Accueil", href: "/" },
            { label: "Contact" },
          ]}
        />
        <section className={styles.section} data-fb-container="Section Formulaire de contact">
          <Container>
            <div className={styles.grid}>
              <div className={styles.formWrap} id="b-contact-form" data-fb-label="Formulaire de contact (Fillout)">
                <FilloutForm />
              </div>
              <aside className={styles.info} id="b-contact-info" data-fb-container="Encadré Informations de contact">
                <div className={styles.infoContent}>
                  <p className="eyebrow">Coordonnées</p>
                  <h2 className={styles.infoTitle}>Informations de contact</h2>
                  <ul className={styles.infoList}>
                    <li className={styles.infoItem} data-fb-label="Coordonnée — Adresse / zone d'intervention">
                      <MapPin size={22} color="var(--c-accent-secondary)" strokeWidth={1.5} aria-hidden="true" />
                      <span>Basée à Sion, Swiss Serenity Plus® accompagne ses clients dans toute la Suisse romande.</span>
                    </li>
                    <li className={styles.infoItem} data-fb-label="Coordonnée — Téléphone">
                      <Phone size={22} color="var(--c-accent-secondary)" strokeWidth={1.5} aria-hidden="true" />
                      <a href="tel:+41762198513">+41 76 219 85 13</a>
                    </li>
                    <li className={styles.infoItem} data-fb-label="Coordonnée — E-mail">
                      <Mail size={22} color="var(--c-accent-secondary)" strokeWidth={1.5} aria-hidden="true" />
                      <a href="mailto:mireille.dayer@swiss-serenity-plus.ch">
                        mireille.dayer@swiss-serenity-plus.ch
                      </a>
                    </li>
                  </ul>
                </div>

                <div className={styles.mapWrap}>
                  <Image
                    src="https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/blog-covers/1779465979125-aaa7ab22-d945-4e6d-b782-1d6185106efe.png"
                    alt="Swiss Serenity Plus, basée à Sion en Valais"
                    fill
                    sizes="(max-width: 1024px) 100vw, 440px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </aside>
            </div>
          </Container>
        </section>
        <Quote>
          Chaque priorité étant unique, nous prenons le temps d&rsquo;échanger
          ensemble autour de votre projet, de vos priorités et des solutions
          les plus adaptées à votre situation.
        </Quote>
      </main>
      <Footer />
    </>
  );
}
