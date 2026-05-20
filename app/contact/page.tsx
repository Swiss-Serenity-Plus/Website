import { Metadata } from "next";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import PageHero from "../components/PageHero/PageHero";
import Container from "../components/Container/Container";
import ContactForm from "../components/ContactForm/ContactForm";
import styles from "./page.module.css";
import { MapPin, Phone, Mail } from "lucide-react";
import { SITE_URL, OG_IMAGE, OG_DEFAULTS } from "../lib/seo";

const PAGE_URL = `${SITE_URL}/contact`;

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
      <Header />
      <main>
        <PageHero
          eyebrow="Contact"
          title="Comment pouvons-nous vous accompagner ?"
          subtitle="Un premier échange offert, en toute confidentialité et sans engagement, pour échanger autour de votre projet, de vos priorités et des solutions adaptées à votre situation."
          breadcrumbs={[
            { label: "Accueil", href: "/" },
            { label: "Contact" },
          ]}
        />
        <section className={styles.section}>
          <Container>
            <div className={styles.grid}>
              <div className={styles.formWrap}>
                <ContactForm />
              </div>
              <aside className={styles.info}>
                <p className="eyebrow">Coordonnées</p>
                <h2 className={styles.infoTitle}>Informations de contact</h2>
                <ul className={styles.infoList}>
                  <li className={styles.infoItem}>
                    <MapPin size={18} color="var(--c-accent-secondary)" strokeWidth={1.5} aria-hidden="true" />
                    <span>Basée à Sion, Swiss Serenity Plus® accompagne ses clients dans toute la Suisse romande.</span>
                  </li>
                  <li className={styles.infoItem}>
                    <Phone size={18} color="var(--c-accent-secondary)" strokeWidth={1.5} aria-hidden="true" />
                    <a href="tel:+41762198513">+41 76 219 85 13</a>
                  </li>
                  <li className={styles.infoItem}>
                    <Mail size={18} color="var(--c-accent-secondary)" strokeWidth={1.5} aria-hidden="true" />
                    <a href="mailto:mireille.dayer@swiss-serenity-plus.ch">
                      mireille.dayer@swiss-serenity-plus.ch
                    </a>
                  </li>
                </ul>

                <div className={styles.mapWrap}>
                  <iframe
                    title="Localisation Swiss Serenity Plus — Sion, Valais"
                    src="https://maps.google.com/maps?q=Chemin+de+Clavoz+18,+1950+Sion,+Suisse&output=embed"
                    width="100%"
                    height="220"
                    style={{ border: 0, borderRadius: 12, display: "block" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

              </aside>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
