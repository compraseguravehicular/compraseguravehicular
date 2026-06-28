"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  MessageCircle,
  Save,
  ShieldCheck
} from "lucide-react";
import { track } from "@vercel/analytics/react";
import { RiskBadge } from "@/components/risk-badge";
import type {
  ConfidenceLevel,
  OrderDetail,
  OrderSourceProgress,
  OrderSourceResult,
  SourceStatus
} from "@/lib/domain";
import { whatsappHref } from "@/lib/utils";

type SaveState = Record<string, "idle" | "saving" | "saved" | "error">;

const statusOptions: Array<{ value: SourceStatus; label: string }> = [
  { value: "pending", label: "Pendiente" },
  { value: "consulted_no_alert", label: "Consultada sin alerta" },
  { value: "consulted_with_alert", label: "Consultada con alerta" },
  { value: "unavailable", label: "No disponible" },
  { value: "not_applicable", label: "No aplica" },
  { value: "not_included", label: "No incluido" },
  { value: "requires_manual_document", label: "Requiere documento/manual" },
  { value: "failed", label: "Fallida" }
];

const confidenceOptions: ConfidenceLevel[] = [
  "Alta",
  "Media",
  "Baja",
  "No aplica"
];

const statusStyles: Record<SourceStatus, string> = {
  pending: "bg-surface text-slateText",
  consulted_no_alert: "bg-brand-50 text-brand-700",
  consulted_with_alert: "bg-amber-50 text-amberRisk",
  unavailable: "bg-red-50 text-redRisk",
  not_applicable: "bg-surface text-slateText",
  not_included: "bg-surface text-slateText",
  requires_manual_document: "bg-amber-50 text-amberRisk",
  failed: "bg-red-50 text-redRisk"
};

