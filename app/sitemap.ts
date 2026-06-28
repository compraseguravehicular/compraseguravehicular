import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl(),
      lastModified: new Date("2026-06-28"),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: absoluteUrl("/reporte"),
      lastModified: new Date("2026-06-28"),
      changeFrequency: "monthly",
      priority: 0.6
    }
  ];
}
