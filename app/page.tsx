import { Metadata } from "next";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Hero from "./components/Hero/Hero";
import MountainDecor from "./components/MountainDecor/MountainDecor";
import ValueProp3Col from "./components/ValueProp3Col/ValueProp3Col";
import ServiceSection from "./components/ServiceSection/ServiceSection";
import LocalTrust from "./components/LocalTrust/LocalTrust";
import AboutTeaser from "./components/AboutTeaser/AboutTeaser";
import ContactCTA from "./components/ContactCTA/ContactCTA";
import { ALL_SERVICES } from "./data/services";
import { SITE_URL, OG_DEFAULTS } from "./lib/seo";

export const metadata: Metadata = {
  title: "Swiss Serenity Plus — Bras droit externalisé pour dirigeants en Suisse romande",
  description: "Bras droit business externalisé pour entrepreneurs et PME en Suisse romande. Structuration, suivi, expérience client et accompagnement particuliers. Sion, Valais.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Swiss Serenity Plus — Bras droit externalisé pour dirigeants en Suisse romande",
    description: "Bras droit business externalisé pour entrepreneurs et PME en Suisse romande. Structuration, suivi, expérience client et accompagnement particuliers. Sion, Valais.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiss Serenity Plus — Bras droit externalisé pour dirigeants en Suisse romande",
    description: "Bras droit business externalisé pour entrepreneurs et PME en Suisse romande. Sion, Valais.",
  },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <MountainDecor />
        <Hero />
        <ValueProp3Col />
        <ServiceSection
          id="services"
          eyebrow="Domaines d'intervention"
          title="Un accompagnement sur mesure pour chaque besoin"
          intro="Cinq piliers de service pour les dirigeants d'entreprise et les particuliers en Suisse romande."
          cards={ALL_SERVICES}
        />
        <AboutTeaser />
        <LocalTrust />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
