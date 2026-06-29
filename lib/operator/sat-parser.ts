import type { ConfidenceLevel, SourceStatus } from "@/lib/domain";
import { compactPlate, normalizePlate } from "@/lib/plates";

export type SatLimaFields = {
  plate?: string;
  status?: string;
  totalDebt?: string;
  currency?: string;
  infractionCount?: string;
  documentNumber?: string;
  infractionCode?: string;
  infractionDate?: string;
  administrativeCapture?: string;
  rawFinding?: string;
};

export type ParsedSatResult = {
  sourceId: "sat_lima_papeletas";
  sourceName: "SAT Lima Papeletas";
  plate: string;
  statusSuggestion: SourceStatus;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  summary: string;
  alerts: string[];
  extractedFields: SatLimaFields;
  fieldRows: Array<{
    label: string;
    value: string;
  }>;
  evidenceText: string;
  sellerScript: string;
  reportNotes: string[];
};

const noDebtPatterns = [
  /NO\s+(?:REGISTRA|PRESENTA|TIENE)\s+(?:PAPELETAS|MULTAS|DEUDAS|INFRACCIONES)/,
  /SIN\s+(?:PAPELETAS|MULTAS|DEUDAS|INFRACCIONES|REGISTROS)/,
  /NO\s+SE\s+ENCONTRARON?\s+(?:REGISTROS|PAPELETAS|MULTAS|DEUDAS)/,
  /NO\s+EXISTEN?\s+(?:REGISTROS|PAPELETAS|MULTAS|DEUDAS)/
];

const debtPatterns = [
  /PENDIENTE/,
  /DEUDA/,
  /MULTA/,
  /PAPELETA/,
  /CAPTURA/,
  /INTERNAMIENTO/,
  /COACTIVA/
];

const fieldRowsOrder: Array<{ key: keyof SatLimaFields; label: string }> = [
  { key: "plate", label: "Placa" },
  { key: "status", label: "Estado SAT" },
  { key: "totalDebt", label: "Deuda/monto" },
  { key: "infractionCount", label: "Registros" },
  { key: "documentNumber", label: "Documento/papeleta" },
  { key: "infractionCode", label: "Codigo infraccion" },
  { key: "infractionDate", label: "Fecha infraccion" },
  { key: "administrativeCapture", label: "Captura administrativa" },
  { key: "rawFinding", label: "Hallazgo" }
];

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

