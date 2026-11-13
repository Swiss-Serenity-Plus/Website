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
  title: "Swiss Serenity Plus ⎜ Bras droit externalisé pour dirigeants en Suisse romande",
  description: "Offrez à vos salariés plus qu’une écoute : un tiers de confiance qui fait leurs démarches à leur place. Réduisez l’absentéisme et la charge mentale.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Swiss Serenity Plus ⎜ Bras droit externalisé pour dirigeants en Suisse romande",
    description: "Offrez à vos salariés plus qu’une écoute : un tiers de confiance qui fait leurs démarches à leur place. Réduisez l’absentéisme et la charge mentale.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiss Serenity Plus ⎜ Bras droit externalisé pour dirigeants en Suisse romande",
    description: "Offrez à vos salariés plus qu’une écoute : un tiers de confiance qui fait leurs démarches à leur place. Réduisez l’absentéisme et la charge mentale.",
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
          title="Vos démarches et votre activité, prises en charge jusqu'au bout"
          intro="Démarches administratives, relation client et fournisseurs : un appui sur le terrain pour les particuliers, les entreprises et les institutions, en Valais, en Suisse romande et dans le bassin genevois franco-suisse."
          cards={[...ALL_SERVICES.slice(3), ...ALL_SERVICES.slice(0, 3)]}
        />
        <AboutTeaser />
        <LocalTrust />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
