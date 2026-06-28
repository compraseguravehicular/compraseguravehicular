import type { Metadata } from "next";
import Link from "next/link";
import { ClaimForm } from "@/components/claim-form";
import { LegalPageShell } from "@/components/legal-page-shell";
import { businessConfig, businessIdentityText } from "@/lib/business";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones",
  description:
    "Canal para registrar reclamos o quejas relacionados con Compra Segura Vehicular."
};

export default function ClaimsBookPage() {
  return (
    <LegalPageShell
      eyebrow="Atencion al consumidor"
      title="Libro de Reclamaciones"
      description="Registra una queja o reclamo relacionado con una orden, pago, atencion o entrega del servicio."
    >
      <div className="mb-8 rounded-md border border-brand-100 bg-brand-50 p-4 text-sm leading-6 text-ink">
        <p>
          Reclamo: disconformidad relacionada con el producto o servicio.
          Queja: disconformidad no relacionada directamente con el producto o
          servicio, o malestar por la atencion.
        </p>
        <p className="mt-2">
          {businessIdentityText} Respuesta operativa estimada:
          {" "}{businessConfig.responseSla}.
        </p>
      </div>

      <ClaimForm />

      <div className="mt-8 border-t border-line pt-6 text-sm leading-6 text-slateText">
        <p>
          Referencia oficial: Indecopi mantiene informacion sobre el Libro de
          Reclamaciones y una plataforma para proveedores en{" "}
          <a
            href="https://consumidor.indecopi.gob.pe/tulibro/#/"
            target="_blank"
            rel="noreferrer"
          >
            Tu Libro de Reclamaciones
          </a>
          .
        </p>
        <p className="mt-2">
          Este canal no limita tu derecho a usar otros mecanismos ante Indecopi.
          Tambien puedes escribir a {businessConfig.supportEmail} o volver a los{" "}
          <Link href="/terminos">terminos del servicio</Link>.
        </p>
      </div>
    </LegalPageShell>
  );
}
