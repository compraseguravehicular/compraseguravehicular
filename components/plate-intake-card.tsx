"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Search, ShieldCheck } from "lucide-react";
import { track } from "@vercel/analytics/react";

type PlateRunState =
  | { status: "idle" }
  | { status: "submitting" }
  | {
      status: "success";
      plate: string;
      totalSources: number;
      manualAssisted: number;
      paidOrPartner: number;
      blocked: number;
    }
  | { status: "error"; message: string };

export function PlateIntakeCard() {
  const [plate, setPlate] = useState("");
  const [packageType, setPackageType] = useState("compra_segura");
  const [state, setState] = useState<PlateRunState>({ status: "idle" });

  const cleanPlate = useMemo(() => plate.toUpperCase().replace(/[^A-Z0-9-]/g, ""), [plate]);
  const isSubmitting = state.status === "submitting";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "submitting" });

    try {
      const response = await fetch("/api/source-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate: cleanPlate, packageType })
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
              : data.error ?? "No se pudo preparar la verificacion."
        });
        return;
      }

      track("plate_quick_check", {
        package_type: packageType,
        total_sources: data.metrics.total
      });
      setState({
        status: "success",
        plate: data.plate,
        totalSources: data.metrics.total,
        manualAssisted: data.metrics.manualAssisted,
        paidOrPartner: data.metrics.paidOrPartner,
        blocked: data.metrics.blocked
      });
    } catch {
      setState({
        status: "error",
        message: "No se pudo conectar con el servidor."
      });
    }
  }

  return (
    <div className="mt-8 max-w-3xl rounded-lg border border-white/20 bg-white p-3 text-ink shadow-soft">
      <form onSubmit={onSubmit} className="rounded-md border border-line bg-surface p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <label className="grid flex-1 gap-2">
            <span className="text-sm font-semibold text-slateText">
              Ingresa la placa
            </span>
            <span className="flex min-h-16 items-center rounded-md border-2 border-ink bg-white px-4 shadow-sm">
              <span className="mr-3 rounded-sm bg-ink px-2 py-1 text-xs font-bold text-white">
                PE
              </span>
              <input
                value={cleanPlate}
                onChange={(event) => setPlate(event.target.value)}
                placeholder="5075-CD"
                aria-label="Placa vehicular"
                className="min-w-0 flex-1 bg-transparent text-3xl font-black uppercase tracking-normal outline-none placeholder:text-slate-300"
              />
            </span>
            <span className="text-xs leading-5 text-slateText">
              Tambien aceptamos formato sin guion, por ejemplo 5075CD.
            </span>
          </label>

          <label className="grid gap-2 lg:w-56">
            <span className="text-sm font-semibold text-slateText">Plan</span>
            <select
              value={packageType}
              onChange={(event) => setPackageType(event.target.value)}
              className="h-12 rounded-md border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-brand-700"
            >
              <option value="compra_segura">Compra Segura</option>
              <option value="express">Express</option>
              <option value="pro">Pro</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-bold text-white hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 aria-hidden="true" className="animate-spin" size={18} />
            ) : (
              <Search aria-hidden="true" size={18} />
            )}
            Analizar
          </button>
        </div>
      </form>

      {state.status === "error" ? (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-redRisk">
          {state.message}
        </div>
      ) : null}

      {state.status === "success" ? (
        <div className="mt-3 grid gap-3 rounded-md border border-brand-100 bg-brand-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex gap-3">
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand-700"
              size={20}
            />
            <div>
              <p className="font-bold text-brand-900">
                {state.plate}: {state.totalSources} fuentes preparadas
              </p>
              <p className="mt-1 text-sm leading-6 text-slateText">
                {state.manualAssisted} manuales asistidas, {state.paidOrPartner} con pago/API y {state.blocked} por matriz.
              </p>
            </div>
          </div>
          <Link
            href="#solicitud"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-900"
          >
            Crear orden
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 text-sm text-slateText md:grid-cols-3">
          {[
            "Placa normalizada",
            "Fuentes trazables",
            "Riesgo calculable"
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="text-brand-700" size={16} />
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