function stripHtml(value: string) {
  return decodeHtmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(td|th|tr|p|div|li|h\d|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeEvidenceText(value: string) {
  return stripHtml(
    value
      .replace(/`n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/`t/g, "\t")
      .replace(/\\t/g, "\t")
  )
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

function cleanField(value: string) {
  return value
    .replace(/\s{2,}/g, " ")
    .replace(/^\W+|\W+$/g, "")
    .trim()
    .slice(0, 220);
}

function normalizeLabel(value: string) {
  return normalizeForMatching(value).replace(/[^A-Z0-9]/g, "");
}

function fieldKeyFromLabel(value: string): keyof SatLimaFields | undefined {
  const normalized = normalizeLabel(value);
  const aliases: Array<[keyof SatLimaFields, string[]]> = [
    ["plate", ["PLACA", "NROPLACA", "NUMEROPLACA"]],
    ["status", ["ESTADO", "SITUACION", "ESTADODEUDA"]],
    ["totalDebt", ["MONTO", "DEUDA", "TOTAL", "IMPORTE", "SALDO", "MONTODEUDA"]],
    ["infractionCount", ["REGISTROS", "CANTIDAD", "NUMERO", "NROPAPELETAS"]],
    ["documentNumber", ["PAPELETA", "DOCUMENTO", "NROPAPELETA", "NUMEROPAPELETA"]],
    ["infractionCode", ["CODIGO", "CODINFRACCION", "INFRACCION"]],
    ["infractionDate", ["FECHA", "FECHAINFRACCION", "FECHAEMISION"]],
    ["administrativeCapture", ["CAPTURA", "CAPTURAADMINISTRATIVA", "INTERNAMIENTO"]]
  ];

  for (const [key, labels] of aliases) {
    if (
      labels.some(
        (label) =>
          normalized === label ||
          normalized.startsWith(label) ||
          label.startsWith(normalized)
      )
    ) {
      return key;
    }
  }

  return undefined;
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
    .replace(/`t/g, "\t")
    .replace(/\\t/g, "\t")
    .split(/\r?\n+/)
    .map((line) => line.split("\t").map(cleanField))
    .filter((row) => row.length > 1 && row.some(Boolean));
}

function mapRowsToFields(rows: string[][]) {
  const fields: SatLimaFields = {};

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

    if (knownHeaderCount >= 3 && nextRow) {
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

function extractAmount(text: string) {
  const currencyMatch = text.match(/(?:S\/\.?|SOLES|PEN)\s*([0-9]{1,6}(?:[.,][0-9]{2})?)/i);

  if (currencyMatch?.[1]) {
    return `S/ ${currencyMatch[1].replace(",", ".")}`;
  }

  const labeledMatch = text.match(
    /(?:MONTO|DEUDA|TOTAL|IMPORTE|SALDO)[^\d]{0,24}([0-9]{1,6}(?:[.,][0-9]{2})?)/i
  );

  return labeledMatch?.[1]
    ? `S/ ${labeledMatch[1].replace(",", ".")}`
    : undefined;
}

function extractFirstDate(text: string) {
  return text.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/)?.[0];
}

function extractDocumentNumber(text: string) {
  return text.match(/\b(?:PAPELETA|ACTA|DOC(?:UMENTO)?)\s*:?\s*([A-Z0-9-]{4,30})/i)?.[1];
}

function countLikelyRows(rows: string[][]) {
  const dataRows = rows.filter((row) => {
    const joined = normalizeForMatching(row.join(" "));
    return (
      row.length >= 3 &&
      !row.some((cell) => fieldKeyFromLabel(cell)) &&
      (/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(joined) ||
        /S\/|SOLES|PENDIENTE|CANCELADO|PAPELETA/.test(joined))
    );
  });

  return dataRows.length ? String(dataRows.length) : undefined;
}

function inferFields(rawText: string, evidenceText: string, requestedPlate: string) {
  const rows = [...extractHtmlTableRows(rawText), ...extractDelimitedRows(rawText)];
  const tableFields = mapRowsToFields(rows);
  const searchText = normalizeForMatching(evidenceText);
  const noDebtFinding = noDebtPatterns.some((pattern) => pattern.test(searchText));
  const fields: SatLimaFields = { ...tableFields };

  if (!fields.plate && searchText.includes(compactPlate(requestedPlate))) {
    fields.plate = requestedPlate;
  }

  if (!fields.totalDebt && !noDebtFinding) {
    fields.totalDebt = extractAmount(evidenceText);
  }

  if (!fields.infractionDate) {
    fields.infractionDate = extractFirstDate(evidenceText);
  }

  if (!fields.documentNumber) {
    fields.documentNumber = extractDocumentNumber(evidenceText);
  }

  if (!fields.infractionCount) {
    fields.infractionCount = countLikelyRows(rows);
  }

  if (!fields.administrativeCapture && /CAPTURA|INTERNAMIENTO/.test(searchText)) {
    fields.administrativeCapture = "Revisar posible captura o internamiento en evidencia SAT.";
  }

  if (!fields.status) {
    if (noDebtFinding) {
      fields.status = "Sin papeletas/deuda visible";
    } else if (debtPatterns.some((pattern) => pattern.test(searchText)) || fields.totalDebt) {
      fields.status = "Con registros por revisar";
    }
  }

  if (!fields.rawFinding) {
    const relevantLine = evidenceText
      .split(/\n+/)
      .map(cleanField)
      .find((line) => /papeleta|multa|deuda|registro|captura/i.test(line));

    if (relevantLine) {
      fields.rawFinding = relevantLine;
    }
  }

  return fields;
}

function scoreFields(fields: SatLimaFields, requestedPlate: string) {
  const fieldCount = Object.values(fields).filter(Boolean).length;
  const plateMatches = fields.plate
    ? compactPlate(fields.plate) === compactPlate(requestedPlate)
    : false;
  const coreScore = Math.min(65, fieldCount * 10);
  const plateScore = plateMatches ? 20 : fields.plate ? 8 : 0;
  const statusScore = fields.status || fields.totalDebt ? 15 : 0;

  return Math.min(100, coreScore + plateScore + statusScore);
}

function alertTerms(text: string, fields: SatLimaFields) {
  const normalized = normalizeForMatching(text);
  const alerts: string[] = [];
  const amount = fields.totalDebt?.match(/([0-9]+(?:[.,][0-9]{2})?)/)?.[1];
  const amountNumber = amount ? Number(amount.replace(",", ".")) : 0;

  if (amountNumber > 0) {
    alerts.push(`SAT Lima registra monto/deuda visible: ${fields.totalDebt}.`);
  }

  if (/PENDIENTE|DEUDA|COACTIVA/.test(normalized) && !noDebtPatterns.some((pattern) => pattern.test(normalized))) {
    alerts.push("SAT Lima muestra estado pendiente/deuda; revisar detalle antes de cerrar venta.");
  }

  if (fields.administrativeCapture || /CAPTURA|INTERNAMIENTO/.test(normalized)) {
    alerts.push("Revisar posible captura administrativa o internamiento asociado.");
  }

  if (/NO\s+SE\s+PUDO|ERROR|SESION\s+EXPIR|NO\s+AUTORIZADO/.test(normalized)) {
    alerts.push("La evidencia SAT parece error o sesion expirada; repetir consulta oficial.");
  }

  return [...new Set(alerts)];
}

function buildSummary(
  plate: string,
  fields: SatLimaFields,
  alerts: string[],
  confidenceScore: number
) {
  const parts = [
    fields.status ? `estado ${fields.status}` : undefined,
    fields.totalDebt ? `monto ${fields.totalDebt}` : undefined,
    fields.infractionCount ? `${fields.infractionCount} registro(s)` : undefined,
    fields.documentNumber ? `documento ${fields.documentNumber}` : undefined,
    fields.infractionDate ? `fecha ${fields.infractionDate}` : undefined,
    fields.administrativeCapture ? fields.administrativeCapture : undefined
  ].filter(Boolean);

  const base = parts.length
    ? `SAT Lima ${plate}: ${parts.join(", ")}.`
    : `SAT Lima ${plate}: evidencia capturada, pero faltan campos estructurados.`;
  const riskText = alerts.length
    ? ` Alertas: ${alerts.join(" ")}`
    : " Sin papeleta/deuda evidente en el texto capturado.";

  return `${base}${riskText} Confianza ${confidenceScore}/100.`;
}

export function parseSatEvidence(input: {
  plate: string;
  rawText: string;
}): ParsedSatResult {
  const plate = normalizePlate(input.plate);
  const evidenceText = normalizeEvidenceText(input.rawText);
  const extractedFields = inferFields(input.rawText, evidenceText, plate);
  const confidenceScore = scoreFields(extractedFields, plate);
  const alerts = alertTerms(evidenceText, extractedFields);
  const confidenceLevel: ConfidenceLevel =
    confidenceScore >= 75 ? "Alta" : confidenceScore >= 45 ? "Media" : "Baja";
  const statusSuggestion: SourceStatus =
    alerts.length > 0
      ? "consulted_with_alert"
      : confidenceScore >= 45
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
    `Placa ${plate}: ya revise SAT Lima.`,
    alerts.length
      ? `Hay observaciones: ${alerts.join(" ")}`
      : "No veo papeleta/deuda SAT evidente en la evidencia capturada.",
    fieldRows.length
      ? `Datos principales: ${fieldRows.slice(0, 5).map((field) => `${field.label} ${field.value}`).join(", ")}.`
      : "La evidencia necesita una segunda revision porque no se extrajeron suficientes campos."
  ].join(" ");

  return {
    sourceId: "sat_lima_papeletas",
    sourceName: "SAT Lima Papeletas",
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
      "Guardar captura o HTML del resultado SAT como evidencia.",
      "Verificar que la placa visible coincida con la placa del cliente.",
      "Si SAT muestra sesion expirada o error, repetir consulta desde la opcion Consulta de papeletas / Multas Administrativas."
    ]
  };
}
