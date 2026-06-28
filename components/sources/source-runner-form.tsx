"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Play, ShieldAlert } from "lucide-react";
import { track } from "@vercel/analytics/react";

type SourceRunState =
  | { status: "idle" }
  | { status: "submitting" }
  | {
      status: "success";
      data: {
        plate: string;
        packageType: string;
        metrics: {
          total: number;
          automaticCandidates: number;
          manualAssisted: number;
          paidOrPartner: number;
          blocked: number;
        };
        results: Array<{
          sourceId: string;
          sourceName: string;
          category: string;
          status: string;
          automationMode: string;
          confidence: string;
          officialUrl: string;
          summary: string;
          fields: string[];
          limitation: string;
          operatorAction: string;
        }>;
      };
    }
  | { status: "error"; message: string };

const packageOptions = [
  { value: "compra_segura", label: "Compra Segura" },
  { value: "express", label: "Express" },
  { value: "pro", label: "Pro" }
];

const modeLabels: Record<string, string> = {
  automatic_candidate: "Candidata a automatizar",
  manual_assisted: "Manual asistida",
  paid_or_partner: "Pago/API/convenio",
  blocked: "Matriz pendiente"
};

export function SourceRunnerForm() {
  const [state, setState] = useState<SourceRunState>({ status: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });

    const formData = new FormData(event.currentTarget);
    const payload = {
      plate: formData.get("plate"),
      packageType: formData.get("packageType")
    };

    try {
      const response = await fetch("/api/source-runs", {
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
              : data.error ?? "No se pudo ejecutar fuentes."
        });
        return;
      }

      track("source_run_created", {
        package_type: String(payload.packageType),
        total_sources: data.metrics.total
      });
      setState({ status: "success", data });
    } catch {
      setState({
        status: "error",
        message: "No se pudo conectar con el servidor."
      });
    }
  }

  return (
    <div className="grid gap-6">
      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-md border border-line bg-white p-5 shadow-panel md:grid-cols-[1fr_220px_auto]"
      >
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Placa
          <input
            name="plate"
            required
            placeholder="ABC-123"
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
        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {state.status === "submitting" ? (
            <Loader2 aria-hidden="true" className="animate-spin" size={18} />
          ) : (
            <Play aria-hidden="true" size={18} />
          )}
          Ejecutar
        </button>
      </form>

      {state.status === "error" ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-redRisk">
          {state.message}
        </div>
      ) : null}

      {state.status === "success" ? (
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ["Fuentes", state.data.metrics.total],
              ["Manual asistida", state.data.metrics.manualAssisted],
              ["Pago/API", state.data.metrics.paidOrPartner],
              ["Bloqueadas", state.data.metrics.blocked],
              ["Auto candidatas", state.data.metrics.automaticCandidates]
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-md border border-line bg-white p-4 shadow-panel"
              >
                <p className="text-xs font-semibold uppercase tracking-normal text-slateText">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <div className="flex gap-3">
              <ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
              <p>
                Esta version no inventa resultados. Genera el plan operativo por
                placa y abre la fuente oficial para evidencia manual. La
                automatizacion real se activa fuente por fuente cuando sea
                estable, permitida y verificable.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {state.data.results.map((item) => (
              <article
                key={item.sourceId}
                className="rounded-md border border-line bg-white p-5 shadow-panel"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-normal text-slateText">
                      {item.category} - {modeLabels[item.automationMode] ?? item.automationMode}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-ink">
                      {item.sourceName}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slateText">
                      {item.summary}
                    </p>
                  </div>
                  <a
                    href={item.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-ink hover:border-brand-700 hover:text-brand-700"
                  >
                    Abrir fuente
                    <ExternalLink aria-hidden="true" size={16} />
                  </a>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
                  <div className="rounded-md bg-surface p-4">
                    <p className="text-sm font-semibold text-ink">
                      Campos esperados
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slateText">
                      {item.fields.join(", ")}
                    </p>
                  </div>
                  <div className="rounded-md bg-surface p-4">
                    <p className="text-sm font-semibold text-ink">Limitacion</p>
                    <p className="mt-2 text-sm leading-6 text-slateText">
                      {item.limitation}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
