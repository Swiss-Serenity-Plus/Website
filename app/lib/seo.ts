export const SITE_URL = "https://swiss-serenity-plus.ch";

export const OG_IMAGE = {
  url: "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/image.png",
  width: 480,
  height: 600,
  alt: "Mireille Dayer, fondatrice de Swiss Serenity Plus — bras droit externalisé en Suisse romande",
};

export const OG_DEFAULTS = {
  siteName: "Swiss Serenity Plus",
  locale: "fr_CH",
  type: "website" as const,
};

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

/**
 * Construit un objet BreadcrumbList schema.org a partir d'un fil d'Ariane.
 * Le dernier item (page courante, sans href) n'expose pas de propriete "item".
 */
export function buildBreadcrumbJsonLd(entries: BreadcrumbEntry[]) {
  const toUrl = (href: string) => {
    if (href.includes("http")) return href;
    if (href.startsWith("/")) return `${SITE_URL}${href}`;
    return `${SITE_URL}/${href}`;
  };

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.label,
      ...(entry.href ? { item: toUrl(entry.href) } : {}),
    })),
  };
}
