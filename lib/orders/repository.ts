import type {
  ConfidenceLevel,
  CreatedOrder,
  CreateOrderInput,
  OrderDetail,
  OrderSourceProgress,
  OrderSourceResult,
  OrderStatus,
  PanelData,
  PanelOrder,
  PaymentStatus,
  RiskLevel
} from "@/lib/domain";
import { panelOrders } from "@/lib/product-data";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { packageLabels, packagePrices } from "@/lib/orders/pricing";
import { sourceTemplates } from "@/lib/orders/source-templates";
import { assessOrderRisk, buildReportSummary } from "@/lib/risk/engine";
import { findSourceDefinitionByName } from "@/lib/sources/registry";
import type { UpdateSourceResultPayload } from "@/lib/validators";

type VehicleCheckRow = {
  id: string;
  code: string;
  plate: string;
  package_type: "express" | "compra_segura" | "pro";
  status: OrderStatus;
  risk_level: RiskLevel;
  payment_status?: PaymentStatus;
  total_price: number;
  city?: string;
  vehicle_type?: string;
  seller_name?: string | null;
  listing_url?: string | null;
  vin?: string | null;
  mileage?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  customers?:
    | {
        name: string;
        phone: string;
        email?: string | null;
      }
    | {
        name: string;
        phone: string;
        email?: string | null;
      }[]
    | null;
};

type SourceResultRow = {
  id: string;
  source_name: string;
  source_category: string;
  status: OrderSourceResult["status"];
  confidence_level: ConfidenceLevel;
  summary: string | null;
  evidence_url: string | null;
  checked_at: string | null;
  updated_at: string | null;
  created_at?: string;
};

function buildReportCode() {
  const year = new Date().getFullYear();
  const suffix = Date.now().toString().slice(-6);
  return `CV-${year}-${suffix}`;
}

