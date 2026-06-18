import { Metadata } from "next";
import { HeartHandshake, Sparkles, ShieldCheck } from "lucide-react";
import ServicePageTemplate from "../../components/ServicePageTemplate/ServicePageTemplate";
import { SITE_URL, OG_IMAGE, OG_DEFAULTS } from "../../lib/seo";

const PAGE_URL = `${SITE_URL}/entreprises/experience-client`;

export const metadata: Metadata = {
  title: "Amélioration Expérience Client PME — Swiss Serenity Plus",
  description: "Structurer votre expérience client pour renforcer fidélisation et image de marque. Accueil, suivi relationnel et parcours client externalisés en Suisse romande.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Expérience client & Suivi relationnel externalisé — Suisse romande",
    description: "Structurer et améliorer le parcours client pour renforcer satisfaction et fidélisation. Qualité, professionnalisme et sens du détail. PME en Suisse romande.",
    url: PAGE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amélioration expérience client PME — Swiss Serenity Plus",
    description: "Expérience client et suivi relationnel externalisés pour PME en Suisse romande.",
    images: [OG_IMAGE.url],
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Expérience client & Suivi relationnel",
  "serviceType": "Gestion de l'Expérience Client Externalisée",
  "provider": { "@type": "LocalBusiness", "@id": `${SITE_URL}/#business`, "name": "Swiss Serenity Plus" },
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Valais" },
    { "@type": "AdministrativeArea", "name": "Suisse romande" },
  ],
  "description": "Audit du parcours client, définition des standards de qualité, mise en place d'un suivi structuré et d'outils de fidélisation pour PME et indépendants.",
  "url": PAGE_URL,
};

export default function ExperienceClientPage() {
  return (
    <ServicePageTemplate
      eyebrow="Entreprises"
      title="Expérience client & Fidélisation"
      subtitle="Renforcer la satisfaction et la fidélisation de vos clients en structurant une expérience cohérente, professionnelle et mémorable."
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Entreprises", href: "/#services" },
        { label: "Expérience client" },
      ]}
      currentHref="/entreprises/experience-client"
      schema={serviceSchema}
      targetAudience={{
        eyebrow: null,
        description: "Ce service s'adresse aux entreprises, commerces et institutions qui souhaitent améliorer l'expérience client, renforcer leur image et créer une relation durable avec leur clientèle.",
        image: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/blog-covers/1780841740690-a969a7bc-f04e-43d8-9833-f5f6023b668c.png",
        profiles: [
          "PME, Commerces et Restaurants — Souhaitant renforcer la satisfaction et la fidélisation de leur clientèle.",
          "EMS, Institutions et lieux d'accueil — Souhaitant améliorer le parcours, le confort et la qualité perçue par les usagers et visiteurs.",
          "Entreprises en montée en gamme — Souhaitant valoriser leur image à travers une expérience client plus cohérente et professionnelle.",
          "Toute structure souhaitant professionnaliser son suivi relationnel — Mise en place d'échanges plus fluides, cohérents et personnalisés avec leurs clients ou usagers.",
        ],
      }}
      deliverables={{
        title: "Une expérience client à la hauteur de vos ambitions",
        items: [
          "Analyse de l'expérience client actuelle",
          "Mise en place de standards relationnels cohérents",
          "Amélioration du parcours et du suivi client",
          "Création d'outils de fidélisation adaptés",
          "Formation aux bonnes pratiques relationnelles",
          "Mesure et suivi de la satisfaction client",
        ],
      }}
      values={{
        eyebrow: "Nos valeurs",
        title: "Qualité, professionnalisme et sens du détail",
        image: "/logo-diamond.svg",
        columns: [
          { title: "Qualité", text: "Chaque point de contact client est pensé pour offrir une expérience cohérente et de haute tenue." },
          { title: "Professionnalisme", text: "Une image soignée et des interactions maîtrisées qui renforcent la crédibilité et la qualité perçue de votre structure." },
          { title: "Sens du détail", text: "Ce sont les petites attentions qui font les grandes fidélités. Aucun détail n'est laissé au hasard." },
        ],
      }}
      process={{
        columns: [
          { title: "Échange initial", text: "Comprendre votre clientèle, vos points forts et les axes d'amélioration de l'expérience client." },
          { title: "Analyse du parcours client", text: "Analyse du parcours client, de la première prise de contact jusqu'au suivi relationnel." },
          { title: "Plan d'amélioration", text: "Définition des priorités et des ajustements permettant d'améliorer durablement l'expérience client." },
          { title: "Mise en place", text: "Mise en place des améliorations, accompagnement des équipes et suivi dans la durée." },
        ],
      }}
      results={{
        columns: [
          { icon: HeartHandshake, title: "Fidélisation renforcée", text: "Des clients satisfaits qui reviennent et recommandent votre entreprise dans leur entourage." },
          { icon: Sparkles, title: "Image et crédibilité renforcées", text: "Une réputation de sérieux et de qualité qui devient un moteur de développement commercial." },
          { icon: ShieldCheck, title: "Moins de clients perdus", text: "Un suivi plus attentif permettant d'identifier rapidement les insatisfactions et de préserver la relation client." },
        ],
      }}
      ctaTitle={"Gagnez du temps.\nGagnez en sérénité.\nGagnez en qualité de vie."}
      ctaSubtitle="Prenons le temps d'un échange confidentiel et sans engagement pour faire le point sur vos priorités."
    />
  );
}
