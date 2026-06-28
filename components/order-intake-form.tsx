"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MessageCircle, Send } from "lucide-react";
import { track } from "@vercel/analytics/react";
import { businessConfig } from "@/lib/business";

type ApiState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; code: string; whatsappHref: string }
  | { status: "error"; message: string };

const packageOptions = [
  { value: "compra_segura", label: "Compra Segura - S/ 39.90" },
  { value: "express", label: "Express - S/ 19.90" },
  { value: "pro", label: "Pro - desde S/ 59" }
];

const vehicleTypes = ["Auto", "Camioneta", "Moto", "Taxi", "Carga", "Bus/van"];

export function OrderIntakeForm() {
  const [state, setState] = useState<ApiState>({ status: "idle" });
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51999999999";

  const isSubmitting = state.status === "submitting";
  const isCreated = state.status === "success";

  const defaultMessage = useMemo(
    () =>
      "Hola, quiero verificar una placa antes de comprar un vehiculo. Paquete: Compra Segura",
    []
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });

    const formData = new FormData(event.currentTarget);
    const payload = {
      plate: formData.get("plate"),
      customerName: formData.get("customerName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      packageType: formData.get("packageType"),
      city: formData.get("city"),
      vehicleType: formData.get("vehicleType"),
      sellerName: formData.get("sellerName"),
      listingUrl: formData.get("listingUrl"),
      notes: formData.get("notes"),
      consentAccepted: formData.get("consentAccepted") === "on"
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
              : data.error ?? "No se pudo crear la orden."
        });
        return;
      }

      track("order_created", {
        package_type: String(payload.packageType),
        source: "landing_form"
      });

      setState({
        status: "success",
        code: data.order.code,
        whatsappHref: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          data.whatsappMessage ?? defaultMessage
        )}`
      });
    } catch {
      setState({
        status: "error",
        message: "No se pudo conectar con el servidor. Intenta nuevamente."
      });
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-line bg-white p-5 shadow-panel sm:p-6"
    >
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-normal text-brand-700">
          Solicitud real
        </p>
        <h2 className="mt-2 text-2xl font-bold text-ink">
          Crea una orden de verificacion
        </h2>
        <p className="mt-2 text-sm leading-6 text-slateText">
          La orden queda lista para confirmar pago, consultar fuentes y entregar
          el reporte por WhatsApp.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Placa
          <input
            name="plate"
            placeholder="5075-CD o 5075CD"
            required
            className="h-11 rounded-md border border-line px-3 font-normal uppercase outline-none focus:border-brand-700"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Paquete
          <select
            name="packageType"
            defaultValue="compra_segura"
            className="h-11 rounded-md border border-line bg-white px-3 font-normal outline-none focus:border-brand-700"
          >
            {packageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Nombre
          <input
            name="customerName"
            placeholder="Nombre del cliente"
            required
            className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          WhatsApp
          <input
            name="phone"
            placeholder="999999999"
            required
            className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Ciudad
          <input
            name="city"
            placeholder="Lima, Callao, Arequipa..."
            required
            className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Tipo de vehiculo
          <select
            name="vehicleType"
            defaultValue="Auto"
            className="h-11 rounded-md border border-line bg-white px-3 font-normal outline-none focus:border-brand-700"
          >
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Email opcional
          <input
            name="email"
            type="email"
            placeholder="cliente@email.com"
            className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Vendedor opcional
          <input
            name="sellerName"
            placeholder="Nombre del vendedor"
            className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700"
          />
        </label>
      </div>

      <label className="mt-4 grid gap-2 text-sm font-semibold text-ink">
        Link del anuncio opcional
        <input
          name="listingUrl"
          placeholder="https://..."
          className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700"
        />
      </label>

      <label className="mt-4 grid gap-2 text-sm font-semibold text-ink">
        Observaciones
        <textarea
          name="notes"
          rows={3}
          placeholder="Ejemplo: el vendedor dice que el auto no tiene papeletas..."
          className="rounded-md border border-line px-3 py-2 font-normal outline-none focus:border-brand-700"
        />
      </label>

      <label className="mt-4 flex gap-3 text-sm leading-6 text-slateText">
        <input
          name="consentAccepted"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border-line text-brand-700"
        />
        <span>
          Acepto que los datos enviados se usen para crear la orden y elaborar
          un reporte informativo basado en fuentes disponibles, segun la{" "}
          <Link
            href="/privacidad"
            className="font-semibold text-brand-700 hover:text-brand-900"
          >
            politica de privacidad
          </Link>{" "}
          y el{" "}
          <Link
            href="/consentimiento"
            className="font-semibold text-brand-700 hover:text-brand-900"
          >
            consentimiento informado
          </Link>
          .
        </span>
      </label>

      {state.status === "error" ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-redRisk">
          {state.message}
        </div>
      ) : null}

      {state.status === "success" ? (
        <div className="mt-4 rounded-md border border-brand-100 bg-brand-50 p-4">
          <div className="flex gap-3">
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand-700"
              size={18}
            />
            <div>
              <p className="font-semibold text-brand-900">
                Orden creada: {state.code}
              </p>
              <p className="mt-1 text-sm text-slateText">
                Ahora confirma el pago y enviaremos el resumen por WhatsApp.
              </p>
              <div className="mt-3 grid gap-1 text-sm text-ink">
                <p>
                  Yape: <strong>{businessConfig.yapeNumber}</strong>
                </p>
                <p>
                  Plin: <strong>{businessConfig.plinNumber}</strong>
                </p>
                <p>
                  Titular: <strong>{businessConfig.paymentAccountName}</strong>
                </p>
              </div>
            </div>
          </div>
          <a
            href={state.whatsappHref}
            data-track="whatsapp_click"
            data-track-props={JSON.stringify({
              location: "order_success",
              status: "order_created"
            })}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-900"
          >
            <MessageCircle aria-hidden="true" size={17} />
            Abrir WhatsApp con orden
          </a>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || isCreated}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <Loader2 aria-hidden="true" className="animate-spin" size={18} />
        ) : isCreated ? (
          <CheckCircle2 aria-hidden="true" size={18} />
        ) : (
          <Send aria-hidden="true" size={18} />
        )}
        {isSubmitting
          ? "Creando orden..."
          : isCreated
            ? "Orden creada"
            : "Crear orden y continuar"}
      </button>
    </form>
  );
}
