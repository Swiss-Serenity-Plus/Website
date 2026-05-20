import { Metadata } from "next";
import { Timer, ShieldCheck, Network } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate/ServicePageTemplate";
import { SITE_URL, OG_IMAGE, OG_DEFAULTS } from "../../lib/seo";

const PAGE_URL = `${SITE_URL}/entreprises/sourcing-partenaires`;

export const metadata: Metadata = {
  title: "Sourcing Partenaires & Fournisseurs Suisse — Swiss Serenity Plus",
  description: "Recherche, sélection et coordination de partenaires et fournisseurs pour PME en Suisse. Sourcing stratégique externalisé depuis Sion, Valais. Sélection rigoureuse.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Sourcing & Gestion des partenaires commerciaux — Suisse romande",
    description: "Identifier, sélectionner et coordonner les bons partenaires pour vos PME en Suisse romande. Sourcing stratégique externalisé, approche de confiance.",
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sourcing partenaires & fournisseurs — Swiss Serenity Plus",
    description: "Sourcing stratégique externalisé pour PME en Suisse romande.",
    images: [OG_IMAGE.url],
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Sourcing & Gestion des partenaires commerciaux",
  "serviceType": "Sourcing Stratégique Externalisé",
  "provider": { "@type": "LocalBusiness", "@id": `${SITE_URL}/#business`, "name": "Swiss Serenity Plus" },
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Suisse" },
    { "@type": "AdministrativeArea", "name": "Suisse romande" },
  ],
  "description": "Identification, présélection, évaluation et coordination de partenaires et fournisseurs de confiance pour renforcer la capacité d'exécution des PME.",
  "url": PAGE_URL,
};

export default function SourcingPartenairesPage() {
  return (
    <ServicePageTemplate
      eyebrow="Entreprises"
      title="Sélection & Coordination de Partenaires de confiance"
      subtitle="Une recherche et une coordination d'intervenants fiables pour répondre aux réalités de votre activité."
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Entreprises", href: "/#services" },
        { label: "Sourcing & Partenaires" },
      ]}
      currentHref="/entreprises/sourcing-partenaires"
      schema={serviceSchema}
      targetAudience={{
        eyebrow: null,
        title: "Une solution adaptée à différents secteurs d'activité",
        description: "Un appui fiable pour faciliter la recherche, la coordination et le suivi de vos collaborations externes.",
        profiles: [
          "PME, Indépendants et Commerces — Identification de prestataires fiables pour soutenir vos projets et votre évolution.",
          "Cabinets médicaux, EMS, Institutions et PPE — Recherche de fournisseurs et de collaborations adaptés aux exigences du secteur.",
          "Entreprises et Organisations nécessitant une coordination renforcée — Gestion cohérente des échanges entre les différents intervenants et partenaires.",
          "Professionnels souhaitant développer un réseau de collaboration fiable — Coordination et mise en relation avec des interlocuteurs adaptés à vos projets.",
        ],
      }}
      deliverables={{
        eyebrow: "Ce que Swiss Serenity Plus vous apporte",
        title: "Une sélection rigoureuse de A à Z",
        items: [
          "Définition précise du profil de partenaire recherché",
          "Identification et présélection d'interlocuteurs pertinents",
          "Evaluation de la fiabilité et de la cohérence des partenaires",
          "Encadrement des premiers échanges et négociations",
          "Définition et mise en place des modalités de collaboration",
          "Suivi et coordination des partenaires actifs",
        ],
      }}
      values={{
        title: "Une sélection rigoureuse basée sur l'efficacité et la confiance",
        eyebrow: "Nos valeurs",
        columns: [
          { title: "Rigueur", text: "Chaque partenaire est évalué selon des critères exigeants de qualité, fiabilité et compatibilité avec votre culture." },
          { title: "Fiabilité", text: "Des relations fondées sur la transparence et le respect mutuel. Vos partenaires deviennent de véritables alliés." },
          { title: "Engagement", text: "Swiss Serenity Plus reste votre interlocuteur central pour assurer la continuité et la fluidité des échanges entre les différents intervenants." },
        ],
      }}
      process={{
        title: "Une approche structurée et progressive",
        columns: [
          { title: "Premier Échange", text: "Définition de vos attentes, de vos critères prioritaires et du contexte de votre recherche." },
          { title: "Analyse des collaborations existantes", text: "Identification des points de vigilance, des besoins complémentaires et des opportunités d'amélioration." },
          { title: "Recherche et Sélection", text: "Recherche ciblée et sélection des collaborations les plus pertinentes pour votre projet." },
          { title: "Mise en relation et Suivi", text: "Accompagnement des échanges, coordination des collaborations et suivi dans la durée." },
        ],
      }}
      results={{
        title: "Les bénéfices de cette approche",
        columns: [
          { icon: Timer, title: "Un gain de temps significatif", text: "Vous ne passez plus des heures à chercher, comparer et négocier. Swiss Serenity Plus le fait pour vous." },
          { icon: ShieldCheck, title: "Qualité d'exécution renforcée", text: "Des partenaires sélectionnés avec soin qui livrent un travail à la hauteur de vos exigences." },
          { icon: Network, title: "Réseau solide et durable", text: "Des relations partenaires bien construites qui deviennent un actif stratégique pour votre développement." },
        ],
      }}
    />
  );
}
