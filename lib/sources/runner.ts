import type { PackageType } from "@/lib/domain";
import { getSourcesForPackage } from "@/lib/sources/registry";
import type { SourceRunResult } from "@/lib/sources/types";

function statusForMode(mode: SourceRunResult["automationMode"]) {
  if (mode === "automatic_candidate") {
    return "pending";
  }

  if (mode === "blocked") {
    return "requires_manual_document";
  }

  if (mode === "paid_or_partner") {
    return "requires_manual_document";
  }

  return "requires_manual_document";
}

export function runVehicleSourcePlan(
  plate: string,
  packageType: PackageType
): SourceRunResult[] {
  const normalizedPlate = plate.trim().toUpperCase();

  return getSourcesForPackage(packageType).map((source) => ({
    sourceId: source.id,
    sourceName: source.name,
    category: source.category,
    status: statusForMode(source.automationMode),
    automationMode: source.automationMode,
    confidence: source.confidence,
    officialUrl: source.officialUrl,
    fields: source.fields,
    limitation: source.limitation,
    operatorAction: source.operatorAction,
    summary: `Plan listo para placa ${normalizedPlate}: ${source.operatorAction}`
  }));
}

export function sourceRunMetrics(results: SourceRunResult[]) {
  return {
    total: results.length,
    automaticCandidates: results.filter(
      (item) => item.automationMode === "automatic_candidate"
    ).length,
    manualAssisted: results.filter(
      (item) => item.automationMode === "manual_assisted"
    ).length,
    paidOrPartner: results.filter(
      (item) => item.automationMode === "paid_or_partner"
    ).length,
    blocked: results.filter((item) => item.automationMode === "blocked").length
  };
}
