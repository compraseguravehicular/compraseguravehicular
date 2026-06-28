import type { Metadata } from "next";
import { LiveReportRunner } from "@/components/live-report-runner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Gateway de fuentes",
  description:
    "Gateway de integraciones vehiculares por API, proveedor y worker para Compra Segura Vehicular.",
  robots: {
    index: false,
    follow: false
  }
};

export default function SourcesPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-surface pt-16">
        <section className="bg-ink py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-normal text-white/70">
              Integraciones
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-normal sm:text-5xl">
              Gateway tecnologico de fuentes vehiculares
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/75">
              Ejecuta la placa contra proveedores API, workers versionados y
              matriz de datos, dejando trazabilidad por fuente.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <LiveReportRunner initialPlate="5075cd" autoRun={false} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
