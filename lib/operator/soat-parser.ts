import type { ConfidenceLevel, SourceStatus } from "@/lib/domain";
import { compactPlate, normalizePlate } from "@/lib/plates";

export type SoatVehicleFields = {
  plate?: string;
  status?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  policyNumber?: string;
  vehicleUse?: string;
  vehicleClass?: string;
  certificateType?: string;
  issuedAt?: string;
  canceledAt?: string;
  policeControlDate?: string;
  seats?: string;
  brand?: string;
  model?: string;
};

export type ParsedSoatResult = {
  sourceId: "apeseg_soat";
  sourceName: "SOAT / APESEG";
  plate: string;
  statusSuggestion: SourceStatus;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  summary: string;
  alerts: string[];
  extractedFields: SoatVehicleFields;
  fieldRows: Array<{
    label: string;
    value: string;
  }>;
  evidenceText: string;
  sellerScript: string;
  reportNotes: string[];
};

const fieldDefinitions: Array<{
  key: keyof SoatVehicleFields;
  label: string;
  aliases: string[];
  patterns?: RegExp[];
}> = [
  {
    key: "plate",
    label: "Placa",
    aliases: ["placa", "numero placa", "numero de placa"],
    patterns: [/(?:PLACA|NUMERO\s+DE\s+PLACA)\s*:?\s*([A-Z0-9-]{5,10})/i]
  },
  {
    key: "status",
    label: "Estado SOAT",
    aliases: ["estado", "estado soat", "situacion"],
    patterns: [/(?:ESTADO|ESTADO\s+SOAT)\s*:?\s*([^\n\r|]{2,80})/i]
  },
  {
    key: "company",
    label: "Aseguradora",
    aliases: [
      "nombrecompania",
      "nombre compania",
      "compania",
      "aseguradora",
      "empresa"
    ]
  },
  {
    key: "startDate",
    label: "Inicio de vigencia",
    aliases: ["fechainicio", "fecha inicio", "inicio", "inicio vigencia"]
  },
  {
    key: "endDate",
    label: "Fin de vigencia",
    aliases: ["fechafin", "fecha fin", "fin", "fin vigencia", "vencimiento"]
  },
  {
    key: "policyNumber",
    label: "Poliza/certificado",
    aliases: [
      "numeropoliza",
      "numero poliza",
      "poliza",
      "numero certificado",
      "certificado"
    ]
  },
  {
    key: "vehicleUse",
    label: "Uso",
    aliases: ["nombreusovehiculo", "nombre uso vehiculo", "uso", "uso vehiculo"]
  },
  {
    key: "vehicleClass",
    label: "Clase",
    aliases: [
      "nombreclasevehiculo",
      "nombre clase vehiculo",
      "clase",
      "clase vehiculo"
    ]
  },
  {
    key: "certificateType",
    label: "Tipo de certificado",
    aliases: ["tipocertificado", "tipo certificado", "tipo"]
  },
  {
    key: "issuedAt",
    label: "Fecha de emision",
    aliases: [
      "fechacreacion",
      "fecha creacion",
      "fec creacion",
      "fec. creacion",
      "fecha emision",
      "fec emision",
      "emision"
    ]
  },
  {
    key: "canceledAt",
    label: "Fecha de anulacion",
    aliases: [
      "fechaanulacion",
      "fecha anulacion",
      "fec anulacion",
      "fec. anulacion",
      "anulacion"
    ]
  },
  {
    key: "policeControlDate",
    label: "Control policial",
    aliases: [
      "fechacontrolpolicial",
      "fecha control policial",
      "fec control policial",
      "fec. control policial",
      "fec ctrl policial",
      "fec. ctrl. policial",
      "control policial"
    ]
  },
  {
    key: "seats",
    label: "Asientos",
    aliases: [
      "numeroasientos",
      "numero asientos",
      "numero de asientos",
      "asientos"
    ]
  },
  {
    key: "brand",
    label: "Marca",
    aliases: ["marca"]
  },
  {
    key: "model",
    label: "Modelo",
    aliases: ["modelo", "modelovehiculo", "modelo vehiculo", "modelo de vehiculo"]
  }
];

