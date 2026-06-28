export type PackageType = "express" | "compra_segura" | "pro";

export type OrderStatus =
  | "created"
  | "pending_payment"
  | "paid"
  | "processing"
  | "manual_review_required"
  | "completed"
  | "delivered"
  | "cancelled"
  | "failed";

export type RiskLevel = "Pendiente" | "Verde" | "Amarillo" | "Rojo";

export type PaymentStatus = "pending" | "confirmed" | "failed" | "refunded";

export type SourceStatus =
  | "pending"
  | "consulted_no_alert"
  | "consulted_with_alert"
  | "unavailable"
  | "not_applicable"
  | "not_included"
  | "requires_manual_document"
  | "failed";

export type ConfidenceLevel = "Alta" | "Media" | "Baja" | "No aplica";

export type CreateOrderInput = {
  plate: string;
  customerName: string;
  phone: string;
  email?: string;
  packageType: PackageType;
  city: string;
  vehicleType: string;
  sellerName?: string;
  sellerDocument?: string;
  listingUrl?: string;
  vin?: string;
  mileage?: number;
  notes?: string;
  consentAccepted: boolean;
};

export type CreatedOrder = {
  id: string;
  code: string;
  plate: string;
  packageType: PackageType;
  status: OrderStatus;
  riskLevel: RiskLevel;
  totalPrice: number;
};

export type PanelOrder = {
  code: string;
  plate: string;
  packageType: string;
  customer: string;
  status: OrderStatus;
  risk: RiskLevel;
  time: string;
};

export type PanelMetric = {
  label: string;
  value: string;
};

export type PanelData = {
  orders: PanelOrder[];
  metrics: PanelMetric[];
  isLive: boolean;
};

export type SourceTemplate = {
  sourceName: string;
  sourceCategory: string;
  requiredFor: PackageType[];
};

export type OrderSourceResult = {
  id: string;
  sourceName: string;
  sourceCategory: string;
  status: SourceStatus;
  confidenceLevel: ConfidenceLevel;
  summary?: string;
  evidenceUrl?: string;
  checkedAt?: string;
  updatedAt?: string;
  officialUrl?: string;
};

export type OrderSourceProgress = {
  total: number;
  completed: number;
  alerts: number;
  pending: number;
  completionRate: number;
};

export type RiskRecommendation =
  | "Comprar"
  | "Negociar"
  | "Pedir documentos"
  | "Evitar";

export type RiskAssessment = {
  score: number;
  level: Exclude<RiskLevel, "Pendiente">;
  recommendation: RiskRecommendation;
  alerts: string[];
  riskFactors: string[];
  positiveFactors: string[];
  pendingFactors: string[];
};

export type ReportSummary = {
  plate: string;
  packageLabel: string;
  consultedSources: string[];
  pendingSources: string[];
  alerts: string[];
  score: number;
  recommendation: RiskRecommendation;
  whatsappText: string;
  pdfSections: Array<{
    title: string;
    content: string;
  }>;
};

export type OrderDetail = {
  id: string;
  code: string;
  plate: string;
  packageType: PackageType;
  packageLabel: string;
  status: OrderStatus;
  riskLevel: RiskLevel;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  city: string;
  vehicleType: string;
  sellerName?: string;
  listingUrl?: string;
  vin?: string;
  mileage?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  sources: OrderSourceResult[];
  progress: OrderSourceProgress;
  riskAssessment: RiskAssessment;
  reportSummary: ReportSummary;
  isLive: boolean;
};
