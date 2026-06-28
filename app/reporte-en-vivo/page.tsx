import type { Metadata } from "next";
import { LiveReportRunner } from "@/components/live-report-runner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Reporte en vivo por placa",
  description:
    "Genera un reporte operativo por placa con validacion responsable de fuentes vehiculares oficiales en Peru.",
  robots: {
    index: false,
    follow: false
  }
};

export default function LiveReportPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-surface pt-16">
        <section className="bg-ink py-14 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-normal text-white/70">
              Funcion principal
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-normal sm:text-5xl">
              Reporte en vivo de fuentes por placa
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/75">
              Consulta la placa contra el gateway de integraciones, proveedores
              API, workers y fuentes oficiales, con trazabilidad lista para
              reporte.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <LiveReportRunner initialPlate="5075cd" autoRun />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
