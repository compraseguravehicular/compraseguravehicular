import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-06-28");

  return [
    {
      url: absoluteUrl(),
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: absoluteUrl("/reporte"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: absoluteUrl("/terminos"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: absoluteUrl("/privacidad"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: absoluteUrl("/consentimiento"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: absoluteUrl("/libro-de-reclamaciones"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4
    }
  ];
}