function formatElapsed(createdAt: string) {
  const elapsedMs = Date.now() - new Date(createdAt).getTime();
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getCustomerName(row: VehicleCheckRow) {
  const customer = Array.isArray(row.customers)
    ? row.customers[0]
    : row.customers;
  return customer?.name ?? "Cliente";
}

function getCustomer(row: VehicleCheckRow) {
  const customer = Array.isArray(row.customers)
    ? row.customers[0]
    : row.customers;

  return {
    name: customer?.name ?? "Cliente",
    phone: customer?.phone ?? "",
    email: customer?.email ?? undefined
  };
}

function mapSourceRow(row: SourceResultRow): OrderSourceResult {
  const definition = findSourceDefinitionByName(row.source_name);

  return {
    id: row.id,
    sourceName: row.source_name,
    sourceCategory: row.source_category,
    status: row.status,
    confidenceLevel: row.confidence_level,
    summary: row.summary ?? undefined,
    evidenceUrl: row.evidence_url ?? undefined,
    checkedAt: row.checked_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    officialUrl: definition?.officialUrl
  };
}

function calculateSourceProgress(
  sources: OrderSourceResult[]
): OrderSourceProgress {
  const completedStatuses = new Set([
    "consulted_no_alert",
    "consulted_with_alert",
    "unavailable",
    "not_applicable",
    "not_included",
    "requires_manual_document",
    "failed"
  ]);
  const total = sources.length;
  const completed = sources.filter((source) =>
    completedStatuses.has(source.status)
  ).length;
  const alerts = sources.filter(
    (source) => source.status === "consulted_with_alert"
  ).length;
  const pending = Math.max(0, total - completed);

  return {
    total,
    completed,
    alerts,
    pending,
    completionRate: total ? Math.round((completed / total) * 100) : 0
  };
}

function demoOrderDetail(code: string): OrderDetail {
  const sources: OrderSourceResult[] = sourceTemplates
    .filter((source) => source.requiredFor.includes("compra_segura"))
    .map((source, index) => ({
      id: crypto.randomUUID(),
      sourceName: source.sourceName,
      sourceCategory: source.sourceCategory,
      status: index < 2 ? "consulted_no_alert" : "pending",
      confidenceLevel: "Media",
      summary: index < 2 ? "Resultado demo sin alerta." : undefined,
      officialUrl: findSourceDefinitionByName(source.sourceName)?.officialUrl
    }));

  const progress = calculateSourceProgress(sources);
  const riskAssessment = assessOrderRisk({
    code,
    plate: "ABC-123",
    packageLabel: packageLabels.compra_segura,
    progress,
    sources
  });

  return {
    id: crypto.randomUUID(),
    code,
    plate: "ABC-123",
    packageType: "compra_segura",
    packageLabel: packageLabels.compra_segura,
    status: "processing",
    riskLevel: "Pendiente",
    paymentStatus: "pending",
    totalPrice: packagePrices.compra_segura,
    city: "Lima",
    vehicleType: "Auto",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: {
      name: "Cliente demo",
      phone: "999999999"
    },
    sources,
    progress,
    riskAssessment,
    reportSummary: buildReportSummary(
      {
        code,
        plate: "ABC-123",
        packageLabel: packageLabels.compra_segura,
        progress,
        sources
      },
      riskAssessment
    ),
    isLive: false
  };
}

function demoPanelData(): PanelData {
  return {
    isLive: false,
    orders: panelOrders.map((order) => ({
      ...order,
      status: order.status as OrderStatus,
      risk: order.risk as RiskLevel
    })),
    metrics: [
      { label: "Ordenes hoy", value: "18" },
      { label: "Pagadas", value: "11" },
      { label: "Tiempo promedio", value: "13:20" },
      { label: "Ventas", value: "S/ 438" }
    ]
  };
}

export async function createVehicleCheck(
  input: CreateOrderInput
): Promise<CreatedOrder> {
  const totalPrice = packagePrices[input.packageType];
  const code = buildReportCode();

  if (!isSupabaseConfigured()) {
    return {
      id: crypto.randomUUID(),
      code,
      plate: input.plate,
      packageType: input.packageType,
      status: "pending_payment",
      riskLevel: "Pendiente",
      totalPrice
    };
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      name: input.customerName,
      phone: input.phone,
      email: input.email
    })
    .select("id")
    .single();

  if (customerError || !customer) {
    throw new Error(customerError?.message ?? "No se pudo crear cliente.");
  }

  const { data: check, error: checkError } = await supabase
    .from("vehicle_checks")
    .insert({
      code,
      customer_id: customer.id,
      plate: input.plate,
      package_type: input.packageType,
      status: "pending_payment",
      risk_level: "Pendiente",
      total_price: totalPrice,
      payment_status: "pending",
      source_channel: "landing",
      city: input.city,
      vehicle_type: input.vehicleType,
      seller_name: input.sellerName,
      seller_document: input.sellerDocument,
      listing_url: input.listingUrl,
      vin: input.vin,
      mileage: input.mileage,
      notes: input.notes,
      consent_accepted: input.consentAccepted
    })
    .select("id, code, plate, package_type, status, risk_level, total_price")
    .single();

  if (checkError || !check) {
    throw new Error(checkError?.message ?? "No se pudo crear orden.");
  }

  const sourceRows = sourceTemplates
    .filter((source) => source.requiredFor.includes(input.packageType))
    .map((source) => ({
      check_id: check.id,
      source_name: source.sourceName,
      source_category: source.sourceCategory,
      status: "pending",
      confidence_level: "Media"
    }));

  if (sourceRows.length) {
    const { error: sourcesError } = await supabase
      .from("source_results")
      .insert(sourceRows);

    if (sourcesError) {
      throw new Error(sourcesError.message);
    }
  }

  return {
    id: check.id,
    code: check.code,
    plate: check.plate,
    packageType: check.package_type,
    status: check.status,
    riskLevel: check.risk_level,
    totalPrice: Number(check.total_price)
  };
}

