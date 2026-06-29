import type { ConfidenceLevel, SourceStatus } from "@/lib/domain";
import { compactPlate, normalizePlate } from "@/lib/plates";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ParsedSunarpResult } from "@/lib/operator/sunarp-parser";

const operatorCustomerPhone = "operator-evidence-cache";
const operatorCustomerEmail = "operador@compraseguravehicular.local";
const operatorSourceChannel = "operator_evidence";

type OperatorCheckRow = {
  id: string;
  code: string;
  plate: string;
};

type OperatorSourceRow = {
  id: string;
  source_name: string;
  source_category: string;
  status: SourceStatus;
  confidence_level: ConfidenceLevel;
  summary: string | null;
  raw_data: unknown;
  evidence_url: string | null;
  checked_at: string | null;
  updated_at: string | null;
};

export type OperatorSourceEvidence = {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceCategory: string;
  plate: string;
  status: SourceStatus;
  confidenceLevel: ConfidenceLevel;
  summary?: string;
  rawData?: unknown;
  evidenceUrl?: string;
  checkedAt?: string;
  updatedAt?: string;
};

type ParsedOperatorResult = {
  sourceId: string;
  sourceName: string;
  plate: string;
  statusSuggestion: SourceStatus;
  confidenceLevel: ConfidenceLevel;
  summary: string;
  alerts: string[];
  fieldRows: Array<{
    label: string;
    value: string;
  }>;
  extractedFields: unknown;
};

function operatorCodeForPlate(plate: string) {
  return `OP-${compactPlate(plate)}`;
}

async function getOrCreateOperatorCustomerId() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data: existingCustomer, error: existingError } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", operatorCustomerPhone)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingCustomer?.id) {
    return existingCustomer.id as string;
  }

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      name: "Cache operativo",
      phone: operatorCustomerPhone,
      email: operatorCustomerEmail
    })
    .select("id")
    .single();

  if (error || !customer) {
    throw new Error(error?.message ?? "No se pudo crear cliente operativo.");
  }

  return customer.id as string;
}

async function getOrCreateOperatorCheck(plate: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const normalizedPlate = normalizePlate(plate);
  const code = operatorCodeForPlate(normalizedPlate);
  const { data: existingCheck, error: existingError } = await supabase
    .from("vehicle_checks")
    .select("id, code, plate")
    .eq("code", code)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingCheck) {
    return existingCheck as OperatorCheckRow;
  }

  const customerId = await getOrCreateOperatorCustomerId();
  const { data: check, error } = await supabase
    .from("vehicle_checks")
    .insert({
      code,
      customer_id: customerId,
      plate: normalizedPlate,
      package_type: "pro",
      status: "processing",
      risk_level: "Pendiente",
      total_price: 0,
      payment_status: "pending",
      source_channel: operatorSourceChannel,
      city: "Lima",
      vehicle_type: "No especificado",
      notes: "Cache operativo para evidencias OCR por placa.",
      consent_accepted: false
    })
    .select("id, code, plate")
    .single();

  if (error || !check) {
    throw new Error(error?.message ?? "No se pudo crear cache operativo.");
  }

  return check as OperatorCheckRow;
}

function mapOperatorSourceRow(
  row: OperatorSourceRow,
  plate: string
): OperatorSourceEvidence {
  const rawRecord =
    row.raw_data && typeof row.raw_data === "object"
      ? (row.raw_data as Record<string, unknown>)
      : undefined;
  const sourceId =
    typeof rawRecord?.sourceId === "string"
      ? rawRecord.sourceId
      : "sunarp_consulta_vehicular";

  return {
    id: row.id,
    sourceId,
    sourceName: row.source_name,
    sourceCategory: row.source_category,
    plate,
    status: row.status,
    confidenceLevel: row.confidence_level,
    summary: row.summary ?? undefined,
    rawData: row.raw_data ?? undefined,
    evidenceUrl: row.evidence_url ?? undefined,
    checkedAt: row.checked_at ?? undefined,
    updatedAt: row.updated_at ?? undefined
  };
}

export async function saveSunarpOperatorEvidence(input: {
  plate: string;
  result: ParsedSunarpResult;
  rawText: string;
  evidenceUrl?: string;
}) {
  return saveOperatorEvidence({
    ...input,
    sourceCategory: "registral",
    ingestion: "operator_ocr"
  });
}

export async function saveOperatorEvidence(input: {
  plate: string;
  result: ParsedOperatorResult;
  sourceCategory: string;
  rawText: string;
  evidenceUrl?: string;
  ingestion?: string;
}) {
  if (!isSupabaseConfigured()) {
    return undefined;
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return undefined;
  }

  const check = await getOrCreateOperatorCheck(input.result.plate);
  const checkedAt = new Date().toISOString();
  const rawData = {
    sourceId: input.result.sourceId,
    parsedResult: input.result,
    extractedFields: input.result.extractedFields,
    fieldRows: input.result.fieldRows,
    alerts: input.result.alerts,
    evidenceText: input.rawText,
    savedAt: checkedAt,
    ingestion: input.ingestion ?? "operator_evidence"
  };

  const { data: existingSource, error: existingError } = await supabase
    .from("source_results")
    .select("id")
    .eq("check_id", check.id)
    .eq("source_name", input.result.sourceName)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingSource?.id) {
    const { data, error } = await supabase
      .from("source_results")
      .update({
        status: input.result.statusSuggestion,
        confidence_level: input.result.confidenceLevel,
        summary: input.result.summary,
        raw_data: rawData,
        evidence_url: input.evidenceUrl,
        checked_at: checkedAt
      })
      .eq("id", existingSource.id)
      .select(
        "id, source_name, source_category, status, confidence_level, summary, raw_data, evidence_url, checked_at, updated_at"
      )
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo actualizar evidencia OCR.");
    }

    return mapOperatorSourceRow(data as OperatorSourceRow, check.plate);
  }

  const { data, error } = await supabase
    .from("source_results")
    .insert({
      check_id: check.id,
      source_name: input.result.sourceName,
      source_category: input.sourceCategory,
      status: input.result.statusSuggestion,
      confidence_level: input.result.confidenceLevel,
      summary: input.result.summary,
      raw_data: rawData,
      evidence_url: input.evidenceUrl,
      checked_at: checkedAt
    })
    .select(
      "id, source_name, source_category, status, confidence_level, summary, raw_data, evidence_url, checked_at, updated_at"
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo guardar evidencia OCR.");
  }

  return mapOperatorSourceRow(data as OperatorSourceRow, check.plate);
}

export async function getOperatorEvidenceForPlate(plate: string) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const normalizedPlate = normalizePlate(plate);
  const code = operatorCodeForPlate(normalizedPlate);
  const { data: check, error: checkError } = await supabase
    .from("vehicle_checks")
    .select("id, code, plate")
    .eq("code", code)
    .eq("source_channel", operatorSourceChannel)
    .maybeSingle();

  if (checkError || !check) {
    return [];
  }

  const { data: rows, error } = await supabase
    .from("source_results")
    .select(
      "id, source_name, source_category, status, confidence_level, summary, raw_data, evidence_url, checked_at, updated_at"
    )
    .eq("check_id", check.id)
    .order("checked_at", { ascending: false });

  if (error || !rows) {
    return [];
  }

  return (rows as OperatorSourceRow[]).map((row) =>
    mapOperatorSourceRow(row, check.plate as string)
  );
}
