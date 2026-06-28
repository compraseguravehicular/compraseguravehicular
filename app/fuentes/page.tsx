import type { Metadata } from "next";
import { SourceRunnerForm } from "@/components/sources/source-runner-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Motor de fuentes",
  description:
    "Orquestador operativo de fuentes vehiculares para Compra Segura Vehicular."
};

export default function SourcesPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-surface pt-16">
        <section className="bg-ink py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-normal text-white/70">
              Funcion principal
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-normal sm:text-5xl">
              Motor de fuentes vehiculares
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/75">
              Ejecuta el plan de consulta por placa, clasifica fuentes por
              nivel de automatizacion y guia al operador hacia evidencia
              verificable.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SourceRunnerForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
