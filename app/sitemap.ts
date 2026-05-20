import type { MetadataRoute } from "next";

const BASE = "https://swiss-serenity-plus.ch";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE,                                                                   lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/entreprises/structuration-organisation`,                       lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/entreprises/suivi-optimisation`,                               lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/entreprises/sourcing-partenaires`,                             lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/entreprises/experience-client`,                                lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/particuliers/accompagnement-administratif`,                    lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/contact`,                                                      lastModified: now, changeFrequency: "monthly", priority: 0.80 },
    { url: `${BASE}/blog`,                                                         lastModified: now, changeFrequency: "weekly",  priority: 0.70 },
    { url: `${BASE}/a-propos`,                                                     lastModified: now, changeFrequency: "monthly", priority: 0.60 },
    { url: `${BASE}/mentions-legales`,                                             lastModified: now, changeFrequency: "yearly",  priority: 0.15 },
  ];
}