const fieldRowsOrder: Array<{ key: keyof SoatVehicleFields; label: string }> = [
  { key: "plate", label: "Placa" },
  { key: "status", label: "Estado SOAT" },
  { key: "company", label: "Aseguradora" },
  { key: "startDate", label: "Inicio de vigencia" },
  { key: "endDate", label: "Fin de vigencia" },
  { key: "policyNumber", label: "Poliza/certificado" },
  { key: "vehicleUse", label: "Uso" },
  { key: "vehicleClass", label: "Clase" },
  { key: "certificateType", label: "Tipo de certificado" },
  { key: "brand", label: "Marca" },
  { key: "model", label: "Modelo" },
  { key: "seats", label: "Asientos" },
  { key: "issuedAt", label: "Fecha de emision" },
  { key: "canceledAt", label: "Fecha de anulacion" },
  { key: "policeControlDate", label: "Control policial" }
];

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(td|th|tr|p|div|li|h\d|section|article)>/gi, "\n")
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

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
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
    .toUpperCase();
}

function normalizeLabel(value: string) {
  return normalizeForMatching(value).replace(/[^A-Z0-9]/g, "");
}

function fieldKeyFromLabel(value: string) {
  const normalized = normalizeLabel(value);

  for (const field of fieldDefinitions) {
    const labels = [field.label, ...field.aliases].map(normalizeLabel);
    if (
      labels.some(
        (label) =>
          normalized === label ||
          normalized.startsWith(label) ||
          label.startsWith(normalized)
      )
    ) {
      return field.key;
    }
  }

  return undefined;
}

function isExactKnownLabel(value: string) {
  const normalized = normalizeLabel(value);

  return fieldDefinitions.some((field) =>
    [field.label, ...field.aliases]
      .map(normalizeLabel)
      .some((label) => normalized === label)
  );
}

function cleanField(value: string) {
  return value
    .replace(/\s{2,}/g, " ")
    .replace(/^\W+|\W+$/g, "")
    .trim()
    .slice(0, 180);
}

function evidenceLines(evidenceText: string) {
  return evidenceText
    .split(/\n+/)
    .map((line) => cleanField(line))
    .filter(Boolean);
}

function isKnownLabel(value: string) {
  const labelCandidate = value.split(":")[0] ?? value;
  return Boolean(fieldKeyFromLabel(labelCandidate));
}

function extractFromLines(
  evidenceText: string,
  field: (typeof fieldDefinitions)[number]
) {
  const lines = evidenceLines(evidenceText);
  const aliases = field.aliases.map(normalizeLabel);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const colonMatch = line.match(/^([^:]{2,80})\s*:\s*(.*)$/);

    if (colonMatch) {
      const label = normalizeLabel(colonMatch[1]);
      if (aliases.includes(label)) {
        const value = cleanField(colonMatch[2]);
        return value || undefined;
      }
    }

    const normalizedLine = normalizeLabel(line);
    if (aliases.includes(normalizedLine)) {
      const next = lines[index + 1];
      if (next && !isKnownLabel(next)) {
        return cleanField(next);
      }
    }

    const alias = aliases.find((candidate) =>
      normalizedLine.startsWith(candidate) && normalizedLine.length > candidate.length
    );
    if (alias && !isExactKnownLabel(line)) {
      const value = line.slice(field.aliases[0].length);
      if (value.trim().length >= 2) {
        return cleanField(value);
      }
    }
  }

  return undefined;
}

function extractWithPatterns(text: string, patterns: RegExp[] = []) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return cleanField(match[1]);
    }
  }

  return undefined;
}

function extractField(
  evidenceText: string,
  searchText: string,
  field: (typeof fieldDefinitions)[number]
) {
  return (
    extractFromLines(evidenceText, field) ??
    extractWithPatterns(searchText, field.patterns)
  );
}

function htmlCellText(value: string) {
  return cleanField(
    decodeHtmlEntities(value)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
  );
}

