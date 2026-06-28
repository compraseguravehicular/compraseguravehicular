import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://compraseguravehicular.pe",
      lastModified: new Date("2026-06-28"),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: "https://compraseguravehicular.pe/reporte",
      lastModified: new Date("2026-06-28"),
      changeFrequency: "monthly",
      priority: 0.6
    }
  ];
}
