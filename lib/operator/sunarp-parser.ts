import type { ConfidenceLevel, SourceStatus } from "@/lib/domain";
import { compactPlate, normalizePlate } from "@/lib/plates";

export type SunarpVehicleFields = {
  plate?: string;
  previousPlate?: string;
  brand?: string;
  model?: string;
  color?: string;
  serialNumber?: string;
  vin?: string;
  engineNumber?: string;
  ownerName?: string;
  registryOffice?: string;
  vehicleStatus?: string;
  theftAnnotation?: string;
};

export type ParsedSunarpResult = {
  sourceId: "sunarp_consulta_vehicular";
  sourceName: "SUNARP Consulta Vehicular";
  plate: string;
  statusSuggestion: SourceStatus;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  summary: string;
  alerts: string[];
  extractedFields: SunarpVehicleFields;
  fieldRows: Array<{
    label: string;
    value: string;
  }>;
  evidenceText: string;
  sellerScript: string;
  reportNotes: string[];
};

const fieldPatterns: Array<{
  key: keyof SunarpVehicleFields;
  label: string;
  patterns: RegExp[];
}> = [
  {
    key: "plate",
    label: "Placa",
    patterns: [
      /(?:placa actual|nro\.?\s*placa|numero de placa|placa)\s*:?\s*([A-Z0-9-]{5,10})/i
    ]
  },
  {
    key: "previousPlate",
    label: "Placa anterior",
    patterns: [
      /(?:placa anterior|placa antigua)\s*:?\s*([A-Z0-9-]{5,10})/i
    ]
  },
  {
    key: "brand",
    label: "Marca",
    patterns: [/(?:marca)\s*:?\s*([^\n\r|]{2,60})/i]
  },
  {
    key: "model",
    label: "Modelo",
    patterns: [/(?:modelo)\s*:?\s*([^\n\r|]{2,80})/i]
  },
  {
    key: "color",
    label: "Color",
    patterns: [/(?:color)\s*:?\s*([^\n\r|]{2,60})/i]
  },
  {
    key: "serialNumber",
    label: "Serie",
    patterns: [/(?:nro\.?\s*serie|numero de serie|serie)\s*:?\s*([A-Z0-9-]{4,40})/i]
  },
  {
    key: "vin",
    label: "VIN",
    patterns: [/(?:vin)\s*:?\s*([A-Z0-9-]{4,40})/i]
  },
  {
    key: "engineNumber",
    label: "Motor",
    patterns: [/(?:nro\.?\s*motor|numero de motor|motor)\s*:?\s*([A-Z0-9-]{3,40})/i]
  },
  {
    key: "ownerName",
    label: "Titular",
    patterns: [
      /(?:propietario|titular|nombre del propietario)\s*:?\s*([^\n\r|]{3,120})/i
    ]
  },
  {
    key: "registryOffice",
    label: "Sede registral",
    patterns: [/(?:sede|oficina registral|zona registral)\s*:?\s*([^\n\r|]{3,100})/i]
  },
  {
    key: "vehicleStatus",
    label: "Estado",
    patterns: [/(?:estado del vehiculo|estado)\s*:?\s*([^\n\r|]{2,80})/i]
  },
  {
    key: "theftAnnotation",
    label: "Anotacion de robo",
    patterns: [
      /(?:anotaci[oó]n\s+de\s+robo|anotacion policial|robo)\s*:?\s*([^\n\r|]{2,120})/i
    ]
  }
];

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h\d|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeEvidenceText(value: string) {
  return stripHtml(value.replace(/`n/g, "\n").replace(/\\n/g, "\n"))
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanField(value: string) {
  return value
    .replace(/\s{2,}/g, " ")
    .replace(/^\W+|\W+$/g, "")
    .trim()
    .slice(0, 140);
}

function extractField(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return cleanField(match[1]);
    }
  }

  return undefined;
}

function scoreFields(fields: SunarpVehicleFields, requestedPlate: string) {
  const fieldCount = Object.values(fields).filter(Boolean).length;
  const extractedPlate = fields.plate ? compactPlate(fields.plate) : undefined;
  const plateMatches = extractedPlate
    ? extractedPlate === compactPlate(requestedPlate)
    : false;
  const coreScore = Math.min(70, fieldCount * 8);
  const plateScore = plateMatches ? 25 : extractedPlate ? 8 : 0;

  return Math.min(100, coreScore + plateScore);
}

function alertTerms(text: string, fields: SunarpVehicleFields) {
  const normalized = text.toLowerCase();
  const alerts: string[] = [];

  if (normalized.includes("robo") && !normalized.includes("sin anotacion")) {
    alerts.push("SUNARP menciona robo o anotacion relacionada; revisar evidencia oficial antes de avanzar.");
  }

  if (fields.theftAnnotation && !/sin|no registra|ninguna/i.test(fields.theftAnnotation)) {
    alerts.push(`Anotacion de robo: ${fields.theftAnnotation}.`);
  }

  if (fields.vehicleStatus && /baja|inactivo|suspend|bloque/i.test(fields.vehicleStatus)) {
    alerts.push(`Estado registral sensible: ${fields.vehicleStatus}.`);
  }

  if (/no se encontr|sin resultado|no registra veh/i.test(normalized)) {
    alerts.push("La fuente no encontro datos concluyentes para la placa.");
  }

  return [...new Set(alerts)];
}

function buildSummary(
  requestedPlate: string,
  fields: SunarpVehicleFields,
  alerts: string[],
  confidenceScore: number
) {
  const parts = [
    fields.brand,
    fields.model,
    fields.color ? `color ${fields.color}` : undefined,
    fields.vin ? `VIN ${fields.vin}` : fields.serialNumber ? `serie ${fields.serialNumber}` : undefined,
    fields.engineNumber ? `motor ${fields.engineNumber}` : undefined,
    fields.ownerName ? `titular ${fields.ownerName}` : undefined,
    fields.vehicleStatus ? `estado ${fields.vehicleStatus}` : undefined
  ].filter(Boolean);

  const base = parts.length
    ? `SUNARP ${requestedPlate}: ${parts.join(", ")}.`
    : `SUNARP ${requestedPlate}: evidencia capturada, pero faltan campos estructurados.`;
  const riskText = alerts.length ? ` Alertas: ${alerts.join(" ")}` : " Sin alerta registral evidente en el texto capturado.";

  return `${base}${riskText} Confianza ${confidenceScore}/100.`;
}

export function parseSunarpEvidence(input: {
  plate: string;
  rawText: string;
}): ParsedSunarpResult {
  const plate = normalizePlate(input.plate);
  const evidenceText = normalizeEvidenceText(input.rawText);
  const extractedFields: SunarpVehicleFields = {};

  for (const field of fieldPatterns) {
    const value = extractField(evidenceText, field.patterns);
    if (value) {
      extractedFields[field.key] = value;
    }
  }

  if (!extractedFields.plate && evidenceText.includes(compactPlate(plate))) {
    extractedFields.plate = plate;
  }

  const alerts = alertTerms(evidenceText, extractedFields);
  const confidenceScore = scoreFields(extractedFields, plate);
  const confidenceLevel: ConfidenceLevel =
    confidenceScore >= 75 ? "Alta" : confidenceScore >= 40 ? "Media" : "Baja";
  const statusSuggestion: SourceStatus =
    alerts.length > 0
      ? "consulted_with_alert"
      : confidenceScore >= 40
        ? "consulted_no_alert"
        : "requires_manual_document";
  const summary = buildSummary(plate, extractedFields, alerts, confidenceScore);
  const fieldRows = fieldPatterns
    .map((field) => ({
      label: field.label,
      value: extractedFields[field.key]
    }))
    .filter((field): field is { label: string; value: string } => Boolean(field.value));
  const sellerScript = [
    `Placa ${plate}: ya revise SUNARP.`,
    alerts.length
      ? `Hay observaciones: ${alerts.join(" ")}`
      : "No veo alerta registral evidente en la evidencia capturada.",
    fieldRows.length
      ? `Datos principales: ${fieldRows.slice(0, 5).map((field) => `${field.label} ${field.value}`).join(", ")}.`
      : "La captura necesita una segunda revision porque no se extrajeron suficientes campos."
  ].join(" ");

  return {
    sourceId: "sunarp_consulta_vehicular",
    sourceName: "SUNARP Consulta Vehicular",
    plate,
    statusSuggestion,
    confidenceLevel,
    confidenceScore,
    summary,
    alerts,
    extractedFields,
    fieldRows,
    evidenceText,
    sellerScript,
    reportNotes: [
      "Guardar captura o PDF oficial como evidencia.",
      "Verificar que la placa visible coincida con la placa del cliente.",
      "Si el texto extraido no muestra titular/VIN/motor, repetir captura desde la seccion de resultados."
    ]
  };
}
