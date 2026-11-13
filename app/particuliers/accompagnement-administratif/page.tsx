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
        title: "À qui s'adresse cet accompagnement ?",
        image: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/blog-covers/1779635065199-2abda4e7-22d7-4f8b-a1dc-79ef1d49bdc3.png",
        description: "Plus qu'une aide administrative : en tiers de confiance, formalités, caisse maladie et dossiers complexes sont pris en charge sur le terrain, à votre place, de Sion à toute la Suisse romande et jusqu'en Haute-Savoie.",
        profiles: [
          "Seniors et leurs proches : organisation du maintien à domicile ou de l'entrée en EMS, choix d'un établissement, inscriptions et démarches auprès des communes, du canton et des organismes d'aide…",
          "Expatriés, frontaliers et personnes qui s'installent en Suisse ou partent vivre en France : installation, permis, assurances, projet de travailler en Suisse et recherche d'emploi…",
          "Toute personne qui traverse une étape de vie : fin de carrière, entrée en maison de retraite, déménagement, changement de situation familiale, succession…",
          "Salariés aidants qui, en plus de leur travail, prennent soin au quotidien d'un membre de leur famille et ne trouvent plus le temps de tout gérer.",
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
            "Le Fil Conducteur est un accompagnement premium **concret et sur mesure**, pensé pour celles et ceux qui manquent de temps. En tiers de confiance, il prend en charge démarches et dossiers de A à Z, à votre place et sur le terrain, pour que chacun puisse se consacrer à l'essentiel.",
          ]}
          sections={[
            {
              Icon: Briefcase,
              heading: "Pour les chefs d'entreprise et leurs équipes",
              text: "Profitez d'un **bras droit externalisé** pour vos tâches administratives et commerciales : suivi de dossiers, relation clients, relation fournisseurs. Ni salaire fixe, ni charges sociales. Offrez aussi à vos collaborateurs une **banque d'heures** : ils l'utilisent pour leurs missions comme pour leurs besoins personnels, en toute confidentialité. Un geste fort pour leur bien-être et leur engagement.",
            },
            {
              Icon: HeartHandshake,
              heading: "À titre privé, pour vous et vos proches",
              text: "Papiers, dossiers, échanges avec l'AVS, l'AI ou votre caisse maladie : Le Fil Conducteur prend en charge toutes vos démarches administratives. Lorsqu'un proche perd en autonomie, il recherche et compare pour vous les solutions, du maintien à domicile à l'entrée en EMS ou en résidence seniors, en passant par les aides au quotidien. Il vous accompagne dans votre choix, puis coordonne la mise en place.\n\nVéritable tiers de confiance, Le Fil Conducteur ne se contente pas d'informer ou d'orienter : **il agit à votre place, sur le terrain**. Formulaires, relances, rendez-vous, accompagnement sur place, lien avec les administrations et les établissements : il pilote l'ensemble et mène tout à son terme, en toute confidentialité. Vous gardez la main sur chaque décision, et il reste à vos côtés dans la durée.",
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
          cta={{ label: "Demander un premier échange", href: "/contact", id: "b-fil-conducteur-cta-contact" }}
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
