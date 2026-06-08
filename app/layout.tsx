import type { Metadata } from "next";
import { SITE_URL, OG_IMAGE, OG_DEFAULTS } from "./lib/seo";
import "./globals.css";

const LOGO_URL = "https://pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev/photos-site/Logo%20Serenity%20Plus.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Swiss Serenity Plus — Bras droit externalisé en Suisse romande",
  description: "Bras droit externalisé haut de gamme pour entrepreneurs et PME en Suisse romande.",
  icons: {
    icon: [{ url: LOGO_URL, type: "image/png" }],
    shortcut: [{ url: LOGO_URL, type: "image/png" }],
    apple: [{ url: LOGO_URL, type: "image/png" }],
  },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Swiss Serenity Plus — Bras droit externalisé en Suisse romande",
    description: "Bras droit externalisé haut de gamme pour entrepreneurs et PME en Suisse romande.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiss Serenity Plus — Bras droit externalisé en Suisse romande",
    description: "Bras droit externalisé haut de gamme pour entrepreneurs et PME en Suisse romande.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": `${SITE_URL}/#business`,
  "name": "Swiss Serenity Plus",
  "alternateName": "Bras droit business externalisé",
  "image": OG_IMAGE.url,
  "logo": {
    "@type": "ImageObject",
    "url": LOGO_URL,
  },
  "url": SITE_URL,
  "telephone": "+41762198513",
  "email": "mireille.dayer@swiss-serenity-plus.ch",
  "founder": {
    "@type": "Person",
    "@id": `${SITE_URL}/a-propos/#mireille`,
    "name": "Mireille Dayer",
    "jobTitle": "Fondatrice & Bras droit externalisé",
    "url": `${SITE_URL}/a-propos`,
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Chemin de Clavoz 18",
    "postalCode": "1950",
    "addressLocality": "Sion",
    "addressRegion": "Valais",
    "addressCountry": "CH",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 46.2286,
    "longitude": 7.3595,
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00",
    },
  ],
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Canton du Valais" },
    { "@type": "AdministrativeArea", "name": "Canton de Vaud" },
    { "@type": "AdministrativeArea", "name": "Canton de Fribourg" },
    { "@type": "AdministrativeArea", "name": "Canton de Genève" },
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services Swiss Serenity Plus",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Structuration & Organisation", "url": `${SITE_URL}/entreprises/structuration-organisation` } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Suivi & Optimisation",         "url": `${SITE_URL}/entreprises/suivi-optimisation` } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Sourcing & Partenaires",       "url": `${SITE_URL}/entreprises/sourcing-partenaires` } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Expérience client",            "url": `${SITE_URL}/entreprises/experience-client` } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Accompagnement particuliers",  "url": `${SITE_URL}/particuliers/accompagnement-administratif` } },
    ],
  },
  "description": "Bras droit business et commercial externalisé pour dirigeants de PME et particuliers en Suisse romande. Office management stratégique depuis Sion, Valais.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CH">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
