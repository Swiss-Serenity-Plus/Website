import { Metadata } from "next";
import { BadgeCheck, Users } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate/ServicePageTemplate";
import OfferModalities from "../../components/OfferModalities/OfferModalities";
import LotusIcon from "../../components/icons/LotusIcon";
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
      title="Une approche humaine et sur mesure"
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
        image: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/blog-covers/1779635065199-2abda4e7-22d7-4f8b-a1dc-79ef1d49bdc3.png",
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
        title: "Rigueur • Discrétion • Bienveillance",
        titleOneLine: true,
        columns: [
          { title: "Bienveillance", text: "Une écoute attentive et un accompagnement à votre rythme, sans jugement et avec une patience sincère.", image: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/image-removebg-preview.png" },
          { title: "Discrétion", text: "Vos informations personnelles sont traitées avec une confidentialité absolue et un respect total.", image: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/image-removebg-preview%20(1).png" },
          { title: "Rigueur", text: "Chaque démarche est conduite avec soin pour que rien ne soit oublié et que tout soit fait dans les règles.", image: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/icons/IconPre%CC%81cision-removebg-preview.png" },
        ],
      }}
      afterProcess={<OfferModalities />}
      process={{
        eyebrow: "Notre prise en charge",
        title: "Un accompagnement structuré et personnalisé",
        columns: [
          { title: "Premier échange", text: "Un entretien chaleureux, à votre écoute, pour comprendre votre situation, vos attentes et les démarches à envisager." },
          { title: "Analyse personnalisée", text: "Etude attentive de votre dossier afin d'identifier les priorités et les solutions les plus adaptées." },
          { title: "Proposition d'accompagnement", text: "Mise en place de solutions adaptées à vos besoins et à votre rythme." },
          { title: "Suivi dédié", text: "Une prise en charge discrète et attentive, avec un suivi régulier à chaque étape." },
        ],
      }}
      results={{
        eyebrow: "Des bénéfices concrets",
        title: "Ce que vous y gagnez",
        description: "Un accompagnement fiable et structuré pour alléger vos préoccupations administratives et retrouver davantage de tranquillité d'esprit.",
        columns: [
          { icon: LotusIcon, title: "Un quotidien plus serein", text: "Vous déléguez ce qui vous pèse à quelqu'un de fiable. Vous vous concentrez sur l'essentiel." },
          { icon: BadgeCheck, title: "Une charge mentale allégée", text: "Un suivi rigoureux des échéances et des procédures pour éviter oublis et complications." },
          { icon: Users, title: "Du temps pour vos priorités", text: "Un soutien discret et personnalisé pour vous permettre de vous concentrer sur vos priorités et vos loisirs en toute sérénité." },
        ],
      }}
    />
  );
}
