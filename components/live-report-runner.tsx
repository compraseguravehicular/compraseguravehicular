"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { track } from "@vercel/analytics/react";

type LiveReport = {
  plate: string;
  packageType: string;
  packageLabel: string;
  generatedAt: string;
  metrics: {
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
  risk: {
    score: number;
    level: "Verde" | "Amarillo" | "Rojo";
    recommendation: "Comprar" | "Negociar" | "Pedir documentos" | "Evitar";
    alerts: string[];
    riskFactors: string[];
    positiveFactors: string[];
    pendingFactors: string[];
  };
  sources: Array<{
    sourceId: string;
    sourceName: string;
    category: string;
    officialUrl: string;
    status: string;
    integrationMode: string;
    providerName: string;
    providerConfigured: boolean;
    requiredEnv: string[];
    availability: string;
    httpStatus?: number;
    confidence: string;
    checkedAt: string;
    fields: string[];
    summary: string;
    technicalFinding: string;
    limitation: string;
    operatorAction: string;
    nextTechnologyStep: string;
    evidence: Array<{
      label: string;
      url: string;
      detail: string;
    }>;
  }>;
  summary: {
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
};

type LiveReportState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; report: LiveReport; copied: boolean }
  | { status: "error"; message: string };

const packageOptions = [
  { value: "pro", label: "Todas las fuentes" },
  { value: "compra_segura", label: "Compra Segura" },
  { value: "express", label: "Express" }
];

const packageValues = new Set(["express", "compra_segura", "pro"]);

const statusLabels: Record<string, string> = {
  api_result: "API conectada",
  operator_evidence: "Evidencia OCR",
  api_credentials_missing: "Falta API key",
  worker_candidate: "Worker candidato",
  portal_protected: "Portal protegido",
  session_protected: "Sesion protegida",
  partner_required: "Partner/API",
  matrix_required: "Matriz de datos",
  unavailable: "No disponible",
  failed: "Fallida"
};

const statusClasses: Record<string, string> = {
  api_result: "border-brand-100 bg-brand-50 text-brand-900",
  operator_evidence: "border-emerald-200 bg-emerald-50 text-emerald-900",
  api_credentials_missing: "border-amber-200 bg-amber-50 text-amber-900",
  worker_candidate: "border-sky-200 bg-sky-50 text-sky-900",
  portal_protected: "border-orange-200 bg-orange-50 text-orange-900",
  session_protected: "border-indigo-200 bg-indigo-50 text-indigo-900",
  partner_required: "border-violet-200 bg-violet-50 text-violet-900",
  matrix_required: "border-slate-200 bg-slate-100 text-slate-700",
  unavailable: "border-red-200 bg-red-50 text-redRisk",
  failed: "border-red-200 bg-red-50 text-redRisk"
};

function cleanPlateInput(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

function riskClass(level: LiveReport["risk"]["level"]) {
  if (level === "Verde") {
    return "bg-brand-50 text-brand-900 border-brand-100";
  }

  if (level === "Rojo") {
    return "bg-red-50 text-redRisk border-red-200";
  }

  return "bg-amber-50 text-amber-900 border-amber-200";
}

type MetricCard = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

export function LiveReportRunner({
  initialPlate = "5075cd",
  autoRun = true
}: {
  initialPlate?: string;
  autoRun?: boolean;
}) {
  const [plate, setPlate] = useState(initialPlate);
  const [packageType, setPackageType] = useState("pro");
  const [state, setState] = useState<LiveReportState>({ status: "idle" });

  const cleanPlate = useMemo(() => cleanPlateInput(plate), [plate]);
  const isLoading = state.status === "loading";

  function packageFromQuery(value: string | null) {
    return value && packageValues.has(value) ? value : "pro";
  }

  async function runReport(nextPlate = cleanPlate, nextPackage = packageType) {
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/live-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: nextPlate,
          packageType: nextPackage
        })
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
              : data.error ?? "No se pudo generar el reporte."
        });
        return;
      }

      track("live_report_generated", {
        package_type: nextPackage,
        total_sources: data.report.metrics.total,
        credential_missing: data.report.metrics.credentialMissing,
        api_results: data.report.metrics.apiResults
      });
      setState({ status: "success", report: data.report, copied: false });
      setPlate(data.report.plate);
    } catch {
      setState({
        status: "error",
        message: "No se pudo conectar con el servidor."
      });
    }
  }

  useEffect(() => {
    if (autoRun) {
      const params = new URLSearchParams(window.location.search);
      const queryPlate = params.get("placa") ?? initialPlate;
      const queryPackage = packageFromQuery(params.get("paquete"));

      setPlate(queryPlate);
      setPackageType(queryPackage);
      void runReport(cleanPlateInput(queryPlate), queryPackage);
    }
  }, [autoRun, initialPlate]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runReport();
  }

  async function copySummary() {
    if (state.status !== "success") {
      return;
    }

    await navigator.clipboard.writeText(state.report.summary.whatsappText);
    setState({ ...state, copied: true });
  }

  return (
    <div className="grid gap-6">
      <form
        onSubmit={onSubmit}
        className="grid min-w-0 gap-4 rounded-md border border-line bg-white p-4 shadow-panel lg:grid-cols-[minmax(0,1fr)_220px_auto]"
      >
        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-bold text-ink">Placa a consultar</span>
          <span className="flex min-h-16 min-w-0 items-center rounded-md border-2 border-ink bg-white px-4">
            <span className="mr-3 rounded-sm bg-ink px-2 py-1 text-xs font-bold text-white">
              PE
            </span>
            <input
              value={cleanPlate}
              onChange={(event) => setPlate(event.target.value)}
              placeholder="5075-CD"
              className="min-w-0 flex-1 bg-transparent text-3xl font-black uppercase tracking-normal text-ink outline-none placeholder:text-slate-300"
              aria-label="Placa vehicular"
            />
          </span>
          <span className="text-xs leading-5 text-slateText">
            Acepta 5075-CD y 5075CD como la misma placa.
          </span>
        </label>

        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-bold text-ink">Cobertura</span>
          <select
            value={packageType}
            onChange={(event) => setPackageType(event.target.value)}
            className="h-16 min-w-0 rounded-md border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-brand-700"
          >
            {packageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-xs leading-5 text-slateText">
            Para pruebas usamos todas las fuentes posibles.
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-auto inline-flex min-h-16 min-w-0 items-center justify-center gap-2 rounded-md bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 aria-hidden="true" className="animate-spin" size={19} />
          ) : (
            <Search aria-hidden="true" size={19} />
          )}
          Generar reporte
        </button>
      </form>

      {state.status === "loading" ? (
        <div className="rounded-md border border-line bg-white p-6 shadow-panel">
          <div className="flex items-center gap-3 text-ink">
            <Loader2 aria-hidden="true" className="animate-spin text-brand-700" size={22} />
                <div>
                  <p className="font-bold">Consultando fuentes posibles</p>
                  <p className="mt-1 text-sm text-slateText">
                Ejecutando gateway de integraciones, proveedores y workers.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-redRisk">
          {state.message}
        </div>
      ) : null}

      {state.status === "success" ? (
        <section className="grid gap-6">
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <article className={`rounded-md border p-5 shadow-panel ${riskClass(state.report.risk.level)}`}>
              <p className="text-sm font-bold uppercase tracking-normal">
                Riesgo preliminar
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <span className="text-5xl font-black">
                  {state.report.risk.score}
                </span>
                <span className="pb-2 text-xl font-bold">
                  {state.report.risk.level}
                </span>
              </div>
              <p className="mt-4 text-base font-bold">
                Recomendacion: {state.report.risk.recommendation}
              </p>
              <p className="mt-3 text-sm leading-6">
                {state.report.summary.headline}
              </p>
            </article>

            <article className="rounded-md border border-line bg-white p-5 shadow-panel">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-normal text-slateText">
                    Resumen copiable
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-ink">
                    {state.report.plate}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slateText">
                    Generado para {state.report.packageLabel}. Listo para
                    WhatsApp, PDF, evidencia OCR y proveedores reales.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copySummary}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white hover:bg-brand-900"
                >
                  <Clipboard aria-hidden="true" size={17} />
                  {state.copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-surface p-4 text-sm leading-6 text-ink">
                {state.report.summary.whatsappText}
              </pre>
            </article>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {([
              {
                label: "Fuentes",
                value: `${state.report.metrics.checked}/${state.report.metrics.total}`,
                icon: ShieldCheck
              },
              {
                label: "Datos reales",
                value: state.report.metrics.apiResults,
                icon: CheckCircle2
              },
              {
                label: "Faltan keys",
                value: state.report.metrics.credentialMissing,
                icon: AlertTriangle
              },
              {
                label: "Workers/partners",
                value:
                  state.report.metrics.workerCandidates +
                  state.report.metrics.partnerRequired +
                  state.report.metrics.matrixRequired,
                icon: FileText
              }
            ] satisfies MetricCard[]).map((item) => {
              const MetricIcon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-md border border-line bg-white p-4 shadow-panel"
                >
                  <MetricIcon aria-hidden="true" className="text-brand-700" size={20} />
                  <p className="mt-3 text-xs font-bold uppercase tracking-normal text-slateText">
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-black text-ink">{item.value}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <div className="flex gap-3">
              <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" size={19} />
              <p>
                Este reporte ya usa una capa de integracion. Cuando agregues
                evidencia OCR o tokens de proveedor, la misma pantalla recibira
                datos estructurados sin cambiar la experiencia del usuario.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {state.report.sources.map((source) => (
              <article
                key={source.sourceId}
                className="rounded-md border border-line bg-white p-5 shadow-panel"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-md border px-2.5 py-1 text-xs font-bold ${
                          statusClasses[source.status] ??
                          "border-line bg-surface text-slateText"
                        }`}
                      >
                        {statusLabels[source.status] ?? source.status}
                      </span>
                      <span className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-bold text-slateText">
                        {source.integrationMode}
                      </span>
                      <span className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-bold text-slateText">
                        {source.providerConfigured ? "provider on" : "provider off"}
                      </span>
                      <span className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-bold text-slateText">
                        portal {source.availability}
                        {source.httpStatus ? ` ${source.httpStatus}` : ""}
                      </span>
                      <span className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-bold text-slateText">
                        {source.confidence}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-ink">
                      {source.sourceName}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slateText">
                      {source.summary}
                    </p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-normal text-brand-700">
                      {source.providerName}
                    </p>
                  </div>
                  <a
                    href={source.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-line px-4 text-sm font-bold text-ink hover:border-brand-700 hover:text-brand-700"
                  >
                    Fuente oficial
                    <ExternalLink aria-hidden="true" size={17} />
                  </a>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-md bg-surface p-4">
                    <p className="text-sm font-bold text-ink">Hallazgo tecnico</p>
                    <p className="mt-2 text-sm leading-6 text-slateText">
                      {source.technicalFinding}
                    </p>
                  </div>
                  <div className="rounded-md bg-surface p-4">
                    <p className="text-sm font-bold text-ink">Siguiente paso tecnologico</p>
                    <p className="mt-2 text-sm leading-6 text-slateText">
                      {source.nextTechnologyStep}
                    </p>
                  </div>
                  <div className="rounded-md bg-surface p-4">
                    <p className="text-sm font-bold text-ink">Contrato de datos</p>
                    <p className="mt-2 text-sm leading-6 text-slateText">
                      {source.fields.join(", ")}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-slateText">
                      Env: {source.requiredEnv.join(", ")}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={() => runReport()}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-bold text-ink hover:border-brand-700 hover:text-brand-700 sm:w-auto"
          >
            <RefreshCw aria-hidden="true" size={17} />
            Recalcular reporte
          </button>
        </section>
      ) : null}
    </div>
  );
}
