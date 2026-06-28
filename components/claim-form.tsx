"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { track } from "@vercel/analytics/react";
import { businessConfig } from "@/lib/business";

type ClaimState =
  | { status: "idle" }
  | { status: "submitting" }
  | {
      status: "success";
      code: string;
      storageMode: "database" | "demo" | "manual_fallback";
      fallbackHref?: string;
    }
  | { status: "error"; message: string };

export function ClaimForm() {
  const [state, setState] = useState<ClaimState>({ status: "idle" });
  const isSubmitting = state.status === "submitting";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      fullName: formData.get("fullName"),
      documentNumber: formData.get("documentNumber"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      orderCode: formData.get("orderCode"),
      claimType: formData.get("claimType"),
      productService: formData.get("productService"),
      amount: formData.get("amount"),
      detail: formData.get("detail"),
      request: formData.get("request"),
      consentAccepted: formData.get("consentAccepted") === "on"
    };

    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        const firstIssue = data.issues
          ? Object.values(data.issues).flat().filter(Boolean)[0]
          : undefined;
        setState({
          status: "error",
          message:
            typeof firstIssue === "string"
              ? firstIssue
              : data.error ?? "No se pudo registrar la solicitud."
        });
        return;
      }

      track("claim_created", { type: String(payload.claimType ?? "unknown") });
      const fallbackBody = [
        `Codigo: ${data.claim.code}`,
        `Tipo: ${payload.claimType}`,
        `Nombre: ${payload.fullName}`,
        `Documento: ${payload.documentNumber}`,
        `Email: ${payload.email}`,
        `Telefono: ${payload.phone}`,
        `Direccion: ${payload.address}`,
        `Orden: ${payload.orderCode || "No indicada"}`,
        `Servicio: ${payload.productService}`,
        `Monto: ${payload.amount || "No indicado"}`,
        "",
        "Detalle:",
        String(payload.detail),
        "",
        "Pedido:",
        String(payload.request)
      ].join("\n");
      setState({
        status: "success",
        code: data.claim.code,
        storageMode: data.claim.storageMode,
        fallbackHref: `mailto:${businessConfig.supportEmail}?subject=${encodeURIComponent(
          `Libro de Reclamaciones ${data.claim.code}`
        )}&body=${encodeURIComponent(fallbackBody)}`
      });
      form.reset();
    } catch {
      setState({
        status: "error",
        message: "No se pudo conectar con el servidor. Intenta nuevamente."
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Nombre completo
          <input name="fullName" required className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          DNI/CE/RUC
          <input name="documentNumber" required className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Email
          <input name="email" type="email" required className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Telefono
          <input name="phone" required className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-ink">
        Direccion
        <input name="address" required className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700" />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Codigo de orden
          <input name="orderCode" placeholder="CV-2026-..." className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Tipo
          <select name="claimType" required className="h-11 rounded-md border border-line bg-white px-3 font-normal outline-none focus:border-brand-700">
            <option value="reclamo">Reclamo</option>
            <option value="queja">Queja</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Monto relacionado
          <input name="amount" inputMode="decimal" placeholder="39.90" className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-ink">
        Servicio contratado
        <input name="productService" required defaultValue="Reporte vehicular informativo" className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700" />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-ink">
        Detalle
        <textarea name="detail" required rows={5} className="rounded-md border border-line px-3 py-2 font-normal outline-none focus:border-brand-700" />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-ink">
        Pedido concreto
        <textarea name="request" required rows={4} className="rounded-md border border-line px-3 py-2 font-normal outline-none focus:border-brand-700" />
      </label>

      <label className="flex gap-3 text-sm leading-6 text-slateText">
        <input name="consentAccepted" type="checkbox" required className="mt-1 h-4 w-4 rounded border-line text-brand-700" />
        Acepto el tratamiento de mis datos para registrar y atender esta solicitud segun la{" "}
        <Link href="/privacidad" className="font-semibold text-brand-700 hover:text-brand-900">
          politica de privacidad
        </Link>
        .
      </label>

      {state.status === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-redRisk">
          {state.message}
        </div>
      ) : null}

      {state.status === "success" ? (
        <div className="rounded-md border border-brand-100 bg-brand-50 p-4">
          <div className="flex gap-3">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-brand-700" size={18} />
            <div>
              <p className="font-semibold text-brand-900">
                Solicitud registrada: {state.code}
              </p>
              <p className="mt-1 text-sm text-slateText">
                {state.storageMode === "manual_fallback"
                  ? "Usa el correo prellenado como canal de respaldo para dejar constancia de la solicitud."
                  : "La respuesta sera enviada al correo indicado dentro del plazo operativo publicado."}
              </p>
              {state.storageMode === "manual_fallback" && state.fallbackHref ? (
                <a
                  href={state.fallbackHref}
                  className="mt-3 inline-flex min-h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-brand-700 hover:text-brand-900"
                >
                  Enviar constancia por correo
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <Loader2 aria-hidden="true" className="animate-spin" size={18} /> : <Send aria-hidden="true" size={18} />}
        {isSubmitting ? "Registrando..." : "Registrar solicitud"}
      </button>

      <p className="text-xs leading-5 text-slateText">
        Canal de soporte: {businessConfig.supportEmail}. Conserva tu codigo para seguimiento.
      </p>
    </form>
  );
}
