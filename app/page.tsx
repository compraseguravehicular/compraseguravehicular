import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageCircle,
  Search,
  ShieldCheck
} from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { OrderIntakeForm } from "@/components/order-intake-form";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  coreSources,
  operatingSteps,
  packages,
  reportHighlights
} from "@/lib/product-data";
import { whatsappHref } from "@/lib/utils";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Compra Segura Vehicular",
    areaServed: "PE",
    description:
      "Reporte vehicular por placa con fuentes verificadas, evidencias, semaforo de riesgo y recomendacion de compra.",
    offers: packages.map((item) => ({
      "@type": "Offer",
      name: item.name,
      priceCurrency: "PEN",
      price: item.price.replace("S/ ", "").replace("Desde ", "")
    }))
  };

  return (
    <>
    <main>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative min-h-[86vh] overflow-hidden bg-ink text-white">
        <Image
          src="/images/vehicle-report-hero.png"
          alt="Inspeccion vehicular con reporte digital"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-center px-4 pb-20 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 text-sm font-medium text-white">
              <ShieldCheck aria-hidden="true" size={16} />
              Diagnostico vehicular por placa en Peru
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal sm:text-5xl lg:text-6xl">
              Antes de separar un auto usado, verifica si realmente conviene
              comprarlo
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">
              Recibe un reporte con fuentes verificadas, evidencias, semaforo
              de riesgo y recomendacion clara: comprar, negociar, evitar o
              pedir documentos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton
                href={whatsappHref(
                  "Hola, quiero verificar una placa antes de comprar un vehiculo. Paquete: Compra Segura"
                )}
                icon={MessageCircle}
                variant="light"
                eventName="whatsapp_click"
                eventProperties={{ location: "hero", package: "compra_segura" }}
              >
                Verificar por WhatsApp
              </CtaButton>
              <CtaButton
                href="/reporte"
                icon={FileText}
                variant="secondary"
                eventName="report_demo_click"
                eventProperties={{ location: "hero" }}
              >
                Ver reporte demo
              </CtaButton>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/70">
              Reporte informativo. No somos entidad oficial y no reemplazamos
              certificados registrales ni revision mecanica presencial.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {reportHighlights.map((item) => (
            <div key={item.label} className="border-l border-line pl-4">
              <p className="text-sm text-slateText">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-ink">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-normal text-brand-700">
              Validacion monetizable
            </p>
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">
              El primer backend ya crea ordenes listas para operar
            </h2>
            <p className="mt-4 text-base leading-7 text-slateText">
              Este formulario entra por API, valida datos y crea una orden en
              Supabase si las credenciales estan configuradas. Sin credenciales,
              mantiene modo demo para no bloquear desarrollo.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-ink">
              {[
                "Validacion server-side con Zod.",
                "Service role solo en servidor.",
                "Fallback demo sin exponer datos sensibles.",
                "Orden preparada para fuentes, pago, evidencias y PDF."
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-brand-700"
                    size={17}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <OrderIntakeForm />
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Producto"
            title="No vendemos una lista de datos. Vendemos una decision mejor informada."
          >
            El valor esta en ordenar fuentes, registrar evidencia y convertir
            los hallazgos en una recomendacion accionable.
          </SectionHeading>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              "El vendedor puede no ser el titular.",
              "El vehiculo puede tener deudas, papeletas o captura administrativa.",
              "El SOAT, CITV o GNV pueden requerir regularizacion."
            ].map((item) => (
              <div
                key={item}
                className="rounded-md border border-line bg-white p-6 shadow-panel"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="mb-4 text-brand-700"
                  size={22}
                />
                <p className="leading-7 text-ink">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="paquetes" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Paquetes" title="Tres niveles para vender desde el primer dia">
            Express capta demanda, Compra Segura concentra margen y Pro cubre
            casos donde la decision necesita mas respaldo.
          </SectionHeading>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {packages.map((item) => (
              <article
                key={item.name}
                className="relative rounded-md border border-line bg-white p-6 shadow-panel"
              >
                {item.recommended ? (
                  <span className="absolute right-4 top-4 rounded-md bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    Recomendado
                  </span>
                ) : null}
                <h3 className="text-xl font-bold text-ink">{item.name}</h3>
                <p className="mt-3 text-3xl font-bold text-ink">
                  {item.price}
                </p>
                <p className="mt-4 min-h-16 text-sm leading-6 text-slateText">
                  {item.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {item.includes.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm text-ink">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-brand-700"
                        size={17}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <CtaButton
                    href={whatsappHref(
                      `Hola, quiero verificar una placa. Paquete: ${item.name}`
                    )}
                    icon={MessageCircle}
                    variant={item.recommended ? "primary" : "secondary"}
                    eventName="whatsapp_click"
                    eventProperties={{
                      location: "packages",
                      package: item.name
                    }}
                  >
                    {item.cta}
                  </CtaButton>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Fuentes" title="Cobertura por capas, no promesas absolutas">
            Cada fuente se registra con estado, fecha, evidencia y nivel de
            confianza.
          </SectionHeading>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coreSources.map((source) => {
              const Icon = source.icon;
              return (
                <div
                  key={source.name}
                  className="flex gap-4 rounded-md border border-line bg-white p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <Icon aria-hidden="true" size={20} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{source.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slateText">
                      {source.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-normal text-brand-700">
                Flujo operativo
              </p>
              <h2 className="text-3xl font-bold text-ink sm:text-4xl">
                Disenado para vender hoy y automatizar despues
              </h2>
              <p className="mt-4 text-base leading-7 text-slateText">
                La primera version prioriza ordenes, evidencias, PDF y WhatsApp.
                Las fuentes se automatizan solo cuando demuestran estabilidad y
                ahorro real.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CtaButton
                  href="/panel"
                  icon={Search}
                  variant="primary"
                  eventName="internal_panel_click"
                  eventProperties={{ location: "operations" }}
                >
                  Ver panel interno
                </CtaButton>
                <CtaButton
                  href="/reporte"
                  icon={FileText}
                  variant="secondary"
                  eventName="report_demo_click"
                  eventProperties={{ location: "operations" }}
                >
                  Ver PDF demo
                </CtaButton>
              </div>
            </div>
            <div className="grid gap-4">
              {operatingSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex gap-4 rounded-md border border-line bg-surface p-5"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-brand-700">
                      <Icon aria-hidden="true" size={20} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slateText">
                        Paso {index + 1}
                      </p>
                      <h3 className="mt-1 font-semibold text-ink">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slateText">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-900 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-normal">
              Empezar con Compra Segura
            </h2>
            <p className="mt-3 max-w-2xl text-white/75">
              La validacion profesional empieza con leads, pagos, tiempos de
              entrega y reclamos medidos desde el primer dia.
            </p>
          </div>
          <Link
            href={whatsappHref(
              "Hola, quiero iniciar una verificacion Compra Segura por placa."
            )}
            data-track="whatsapp_click"
            data-track-props={JSON.stringify({ location: "final_cta" })}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          >
            <MessageCircle aria-hidden="true" size={18} />
            Abrir WhatsApp
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
