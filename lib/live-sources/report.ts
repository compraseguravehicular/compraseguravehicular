import type { PackageType, RiskAssessment, RiskRecommendation } from "@/lib/domain";
import { normalizePlate } from "@/lib/plates";
import { packageLabels } from "@/lib/orders/pricing";
import { getSourcesForPackage } from "@/lib/sources/registry";
import { validateLiveSource } from "@/lib/live-sources/adapters";
import {
  getOperatorEvidenceForPlate,
  type OperatorSourceEvidence
} from "@/lib/operator/evidence-repository";
import type {
  LivePlateReport,
  LiveReportMetrics,
  LiveReportSummary,
  LiveSourceCheck
} from "@/lib/live-sources/types";

type LiveReportInput = {
  plate: string;
  packageType: PackageType;
};

const pendingStatuses = new Set([
  "api_credentials_missing",
  "worker_candidate",
  "portal_protected",
  "session_protected",
  "partner_required",
  "matrix_required",
  "unavailable",
  "failed"
]);

const structuredResultStatuses = new Set(["api_result", "operator_evidence"]);

function buildMetrics(sources: LiveSourceCheck[]): LiveReportMetrics {
  const checked = sources.length;
  const onlineOrProtected = sources.filter((source) =>
    ["online", "protected"].includes(source.availability)
  ).length;

  return {
    total: sources.length,
    checked,
    apiResults: sources.filter((source) =>
      structuredResultStatuses.has(source.status)
    ).length,
    providersConfigured: sources.filter((source) => source.providerConfigured).length,
    credentialMissing: sources.filter(
      (source) => source.status === "api_credentials_missing"
    ).length,
    workerCandidates: sources.filter(
      (source) => source.status === "worker_candidate"
    ).length,
    protectedPortals: sources.filter((source) =>
      ["portal_protected", "session_protected"].includes(source.status)
    ).length,
    partnerRequired: sources.filter(
      (source) => source.status === "partner_required"
    ).length,
    matrixRequired: sources.filter(
      (source) => source.status === "matrix_required"
    ).length,
    onlineOrProtected,
    unavailable: sources.filter((source) => source.status === "unavailable").length,
    completionRate: sources.length ? Math.round((checked / sources.length) * 100) : 0
  };
}

function recommendationForLiveScore(
  score: number,
  metrics: LiveReportMetrics
): RiskRecommendation {
  if (metrics.unavailable >= 4) {
    return "Pedir documentos";
  }

  if (metrics.credentialMissing + metrics.protectedPortals >= 3) {
    return "Pedir documentos";
  }

  if (score >= 70) {
    return "Evitar";
  }

  if (score >= 46) {
    return "Pedir documentos";
  }

  if (score >= 26) {
    return "Negociar";
  }

  return "Comprar";
}

