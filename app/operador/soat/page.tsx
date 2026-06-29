import type { Metadata } from "next";
import Link from "next/link";
import { SoatCopilot } from "@/components/operator/soat-copilot";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Copiloto SOAT / APESEG",
  description:
    "Copiloto operativo para capturar evidencia SOAT/APESEG por placa y convertirla en datos estructurados para reporte.",
  robots: {
    index: false,
    follow: false
  }
};

export default function SoatOperatorPage() {
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
                href="/operador"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/25 px-4 text-sm font-bold text-white hover:bg-white hover:text-ink"
              >
                SUNARP
              </Link>
              <Link
                href="/operador/soat"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-bold text-ink"
              >
                SOAT / APESEG
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SoatCopilot initialPlate="5075cd" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