export async function getPanelData(): Promise<PanelData> {
  if (!isSupabaseConfigured()) {
    return demoPanelData();
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoPanelData();
  }

  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("vehicle_checks")
    .select(
      "id, code, plate, package_type, status, risk_level, total_price, created_at, customers(name, phone)"
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudieron cargar ordenes.");
  }

  const rows = data as unknown as VehicleCheckRow[];
  const orders: PanelOrder[] = rows.map((row) => ({
    code: row.code,
    plate: row.plate,
    packageType: packageLabels[row.package_type],
    customer: getCustomerName(row),
    status: row.status,
    risk: row.risk_level,
    time: formatElapsed(row.created_at)
  }));

  const todaysRows = rows.filter(
    (row) => new Date(row.created_at).getTime() >= since.getTime()
  );
  const paidRows = rows.filter((row) =>
    ["paid", "processing", "manual_review_required", "completed", "delivered"].includes(
      row.status
    )
  );
  const sales = paidRows.reduce((sum, row) => sum + Number(row.total_price), 0);

  return {
    isLive: true,
    orders,
    metrics: [
      { label: "Ordenes hoy", value: todaysRows.length.toString() },
      { label: "Pagadas", value: paidRows.length.toString() },
      { label: "Tiempo promedio", value: "En medicion" },
      { label: "Ventas", value: `S/ ${sales.toFixed(0)}` }
    ]
  };
}

export async function getOrderDetailByCode(
  code: string
): Promise<OrderDetail | null> {
  const normalizedCode = code.trim().toUpperCase();

  if (!isSupabaseConfigured()) {
    return demoOrderDetail(normalizedCode);
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoOrderDetail(normalizedCode);
  }

  const { data: orderData, error: orderError } = await supabase
    .from("vehicle_checks")
    .select(
      [
        "id",
        "code",
        "plate",
        "package_type",
        "status",
        "risk_level",
        "payment_status",
        "total_price",
        "city",
        "vehicle_type",
        "seller_name",
        "listing_url",
        "vin",
        "mileage",
        "notes",
        "created_at",
        "updated_at",
        "customers(name, phone, email)"
      ].join(", ")
    )
    .eq("code", normalizedCode)
    .maybeSingle();

  if (orderError) {
    throw new Error(orderError.message);
  }

  if (!orderData) {
    return null;
  }

  const row = orderData as unknown as VehicleCheckRow;
  const { data: sourceData, error: sourceError } = await supabase
    .from("source_results")
    .select(
      "id, source_name, source_category, status, confidence_level, summary, evidence_url, checked_at, updated_at, created_at"
    )
    .eq("check_id", row.id)
    .order("created_at", { ascending: true });

  if (sourceError) {
    throw new Error(sourceError.message);
  }

  const sources = ((sourceData ?? []) as SourceResultRow[]).map(mapSourceRow);
  const progress = calculateSourceProgress(sources);
  const packageLabel = packageLabels[row.package_type];
  const riskAssessment = assessOrderRisk({
    code: row.code,
    plate: row.plate,
    packageLabel,
    progress,
    sources
  });

  return {
    id: row.id,
    code: row.code,
    plate: row.plate,
    packageType: row.package_type,
    packageLabel,
    status: row.status,
    riskLevel: row.risk_level,
    paymentStatus: row.payment_status ?? "pending",
    totalPrice: Number(row.total_price),
    city: row.city ?? "",
    vehicleType: row.vehicle_type ?? "",
    sellerName: row.seller_name ?? undefined,
    listingUrl: row.listing_url ?? undefined,
    vin: row.vin ?? undefined,
    mileage: row.mileage ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    customer: getCustomer(row),
    sources,
    progress,
    riskAssessment,
    reportSummary: buildReportSummary(
      {
        code: row.code,
        plate: row.plate,
        packageLabel,
        progress,
        sources
      },
      riskAssessment
    ),
    isLive: true
  };
}

export async function updateOrderSourceResult(
  input: UpdateSourceResultPayload
): Promise<OrderSourceResult> {
  if (!isSupabaseConfigured()) {
    return {
      id: input.id,
      sourceName: "Fuente demo",
      sourceCategory: "demo",
      status: input.status,
      confidenceLevel: input.confidenceLevel,
      summary: input.summary,
      evidenceUrl: input.evidenceUrl,
      checkedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const shouldMarkChecked = input.status !== "pending";
  const { data, error } = await supabase
    .from("source_results")
    .update({
      status: input.status,
      confidence_level: input.confidenceLevel,
      summary: input.summary,
      evidence_url: input.evidenceUrl,
      checked_at: shouldMarkChecked ? new Date().toISOString() : null
    })
    .eq("id", input.id)
    .select(
      "id, source_name, source_category, status, confidence_level, summary, evidence_url, checked_at, updated_at"
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo actualizar la fuente.");
  }

  return mapSourceRow(data as SourceResultRow);
}
