import type { CreateClaimPayload } from "@/lib/validators";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";

type CreatedClaim = {
  id: string;
  code: string;
  storageMode: "database" | "demo" | "manual_fallback";
};

function buildClaimCode() {
  const year = new Date().getFullYear();
  const suffix = Date.now().toString().slice(-6);
  return `LR-${year}-${suffix}`;
}

export async function createCustomerClaim(
  input: CreateClaimPayload
): Promise<CreatedClaim> {
  const code = buildClaimCode();

  if (!isSupabaseConfigured()) {
    return {
      id: crypto.randomUUID(),
      code,
      storageMode: "demo"
    };
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data, error } = await supabase
    .from("customer_claims")
    .insert({
      code,
      full_name: input.fullName,
      document_number: input.documentNumber,
      email: input.email,
      phone: input.phone,
      address: input.address,
      order_code: input.orderCode,
      claim_type: input.claimType,
      product_service: input.productService,
      amount: input.amount,
      detail: input.detail,
      request: input.request,
      consent_accepted: input.consentAccepted,
      status: "received"
    })
    .select("id, code")
    .single();

  if (error?.code === "PGRST205") {
    return {
      id: crypto.randomUUID(),
      code,
      storageMode: "manual_fallback"
    };
  }

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo registrar la solicitud.");
  }

  return {
    id: data.id,
    code: data.code,
    storageMode: "database"
  };
}