function assessLiveReportRisk(
  sources: LiveSourceCheck[],
  metrics: LiveReportMetrics
): RiskAssessment {
  let score = 12;
  const alerts: string[] = [];
  const riskFactors: string[] = [];
  const positiveFactors: string[] = [];
  const pendingFactors: string[] = [];

  if (metrics.apiResults > 0) {
    positiveFactors.push(
      `${metrics.apiResults} fuentes devolvieron datos estructurados o evidencia OCR.`
    );
  }

  if (metrics.onlineOrProtected > 0) {
    positiveFactors.push(
      `${metrics.onlineOrProtected} fuentes oficiales respondieron o estan protegidas activamente.`
    );
  }

  if (metrics.credentialMissing > 0) {
    score += Math.min(28, metrics.credentialMissing * 4);
    pendingFactors.push(
      `${metrics.credentialMissing} fuentes requieren credenciales de proveedor API.`
    );
  }

  if (metrics.protectedPortals > 0) {
    score += metrics.protectedPortals * 5;
    pendingFactors.push(
      `${metrics.protectedPortals} fuentes estan protegidas por sesion o control antiabuso.`
    );
  }

  if (metrics.workerCandidates > 0) {
    score += Math.min(14, metrics.workerCandidates * 3);
    pendingFactors.push(
      `${metrics.workerCandidates} fuentes son candidatas a worker con evidencia automatizada.`
    );
  }

  if (metrics.partnerRequired > 0) {
    score += metrics.partnerRequired * 4;
    pendingFactors.push(
      `${metrics.partnerRequired} fuente requiere partner/API con control de costo.`
    );
  }

  if (metrics.unavailable > 0) {
    score += metrics.unavailable * 8;
    riskFactors.push(
      `${metrics.unavailable} fuentes no estuvieron disponibles al momento de la prueba.`
    );
  }

  if (metrics.matrixRequired > 0) {
    score += 6;
    pendingFactors.push(
      "La cobertura provincial requiere motor de matriz por ciudad."
    );
  }

  if (metrics.apiResults === 0) {
    alerts.push(
      "No se confirmaron alertas vehiculares reales por API/evidencia todavia; faltan credenciales o proveedores en fuentes criticas."
    );
  } else {
    alerts.push(
      `${metrics.apiResults} fuente(s) ya aportaron datos estructurados al reporte; aun faltan fuentes criticas por resolver.`
    );
  }

  if (metrics.credentialMissing + metrics.protectedPortals > 0) {
    alerts.push(
      "SUNARP, SOAT, CITV, SAT, Callao o GNV deben resolverse con API/proveedor/worker autorizado, no con simulacion."
    );
  }

  const boundedScore = Math.max(0, Math.min(100, score));
  const level =
    boundedScore >= 61 ? "Rojo" : boundedScore >= 26 ? "Amarillo" : "Verde";

  return {
    score: boundedScore,
    level,
    recommendation: recommendationForLiveScore(boundedScore, metrics),
    alerts: alerts.slice(0, 6),
    riskFactors: riskFactors.slice(0, 8),
    positiveFactors: positiveFactors.slice(0, 8),
    pendingFactors: pendingFactors.slice(0, 8)
  };
}

function buildSummary(
  plate: string,
  packageType: PackageType,
  generatedAt: string,
  sources: LiveSourceCheck[],
  metrics: LiveReportMetrics,
  risk: RiskAssessment
): LiveReportSummary {
  const packageLabel = packageLabels[packageType];
  const consultedSources = sources
    .filter((source) => source.availability === "online")
    .map((source) => source.sourceName);
  const pendingSources = sources
    .filter((source) => pendingStatuses.has(source.status))
    .map((source) => source.sourceName);
  const integrationRequired = sources
    .filter((source) =>
      [
        "api_credentials_missing",
        "portal_protected",
        "session_protected",
        "partner_required",
        "matrix_required"
      ].includes(source.status)
    )
    .map((source) => source.sourceName);
  const headline =
    `Reporte tecnico generado para ${plate}: ${metrics.checked}/${metrics.total} fuentes revisadas y ` +
    `${metrics.apiResults} fuentes con datos estructurados.`;
  const whatsappText = [
    "Reporte Compra Segura Vehicular",
    `Placa: ${plate}`,
    `Paquete: ${packageLabel}`,
    `Generado: ${new Date(generatedAt).toLocaleString("es-PE", {
      timeZone: "America/Lima"
    })}`,
    `Fuentes revisadas: ${metrics.checked}/${metrics.total}`,
    `Datos estructurados recibidos: ${metrics.apiResults}`,
    `Integraciones activas: ${metrics.providersConfigured}`,
    `Integraciones pendientes: ${metrics.credentialMissing + metrics.protectedPortals + metrics.partnerRequired + metrics.matrixRequired}`,
    `Riesgo preliminar: ${risk.level} (${risk.score}/100)`,
    `Recomendacion: ${risk.recommendation}`,
    integrationRequired.length
      ? `Resolver con API/proveedor: ${integrationRequired.join(", ")}`
      : "Resolver con API/proveedor: sin pendientes criticos",
    pendingSources.length
      ? `Pendientes tecnologicos: ${pendingSources.join(", ")}`
      : "Pendientes tecnologicos: ninguno",
    "Nota: el sistema usa evidencia real o tokens/proveedores reales; no simula datos ni usa bypass antiabuso."
  ].join("\n");

  return {
    plate,
    packageType,
    packageLabel,
    generatedAt,
    headline,
    alerts: risk.alerts,
    pendingSources,
    consultedSources,
    whatsappText,
    pdfSections: [
      {
        title: "Resumen ejecutivo",
        content: `${headline} Riesgo preliminar ${risk.level} con recomendacion: ${risk.recommendation}.`
      },
      {
        title: "Fuentes e integraciones",
        content: sources
          .map(
            (source) =>
              `${source.sourceName}: ${source.status} via ${source.integrationMode}`
          )
          .join(" | ")
      },
      {
        title: "Pendientes tecnologicos",
        content:
          pendingSources.join(", ") ||
          "No hay pendientes operativos registrados."
      }
    ]
  };
}

