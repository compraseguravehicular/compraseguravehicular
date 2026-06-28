import type { SourceTemplate } from "@/lib/domain";

export const sourceTemplates: SourceTemplate[] = [
  {
    sourceName: "SUNARP Consulta Vehicular",
    sourceCategory: "registral",
    requiredFor: ["express", "compra_segura", "pro"]
  },
  {
    sourceName: "SOAT / SBS / APESEG",
    sourceCategory: "circulacion",
    requiredFor: ["express", "compra_segura", "pro"]
  },
  {
    sourceName: "MTC CITV",
    sourceCategory: "circulacion",
    requiredFor: ["express", "compra_segura", "pro"]
  },
  {
    sourceName: "SAT Lima",
    sourceCategory: "deudas",
    requiredFor: ["express", "compra_segura", "pro"]
  },
  {
    sourceName: "SAT Captura Administrativa",
    sourceCategory: "deudas",
    requiredFor: ["compra_segura", "pro"]
  },
  {
    sourceName: "Callao Papeletas",
    sourceCategory: "deudas",
    requiredFor: ["express", "compra_segura", "pro"]
  },
  {
    sourceName: "SUTRAN",
    sourceCategory: "infracciones",
    requiredFor: ["express", "compra_segura", "pro"]
  },
  {
    sourceName: "ATU",
    sourceCategory: "infracciones",
    requiredFor: ["express", "compra_segura", "pro"]
  },
  {
    sourceName: "AAP Placas",
    sourceCategory: "placas",
    requiredFor: ["compra_segura", "pro"]
  },
  {
    sourceName: "Infogas / GNV",
    sourceCategory: "premium",
    requiredFor: ["pro"]
  },
  {
    sourceName: "Municipalidades Provinciales",
    sourceCategory: "premium",
    requiredFor: ["pro"]
  },
  {
    sourceName: "SUNARP Documentos Pagados",
    sourceCategory: "premium",
    requiredFor: ["pro"]
  }
];
