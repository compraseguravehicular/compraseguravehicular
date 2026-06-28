import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { businessConfig } from "@/lib/business";
import { whatsappHref } from "@/lib/utils";

const legalLinks = [
  { href: "/terminos", label: "Terminos" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/consentimiento", label: "Consentimiento" },
  { href: "/libro-de-reclamaciones", label: "Reclamaciones" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="font-semibold text-ink">{businessConfig.brandName}</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slateText">
            {businessConfig.reportDisclaimer}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-ink">
            Legal
          </p>
          <nav className="mt-3 grid gap-2 text-sm text-slateText">
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-ink">
            Contacto
          </p>
          <div className="mt-3 grid gap-2 text-sm text-slateText">
            <a
              href={`mailto:${businessConfig.supportEmail}`}
              className="inline-flex items-center gap-2 hover:text-ink"
            >
              <Mail aria-hidden="true" size={16} />
              {businessConfig.supportEmail}
            </a>
            <a
              href={whatsappHref("Hola, necesito informacion sobre Compra Segura Vehicular.")}
              className="inline-flex items-center gap-2 hover:text-ink"
              data-track="whatsapp_click"
              data-track-props={JSON.stringify({ location: "footer" })}
            >
              <MessageCircle aria-hidden="true" size={16} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
