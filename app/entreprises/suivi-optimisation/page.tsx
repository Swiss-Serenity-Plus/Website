import { Metadata } from "next";
import { Target, Handshake, BarChart3 } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate/ServicePageTemplate";
import { SITE_URL, OG_IMAGE, OG_DEFAULTS } from "../../lib/seo";

const PAGE_URL = `${SITE_URL}/entreprises/suivi-optimisation`;

export const metadata: Metadata = {
  title: "Support Opérationnel Externalisé PME — Suivi & Optimisation — Swiss Serenity Plus",
  description: "Suivi opérationnel externalisé pour PME en Suisse romande : relance client, contenus, fournisseurs. Continuité et rigueur sans ressource interne dédiée. Valais.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Suivi & Optimisation externalisé — PME & Indépendants en Suisse romande",
    description: "Support opérationnel externalisé : suivi clients, contenus, fournisseurs. Rigueur et continuité sans charge salariale. Basé à Sion, Valais.",
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Suivi & Optimisation externalisé — Swiss Serenity Plus",
    description: "Support opérationnel externalisé pour PME en Suisse romande.",
    images: [OG_IMAGE.url],
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Suivi & Optimisation de l'activité",
  "serviceType": "Support Opérationnel Externalisé",
  "provider": { "@type": "LocalBusiness", "@id": `${SITE_URL}/#business`, "name": "Swiss Serenity Plus" },
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Valais" },
    { "@type": "AdministrativeArea", "name": "Suisse romande" },
  ],
  "description": "Suivi régulier du portefeuille clients, animation des contenus, optimisation des relations fournisseurs et reporting de performance pour PME et indépendants.",
  "url": PAGE_URL,
};

export default function SuiviOptimisationPage() {
  return (
    <ServicePageTemplate
      eyebrow="Entreprises"
      title="Suivi & Optimisation de l'activité"
      subtitle="Un regard régulier sur votre activité pour anticiper, ajuster et optimiser. Continuité et précision au service de votre performance."
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Entreprises", href: "/#services" },
        { label: "Suivi & Optimisation" },
      ]}
      currentHref="/entreprises/suivi-optimisation"
      schema={serviceSchema}
      targetAudience={{
        description: "Ce service s'adresse aux dirigeants qui ont besoin d'un suivi régulier et rigoureux sans mobiliser de ressources internes dédiées.",
        profiles: [
          "Dirigeants qui manquent de temps pour le suivi opérationnel",
          "Entreprises avec un portefeuille clients à animer régulièrement",
          "PME qui souhaitent optimiser leurs relations fournisseurs",
          "Indépendants en croissance qui veulent structurer leur suivi",
        ],
      }}
      deliverables={{
        eyebrow: "Ce que nous vous apportons",
        title: "Un soutien au service de votre croissance",
        items: [
          "Fidélisation et optimisation de votre portefeuille clients",
          "Mise à jour, relecture et correction de vos contenus (site internet, supports, flyers, documents…)",
          "Sélection de partenaires et solutions adaptés à votre développement",
          "Suivi commercial, relances et continuité des échanges",
          "Points réguliers et coordination des actions",
          "Veille sectorielle, réglementaire et identification d'opportunités",
        ],
      }}
      values={{
        title: "Discrétion, précision et continuité dans chaque mission",
        columns: [
          { title: "Discrétion", text: "Une présence discrète mais constante. Je m'intègre dans votre fonctionnement sans le perturber." },
          { title: "Précision", text: "Chaque détail compte. Aucune information importante ne passe entre les mailles." },
          { title: "Continuité", text: "Un suivi régulier et cohérent dans le temps. Pas de rupture, pas de perte d'information." },
        ],
      }}
      process={{
        columns: [
          { title: "Premier Échange", text: "Comprendre votre activité, vos priorités et vos enjeux de développement." },
          { title: "Analyse et identification des opportunités", text: "Evaluer l'existant, identifier les axes d'amélioration et les leviers de croissance." },
          { title: "Mise en place d'une organisation pensée pour votre activité", text: "Définition des actions, sélection des outils et mise en place d'un fonctionnement cohérent avec votre organisation." },
          { title: "Accompagnement dans la durée", text: "Une présence régulière pour accompagner l'évolution de votre activité, maintenir la dynamique commerciale et assurer la continuité des actions." },
        ],
      }}
      results={{
        eyebrow: "Ce que Swiss Serenity Plus vous apporte",
        title: "Des bénéfices concrets pour votre activité",
        columns: [
          { icon: Target, title: "Une dynamique commerciale renforcée", text: "Un portefeuille client entretenu avec régularité pour maintenir des échanges actifs et une relation durable." },
          { icon: Handshake, title: "Des partenariats plus cohérents et efficaces", text: "Fournisseurs, partenaires et solutions sélectionnés avec attention pour accompagner votre activité dans la durée." },
          { icon: BarChart3, title: "Plus de sérénité dans votre activité", text: "Une présence fiable pour maintenir la continuité des actions, limiter les oublis et préserver une dynamique commerciale dans le temps." },
        ],
      }}
    />
  );
}