function extractHtmlTableRows(rawText: string) {
  if (!/<t[dh][\s>]/i.test(rawText)) {
    return [];
  }

  return [...rawText.matchAll(/<tr[\s\S]*?<\/tr>/gi)]
    .map((row) =>
      [...row[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
        htmlCellText(cell[1])
      )
    )
    .filter((row) => row.some(Boolean));
}

function extractDelimitedRows(rawText: string) {
  return rawText
    .replace(/`n/g, "\n")
    .replace(/\\n/g, "\n")
    .split(/\r?\n+/)
    .map((line) => line.split(/\t+/).map(cleanField))
    .filter((row) => row.length > 1 && row.some(Boolean));
}

function mapRowsToFields(rows: string[][]) {
  const fields: SoatVehicleFields = {};

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const headerKeys = row.map((cell) => fieldKeyFromLabel(cell));
    const knownHeaderCount = headerKeys.filter(Boolean).length;

    if (row.length >= 2 && knownHeaderCount <= 1) {
      const key = fieldKeyFromLabel(row[0]);
      const value = row.slice(1).find((cell) => cell.trim().length > 0);

      if (key && value && !fields[key]) {
        fields[key] = value;
      }
    }

    const nextRow = rows[index + 1];

    if (knownHeaderCount >= 4 && nextRow) {
      headerKeys.forEach((key, cellIndex) => {
        const value = nextRow[cellIndex];

        if (key && value && !fields[key]) {
          fields[key] = value;
        }
      });
    }
  }

  return fields;
}

function parseDateValue(value?: string) {
  if (!value) {
    return undefined;
  }

  const dateMatch = value.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (dateMatch) {
    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]) - 1;
    const year =
      dateMatch[3].length === 2 ? 2000 + Number(dateMatch[3]) : Number(dateMatch[3]);
    const date = new Date(Date.UTC(year, month, day, 23, 59, 59));
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const isoMatch = value.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (isoMatch) {
    const date = new Date(
      Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]), 23, 59, 59)
    );
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}

function detectBlockingResult(evidenceText: string) {
  const normalized = normalizeForMatching(evidenceText);

  if (/ERROR\s*403|ACCESO\s+NO\s+AUTORIZADO|NO\s+AUTORIZADO/.test(normalized)) {
    return "APESEG no devolvio resultado SOAT: el portal mostro Error 403 / Acceso no autorizado.";
  }

  if (/ERROR\s+DE\s+CONEXION\s+CON\s+LA\s+API|ERROR\s+DE\s+CONEXION/.test(normalized)) {
    return "APESEG no devolvio resultado SOAT: el portal mostro error de conexion con la API.";
  }

  if (/CAPTCHA\s+INCORRECTO|INGRESA\s+EL\s+CAPTCHA|CAPTCHA\s+REQUERIDO/.test(normalized)) {
    return "APESEG no devolvio resultado SOAT: falta resolver correctamente el CAPTCHA oficial.";
  }

  return undefined;
}

function scoreFields(fields: SoatVehicleFields, requestedPlate: string) {
  const fieldCount = Object.values(fields).filter(Boolean).length;
  const plateMatches = fields.plate
    ? compactPlate(fields.plate) === compactPlate(requestedPlate)
    : false;
  const coreScore = Math.min(60, fieldCount * 8);
  const plateScore = plateMatches ? 20 : fields.plate ? 8 : 0;
  const soatScore = fields.status || fields.endDate ? 20 : 0;

  return Math.min(100, coreScore + plateScore + soatScore);
}

function alertTerms(fields: SoatVehicleFields) {
  const alerts: string[] = [];
  const normalizedStatus = normalizeForMatching(fields.status ?? "");
  const endDate = parseDateValue(fields.endDate);
  const now = new Date();

  if (
    normalizedStatus &&
    !/(VIGENTE|ACTIVO|VALIDO|HABILITADO)/.test(normalizedStatus) &&
    /(VENCIDO|ANULADO|NO\s+VIGENTE|INACTIVO|NO\s+REGISTRA|SIN\s+SOAT)/.test(normalizedStatus)
  ) {
    alerts.push(`SOAT con estado sensible: ${fields.status}.`);
  }

  if (fields.canceledAt && !/null|ninguna|no registra|sin/i.test(fields.canceledAt)) {
    alerts.push(`SOAT registra anulacion: ${fields.canceledAt}.`);
  }

  if (endDate && endDate.getTime() < now.getTime()) {
    alerts.push(`SOAT vencido o fuera de vigencia desde ${fields.endDate}.`);
  } else if (endDate) {
    const daysToExpire = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysToExpire <= 30) {
      alerts.push(`SOAT por vencer en ${daysToExpire} dias: ${fields.endDate}.`);
    }
  }

  return [...new Set(alerts)];
}

function statusFromSoatEvidence({
  blockingReason,
  confidenceScore,
  alerts
}: {
  blockingReason?: string;
  confidenceScore: number;
  alerts: string[];
}): SourceStatus {
  if (blockingReason) {
    return "failed";
  }

  if (confidenceScore < 45) {
    return "requires_manual_document";
  }

  return alerts.length > 0 ? "consulted_with_alert" : "consulted_no_alert";
}

function buildSummary(
  requestedPlate: string,
  fields: SoatVehicleFields,
  alerts: string[],
  confidenceScore: number
) {
  const parts = [
    fields.status ? `estado ${fields.status}` : undefined,
    fields.company ? `aseguradora ${fields.company}` : undefined,
    fields.startDate || fields.endDate
      ? `vigencia ${fields.startDate ?? "sin inicio"} a ${fields.endDate ?? "sin fin"}`
      : undefined,
    fields.policyNumber ? `poliza/certificado ${fields.policyNumber}` : undefined,
    fields.vehicleUse ? `uso ${fields.vehicleUse}` : undefined,
    fields.vehicleClass ? `clase ${fields.vehicleClass}` : undefined,
    fields.brand ? `marca ${fields.brand}` : undefined,
    fields.model ? `modelo ${fields.model}` : undefined
  ].filter(Boolean);

  const base = parts.length
    ? `SOAT ${requestedPlate}: ${parts.join(", ")}.`
    : `SOAT ${requestedPlate}: evidencia capturada, pero faltan campos estructurados.`;
  const riskText = alerts.length
    ? ` Alertas: ${alerts.join(" ")}`
    : " Sin alerta SOAT evidente en el texto capturado.";

  return `${base}${riskText} Confianza ${confidenceScore}/100.`;
}

export function parseSoatEvidence(input: {
  plate: string;
  rawText: string;
}): ParsedSoatResult {
  const plate = normalizePlate(input.plate);
  const tableFields = {
    ...mapRowsToFields(extractHtmlTableRows(input.rawText)),
    ...mapRowsToFields(extractDelimitedRows(input.rawText))
  };
  const evidenceText = normalizeEvidenceText(input.rawText);
  const searchText = normalizeForMatching(evidenceText);
  const extractedFields: SoatVehicleFields = { ...tableFields };
  const blockingReason = detectBlockingResult(evidenceText);

  for (const field of fieldDefinitions) {
    if (extractedFields[field.key]) {
      continue;
    }

    const value = extractField(evidenceText, searchText, field);
    if (value) {
      extractedFields[field.key] = value;
    }
  }

  const compactRequestedPlate = compactPlate(plate);
  if (!extractedFields.plate && searchText.includes(compactRequestedPlate)) {
    extractedFields.plate = plate;
  }

  const fieldConfidenceScore = scoreFields(extractedFields, plate);
  const confidenceScore = blockingReason ? Math.min(20, fieldConfidenceScore) : fieldConfidenceScore;
  const alerts = blockingReason
    ? [blockingReason]
    : [
        ...alertTerms(extractedFields),
        ...(confidenceScore < 45
          ? [
              "La evidencia SOAT no tiene suficientes campos estructurados; repetir captura o copiar tabla completa."
            ]
          : [])
      ];
  const confidenceLevel: ConfidenceLevel =
    confidenceScore >= 75 ? "Alta" : confidenceScore >= 45 ? "Media" : "Baja";
  const statusSuggestion = statusFromSoatEvidence({
    blockingReason,
    confidenceScore,
    alerts
  });
  const summary = buildSummary(plate, extractedFields, alerts, confidenceScore);
  const fieldRows = fieldRowsOrder
    .map((field) => ({
      label: field.label,
      value: extractedFields[field.key]
    }))
    .filter((field): field is { label: string; value: string } => Boolean(field.value));
  const sellerScript = [
    `Placa ${plate}: ya revise SOAT/APESEG.`,
    alerts.length
      ? `Hay observaciones: ${alerts.join(" ")}`
      : "No veo alerta SOAT evidente en la evidencia capturada.",
    fieldRows.length
      ? `Datos principales: ${fieldRows.slice(0, 6).map((field) => `${field.label} ${field.value}`).join(", ")}.`
      : "La captura necesita una segunda revision porque no se extrajeron suficientes campos."
  ].join(" ");

  return {
    sourceId: "apeseg_soat",
    sourceName: "SOAT / APESEG",
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
      "Guardar captura o HTML del resultado APESEG como evidencia.",
      "Verificar que la placa visible coincida con la placa del cliente.",
      "Si no aparecen estado, aseguradora o vigencia, repetir la captura desde la tabla de resultados."
    ]
  };
}
