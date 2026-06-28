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
