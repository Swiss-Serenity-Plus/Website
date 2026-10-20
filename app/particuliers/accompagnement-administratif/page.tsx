import { Metadata } from "next";
import { BadgeCheck, Briefcase, HeartHandshake, MessageCircle, Route, Users } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate/ServicePageTemplate";
import OfferModalities from "../../components/OfferModalities/OfferModalities";
import HighlightBlock from "../../components/HighlightBlock/HighlightBlock";
import LotusIcon from "../../components/icons/LotusIcon";
import { SITE_URL, OG_IMAGE, OG_DEFAULTS } from "../../lib/seo";

const PAGE_URL = `${SITE_URL}/particuliers/accompagnement-administratif`;

export const metadata: Metadata = {
  title: "Aide Administrative Valais ⎜ Seniors & Particuliers ⎜ Swiss Serenity Plus",
  description: "Aide administrative pour particuliers, seniors et retraités en Valais. Démarches AVS, caisse maladie, succession, déménagement. Discrétion et bienveillance garanties.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Accompagnement administratif des particuliers ⎜ Valais & Suisse romande",
    description: "Aide dans les démarches administratives du quotidien pour seniors, expatriés et particuliers en Valais. AVS, caisse maladie, étapes de vie. Confidentialité absolue.",
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aide administrative Valais ⎜ seniors & particuliers ⎜ Swiss Serenity Plus",
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
        id: "profils-particuliers",
        eyebrow: null,
        image: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/blog-covers/1779635065199-2abda4e7-22d7-4f8b-a1dc-79ef1d49bdc3.png",
        description: "Pensé pour les personnes souhaitant gagner en sérénité face à des démarches administratives ou des situations de vie nécessitant soutien et organisation.",
        profiles: [
          "Seniors souhaitant un soutien administratif et organisationnel pour leurs démarches, leur maintien à domicile ou leur entrée en EMS.",
          "Expatriés et frontaliers confrontés aux démarches administratives suisses, françaises ou transfrontalières.",
          "Toute personne confrontée à une étape importante de la vie nécessitant organisation et coordination (retraite, déménagement, entrée en EMS, changement de situation familiale…).",
          "Personnes souhaitant gagner du temps, réduire leur charge administrative et avancer avec plus de sérénité dans leurs démarches.",
        ],
      }}
      deliverables={{
        eyebrow: "Accompagnement administratif personnalisé en Valais et dans toute la Suisse romande",
        title: "Un soutien concret au quotidien",
        items: [
          "Gestion et suivi de vos courriers et démarches administratives",
          "Accompagnement dans vos échanges avec les administrations et organismes (AVS, AI, caisses maladie, assurances, homes, EMS…)",
          "Organisation et classement de vos documents importants",
          "Explication et simplification des démarches administratives complexes",
          "Mise en relation, facilitation des échanges et coordination avec les administrations, les assurances et les autres services administratifs",
          "Prise en charge des situations administratives nécessitant un suivi renforcé",
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
      afterTargetAudience={
        <HighlightBlock
          id="fil-conducteur"
          title="Le Fil Conducteur : Votre qualité de vie, notre engagement"
          paragraphs={[
            "Le Fil Conducteur est un accompagnement premium, **concret et sur mesure**, pensé pour celles et ceux qui manquent de temps. Nous prenons en charge vos démarches et vos dossiers de A à Z, dans une relation de confiance et de bienveillance, pour que vous puissiez vous consacrer à l'essentiel.",
          ]}
          sections={[
            {
              Icon: Briefcase,
              heading: "Pour les chefs d'entreprise et leurs équipes",
              text: "Profitez d'un **bras droit externalisé**, sans charges salariales, pour vos tâches administratives, votre développement commercial et votre relation clients. Offrez aussi à vos collaborateurs une **banque d'heures** : ils l'utilisent pour leurs missions comme pour leurs besoins personnels, en toute confidentialité. Un geste fort pour leur bien-être et leur engagement.",
            },
            {
              Icon: HeartHandshake,
              heading: "Pour vous et vos proches",
              text: "Papiers, dossiers, échanges avec l'AVS, l'AI ou votre caisse maladie : nous vous aidons dans toutes vos démarches administratives. Lorsqu'un proche perd en autonomie, nous recherchons et comparons pour vous les différentes solutions, du maintien à domicile à l'entrée en EMS ou en résidence seniors, en passant par les services et les aides au quotidien. Nous vous accompagnons dans votre choix, puis coordonnons la mise en place.\n\nNous ne nous contentons pas de vous informer ou de vous orienter : **nous agissons pour vous, sur le terrain**. Nous constituons les dossiers, prenons les rendez-vous et suivons chaque démarche jusqu'au bout, en vous associant à chaque décision. Des points de suivi réguliers permettent ensuite de vérifier que la solution choisie vous convient toujours.",
            },
            {
              Icon: Route,
              heading: "Pour un nouveau départ entre la Suisse et la France",
              text: "Vous vous installez en Suisse, vous partez vivre en France ou vous êtes frontalier ? Quelle que soit la raison de ce nouveau départ, nous vous accompagnons dans les démarches pour qu'il se passe sereinement.",
            },
            {
              Icon: MessageCircle,
              heading: "Un suivi au plus près de vous",
              text: "Nous intervenons sur le terrain, par téléphone, en visioconférence ou par email, selon ce qui vous convient le mieux. Un seul point de contact connaît votre dossier : **vous n'avez plus à répéter votre situation** à chaque nouvel interlocuteur. Et à chaque étape, vous recevez un compte rendu clair.",
            },
          ]}
        />
      }
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
