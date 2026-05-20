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
      title="Accompagnement administratif des Particuliers"
      subtitle="Un soutien bienveillant et discret pour vos démarches administratives du quotidien et les étapes importantes de votre vie."
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Particuliers" },
        { label: "Accompagnement administratif" },
      ]}
      currentHref="/particuliers/accompagnement-administratif"
      schema={serviceSchema}
      targetAudience={{
        description: "Ce service s'adresse à toute personne qui souhaite être accompagnée dans des démarches administratives complexes ou chronophages.",
        profiles: [
          "Séniors qui souhaitent un soutien dans leurs démarches du quotidien",
          "Expatriés qui découvrent les procédures administratives suisses",
          "Personnes traversant une étape clé (succession, déménagement, retraite)",
          "Toute personne débordée par des démarches administratives",
        ],
      }}
      deliverables={{
        title: "Un accompagnement sur mesure à chaque étape",
        items: [
          "Gestion et suivi de vos courriers administratifs",
          "Accompagnement dans les démarches auprès des administrations",
          "Organisation et classement de vos documents importants",
          "Aide dans la compréhension des procédures complexes",
          "Coordination avec les différents interlocuteurs",
          "Soutien lors d'étapes de vie importantes (succession, retraite, déménagement)",
        ],
      }}
      values={{
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