function calculateProgress(sources: OrderSourceResult[]): OrderSourceProgress {
  const completedStatuses = new Set<SourceStatus>([
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

function sourceStatusLabel(status: SourceStatus) {
  return statusOptions.find((option) => option.value === status)?.label ?? status;
}

export function OrderSourceWorkspace({ order }: { order: OrderDetail }) {
  const [sources, setSources] = useState(order.sources);
  const [saveState, setSaveState] = useState<SaveState>({});

  const progress = useMemo(() => calculateProgress(sources), [sources]);
  const whatsappMessage = [
    `Orden ${order.code}`,
    `Placa ${order.plate}`,
    `Paquete ${order.packageLabel}`,
    `Avance fuentes ${progress.completionRate}%`,
    `Alertas ${progress.alerts}`
  ].join("\n");

  async function onSave(
    event: React.FormEvent<HTMLFormElement>,
    source: OrderSourceResult
  ) {
    event.preventDefault();
    setSaveState((current) => ({ ...current, [source.id]: "saving" }));

    const formData = new FormData(event.currentTarget);
    const payload = {
      id: source.id,
      status: formData.get("status"),
      confidenceLevel: formData.get("confidenceLevel"),
      summary: formData.get("summary"),
      evidenceUrl: formData.get("evidenceUrl")
    };

    try {
      const response = await fetch("/api/source-results", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setSaveState((current) => ({ ...current, [source.id]: "error" }));
        return;
      }

      setSources((current) =>
        current.map((item) =>
          item.id === source.id ? { ...item, ...data.source } : item
        )
      );
      setSaveState((current) => ({ ...current, [source.id]: "saved" }));
      track("source_result_updated", {
        status: String(payload.status),
        source: source.sourceName
      });
    } catch {
      setSaveState((current) => ({ ...current, [source.id]: "error" }));
    }
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <Link
                href="/panel"
                className="text-sm font-semibold text-brand-700 hover:text-brand-900"
              >
                Volver al panel
              </Link>
              <h1 className="mt-2 text-3xl font-bold tracking-normal">
                {order.code} - {order.plate}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slateText">
                {order.customer.name} | {order.packageLabel} | {order.city} |{" "}
                {order.vehicleType}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href={whatsappHref(whatsappMessage)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold hover:border-brand-700 hover:text-brand-700"
                data-track="whatsapp_click"
                data-track-props={JSON.stringify({
                  location: "order_detail",
                  code: order.code
                })}
              >
                <MessageCircle aria-hidden="true" size={17} />
                WhatsApp
              </a>
              <Link
                href="/reporte"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-900"
              >
                <FileText aria-hidden="true" size={17} />
                Reporte demo
              </Link>
            </div>
          </div>

          {!order.isLive ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amberRisk">
              Modo demo activo. Con Supabase configurado, esta vista lee y
              actualiza fuentes reales.
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-5">
          {[
            ["Avance", `${progress.completionRate}%`],
            ["Fuentes", progress.total],
            ["Completadas", progress.completed],
            ["Pendientes", progress.pending],
            ["Alertas", progress.alerts]
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-md border border-line bg-white p-5 shadow-panel"
            >
              <p className="text-sm text-slateText">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4">
            {sources.map((source) => {
              const currentSaveState = saveState[source.id] ?? "idle";

              return (
                <form
                  key={source.id}
                  onSubmit={(event) => onSave(event, source)}
                  className="rounded-md border border-line bg-white p-5 shadow-panel"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-normal text-slateText">
                        {source.sourceCategory}
                      </p>
                      <h2 className="mt-1 text-xl font-bold">
                        {source.sourceName}
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${statusStyles[source.status]}`}
                        >
                          {sourceStatusLabel(source.status)}
                        </span>
                        <span className="rounded-md bg-surface px-2 py-1 text-xs font-semibold text-slateText">
                          Confianza {source.confidenceLevel}
                        </span>
                      </div>
                    </div>
                    {source.officialUrl ? (
                      <a
                        href={source.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-line px-4 text-sm font-semibold hover:border-brand-700 hover:text-brand-700"
                      >
                        Abrir fuente
                        <ExternalLink aria-hidden="true" size={16} />
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold">
                      Estado
                      <select
                        name="status"
                        defaultValue={source.status}
                        className="h-11 rounded-md border border-line bg-white px-3 font-normal outline-none focus:border-brand-700"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Confianza
                      <select
                        name="confidenceLevel"
                        defaultValue={source.confidenceLevel}
                        className="h-11 rounded-md border border-line bg-white px-3 font-normal outline-none focus:border-brand-700"
                      >
                        {confidenceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 grid gap-2 text-sm font-semibold">
                    Resumen operativo
                    <textarea
                      name="summary"
                      rows={3}
                      defaultValue={source.summary}
                      placeholder="Ejemplo: SOAT vigente, sin alertas visibles al momento de consulta."
                      className="rounded-md border border-line px-3 py-2 font-normal outline-none focus:border-brand-700"
                    />
                  </label>

                  <label className="mt-4 grid gap-2 text-sm font-semibold">
                    URL de evidencia
                    <input
                      name="evidenceUrl"
                      defaultValue={source.evidenceUrl}
                      placeholder="https://..."
                      className="h-11 rounded-md border border-line px-3 font-normal outline-none focus:border-brand-700"
                    />
                  </label>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-slateText">
                      {source.checkedAt
                        ? `Consultado: ${new Date(source.checkedAt).toLocaleString("es-PE")}`
                        : "Pendiente de consulta registrada."}
                    </p>
                    <button
                      type="submit"
                      disabled={currentSaveState === "saving"}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {currentSaveState === "saving" ? (
                        <Loader2
                          aria-hidden="true"
                          className="animate-spin"
                          size={17}
                        />
                      ) : currentSaveState === "saved" ? (
                        <CheckCircle2 aria-hidden="true" size={17} />
                      ) : (
                        <Save aria-hidden="true" size={17} />
                      )}
                      {currentSaveState === "saving"
                        ? "Guardando..."
                        : currentSaveState === "saved"
                          ? "Guardado"
                          : "Guardar fuente"}
                    </button>
                  </div>

                  {currentSaveState === "error" ? (
                    <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-redRisk">
                      No se pudo guardar. Revisa datos y vuelve a intentar.
                    </div>
                  ) : null}
                </form>
              );
            })}
          </div>

          <aside className="grid h-fit gap-4">
            <div className="rounded-md border border-line bg-white p-5 shadow-panel">
              <p className="text-sm font-semibold uppercase tracking-normal text-slateText">
                Riesgo actual
              </p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <RiskBadge value={order.riskLevel} />
                <span className="text-sm font-semibold">
                  {progress.alerts ? "Revisar alertas" : "En evaluacion"}
                </span>
              </div>
            </div>

            <div className="rounded-md border border-line bg-white p-5 shadow-panel">
              <p className="text-sm font-semibold uppercase tracking-normal text-slateText">
                Datos de compra
              </p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-slateText">Cliente</dt>
                  <dd className="font-semibold">{order.customer.name}</dd>
                </div>
                <div>
                  <dt className="text-slateText">WhatsApp</dt>
                  <dd className="font-semibold">{order.customer.phone}</dd>
                </div>
                <div>
                  <dt className="text-slateText">Pago</dt>
                  <dd className="font-semibold">{order.paymentStatus}</dd>
                </div>
                <div>
                  <dt className="text-slateText">Monto</dt>
                  <dd className="font-semibold">
                    S/ {order.totalPrice.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-md border border-line bg-white p-5 shadow-panel">
              <p className="text-sm font-semibold uppercase tracking-normal text-slateText">
                Control profesional
              </p>
              <div className="mt-4 grid gap-3 text-sm">
                {[
                  ["Placa correcta en evidencias", ShieldCheck],
                  ["Fuentes pendientes justificadas", AlertTriangle],
                  ["Resumen listo para reporte", FileText]
                ].map(([label, Icon]) => {
                  const IconComp = Icon as typeof ShieldCheck;
                  return (
                    <div key={label as string} className="flex gap-3">
                      <IconComp
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-brand-700"
                        size={17}
                      />
                      {label as string}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
