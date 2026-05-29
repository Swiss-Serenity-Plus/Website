import { Metadata } from "next";
import { Leaf, BadgeCheck, Users } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate/ServicePageTemplate";
import { SITE_URL, OG_IMAGE, OG_DEFAULTS } from "../../lib/seo";

const PAGE_URL = `${SITE_URL}/particuliers/accompagnement-administratif`;

export const metadata: Metadata = {
  title: "Aide Administrative Valais — Seniors & Particuliers — Swiss Serenity Plus",
  description: "Aide administrative pour particuliers, seniors et retraités en Valais. Démarches AVS, caisse maladie, succession, déménagement. Discrétion et bienveillance garanties.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Accompagnement administratif des particuliers — Valais & Suisse romande",
    description: "Aide dans les démarches administratives du quotidien pour seniors, expatriés et particuliers en Valais. AVS, caisse maladie, étapes de vie. Confidentialité absolue.",
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aide administrative Valais — seniors & particuliers — Swiss Serenity Plus",
    description: "Accompagnement administratif pour particuliers et seniors en Valais.",
    images: [OG_IMAGE.url],
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Accompagnement administratif des Particuliers",
  "serviceType": "Aide Administrative pour Particuliers",
  "provider": { "@type": "LocalBusiness", "@id": `${SITE_URL}/#business`, "name": "Swiss Serenity Plus" },
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Valais" },
    { "@type": "AdministrativeArea", "name": "Suisse romande" },
  ],
  "description": "Accompagnement bienveillant dans les démarches administratives du quotidien pour particuliers, seniors et retraités en Valais. AVS, caisse maladie, succession, déménagement.",
  "url": PAGE_URL,
};

export default function AccompagnementAdministratifPage() {
  return (
    <ServicePageTemplate
      eyebrow="Particuliers"
      title="Un accompagnement personnalisé"
      subtitle="Un soutien bienveillant et discret pour simplifier vos démarches administratives et vous accompagner dans les étapes importantes de votre vie."
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Particuliers" },
        { label: "Accompagnement administratif" },
      ]}
      currentHref="/particuliers/accompagnement-administratif"
      schema={serviceSchema}
      targetAudience={{
        eyebrow: null,
        description: "Pensé pour les personnes souhaitant gagner en sérénité face à des démarches administratives ou des situations de vie nécessitant soutien et organisation.",
        profiles: [
          "Seniors souhaitant un soutien administratif et organisationnel dans leurs démarches et lors des étapes importante de la vie.",
          "Expatriés et frontaliers confrontés aux démarches administratives suisses ou transfrontalières.",
          "Toute personne confrontée à une étape importante de la vie nécessitant organisation et accompagnement (Retraite, déménagement, entrée en EMS...)",
          "Celui ou Celle\nà la recherche d'une meilleure qualité de vie et de plus de sérénité face aux démarches administratives.",
        ],
      }}
      deliverables={{
        eyebrow: "Un soutien adapté à chaque besoin",
        title: "Un soutien concret au quotidien",
        items: [
          "Gestion et suivi de vos courriers administratifs",
          "Soutien dans vos échanges avec les organismes et administrations (AVS, AI, Caisses maladie, Home, EMS, Assurances...)",
          "Organisation et classement de vos documents importants",
          "Aide à la compréhension des démarches et procédures complexes",
          "Coordination avec les différents interlocuteurs",
          "Soutien organisationnel et administratif lors d'étapes importantes de la vie (retraite, entrée en EMS, hospitalisation...)",
        ],
      }}
      values={{
        eyebrow: "Nos valeurs",
        title: "Rigueur, discrétion et bienveillance dans chaque accompagnement",
        columns: [
          { title: "Bienveillance", text: "Une écoute attentive et un accompagnement à votre rythme, sans jugement et avec une patience sincère." },
          { title: "Discrétion", text: "Vos informations personnelles sont traitées avec une confidentialité absolue et un respect total." },
          { title: "Rigueur", text: "Chaque démarche est conduite avec soin pour que rien ne soit oublié et que tout soit fait dans les règles." },
        ],
      }}
      process={{
        columns: [
          { title: "Premier contact", text: "Un entretien chaleureux pour comprendre votre situation, vos besoins et les démarches à accomplir." },
          { title: "Évaluation", text: "Analyse complète de votre dossier et identification des priorités et des échéances." },
          { title: "Plan d'accompagnement", text: "Proposition d'un accompagnement adapté à votre rythme et à vos besoins spécifiques." },
          { title: "Suivi bienveillant", text: "Gestion des démarches avec vous, en vous tenant informé à chaque étape." },
        ],
      }}
      results={{
        title: "Ce que vous y gagnez",
        columns: [
          { icon: Leaf, title: "Sérénité retrouvée", text: "Vous déléguez ce qui vous pèse à quelqu'un de fiable. Vous vous concentrez sur l'essentiel." },
          { icon: BadgeCheck, title: "Aucune démarche manquée", text: "Un suivi rigoureux des échéances et des procédures pour éviter oublis et complications." },
          { icon: Users, title: "Du temps pour vos priorités", text: "Un soutien discret et personnalisé pour vous permettre de vous concentrer sur vos priorités et vos loisirs en toute sérénité." },
        ],
      }}
    />
  );
}
