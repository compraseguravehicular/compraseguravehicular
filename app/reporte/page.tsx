import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  MessageCircle
} from "lucide-react";
import { PrintButton } from "@/components/print-button";
import { RiskBadge } from "@/components/risk-badge";
import { reportSources } from "@/lib/product-data";
import { whatsappHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reporte demo",
  description:
    "Ejemplo de reporte Compra Segura Vehicular con semaforo, fuentes, evidencias y recomendacion."
};

const evidenceRows = [
  ["SUNARP", "Consultado", "28/06/2026 09:12", "Media"],
  ["SOAT / APESEG", "Consultado", "28/06/2026 09:14", "Media"],
  ["MTC CITV", "Consultado", "28/06/2026 09:16", "Media"],
  ["SAT Lima", "Consultado", "28/06/2026 09:18", "Media"],
  ["ATU", "Consultado", "28/06/2026 09:20", "Media"]
];

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-surface px-4 py-6 sm:px-6 lg:px-8">
      <div className="no-print mx-auto mb-5 flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Volver a la landing
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row">
          <PrintButton />
          <Link
            href={whatsappHref(
              "Hola, quiero un reporte Compra Segura similar al demo."
            )}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-brand-700 hover:text-brand-700"
          >
            <MessageCircle aria-hidden="true" size={17} />
            Solicitar reporte
          </Link>
        </div>
      </div>

      <article className="print-page mx-auto max-w-5xl rounded-md border border-line bg-white shadow-soft">
        <header className="border-b border-line bg-ink px-6 py-8 text-white sm:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md bg-white text-brand-900">
                <FileText aria-hidden="true" size={22} />
              </div>
              <h1 className="text-3xl font-bold tracking-normal">
                Reporte Compra Segura Vehicular
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                Diagnostico informativo por placa con fuentes disponibles,
                evidencia y recomendacion no vinculante.
              </p>
            </div>
            <div className="grid gap-2 text-sm text-white/85">
              <span>Codigo: CV-2026-0001</span>
              <span>Emitido: 28/06/2026 09:24</span>
              <span>Paquete: Compra Segura</span>
            </div>
          </div>
        </header>

        <section className="grid gap-0 border-b border-line md:grid-cols-4">
          {[
            ["Placa", "ABC-123"],
            ["Semaforo", "Amarillo"],
            ["Score", "45 / 100"],
            ["Entrega", "12 minutos"]
          ].map(([label, value]) => (
            <div key={label} className="border-b border-line p-5 md:border-b-0 md:border-r">
              <p className="text-xs font-semibold uppercase tracking-normal text-slateText">
                {label}
              </p>
              <div className="mt-2 text-xl font-bold text-ink">
                {label === "Semaforo" ? <RiskBadge value={value} /> : value}
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-xl font-bold text-ink">Resultado general</h2>
            <p className="mt-4 leading-7 text-slateText">
              Se detectaron observaciones que deben revisarse antes de pagar o
              firmar. Recomendamos negociar, pedir documentos adicionales y
              regularizar las alertas indicadas.
            </p>
            <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amberRisk">
                Recomendacion
              </p>
              <p className="mt-2 text-ink">
                Negociar antes de pagar y exigir regularizacion de papeletas.
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Alertas principales</h2>
            <ul className="mt-4 space-y-3">
              {[
                "Papeletas pendientes por S/ 420 en SAT Lima.",
                "Revision tecnica vence en 34 dias.",
                "No se consulto documento SUNARP pagado en este paquete."
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-ink">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-amberRisk"
                    size={17}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-line px-6 py-8 sm:px-10">
          <h2 className="text-xl font-bold text-ink">Datos del vehiculo</h2>
          <div className="mt-5 overflow-hidden rounded-md border border-line">
            <table className="w-full border-collapse text-left text-sm">
              <tbody>
                {[
                  ["Marca", "Toyota"],
                  ["Modelo", "Yaris"],
                  ["Color", "Gris"],
                  ["VIN / Serie", "********1234"],
                  ["Motor", "****7782"],
                  ["Titular / coincidencia", "Dato minimizado en demo"]
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-line last:border-b-0">
                    <th className="w-1/3 bg-surface px-4 py-3 font-semibold text-ink">
                      {label}
                    </th>
                    <td className="px-4 py-3 text-slateText">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-t border-line px-6 py-8 sm:px-10">
          <h2 className="text-xl font-bold text-ink">Fuentes consultadas</h2>
          <div className="mt-5 overflow-x-auto rounded-md border border-line">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-normal text-slateText">
                <tr>
                  <th className="px-4 py-3">Fuente</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Confianza</th>
                </tr>
              </thead>
              <tbody>
                {reportSources.map((row) => (
                  <tr key={row.source} className="border-t border-line">
                    <td className="px-4 py-3 font-semibold text-ink">
                      {row.source}
                    </td>
                    <td className="px-4 py-3 text-slateText">{row.result}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-surface px-2 py-1 text-xs font-semibold text-ink">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slateText">
                      {row.confidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-t border-line px-6 py-8 sm:px-10">
          <h2 className="text-xl font-bold text-ink">Evidencias</h2>
          <div className="mt-5 grid gap-3">
            {evidenceRows.map(([source, status, checkedAt, confidence]) => (
              <div
                key={source}
                className="grid gap-3 rounded-md border border-line p-4 text-sm sm:grid-cols-4"
              >
                <span className="font-semibold text-ink">{source}</span>
                <span className="text-slateText">{status}</span>
                <span className="text-slateText">{checkedAt}</span>
                <span className="text-slateText">{confidence}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-line px-6 py-8 sm:px-10">
          <h2 className="text-xl font-bold text-ink">Checklist antes de pagar</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              "Confirmar identidad del vendedor.",
              "Validar tarjeta de identificacion vehicular.",
              "No pagar separacion sin comprobante.",
              "Solicitar documento SUNARP pagado si persiste la duda.",
              "Hacer revision mecanica.",
              "Firmar por notaria o canal formal."
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
        </section>

        <footer className="border-t border-line bg-surface px-6 py-6 text-xs leading-6 text-slateText sm:px-10">
          Este reporte es informativo y ha sido elaborado con base en fuentes
          disponibles al momento de la consulta. No constituye certificado
          oficial, publicidad registral, peritaje mecanico, asesoria legal ni
          garantia de inexistencia absoluta de riesgos.
          <div className="mt-4 flex items-center gap-2 font-semibold text-ink">
            <Download aria-hidden="true" size={15} />
            CV-2026-0001 | ABC-123 | Uso exclusivo del solicitante
          </div>
        </footer>
      </article>
    </main>
  );
}
