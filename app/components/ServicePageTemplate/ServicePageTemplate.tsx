// ServicePageTemplate — template réutilisé pour les 5 pages services.
import type { LucideIcon } from "lucide-react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import PageHero from "../PageHero/PageHero";
import TargetAudience from "../TargetAudience/TargetAudience";
import DeliverablesList from "../DeliverablesList/DeliverablesList";
import ColumnsBlock from "../ColumnsBlock/ColumnsBlock";
import RelatedServices from "../RelatedServices/RelatedServices";
import ContactCTA from "../ContactCTA/ContactCTA";
import { ALL_SERVICES } from "../../data/services";

interface ServicePageTemplateProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  breadcrumbs: { label: string; href?: string }[];
  currentHref: string;
  schema?: object;
  targetAudience: {
    eyebrow?: string | null;
    title?: string;
    description: string;
    profiles: (string | { title: string; text: string })[];
  };
  deliverables: {
    eyebrow?: string;
    title: string;
    items: string[];
  };
  values: {
    eyebrow?: string;
    title: string;
    columns: { title: string; text: string; image?: string }[];
    image?: string;
  };
  process: {
    eyebrow?: string;
    title?: string;
    columns: { title: string; text: string }[];
  };
  results: {
    eyebrow?: string;
    title?: string;
    description?: string;
    columns: { title: string; text: string; icon?: LucideIcon }[];
  };
  ctaTitle?: string;
  ctaSubtitle?: string;
}

const SITE_URL = "https://swiss-serenity-plus.ch";

export default function ServicePageTemplate({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  currentHref,
  schema,
  targetAudience,
  deliverables,
  values,
  process,
  results,
  ctaTitle,
  ctaSubtitle,
}: ServicePageTemplateProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      item: `${SITE_URL}${crumb.href ?? currentHref}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      )}
      <Header />
      <main>
        <PageHero
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs}
        />
        <TargetAudience
          eyebrow={targetAudience.eyebrow}
          title={targetAudience.title}
          description={targetAudience.description}
          profiles={targetAudience.profiles}
        />
        <DeliverablesList
          eyebrow={deliverables.eyebrow}
          title={deliverables.title}
          items={deliverables.items}
        />
        <ColumnsBlock
          eyebrow={values.eyebrow ?? "Nos valeurs sur ce pilier"}
          title={values.title}
          columns={values.columns}
          variant="values"
          background="surface"
          headerImage={values.image}
        />
        <ColumnsBlock
          eyebrow={process.eyebrow ?? "Notre méthode"}
          title={process.title ?? "Un accompagnement en quatre étapes"}
          columns={process.columns}
          variant="numbered"
          background="bg"
          cols={2}
        />
        <ColumnsBlock
          eyebrow={results.eyebrow ?? "Résultats concrets"}
          title={results.title ?? "Ce que vous gagnez concrètement"}
          description={results.description}
          columns={results.columns}
          variant="results"
          background="surface"
        />
        <RelatedServices currentHref={currentHref} services={ALL_SERVICES} />
        <ContactCTA title={ctaTitle} subtitle={ctaSubtitle} />
      </main>
      <Footer />
    </>
  );
}
