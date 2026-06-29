import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/panel", "/fuentes", "/reporte-en-vivo", "/operador"]
    },
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
