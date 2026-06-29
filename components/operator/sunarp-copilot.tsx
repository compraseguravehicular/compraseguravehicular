"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  FileCheck2,
  Loader2,
  MonitorUp,
  ScanText,
  ShieldCheck
} from "lucide-react";
import { track } from "@vercel/analytics/react";

type ParseState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      copied: boolean;
      data: {
        result: {
          plate: string;
          statusSuggestion: string;
          confidenceLevel: string;
          confidenceScore: number;
          summary: string;
          alerts: string[];
          fieldRows: Array<{ label: string; value: string }>;
          sellerScript: string;
          reportNotes: string[];
        };
        savedSource?: unknown;
      };
    }
  | { status: "error"; message: string };

function cleanPlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

function statusLabel(value: string) {
  if (value === "consulted_no_alert") {
    return "Sin alerta";
  }

  if (value === "consulted_with_alert") {
    return "Con alerta";
  }

  return "Revisar captura";
}

export function SunarpCopilot({
  initialPlate = "5075cd",
  sourceResultId
}: {
  initialPlate?: string;
  sourceResultId?: string;
}) {
  const [plate, setPlate] = useState(initialPlate);
  const [rawText, setRawText] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [state, setState] = useState<ParseState>({ status: "idle" });
  const normalizedPlate = useMemo(() => cleanPlate(plate), [plate]);
  const officialUrl = "https://consultavehicular.sunarp.gob.pe/";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryPlate = params.get("placa");
    if (queryPlate) {
      setPlate(queryPlate);
    }
  }, []);

  async function copyPlate() {
    await navigator.clipboard.writeText(normalizedPlate);
  }

  async function analyzeEvidence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/operator/sunarp/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: normalizedPlate,
          rawText,
          evidenceUrl,
          sourceResultId
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
              : data.error ?? "No se pudo analizar."
        });
        return;
      }

      track("operator_sunarp_parsed", {
        status: data.result.statusSuggestion,
        confidence: data.result.confidenceScore
      });
      setPlate(data.result.plate);
      setState({ status: "success", data, copied: false });
    } catch {
      setState({
        status: "error",
        message: "No se pudo conectar con el servidor."
      });
    }
  }

  async function copySellerScript() {
    if (state.status !== "success") {
      return;
    }

    await navigator.clipboard.writeText(state.data.result.sellerScript);
    setState({ ...state, copied: true });
  }

  return (
    <div className="grid min-w-0 gap-6 overflow-x-hidden">
      <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 rounded-md border border-line bg-white p-5 shadow-panel">
          <p className="text-sm font-bold uppercase tracking-normal text-brand-700">
            Modo vendedor
          </p>
          <h2 className="mt-2 text-3xl font-black text-ink">
            Consulta SUNARP sin escribir el reporte a mano
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slateText">
            El copiloto te guia: abres la fuente oficial, resuelves la
            verificacion cuando aparezca, pegas el resultado y el sistema
            extrae campos, alertas, confianza y resumen.
          </p>

          <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="grid min-w-0 gap-2">
              <span className="text-sm font-bold text-ink">Placa</span>
              <span className="flex min-h-16 min-w-0 items-center rounded-md border-2 border-ink bg-white px-4">
                <span className="mr-3 rounded-sm bg-ink px-2 py-1 text-xs font-bold text-white">
                  PE
                </span>
                <input
                  value={normalizedPlate}
                  onChange={(event) => setPlate(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-2xl font-black uppercase tracking-normal outline-none sm:text-3xl"
                  aria-label="Placa vehicular"
                />
              </span>
            </label>
            <button
              type="button"
              onClick={copyPlate}
              className="mt-auto inline-flex min-h-16 min-w-0 items-center justify-center gap-2 rounded-md border border-line px-4 text-sm font-bold text-ink hover:border-brand-700 hover:text-brand-700"
            >
              <Clipboard aria-hidden="true" size={18} />
              Copiar
            </button>
            <a
              href={officialUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex min-h-16 min-w-0 items-center justify-center gap-2 rounded-md bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-900"
            >
              Fuente oficial
              <ExternalLink aria-hidden="true" size={18} />
            </a>
          </div>
        </div>

        <aside className="min-w-0 rounded-md border border-line bg-white p-5 shadow-panel">
          <p className="text-sm font-bold uppercase tracking-normal text-slateText">
            Flujo rapido
          </p>
          <div className="mt-4 grid gap-4">
            {[
              ["1", "Copiar placa", "Usa la placa normalizada."],
              ["2", "Abrir fuente", "Completa la verificacion oficial."],
              ["3", "Pegar resultado", "Texto, HTML o contenido visible."],
              ["4", "Analizar", "Resumen y campos listos para reporte."]
            ].map(([step, title, detail]) => (
              <div key={step} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-50 text-sm font-black text-brand-700">
                  {step}
                </span>
                <div>
                  <p className="font-bold text-ink">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-slateText">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <form
        onSubmit={analyzeEvidence}
        className="grid min-w-0 gap-5 rounded-md border border-line bg-white p-5 shadow-panel"
      >
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <label className="grid min-w-0 gap-2">
            <span className="text-sm font-bold text-ink">
              Resultado oficial pegado
            </span>
            <textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              rows={11}
              placeholder="Pega aqui el texto visible del resultado SUNARP o el HTML copiado de la pagina..."
              className="rounded-md border border-line bg-surface px-3 py-3 text-sm leading-6 outline-none focus:border-brand-700"
            />
          </label>

          <div className="grid min-w-0 gap-4">
            <label className="grid min-w-0 gap-2">
              <span className="text-sm font-bold text-ink">
                URL de evidencia
              </span>
              <input
                value={evidenceUrl}
                onChange={(event) => setEvidenceUrl(event.target.value)}
                placeholder="https://..."
                className="h-11 rounded-md border border-line px-3 text-sm outline-none focus:border-brand-700"
              />
            </label>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <div className="flex gap-3">
                <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
                <p>
                  No necesitas redactar ni interpretar desde cero. El copiloto
                  extrae campos y te dice si la captura sirve o si falta una
                  segunda pasada.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={state.status === "loading"}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-bold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {state.status === "loading" ? (
                <Loader2 aria-hidden="true" className="animate-spin" size={18} />
              ) : (
                <ScanText aria-hidden="true" size={18} />
              )}
              Analizar evidencia
            </button>
          </div>
        </div>
      </form>

      {state.status === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-redRisk">
          {state.message}
        </div>
      ) : null}

      {state.status === "success" ? (
        <section className="grid gap-5">
          <div className="grid min-w-0 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
            <article className="min-w-0 rounded-md border border-line bg-white p-5 shadow-panel">
              <p className="text-sm font-bold uppercase tracking-normal text-slateText">
                Resultado del copiloto
              </p>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-5xl font-black text-ink">
                  {state.data.result.confidenceScore}
                </span>
                <span className="pb-2 text-sm font-bold text-slateText">
                  confianza {state.data.result.confidenceLevel}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                  {statusLabel(state.data.result.statusSuggestion)}
                </span>
                <span className="rounded-md bg-surface px-2.5 py-1 text-xs font-bold text-slateText">
                  {state.data.result.plate}
                </span>
              </div>
            </article>

            <article className="min-w-0 rounded-md border border-line bg-white p-5 shadow-panel">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-normal text-slateText">
                    Guion para venta
                  </p>
                  <p className="mt-3 text-sm leading-6 text-ink">
                    {state.data.result.sellerScript}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copySellerScript}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-900"
                >
                  <Clipboard aria-hidden="true" size={17} />
                  {state.copied ? "Copiado" : "Copiar"}
                </button>
              </div>
            </article>
          </div>

          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <article className="min-w-0 rounded-md border border-line bg-white p-5 shadow-panel">
              <p className="text-sm font-bold uppercase tracking-normal text-slateText">
                Campos extraidos
              </p>
              {state.data.result.fieldRows.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {state.data.result.fieldRows.map((field) => (
                    <div key={field.label} className="rounded-md bg-surface p-4">
                      <p className="text-xs font-bold uppercase tracking-normal text-slateText">
                        {field.label}
                      </p>
                      <p className="mt-2 break-words text-sm font-bold text-ink">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  No se extrajeron campos suficientes. Pega el texto completo de
                  la pantalla de resultado o guarda una captura como evidencia.
                </div>
              )}
            </article>

            <aside className="grid gap-4">
              <div className="rounded-md border border-line bg-white p-5 shadow-panel">
                <p className="text-sm font-bold uppercase tracking-normal text-slateText">
                  Alertas
                </p>
                <div className="mt-4 grid gap-3 text-sm">
                  {state.data.result.alerts.length ? (
                    state.data.result.alerts.map((alert) => (
                      <div key={alert} className="flex gap-3 text-amber-950">
                        <AlertTriangle
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-amberRisk"
                          size={17}
                        />
                        <span>{alert}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-3 text-ink">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-brand-700"
                        size={17}
                      />
                      <span>Sin alerta evidente en el texto capturado.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-md border border-line bg-white p-5 shadow-panel">
                <p className="text-sm font-bold uppercase tracking-normal text-slateText">
                  Control final
                </p>
                <div className="mt-4 grid gap-3 text-sm">
                  {state.data.result.reportNotes.map((note) => (
                    <div key={note} className="flex gap-3">
                      <FileCheck2
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-brand-700"
                        size={17}
                      />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`/reporte-en-vivo?placa=${encodeURIComponent(state.data.result.plate)}&paquete=pro`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-bold text-ink hover:border-brand-700 hover:text-brand-700"
            >
              Ver reporte vivo
              <ArrowRight aria-hidden="true" size={17} />
            </a>
            <a
              href="/panel"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-bold text-ink hover:border-brand-700 hover:text-brand-700"
            >
              Ir al panel
              <MonitorUp aria-hidden="true" size={17} />
            </a>
          </div>
        </section>
      ) : null}
    </div>
  );
}
