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
      title="Structuration & Organisation de l'activité"
      subtitle="Simplifier et fluidifier votre organisation pour que vous puissiez vous concentrer sur ce qui compte vraiment: votre activité principale et votre croissance."
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Entreprises", href: "/#services" },
        { label: "Structuration & Organisation" },
      ]}
      currentHref="/entreprises/structuration-organisation"
      schema={serviceSchema}
      targetAudience={{
        eyebrow: null,
        description: "Ce service s'adresse aux dirigeants et entrepreneurs qui ressentent que leur organisation interne freine leur développement.",
        profiles: [
          "PME en croissance dont les processus n'ont pas suivi le rythme",
          "Indépendants qui souhaitent professionnaliser leur fonctionnement",
          "Dirigeants qui passent trop de temps dans l'administratif",
          "Entreprises en phase de transition ou de restructuration",
        ],
      }}
      deliverables={{
        title: "Ce que nous mettons en place ensemble",
        items: [
          "Audit complet de votre organisation actuelle",
          "Cartographie des processus existants",
          "Identification et suppression des points de friction",
          "Mise en place d'outils simples et adaptés pour faciliter les suivis et les échanges",
          "Création de procédures standardisées",
          "Formation et accompagnement à la prise en main",
        ],
      }}
      values={{
        eyebrow: "Les valeurs qui nous guident",
        title: "Rigueur, clarté et fiabilité au service de votre organisation",
        columns: [
          { title: "Rigueur", text: "Chaque demande, chaque suivi et chaque échange est traité avec méthode, attention et précision." },
          { title: "Clarté", text: "Des outils simples, des procédures compréhensibles. L'efficacité sans la complexité." },
          { title: "Fiabilité", text: "Une organisation qui fonctionne même en votre absence, avec des suivis clairs, fluides et continus." },
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
