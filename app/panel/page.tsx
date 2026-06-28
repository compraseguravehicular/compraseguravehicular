import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  FolderOpen,
  MessageCircle,
  Plus,
  RefreshCcw,
  Search,
  Upload
} from "lucide-react";
import { RiskBadge } from "@/components/risk-badge";
import { reportSources } from "@/lib/product-data";
import { getPanelData } from "@/lib/orders/repository";

export const metadata: Metadata = {
  title: "Panel interno MVP",
  description:
    "Panel operativo para ordenes, fuentes, evidencias, riesgo y entrega por WhatsApp."
};

export const dynamic = "force-dynamic";

const sourceTasks = [
  ["SUNARP", "consulted_no_alert", "Datos coinciden", "Media"],
  ["SOAT / SBS", "consulted_no_alert", "SOAT vigente", "Media"],
  ["MTC CITV", "consulted_with_alert", "Vence en 34 dias", "Media"],
  ["SAT Lima", "consulted_with_alert", "S/ 420 pendiente", "Media"],
  ["Callao", "unavailable", "Portal no disponible", "Baja"],
  ["SUTRAN", "pending", "Pendiente", "-"],
  ["ATU", "consulted_no_alert", "Sin autorizacion taxi", "Media"]
];

const statusStyles: Record<string, string> = {
  created: "bg-surface text-slateText",
  pending_payment: "bg-amber-50 text-amberRisk",
  processing: "bg-blue-50 text-blue-700",
  manual_review_required: "bg-red-50 text-redRisk",
  paid: "bg-brand-50 text-brand-700",
  completed: "bg-brand-50 text-brand-700",
  delivered: "bg-brand-50 text-brand-700",
  cancelled: "bg-surface text-slateText",
  failed: "bg-red-50 text-redRisk",
  pending: "bg-surface text-slateText",
  consulted_no_alert: "bg-brand-50 text-brand-700",
  consulted_with_alert: "bg-amber-50 text-amberRisk",
  unavailable: "bg-red-50 text-redRisk"
};

const metricIcons = {
  "Ordenes hoy": ClipboardCheck,
  Pagadas: CheckCircle2,
  "Tiempo promedio": Clock3,
  Ventas: FileText
};

