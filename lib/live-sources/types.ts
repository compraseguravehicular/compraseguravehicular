import type { PackageType, RiskAssessment } from "@/lib/domain";

export type LiveSourceStatus =
  | "source_available"
  | "blocked_by_captcha"
  | "manual_assisted"
  | "session_required"
  | "paid_or_partner"
  | "unavailable"
  | "blocked"
  | "failed";

export type PortalAvailability =
  | "online"
  | "protected"
  | "offline"
  | "unknown";

export type LiveSourceEvidence = {
  label: string;
  url: string;
  detail: string;
};

export type LiveSourceCheck = {
  sourceId: string;
  sourceName: string;
  category: string;
  officialUrl: string;
  plate: string;
  status: LiveSourceStatus;
  availability: PortalAvailability;
  httpStatus?: number;
  confidence: "Alta" | "Media" | "Baja";
  checkedAt: string;
  fields: string[];
  summary: string;
  technicalFinding: string;
  limitation: string;
  operatorAction: string;
  evidence: LiveSourceEvidence[];
};

export type LiveReportMetrics = {
  total: number;
  checked: number;
  onlineOrProtected: number;
  blockedByCaptcha: number;
  manualAssisted: number;
  sessionRequired: number;
  paidOrPartner: number;
  unavailable: number;
  completionRate: number;
};

export type LiveReportSummary = {
  plate: string;
  packageType: PackageType;
  packageLabel: string;
  generatedAt: string;
  headline: string;
  alerts: string[];
  pendingSources: string[];
  consultedSources: string[];
  whatsappText: string;
  pdfSections: Array<{
    title: string;
    content: string;
  }>;
};

export type LivePlateReport = {
  plate: string;
  packageType: PackageType;
  packageLabel: string;
  generatedAt: string;
  metrics: LiveReportMetrics;
  risk: RiskAssessment;
  sources: LiveSourceCheck[];
  summary: LiveReportSummary;
};
