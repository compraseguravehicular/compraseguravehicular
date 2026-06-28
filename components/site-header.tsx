import Link from "next/link";
import { FileText, LayoutDashboard, MessageCircle } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { whatsappHref } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="no-print fixed inset-x-0 top-0 z-40 border-b border-white/15 bg-ink/80 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-brand-900">
            <FileText aria-hidden="true" size={19} />
          </span>
          <span>Compra Segura Vehicular</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/85 md:flex">
          <Link href="/#paquetes" className="hover:text-white">
            Paquetes
          </Link>
          <Link href="/reporte" className="hover:text-white">
            Reporte demo
          </Link>
          <Link href="/fuentes" className="hover:text-white">
            Fuentes
          </Link>
          <Link href="/panel" className="hover:text-white">
            Panel
          </Link>
        </nav>
        <div className="hidden sm:block">
          <CtaButton
            href={whatsappHref(
              "Hola, quiero verificar una placa antes de comprar un vehiculo. Paquete: Compra Segura"
            )}
            icon={MessageCircle}
            variant="light"
            eventName="whatsapp_click"
            eventProperties={{ location: "header" }}
          >
            WhatsApp
          </CtaButton>
        </div>
        <Link
          href="/panel"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 sm:hidden"
          aria-label="Abrir panel"
        >
          <LayoutDashboard aria-hidden="true" size={19} />
        </Link>
      </div>
    </header>
  );
}