function liveConfidenceFromEvidence(
  confidenceLevel: OperatorSourceEvidence["confidenceLevel"]
) {
  return confidenceLevel === "No aplica" ? "Media" : confidenceLevel;
}

function sourceMatchesEvidence(
  source: LiveSourceCheck,
  evidence: OperatorSourceEvidence
) {
  return (
    source.sourceId === evidence.sourceId ||
    source.sourceName.toLowerCase() === evidence.sourceName.toLowerCase()
  );
}

function mergeOperatorEvidence(
  sources: LiveSourceCheck[],
  evidenceRows: OperatorSourceEvidence[]
) {
  if (!evidenceRows.length) {
    return sources;
  }

  return sources.map((source) => {
    const evidence = evidenceRows.find((row) =>
      sourceMatchesEvidence(source, row)
    );

    if (!evidence) {
      return source;
    }

    const evidenceUrl = evidence.evidenceUrl ?? source.officialUrl;

    return {
      ...source,
      status: "operator_evidence" as const,
      integrationMode: "operator_ocr" as const,
      providerName: "Evidencia OCR supervisada",
      providerConfigured: true,
      requiredEnv: [],
      availability:
        source.availability === "offline" ? "online" : source.availability,
      confidence: liveConfidenceFromEvidence(evidence.confidenceLevel),
      checkedAt: evidence.checkedAt ?? source.checkedAt,
      summary:
        evidence.summary ??
        `${source.sourceName}: evidencia OCR estructurada para ${source.plate}.`,
      technicalFinding:
        "Resultado oficial capturado por operador, leido con OCR y convertido a datos estructurados persistidos para el reporte.",
      limitation:
        "La evidencia OCR debe conservar la captura oficial y fecha/hora; para alto volumen conviene sumar API o convenio autorizado.",
      operatorAction:
        "Continuar con las siguientes fuentes, guardar evidencia y recalcular el riesgo final.",
      nextTechnologyStep:
        "Mantener esta fuente como evidencia OCR y, en paralelo, buscar API/proveedor autorizado para automatizacion escalable.",
      evidence: [
        {
          label: "Evidencia OCR guardada",
          url: evidenceUrl,
          detail:
            "Resultado SUNARP capturado y estructurado desde el operador interno."
        },
        ...source.evidence
      ],
      providerPayload: evidence.rawData
    } satisfies LiveSourceCheck;
  });
}

export async function runLivePlateReport(
  input: LiveReportInput
): Promise<LivePlateReport> {
  const plate = normalizePlate(input.plate);
  const packageType = input.packageType;
  const packageLabel = packageLabels[packageType];
  const generatedAt = new Date().toISOString();
  const sourceDefinitions = getSourcesForPackage(packageType);
  const [validatedSources, operatorEvidence] = await Promise.all([
    Promise.all(
      sourceDefinitions.map((source) => validateLiveSource(source, plate))
    ),
    getOperatorEvidenceForPlate(plate)
  ]);
  const sources = mergeOperatorEvidence(validatedSources, operatorEvidence);
  const metrics = buildMetrics(sources);
  const risk = assessLiveReportRisk(sources, metrics);
  const summary = buildSummary(
    plate,
    packageType,
    generatedAt,
    sources,
    metrics,
    risk
  );

  return {
    plate,
    packageType,
    packageLabel,
    generatedAt,
    metrics,
    risk,
    sources,
    summary
  };
}
