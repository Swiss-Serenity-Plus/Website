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
      title="Renfort commercial & Appui opérationnel"
      subtitle="Une présence fiable pour faire avancer les projets, assurer les relances et maintenir le lien avec vos clients et vos partenaires."
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Entreprises", href: "/#services" },
        { label: "Suivi & Optimisation" },
      ]}
      currentHref="/entreprises/suivi-optimisation"
      schema={serviceSchema}
      targetAudience={{
        eyebrow: null,
        title: "Un partenaire de confiance et opérationnel pour tous les secteurs d'activité",
        description: "Une présence externalisée fiable et efficace pour contribuer activement à votre croissance.",
        image: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/blog-covers/1780938230652-838d8a4d-0be3-4345-b4d6-b3306d4d9ef1.png",
        profiles: [
          { title: "Indépendants, Commerces & PME", text: "Développement commercial, opportunités de croissance et nouveaux partenariats" },
          { title: "Cabinets médicaux & EMS", text: "Recherche de solutions, d'équipements et de partenaires adaptés aux besoins du terrain" },
          { title: "Communes, Fondations & Associations", text: "Développement de projets, services et collaborations de proximité" },
          { title: "Entreprises souhaitant dynamiser leur activité", text: "Renforcement du suivi client et développement de nouvelles opportunités" },
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
        eyebrow: "Notre engagement",
        title: "Performance, Précision et Continuité au service de votre développement",
        columns: [
          { title: "Performance", text: "Des solutions adaptées pour soutenir efficacement vos objectifs de développement.", image: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/IconPerformance-removebg-preview.png" },
          { title: "Précision", text: "Une attention portée à chaque détail pour un travail précis et fiable.", image: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/IconPr%C3%A9cision-removebg-preview.png" },
          { title: "Continuité", text: "Une présence stable et cohérente pour maintenir la continuité des échanges, préserver le lien relationnel et assurer une dynamique durable.", image: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/1779726239026-b4b74479-5b8d-4531-9596-018c061b7fba-removebg-preview.png" },
        ],
      }}
      process={{
        title: "Une collaboration pensée pour votre activité",
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
