"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw
} from "lucide-react";

type OperatorEvidence = {
  id: string;
  sourceId: string;
  sourceName: string;
  status: string;
  confidenceLevel: string;
  checkedAt?: string;
  summary?: string;
};

type EvidenceState =
  | { status: "loading" }
  | { status: "success"; evidence: OperatorEvidence[] }
  | { status: "error"; message: string };

const trackedSources = [
  {
    sourceId: "sunarp_consulta_vehicular",
    sourceName: "SUNARP",
    path: "/operador"
  },
  {
    sourceId: "apeseg_soat",
    sourceName: "SOAT / APESEG",
    path: "/operador/soat"
  }
];

function sourceStatusLabel(evidence?: OperatorEvidence) {
  if (!evidence) {
    return "Pendiente";
  }

  if (evidence.status === "consulted_no_alert") {
    return "Listo";
  }

  if (evidence.status === "consulted_with_alert") {
    return "Con alerta";
  }

  return "Revisar";
}

function sourceStatusClass(evidence?: OperatorEvidence) {
  if (!evidence) {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  if (evidence.status === "consulted_no_alert") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (evidence.status === "consulted_with_alert") {
    return "border-orange-200 bg-orange-50 text-orange-900";
  }

  return "border-red-200 bg-red-50 text-redRisk";
}

function checkedAtLabel(value?: string) {
  if (!value) {
    return "Sin evidencia guardada";
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function OperatorCaseStatus({
  initialPlate,
  activeSource
}: {
  initialPlate: string;
  activeSource: "sunarp" | "soat";
}) {
  const [plate, setPlate] = useState(initialPlate);
  const [state, setState] = useState<EvidenceState>({ status: "loading" });
  const encodedPlate = encodeURIComponent(plate);

  const loadEvidence = useCallback(async (nextPlate: string) => {
    setState({ status: "loading" });

    try {
      const response = await fetch(
        `/api/operator/evidence?plate=${encodeURIComponent(nextPlate)}`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "No se pudo leer evidencia.");
      }

      setPlate(data.plate);
      setState({ status: "success", evidence: data.evidence ?? [] });
    } catch {
      setState({
        status: "error",
        message: "No se pudo cargar el estado del caso."
      });
    }
  }, []);

  useEffect(() => {
    void loadEvidence(initialPlate);
  }, [initialPlate, loadEvidence]);

  useEffect(() => {
    function handleSaved(event: Event) {
      const customEvent = event as CustomEvent<{ plate?: string }>;
      void loadEvidence(customEvent.detail?.plate ?? plate);
    }

    window.addEventListener("operator-evidence-saved", handleSaved);

    return () => {
      window.removeEventListener("operator-evidence-saved", handleSaved);
    };
  }, [loadEvidence, plate]);

  const evidenceBySource = useMemo(() => {
    const rows = state.status === "success" ? state.evidence : [];

    return new Map(rows.map((row) => [row.sourceId, row]));
  }, [state]);

  const completed = trackedSources.filter((source) =>
    evidenceBySource.has(source.sourceId)
  ).length;

  return (
    <section className="mb-6 rounded-md border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-slateText">
            Caso operativo
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-ink">{plate}</h2>
            <span className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-bold text-slateText">
              {completed}/{trackedSources.length} fuentes base listas
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/reporte-en-vivo?placa=${encodedPlate}&paquete=pro`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-bold text-ink hover:border-brand-700 hover:text-brand-700"
          >
            <FileText aria-hidden="true" size={17} />
            Reporte vivo
          </Link>
          <button
            type="button"
            onClick={() => void loadEvidence(plate)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white hover:bg-brand-900"
          >
            {state.status === "loading" ? (
              <Loader2 aria-hidden="true" className="animate-spin" size={17} />
            ) : (
              <RefreshCw aria-hidden="true" size={17} />
            )}
            Actualizar
          </button>
        </div>
      </div>

      {state.status === "error" ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-redRisk">
          {state.message}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {trackedSources.map((source) => {
          const evidence = evidenceBySource.get(source.sourceId);
          const isActive =
            (activeSource === "sunarp" &&
              source.sourceId === "sunarp_consulta_vehicular") ||
            (activeSource === "soat" && source.sourceId === "apeseg_soat");

          return (
            <Link
              key={source.sourceId}
              href={`${source.path}?placa=${encodedPlate}`}
              className={[
                "rounded-md border p-4 transition hover:border-brand-700 hover:bg-brand-50",
                isActive ? "border-ink bg-surface" : "border-line bg-white"
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">{source.sourceName}</p>
                  <p className="mt-1 text-xs leading-5 text-slateText">
                    {checkedAtLabel(evidence?.checkedAt)}
                  </p>
                </div>
                <span
                  className={[
                    "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold",
                    sourceStatusClass(evidence)
                  ].join(" ")}
                >
                  {evidence ? (
                    <CheckCircle2 aria-hidden="true" size={14} />
                  ) : (
                    <AlertTriangle aria-hidden="true" size={14} />
                  )}
                  {sourceStatusLabel(evidence)}
                </span>
              </div>
              {evidence?.summary ? (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slateText">
                  {evidence.summary}
                </p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
