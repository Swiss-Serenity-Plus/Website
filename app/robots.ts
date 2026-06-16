import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/formation/"],
      },
    ],
    sitemap: "https://swiss-serenity-plus.ch/sitemap.xml",
    host: "https://swiss-serenity-plus.ch",
  };
}
