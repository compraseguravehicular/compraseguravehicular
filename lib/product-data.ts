import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  Car,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Database,
  FileCheck2,
  Gauge,
  Landmark,
  MessageCircle,
  ShieldCheck,
  Siren,
  Wrench
} from "lucide-react";

export const whatsappNumber = "51999999999";

export const packages = [
  {
    name: "Express",
    price: "S/ 19.90",
    description:
      "Revision rapida de fuentes principales para detectar alertas basicas.",
    recommended: false,
    includes: [
      "SUNARP consulta vehicular",
      "SOAT y revision tecnica",
      "SAT Lima, Callao, SUTRAN y ATU basico",
      "Resumen por WhatsApp"
    ],
    cta: "Pedir Express"
  },
  {
    name: "Compra Segura",
    price: "S/ 39.90",
    description:
      "Reporte recomendado para compradores: evidencia, PDF y recomendacion final.",
    recommended: true,
    includes: [
      "Fuentes Express",
      "PDF profesional con evidencias",
      "Semaforo de riesgo",
      "Comprar, negociar, evitar o pedir documentos"
    ],
    cta: "Pedir Compra Segura"
  },
  {
    name: "Pro",
    price: "Desde S/ 59",
    description:
      "Verificacion avanzada para operaciones de mayor valor o casos con dudas.",
    recommended: false,
    includes: [
      "Documentos SUNARP cuando aplique",
      "GNV, provincias, recalls y tasacion",
      "Senales de uso intensivo",
      "Revision humana ampliada"
    ],
    cta: "Consultar Pro"
  }
];

export const coreSources = [
  { name: "SUNARP", detail: "Datos registrales y vehiculo", icon: Landmark },
  { name: "SBS / APESEG", detail: "SOAT, CAT y seguro", icon: ShieldCheck },
  { name: "MTC CITV", detail: "Revision tecnica", icon: Wrench },
  { name: "SAT / Callao", detail: "Deudas y papeletas", icon: FileCheck2 },
  { name: "SUTRAN / ATU", detail: "Infracciones y transporte", icon: Siren },
  { name: "Infogas", detail: "GNV y senales de uso", icon: Gauge }
];

export const operatingSteps = [
  {
    title: "Ingresa la placa",
    detail: "Registramos ciudad, paquete y contexto de compra.",
    icon: Car
  },
  {
    title: "Confirmamos pago",
    detail: "Yape, Plin o link de pago en la primera version.",
    icon: CheckCircle2
  },
  {
    title: "Consultamos fuentes",
    detail: "Cada resultado queda con fecha, estado y evidencia.",
    icon: Database
  },
  {
    title: "Calculamos riesgo",
    detail: "Reglas trazables, semaforo y recomendacion.",
    icon: AlertTriangle
  },
  {
    title: "Entregamos por WhatsApp",
    detail: "Resumen ejecutivo y PDF profesional.",
    icon: MessageCircle
  }
];

export const reportHighlights = [
  { label: "Riesgo", value: "Amarillo", tone: "warning" },
  { label: "Fuentes", value: "9 revisadas", tone: "neutral" },
  { label: "Alertas", value: "2 activas", tone: "danger" },
  { label: "Entrega", value: "12 min", tone: "success" }
];

export const reportSources = [
  {
    source: "SUNARP",
    result: "Datos coinciden con placa consultada",
    status: "Sin alerta",
    confidence: "Media"
  },
  {
    source: "SOAT / APESEG",
    result: "SOAT vigente hasta 18/11/2026",
    status: "Sin alerta",
    confidence: "Media"
  },
  {
    source: "MTC CITV",
    result: "Revision tecnica vence en 34 dias",
    status: "Observacion",
    confidence: "Media"
  },
  {
    source: "SAT Lima",
    result: "Papeletas pendientes por S/ 420",
    status: "Alerta",
    confidence: "Media"
  },
  {
    source: "ATU",
    result: "No se encontro autorizacion de taxi activa",
    status: "Sin alerta",
    confidence: "Media"
  }
];

export const panelOrders = [
  {
    code: "CV-2026-0001",
    plate: "ABC-123",
    packageType: "Compra Segura",
    customer: "Cliente WhatsApp",
    status: "processing",
    risk: "Amarillo",
    time: "07:32"
  },
  {
    code: "CV-2026-0002",
    plate: "D4F-882",
    packageType: "Pro",
    customer: "Concesionario Norte",
    status: "manual_review_required",
    risk: "Rojo",
    time: "18:04"
  },
  {
    code: "CV-2026-0003",
    plate: "M2P-441",
    packageType: "Express",
    customer: "Lead Marketplace",
    status: "paid",
    risk: "Pendiente",
    time: "02:15"
  }
];

export const panelMetrics = [
  { label: "Ordenes hoy", value: "18", icon: ClipboardCheck },
  { label: "Pagadas", value: "11", icon: BadgeCheck },
  { label: "Tiempo promedio", value: "13:20", icon: Clock3 },
  { label: "Ventas", value: "S/ 438", icon: Building2 }
];
