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
          title="Un tiers de confiance qui agit à votre place"
          intro="Pour vous, un proche, vos collaborateurs ou votre entreprise : dossiers AVS, AI ou EMS, grandes étapes de vie, démarches entre la Suisse et la France, appui à la direction. Une prise en charge complète, en Suisse romande et en Haute-Savoie."
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
