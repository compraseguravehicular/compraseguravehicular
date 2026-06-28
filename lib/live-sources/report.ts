import type { PackageType, RiskAssessment, RiskRecommendation } from "@/lib/domain";
import { normalizePlate } from "@/lib/plates";
import { packageLabels } from "@/lib/orders/pricing";
import { getSourcesForPackage } from "@/lib/sources/registry";
import { validateLiveSource } from "@/lib/live-sources/adapters";
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
  "blocked_by_captcha",
  "manual_assisted",
  "session_required",
  "paid_or_partner",
  "blocked",
  "unavailable",
  "failed"
]);

function buildMetrics(sources: LiveSourceCheck[]): LiveReportMetrics {
  const checked = sources.length;
  const onlineOrProtected = sources.filter((source) =>
    ["online", "protected"].includes(source.availability)
  ).length;

  return {
    total: sources.length,
    checked,
    onlineOrProtected,
    blockedByCaptcha: sources.filter(
      (source) => source.status === "blocked_by_captcha"
    ).length,
    manualAssisted: sources.filter((source) => source.status === "manual_assisted").length,
    sessionRequired: sources.filter((source) => source.status === "session_required").length,
    paidOrPartner: sources.filter((source) => source.status === "paid_or_partner").length,
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

  if (metrics.blockedByCaptcha + metrics.sessionRequired >= 3) {
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

  if (metrics.onlineOrProtected > 0) {
    positiveFactors.push(
      `${metrics.onlineOrProtected} fuentes oficiales respondieron o estan protegidas activamente.`
    );
  }

  if (metrics.blockedByCaptcha > 0) {
    score += Math.min(24, metrics.blockedByCaptcha * 4);
    pendingFactors.push(
      `${metrics.blockedByCaptcha} fuentes criticas requieren validacion humana por CAPTCHA.`
    );
  }

  if (metrics.sessionRequired > 0) {
    score += metrics.sessionRequired * 5;
    pendingFactors.push(
      `${metrics.sessionRequired} fuente requiere sesion web dinamica.`
    );
  }

  if (metrics.manualAssisted > 0) {
    score += Math.min(14, metrics.manualAssisted * 3);
    pendingFactors.push(
      `${metrics.manualAssisted} fuentes quedan como revision manual asistida.`
    );
  }

  if (metrics.paidOrPartner > 0) {
    score += metrics.paidOrPartner * 4;
    pendingFactors.push(
      `${metrics.paidOrPartner} fuente requiere pago, cuenta o convenio.`
    );
  }

  if (metrics.unavailable > 0) {
    score += metrics.unavailable * 8;
    riskFactors.push(
      `${metrics.unavailable} fuentes no estuvieron disponibles al momento de la prueba.`
    );
  }

  if (sources.some((source) => source.status === "blocked")) {
    score += 6;
    pendingFactors.push(
      "La cobertura provincial requiere matriz por ciudad; no hay fuente unica nacional."
    );
  }

  alerts.push(
    "No se confirmaron alertas vehiculares reales todavia; las fuentes criticas requieren evidencia oficial."
  );

  if (metrics.blockedByCaptcha > 0) {
    alerts.push(
      "SUNARP, SOAT, CITV, Callao o GNV pueden requerir CAPTCHA; el sistema no lo salta ni simula resultados."
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
  const blockedCaptcha = sources
    .filter((source) => source.status === "blocked_by_captcha")
    .map((source) => source.sourceName);
  const headline =
    `Reporte tecnico generado para ${plate}: ${metrics.checked}/${metrics.total} fuentes revisadas y ` +
    `${metrics.onlineOrProtected} portales oficiales respondieron o estan protegidos.`;
  const whatsappText = [
    "Reporte Compra Segura Vehicular",
    `Placa: ${plate}`,
    `Paquete: ${packageLabel}`,
    `Generado: ${new Date(generatedAt).toLocaleString("es-PE", {
      timeZone: "America/Lima"
    })}`,
    `Fuentes revisadas: ${metrics.checked}/${metrics.total}`,
    `Portales online/protegidos: ${metrics.onlineOrProtected}`,
    `Riesgo preliminar: ${risk.level} (${risk.score}/100)`,
    `Recomendacion: ${risk.recommendation}`,
    blockedCaptcha.length
      ? `Validacion humana requerida: ${blockedCaptcha.join(", ")}`
      : "Validacion humana requerida: sin bloqueos por CAPTCHA registrados",
    pendingSources.length
      ? `Pendientes: ${pendingSources.join(", ")}`
      : "Pendientes: ninguno",
    "Nota: no se simulan datos ni se saltan CAPTCHA; el resultado final exige evidencia oficial por fuente."
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
        title: "Fuentes revisadas",
        content: sources
          .map((source) => `${source.sourceName}: ${source.status}`)
          .join(" | ")
      },
      {
        title: "Pendientes operativos",
        content:
          pendingSources.join(", ") ||
          "No hay pendientes operativos registrados."
      }
    ]
  };
}

export async function runLivePlateReport(
  input: LiveReportInput
): Promise<LivePlateReport> {
  const plate = normalizePlate(input.plate);
  const packageType = input.packageType;
  const packageLabel = packageLabels[packageType];
  const generatedAt = new Date().toISOString();
  const sourceDefinitions = getSourcesForPackage(packageType);
  const sources = await Promise.all(
    sourceDefinitions.map((source) => validateLiveSource(source, plate))
  );
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
