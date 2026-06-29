import type { Metadata } from "next";
import { SunarpCopilot } from "@/components/operator/sunarp-copilot";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Copiloto vendedor",
  description:
    "Copiloto operativo para consultar fuentes vehiculares, capturar evidencia y convertir resultados en reporte.",
  robots: {
    index: false,
    follow: false
  }
};

export default function OperatorPage() {
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
              Copiloto vendedor para fuentes oficiales
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/75">
              Empieza con SUNARP: el sistema guia la consulta, analiza la
              evidencia y prepara resumen, campos y alertas para vender con
              rapidez.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SunarpCopilot initialPlate="5075cd" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
