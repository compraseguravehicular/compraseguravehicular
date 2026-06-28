import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Compra Segura Vehicular | Reporte vehicular por placa en Peru",
    template: "%s | Compra Segura Vehicular"
  },
  description:
    "Verifica placa, SOAT, revision tecnica, papeletas, titularidad y riesgo antes de comprar un vehiculo usado en Peru.",
  applicationName: "Compra Segura Vehicular",
  keywords: [
    "reporte vehicular por placa Peru",
    "consulta vehicular por placa",
    "verificar auto usado Peru",
    "papeletas por placa",
    "SOAT por placa",
    "revision tecnica por placa",
    "compra segura vehicular"
  ],
  authors: [{ name: "Compra Segura Vehicular" }],
  creator: "Compra Segura Vehicular",
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: siteUrl,
    siteName: "Compra Segura Vehicular",
    title: "Reporte vehicular por placa en Peru",
    description:
      "Diagnostico informativo con fuentes verificadas, evidencia, semaforo de riesgo y recomendacion de compra.",
    images: [
      {
        url: "/images/vehicle-report-hero.png",
        width: 1600,
        height: 900,
        alt: "Inspeccion vehicular con reporte digital"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Compra Segura Vehicular",
    description:
      "Verifica el riesgo de un vehiculo usado antes de separar o comprar.",
    images: ["/images/vehicle-report-hero.png"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#073B32"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-PE">
      <body>{children}</body>
    </html>
  );
}