export default async function PanelPage() {
  const panelData = await getPanelData();

  return (
    <main className="min-h-screen overflow-x-hidden bg-surface text-ink">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r border-line bg-white lg:block">
          <div className="flex h-16 items-center border-b border-line px-5">
            <Link href="/" className="flex items-center gap-3 font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-900 text-white">
                <FileText aria-hidden="true" size={18} />
              </span>
              Panel MVP
            </Link>
          </div>
          <nav className="grid gap-1 p-4 text-sm">
            {[
              ["Ordenes", FolderOpen],
              ["Fuentes", Search],
              ["Evidencias", Upload],
              ["Riesgo", Calculator],
              ["Reportes", FileText],
              ["WhatsApp", MessageCircle],
              ["Metricas", Clock3]
            ].map(([label, Icon]) => {
              const IconComp = Icon as typeof FolderOpen;
              return (
                <Link
                  key={label as string}
                  href="#"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-slateText hover:bg-surface hover:text-ink"
                >
                  <IconComp aria-hidden="true" size={17} />
                  {label as string}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 overflow-x-hidden">
          <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
            <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-ink hover:border-brand-700"
                  aria-label="Volver"
                >
                  <ArrowLeft aria-hidden="true" size={18} />
                </Link>
                <div>
                  <h1 className="text-xl font-bold">Operacion de reportes</h1>
                  <p className="text-sm text-slateText">
                    Ordenes, fuentes, evidencias y entrega.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slateText"
                    size={17}
                  />
                  <input
                    placeholder="Buscar placa o codigo"
                    className="h-11 w-full rounded-md border border-line bg-white pl-10 pr-3 text-sm outline-none focus:border-brand-700 sm:w-64"
                  />
                </label>
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-900">
                  <Plus aria-hidden="true" size={17} />
                  Nueva orden
                </button>
              </div>
            </div>
          </header>

          <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
            {!panelData.isLive ? (
              <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amberRisk">
                Modo demo activo. Configura Supabase en `.env.local` para leer
                ordenes reales.
              </div>
            ) : null}

            <section className="grid gap-4 md:grid-cols-4">
              {panelData.metrics.map((metric) => {
                const Icon =
                  metricIcons[metric.label as keyof typeof metricIcons] ??
                  FileText;
                return (
                  <div
                    key={metric.label}
                    className="rounded-md border border-line bg-white p-5 shadow-panel"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slateText">{metric.label}</p>
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                        <Icon aria-hidden="true" size={18} />
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold">{metric.value}</p>
                  </div>
                );
              })}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
              <div className="min-w-0 rounded-md border border-line bg-white shadow-panel">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <h2 className="font-bold">Ordenes activas</h2>
                  <button className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold hover:border-brand-700">
                    <RefreshCcw aria-hidden="true" size={15} />
                    Actualizar
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                    <thead className="bg-surface text-xs uppercase tracking-normal text-slateText">
                      <tr>
                        <th className="px-5 py-3">Codigo</th>
                        <th className="px-5 py-3">Placa</th>
                        <th className="px-5 py-3">Paquete</th>
                        <th className="px-5 py-3">Cliente</th>
                        <th className="px-5 py-3">Estado</th>
                        <th className="px-5 py-3">Riesgo</th>
                        <th className="px-5 py-3">Tiempo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {panelData.orders.map((order) => (
                        <tr key={order.code} className="border-t border-line">
                          <td className="px-5 py-4 font-semibold text-ink">
                            {order.code}
                          </td>
                          <td className="px-5 py-4">{order.plate}</td>
                          <td className="px-5 py-4 text-slateText">
                            {order.packageType}
                          </td>
                          <td className="px-5 py-4 text-slateText">
                            {order.customer}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-md px-2 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <RiskBadge value={order.risk} />
                          </td>
                          <td className="px-5 py-4 font-medium">
                            {order.time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="rounded-md border border-line bg-white shadow-panel">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="font-bold">Orden CV-2026-0001</h2>
                  <p className="mt-1 text-sm text-slateText">
                    ABC-123 | Compra Segura
                  </p>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-normal text-slateText">
                      Riesgo actual
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <RiskBadge value="Amarillo" />
                      <span className="text-sm font-semibold">45 / 100</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-normal text-slateText">
                      Acciones
                    </p>
                    <div className="mt-3 grid gap-2">
                      {[
                        ["Calcular riesgo", Calculator],
                        ["Generar PDF", FileText],
                        ["Copiar WhatsApp", MessageCircle]
                      ].map(([label, Icon]) => {
                        const IconComp = Icon as typeof Calculator;
                        return (
                          <button
                            key={label as string}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line text-sm font-semibold hover:border-brand-700 hover:text-brand-700"
                          >
                            <IconComp aria-hidden="true" size={16} />
                            {label as string}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </aside>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
              <div className="min-w-0 rounded-md border border-line bg-white shadow-panel">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="font-bold">Fuentes de la orden</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead className="bg-surface text-xs uppercase tracking-normal text-slateText">
                      <tr>
                        <th className="px-5 py-3">Fuente</th>
                        <th className="px-5 py-3">Estado</th>
                        <th className="px-5 py-3">Resultado</th>
                        <th className="px-5 py-3">Confianza</th>
                        <th className="px-5 py-3">Evidencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sourceTasks.map(([source, status, result, confidence]) => (
                        <tr key={source} className="border-t border-line">
                          <td className="px-5 py-4 font-semibold">{source}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-md px-2 py-1 text-xs font-semibold ${statusStyles[status]}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slateText">{result}</td>
                          <td className="px-5 py-4 text-slateText">
                            {confidence}
                          </td>
                          <td className="px-5 py-4">
                            <button className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-xs font-semibold hover:border-brand-700">
                              <Upload aria-hidden="true" size={14} />
                              Subir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="rounded-md border border-line bg-white shadow-panel">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="font-bold">Control de calidad</h2>
                </div>
                <div className="space-y-3 p-5">
                  {[
                    "Placa correcta en evidencias",
                    "Fuentes pendientes justificadas",
                    "Datos personales minimizados",
                    "Captura SAT no confundida con policial",
                    "Descargo legal incluido"
                  ].map((item) => (
                    <div key={item} className="flex gap-3 text-sm text-ink">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-brand-700"
                        size={17}
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </aside>
            </section>

            <section className="mt-6 rounded-md border border-line bg-white shadow-panel">
              <div className="border-b border-line px-5 py-4">
                <h2 className="font-bold">Resumen de reporte</h2>
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-5">
                {reportSources.map((source) => (
                  <div
                    key={source.source}
                    className="rounded-md border border-line bg-surface p-4"
                  >
                    <p className="text-sm font-semibold">{source.source}</p>
                    <p className="mt-2 text-xs leading-5 text-slateText">
                      {source.result}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
