import type { Metadata } from "next";
import Link from "next/link";
import { OperatorCaseStatus } from "@/components/operator/operator-case-status";
import { SoatCopilot } from "@/components/operator/soat-copilot";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isValidPlate, normalizePlate } from "@/lib/plates";

export const metadata: Metadata = {
  title: "Copiloto SOAT / APESEG",
  description:
    "Copiloto operativo para capturar evidencia SOAT/APESEG por placa y convertirla en datos estructurados para reporte.",
  robots: {
    index: false,
    follow: false
  }
};

type SoatOperatorPageProps = {
  searchParams: Promise<{ placa?: string; plate?: string }>;
};

function plateFromQuery(searchParams: { placa?: string; plate?: string }) {
  const value = searchParams.placa ?? searchParams.plate ?? "5075cd";
  return isValidPlate(value) ? normalizePlate(value) : "5075-CD";
}

export default async function SoatOperatorPage({
  searchParams
}: SoatOperatorPageProps) {
  const query = await searchParams;
  const initialPlate = plateFromQuery(query);
  const encodedPlate = encodeURIComponent(initialPlate);

  return (
    <>
      <SiteHeader />
      <main className="bg-surface pt-16">
        <section className="bg-ink py-14 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-normal text-white/70">
              Operacion asistida
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-normal sm:text-5xl">
              Copiloto SOAT / APESEG
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/75">
              Flujo validado contra el portal real: resuelve el CAPTCHA oficial,
              captura la tabla de resultado y el sistema guarda vigencia,
              aseguradora, estado y alertas en el reporte vivo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/operador?placa=${encodedPlate}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/25 px-4 text-sm font-bold text-white hover:bg-white hover:text-ink"
              >
                SUNARP
              </Link>
              <Link
                href={`/operador/soat?placa=${encodedPlate}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-bold text-ink"
              >
                SOAT / APESEG
              </Link>
              <Link
                href={`/operador/sat?placa=${encodedPlate}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/25 px-4 text-sm font-bold text-white hover:bg-white hover:text-ink"
              >
                SAT Lima
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <OperatorCaseStatus initialPlate={initialPlate} activeSource="soat" />
          <SoatCopilot initialPlate={initialPlate} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
