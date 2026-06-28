import type {
  CreatedOrder,
  CreateOrderInput,
  OrderStatus,
  PanelData,
  PanelOrder,
  RiskLevel
} from "@/lib/domain";
import { panelOrders } from "@/lib/product-data";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { packageLabels, packagePrices } from "@/lib/orders/pricing";
import { sourceTemplates } from "@/lib/orders/source-templates";

type VehicleCheckRow = {
  id: string;
  code: string;
  plate: string;
  package_type: "express" | "compra_segura" | "pro";
  status: OrderStatus;
  risk_level: RiskLevel;
  total_price: number;
  created_at: string;
  customers?:
    | {
        name: string;
        phone: string;
      }
    | {
        name: string;
        phone: string;
      }[]
    | null;
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
