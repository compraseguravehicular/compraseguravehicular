import type { ConfidenceLevel, SourceStatus } from "@/lib/domain";
import { compactPlate, normalizePlate } from "@/lib/plates";

export type SunarpVehicleFields = {
  plate?: string;
  activePlate?: string;
  previousPlate?: string;
  brand?: string;
  model?: string;
  modelYear?: string;
  color?: string;
  serialNumber?: string;
  vin?: string;
  engineNumber?: string;
  ownerName?: string;
  registryOffice?: string;
  vehicleStatus?: string;
  annotations?: string;
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

const fieldDefinitions: Array<{
  key: keyof SunarpVehicleFields;
  label: string;
  patterns: RegExp[];
}> = [
  {
    key: "plate",
    label: "Placa",
    patterns: [
      /(?:N\s*PLACA|NRO\.?\s*PLACA|NUMERO\s+DE\s+PLACA)\s*:?\s*([A-Z0-9-]{5,10})/i,
      /(?:PLACA)\s*:?\s*([A-Z0-9-]{5,10})/i
    ]
  },
  {
    key: "activePlate",
    label: "Placa vigente",
    patterns: [/(?:PLACA\s+VIGENTE|PLACA\s+ACTUAL)\s*:?\s*([A-Z0-9-]{5,10})/i]
  },
  {
    key: "previousPlate",
    label: "Placa anterior",
    patterns: [/(?:PLACA\s+ANTERIOR|PLACA\s+ANTIGUA)\s*:?\s*([A-Z0-9-]{3,40})/i]
  },
  {
    key: "serialNumber",
    label: "Serie",
    patterns: [/(?:N\s*SERIE|NRO\.?\s*SERIE|NUMERO\s+DE\s+SERIE|SERIE)\s*:?\s*([A-Z0-9-]{4,40})/i]
  },
  {
    key: "vin",
    label: "VIN",
    patterns: [/(?:N\s*VIN|VIN)\s*:?\s*([A-Z0-9-]{4,40})/i]
  },
  {
    key: "engineNumber",
    label: "Motor",
    patterns: [/(?:N\s*MOTOR|NRO\.?\s*MOTOR|NUMERO\s+DE\s+MOTOR|MOTOR)\s*:?\s*([A-Z0-9-]{3,40})/i]
  },
  {
    key: "color",
    label: "Color",
    patterns: [/(?:COLOR)\s*:?\s*([^\n\r|]{2,60})/i]
  },
  {
    key: "brand",
    label: "Marca",
    patterns: [/(?:MARCA)\s*:?\s*([^\n\r|]{2,60})/i]
  },
  {
    key: "model",
    label: "Modelo",
    patterns: [/(?:MODELO)\s*:?\s*([^\n\r|]{2,80})/i]
  },
  {
    key: "modelYear",
    label: "Ano de modelo",
    patterns: [/(?:ANO\s+DE\s+MODELO|ANIO\s+DE\s+MODELO)\s*:?\s*([0-9]{4})/i]
  },
  {
    key: "registryOffice",
    label: "Sede registral",
    patterns: [/(?:SEDE|OFICINA\s+REGISTRAL|ZONA\s+REGISTRAL)\s*:?\s*([^\n\r|]{3,100})/i]
  },
  {
    key: "vehicleStatus",
    label: "Estado",
    patterns: [/(?:ESTADO\s+DEL\s+VEHICULO|ESTADO)\s*:?\s*([^\n\r|]{2,80})/i]
  },
  {
    key: "annotations",
    label: "Anotaciones",
    patterns: [/(?:ANOTACIONES|ANOTACION)\s*:?\s*([^\n\r|]{2,120})/i]
  },
  {
    key: "theftAnnotation",
    label: "Anotacion de robo",
    patterns: [
      /(?:ANOTACION\s+DE\s+ROBO|ANOTACION\s+POLICIAL|ROBO)\s*:?\s*([^\n\r|]{2,120})/i
    ]
  }
];

const fieldRowsOrder: Array<{ key: keyof SunarpVehicleFields; label: string }> = [
  { key: "plate", label: "Placa" },
  { key: "activePlate", label: "Placa vigente" },
  { key: "previousPlate", label: "Placa anterior" },
  { key: "brand", label: "Marca" },
  { key: "model", label: "Modelo" },
  { key: "modelYear", label: "Ano de modelo" },
  { key: "color", label: "Color" },
  { key: "serialNumber", label: "Serie" },
  { key: "vin", label: "VIN" },
  { key: "engineNumber", label: "Motor" },
  { key: "ownerName", label: "Propietarios" },
  { key: "registryOffice", label: "Sede registral" },
  { key: "vehicleStatus", label: "Estado" },
  { key: "annotations", label: "Anotaciones" },
  { key: "theftAnnotation", label: "Anotacion de robo" }
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

function normalizeForMatching(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[°º]/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .toUpperCase();
}

function cleanField(value: string) {
  return value
    .replace(/\s{2,}/g, " ")
    .replace(/^\W+|\W+$/g, "")
    .trim()
    .slice(0, 180);
}

function cleanWatermarkNoise(value: string) {
  return value
    .replace(/PUBLICIDAD\s+REGISTRAL/gi, " ")
    .replace(/ESTA\s+INFORMACION\s+NO\s+CONSTITUYE/gi, " ")
    .replace(/SUNARP/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function buildSearchText(evidenceText: string) {
  const normalized = normalizeForMatching(evidenceText);

  return normalized
    .replace(/\bN\s+(PLACA|SERIE|VIN|MOTOR)\b/g, "N $1")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractField(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return cleanField(cleanWatermarkNoise(match[1]));
    }
  }

  return undefined;
}

function evidenceLines(evidenceText: string) {
  return evidenceText
    .split(/\n+/)
    .map((line) => cleanField(line))
    .filter(Boolean);
}

function isLikelyFieldLabel(line: string) {
  const normalized = normalizeForMatching(line);

  return /^(N\s*)?(PLACA|SERIE|VIN|MOTOR|COLOR|MARCA|MODELO|ESTADO|ANOTACIONES|SEDE|ANO|ANIO)\b/.test(
    normalized
  );
}

function extractOwners(evidenceText: string) {
  const lines = evidenceLines(evidenceText);
  const ownerIndex = lines.findIndex((line) =>
    /PROPIETARIO/.test(normalizeForMatching(line))
  );

  if (ownerIndex < 0) {
    const inlineMatch = buildSearchText(evidenceText).match(
      /(?:PROPIETARIO\(S\)|PROPIETARIOS?|TITULAR|NOMBRE\s+DEL\s+PROPIETARIO)\s*:?\s*([^\n\r|]{3,160})/i
    );
    return inlineMatch?.[1] ? cleanField(inlineMatch[1]) : undefined;
  }

  const owners: string[] = [];

  for (const line of lines.slice(ownerIndex + 1)) {
    const normalized = normalizeForMatching(line);

    if (
      /^\d{1,2}\/\d{1,2}\/\d{4}/.test(normalized) ||
      /REALIZAR\s+OTRA\s+BUSQUEDA/.test(normalized) ||
      /CONSULTA\s+VEHICULAR/.test(normalized) ||
      isLikelyFieldLabel(line)
    ) {
      break;
    }

    const cleaned = cleanField(cleanWatermarkNoise(line));
    if (cleaned && cleaned.length >= 4) {
      owners.push(cleaned);
    }
  }

  return owners.length ? owners.join(" / ") : undefined;
}

function scoreFields(fields: SunarpVehicleFields, requestedPlate: string) {
  const fieldCount = Object.values(fields).filter(Boolean).length;
  const extractedPlate = fields.plate ?? fields.activePlate;
  const plateMatches = extractedPlate
    ? compactPlate(extractedPlate) === compactPlate(requestedPlate)
    : false;
  const coreScore = Math.min(70, fieldCount * 8);
  const plateScore = plateMatches ? 25 : extractedPlate ? 8 : 0;

  return Math.min(100, coreScore + plateScore);
}

function alertTerms(text: string, fields: SunarpVehicleFields) {
  const normalized = normalizeForMatching(text);
  const alerts: string[] = [];

  if (
    normalized.includes("ROBO") &&
    !/SIN\s+ANOTACION|NO\s+REGISTRA|NINGUNA/.test(normalized)
  ) {
    alerts.push("SUNARP menciona robo o anotacion relacionada; revisar evidencia oficial antes de avanzar.");
  }

  if (
    fields.theftAnnotation &&
    !/sin|no registra|ninguna/i.test(fields.theftAnnotation)
  ) {
    alerts.push(`Anotacion de robo: ${fields.theftAnnotation}.`);
  }

  if (fields.annotations && !/sin|no registra|ninguna/i.test(fields.annotations)) {
    alerts.push(`Anotacion registral: ${fields.annotations}.`);
  }

  if (fields.vehicleStatus && /baja|inactivo|suspend|bloque/i.test(fields.vehicleStatus)) {
    alerts.push(`Estado registral sensible: ${fields.vehicleStatus}.`);
  }

  if (/NO\s+SE\s+ENCONTR|SIN\s+RESULTADO|NO\s+REGISTRA\s+VEH/i.test(normalized)) {
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
    fields.modelYear ? `ano ${fields.modelYear}` : undefined,
    fields.color ? `color ${fields.color}` : undefined,
    fields.vin ? `VIN ${fields.vin}` : fields.serialNumber ? `serie ${fields.serialNumber}` : undefined,
    fields.engineNumber ? `motor ${fields.engineNumber}` : undefined,
    fields.ownerName ? `propietarios ${fields.ownerName}` : undefined,
    fields.vehicleStatus ? `estado ${fields.vehicleStatus}` : undefined,
    fields.annotations ? `anotaciones ${fields.annotations}` : undefined
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
  const searchText = buildSearchText(evidenceText);
  const extractedFields: SunarpVehicleFields = {};

  for (const field of fieldDefinitions) {
    const value = extractField(searchText, field.patterns);
    if (value) {
      extractedFields[field.key] = value;
    }
  }

  const ownerName = extractOwners(evidenceText);
  if (ownerName) {
    extractedFields.ownerName = ownerName;
  }

  const compactRequestedPlate = compactPlate(plate);
  if (!extractedFields.plate && searchText.includes(compactRequestedPlate)) {
    extractedFields.plate = plate;
  }

  if (!extractedFields.activePlate && extractedFields.plate) {
    extractedFields.activePlate = extractedFields.plate;
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
  const fieldRows = fieldRowsOrder
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
      ? `Datos principales: ${fieldRows.slice(0, 6).map((field) => `${field.label} ${field.value}`).join(", ")}.`
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
      "Si el OCR no muestra titular/VIN/motor, subir una captura mas nitida o copiar el texto visible del resultado."
    ]
  };
}
