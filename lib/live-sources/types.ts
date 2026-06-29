import type { PackageType, RiskAssessment } from "@/lib/domain";

export type LiveSourceStatus =
  | "api_result"
  | "operator_evidence"
  | "api_credentials_missing"
  | "worker_candidate"
  | "portal_protected"
  | "session_protected"
  | "partner_required"
  | "matrix_required"
  | "unavailable"
  | "failed";

export type IntegrationMode =
  | "provider_api"
  | "operator_ocr"
  | "browser_worker"
  | "partner_api"
  | "data_matrix"
  | "portal_probe";

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
  integrationMode: IntegrationMode;
  providerName: string;
  providerConfigured: boolean;
  requiredEnv: string[];
  availability: PortalAvailability;
  httpStatus?: number;
  confidence: "Alta" | "Media" | "Baja";
  checkedAt: string;
  fields: string[];
  summary: string;
  technicalFinding: string;
  limitation: string;
  operatorAction: string;
  nextTechnologyStep: string;
  evidence: LiveSourceEvidence[];
  providerPayload?: unknown;
};

export type LiveReportMetrics = {
  total: number;
  checked: number;
  apiResults: number;
  providersConfigured: number;
  credentialMissing: number;
  workerCandidates: number;
  protectedPortals: number;
  partnerRequired: number;
  matrixRequired: number;
  onlineOrProtected: number;
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
