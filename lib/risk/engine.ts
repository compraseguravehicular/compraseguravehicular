import type {
  OrderSourceProgress,
  OrderSourceResult,
  ReportSummary,
  RiskAssessment,
  RiskRecommendation
} from "@/lib/domain";

type RiskContext = {
  code: string;
  plate: string;
  packageLabel: string;
  progress: OrderSourceProgress;
  sources: OrderSourceResult[];
};

const completedStatuses = new Set([
  "consulted_no_alert",
  "consulted_with_alert",
  "unavailable",
  "not_applicable",
  "not_included",
  "requires_manual_document",
  "failed"
]);

function hasAny(value: string, terms: string[]) {
  const normalized = value.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function recommendationForScore(
  score: number,
  pendingFactors: string[]
): RiskRecommendation {
  if (score >= 70) {
    return "Evitar";
  }

  if (score >= 46 || pendingFactors.length >= 3) {
    return "Pedir documentos";
  }

  if (score >= 26) {
    return "Negociar";
  }

  return "Comprar";
}

export function assessOrderRisk(context: RiskContext): RiskAssessment {
  let score = 8;
  const alerts: string[] = [];
  const riskFactors: string[] = [];
  const positiveFactors: string[] = [];
  const pendingFactors: string[] = [];

  for (const source of context.sources) {
    const name = source.sourceName;
    const text = `${source.sourceName} ${source.summary ?? ""}`;
    const sourceHasEvidence = Boolean(source.evidenceUrl);

    if (source.status === "consulted_no_alert") {
      score -= 2;
      positiveFactors.push(`${name}: sin alerta registrada.`);
      if (!sourceHasEvidence) {
        score += 2;
        pendingFactors.push(`${name}: falta evidencia adjunta.`);
      }
      continue;
    }

    if (source.status === "consulted_with_alert") {
      let weight = 16;

      if (hasAny(text, ["captura", "administrativa", "orden de captura"])) {
        weight = 34;
      } else if (hasAny(text, ["papeleta", "deuda", "multa", "sat"])) {
        weight = 24;
      } else if (hasAny(text, ["soat", "seguro", "vencido", "no encontrado"])) {
        weight = 26;
      } else if (hasAny(text, ["citv", "revision tecnica", "vence", "vencida"])) {
        weight = 18;
      } else if (hasAny(text, ["titular", "sunarp", "inconsistencia"])) {
        weight = 28;
      } else if (hasAny(text, ["taxi", "atu", "gnv", "uso intensivo"])) {
        weight = 16;
      }

      score += weight;
      alerts.push(`${name}: ${source.summary ?? "alerta registrada"}`);
      riskFactors.push(`${name}: requiere revision antes de comprar.`);
      if (!sourceHasEvidence) {
        score += 3;
        pendingFactors.push(`${name}: alerta sin evidencia adjunta.`);
      }
      continue;
    }

    if (source.status === "unavailable" || source.status === "failed") {
      score += 7;
      pendingFactors.push(`${name}: fuente no disponible o fallida.`);
      continue;
    }

    if (source.status === "requires_manual_document") {
      score += 8;
      pendingFactors.push(`${name}: requiere documento, pago o revision manual.`);
      continue;
    }

    if (source.status === "pending") {
      score += 5;
      pendingFactors.push(`${name}: pendiente de consulta.`);
    }
  }

  if (context.progress.completionRate < 50) {
    score += 8;
    pendingFactors.push("Menos del 50% de fuentes completadas.");
  }

  const boundedScore = Math.max(0, Math.min(100, score));
  const level =
    boundedScore >= 61 ? "Rojo" : boundedScore >= 26 ? "Amarillo" : "Verde";

  return {
    score: boundedScore,
    level,
    recommendation: recommendationForScore(boundedScore, pendingFactors),
    alerts: alerts.slice(0, 6),
    riskFactors: riskFactors.slice(0, 8),
    positiveFactors: positiveFactors.slice(0, 8),
    pendingFactors: pendingFactors.slice(0, 8)
  };
}

export function buildReportSummary(
  context: RiskContext,
  risk: RiskAssessment
): ReportSummary {
  const consultedSources = context.sources
    .filter((source) => completedStatuses.has(source.status))
    .map((source) => source.sourceName);
  const pendingSources = context.sources
    .filter((source) => !completedStatuses.has(source.status))
    .map((source) => source.sourceName);
  const whatsappText = [
    `Reporte ${context.code}`,
    `Placa: ${context.plate}`,
    `Paquete: ${context.packageLabel}`,
    `Avance: ${context.progress.completionRate}%`,
    `Riesgo: ${risk.level} (${risk.score}/100)`,
    `Recomendacion: ${risk.recommendation}`,
    risk.alerts.length ? `Alertas: ${risk.alerts.join(" | ")}` : "Alertas: sin alertas registradas",
    pendingSources.length
      ? `Pendiente: ${pendingSources.join(", ")}`
      : "Pendiente: sin fuentes pendientes"
  ].join("\n");

  return {
    plate: context.plate,
    packageLabel: context.packageLabel,
    consultedSources,
    pendingSources,
    alerts: risk.alerts,
    score: risk.score,
    recommendation: risk.recommendation,
    whatsappText,
    pdfSections: [
      {
        title: "Resumen ejecutivo",
        content: `Riesgo ${risk.level} con score ${risk.score}/100. Recomendacion: ${risk.recommendation}.`
      },
      {
        title: "Fuentes consultadas",
        content: consultedSources.length
          ? consultedSources.join(", ")
          : "No hay fuentes completadas todavia."
      },
      {
        title: "Pendientes y alertas",
        content: [...risk.alerts, ...risk.pendingFactors].join(" | ") || "Sin pendientes criticos registrados."
      }
    ]
  };
}
