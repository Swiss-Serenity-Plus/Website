import { Metadata } from "next";
import { Clock, Smile, TrendingUp } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate/ServicePageTemplate";
import { SITE_URL, OG_IMAGE, OG_DEFAULTS } from "../../lib/seo";

const PAGE_URL = `${SITE_URL}/entreprises/structuration-organisation`;

export const metadata: Metadata = {
  title: "Office Manager Externalisé Valais — Structuration & Organisation — Swiss Serenity Plus",
  description: "Office manager externalisé à Sion — audit organisationnel, procédures, outils de suivi adaptés. Fluidifiez votre fonctionnement sans recruter. Valais, Suisse romande.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Structuration & Organisation externalisée — Valais & Suisse romande",
    description: "Office manager externalisé pour PME et indépendants en Valais. Audit, procédures, outils de suivi. Fluidité opérationnelle sans charge salariale.",
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Structuration & Organisation externalisée — Swiss Serenity Plus",
    description: "Office manager externalisé pour PME et indépendants en Valais.",
    images: [OG_IMAGE.url],
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Structuration & Organisation de l'activité",
  "serviceType": "Office Management Externalisé",
  "provider": { "@type": "LocalBusiness", "@id": `${SITE_URL}/#business`, "name": "Swiss Serenity Plus" },
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Valais" },
    { "@type": "AdministrativeArea", "name": "Suisse romande" },
  ],
  "description": "Audit organisationnel, cartographie des processus, mise en place d'outils de suivi et de procédures standardisées pour PME et indépendants en Suisse romande.",
  "url": PAGE_URL,
};

export default function StructurationPage() {
  return (
    <ServicePageTemplate
      eyebrow="Entreprises"
      title="Coordination & Performance opérationnelle"
      subtitle="Fluidifier les échanges et structurer votre organisation pour vous permettre de vous recentrer sur l'essentiel : votre activité et son développement."
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Entreprises", href: "/#services" },
        { label: "Structuration & Organisation" },
      ]}
      currentHref="/entreprises/structuration-organisation"
      schema={serviceSchema}
      targetAudience={{
        eyebrow: null,
        title: "Contextes d'intervention",
        description: "Un accompagnement pensé pour les structures souhaitant améliorer la coordination entre les différents intervenants internes, renforcer leur organisation et gagner en efficacité au quotidien.",
        profiles: [
          "Communes, Institutions ou EMS souhaitant améliorer la circulation des informations et la coordination administrative au quotidien.",
          "Dirigeants ou Indépendants souhaitant alléger leur gestion quotidienne et bénéficier d'un soutien fiable dans la coordination de leurs activités.",
          "PME ou structures en développement souhaitant renforcer leur organisation et harmoniser leur fonctionnement interne.",
          "PPE et autres activités recherchant un appui dans l'organisation de leurs échanges, le suivi des demandes et leur gestion administrative courante.",
        ],
      }}
      deliverables={{
        title: "Ce que nous mettons en place ensemble",
        divider: true,
        items: [
          "Analyse et clarification des échanges, des rôles et des responsabilités",
          "Structuration des suivis, des demandes et des priorités quotidiennes",
          "Soutien dans la gestion administrative et le suivi opérationnel",
          "Mise en place d'outils simples et adaptés pour faciliter les suivis et les échanges",
          "Coordination des informations, des tâches et des échanges entre les différents intervenants",
          "Accompagnement personnalisé selon les besoins et le fonctionnement de votre structure",
        ],
      }}
      values={{
        eyebrow: "Les valeurs qui nous guident",
        title: "Rigueur, clarté et fiabilité au service de votre organisation",
        image: "/icons/clarte-ampoule.svg",
        columns: [
          { title: "Rigueur", text: "Chaque demande, chaque suivi et chaque échange est traité avec méthode, attention et précision." },
          { title: "Clarté", text: "Des outils simples, des échanges facilités et des méthodes compréhensibles pour gagner en efficacité sans complexifier votre fonctionnement." },
          { title: "Fiabilité", text: "Une organisation qui fonctionne même en votre absence, avec des suivis clairs, fluides et continus.", image: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/Icon%20Swiss%20Serenity%20Plus.png" },
        ],
      }}
      process={{
        title: "Une collaboration pensée avec méthode",
        columns: [
          { title: "Premier échange", text: "Un entretien approfondi pour comprendre votre activité, vos contraintes et vos besoins." },
          { title: "Analyse de vos besoins et priorités", text: "Identification des ajustements nécessaires pour fluidifier les échanges, clarifier les suivis et améliorer l'organisation globale de votre activité." },
          { title: "Solutions et Actions concrètes", text: "Définition des outils, méthodes et solutions adaptés à votre fonctionnement et aux réalités de votre activité." },
          { title: "Suivi et Ajustements", text: "Suivi des actions mises en place et ajustements selon l'évolution de votre activité et de vos besoins." },
        ],
      }}
      results={{
        title: "Les bénéfices d'une organisation plus fluide",
        columns: [
          { icon: Clock, title: "Plus de temps pour l'essentiel", text: "Des échanges mieux coordonnés et des suivis plus clairs pour limiter les pertes de temps et les demandes répétitives." },
          { icon: Smile, title: "Une activité plus fluide et plus sereine", text: "Une organisation plus claire et mieux coordonnée pour assurer des suivis fiables et une meilleure continuité dans les échanges et les actions." },
          { icon: TrendingUp, title: "Développement facilité", text: "Des échanges et des suivis mieux maîtrisés pour accompagner plus efficacement l'évolution de vos projets, de votre organisation et de vos priorités." },
        ],
      }}
    />
  );
}
