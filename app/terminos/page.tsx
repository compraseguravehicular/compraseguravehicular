import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal-page-shell";
import { businessConfig, businessIdentityText } from "@/lib/business";

export const metadata: Metadata = {
  title: "Terminos y condiciones",
  description:
    "Terminos comerciales del servicio informativo Compra Segura Vehicular."
};

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Condiciones comerciales"
      title="Terminos y condiciones"
      description="Reglas de contratacion, alcance del servicio, pagos, entrega y limites del reporte vehicular informativo."
    >
      <h2>1. Identificacion del servicio</h2>
      <p>
        {businessConfig.brandName} presta un servicio informativo de verificacion
        vehicular orientado a compradores de vehiculos usados en Peru.
      </p>
      <p>
        {businessIdentityText} Correo de soporte: {businessConfig.supportEmail}.
      </p>

      <h2>2. Alcance</h2>
      <p>
        El reporte organiza informacion disponible en fuentes publicas,
        privadas accesibles, documentos enviados por el cliente y revision
        operativa humana. El resultado se presenta como evidencia, semaforo de
        riesgo y recomendacion informativa.
      </p>
      <p>
        El servicio no reemplaza certificados oficiales, asesoria legal,
        transferencia notarial, peritaje mecanico, tasacion formal ni
        verificacion presencial del vehiculo.
      </p>

      <h2>3. Ordenes y pago</h2>
      <p>
        La orden se considera recibida cuando el cliente completa el formulario
        o contacta por WhatsApp. La atencion operativa inicia cuando se confirma
        el pago o cuando el equipo autoriza expresamente la revision.
      </p>
      <p>
        Los medios iniciales son Yape, Plin, transferencia o enlace de pago si
        estuviera disponible. El cliente debe enviar comprobante cuando el pago
        no pueda validarse automaticamente.
      </p>

      <h2>4. Entrega</h2>
      <p>
        El plazo depende del paquete contratado, disponibilidad de fuentes y
        calidad de los datos recibidos. Si una fuente esta temporalmente caida o
        exige validacion manual, el reporte indicara el estado correspondiente.
      </p>

      <h2>5. Reprogramaciones y devoluciones</h2>
      <p>
        Si la orden todavia no fue procesada, el cliente puede solicitar cambio
        de placa o cancelacion. Si el servicio ya fue iniciado, la devolucion se
        evalua segun avance, error atribuible al servicio y evidencia generada.
      </p>

      <h2>6. Uso responsable</h2>
      <p>
        El cliente declara que usara el reporte para una decision de compra
        licita y que no empleara la informacion para acoso, discriminacion,
        fraude, suplantacion o fines contrarios a la ley.
      </p>

      <h2>7. Reclamos</h2>
      <p>
        Cualquier reclamo o queja puede registrarse en el{" "}
        <Link href="/libro-de-reclamaciones">Libro de Reclamaciones</Link> o
        mediante el correo {businessConfig.supportEmail}.
      </p>

      <h2>8. Cambios</h2>
      <p>
        Estos terminos pueden actualizarse por cambios operativos, legales o
        comerciales. La version publicada en el sitio sera la aplicable al
        momento de contratacion, salvo acuerdo distinto por escrito.
      </p>
    </LegalPageShell>
  );
}
