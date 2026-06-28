import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { businessConfig } from "@/lib/business";

export const metadata: Metadata = {
  title: "Consentimiento informado",
  description:
    "Consentimiento informado para solicitar una verificacion vehicular por placa."
};

export default function ConsentPage() {
  return (
    <LegalPageShell
      eyebrow="Autorizacion de consulta"
      title="Consentimiento informado"
      description="Condiciones que acepta el cliente al solicitar un reporte vehicular informativo."
    >
      <h2>1. Solicitud voluntaria</h2>
      <p>
        Al solicitar el servicio, el cliente autoriza a {businessConfig.brandName}
        a registrar sus datos de contacto, datos del vehiculo y contexto de
        compra para elaborar un reporte informativo.
      </p>

      <h2>2. Fuentes</h2>
      <p>
        La revision puede incluir fuentes publicas, portales institucionales,
        bases accesibles para consulta, documentos enviados por el cliente,
        evidencias del anuncio y verificaciones manuales. Cada fuente puede
        tener disponibilidad, precision y tiempos distintos.
      </p>

      <h2>3. Datos de terceros</h2>
      <p>
        Si el cliente entrega datos del vendedor u otra persona, declara que
        cuenta con una base legitima para compartirlos en el contexto de una
        posible compraventa vehicular y que no solicita usos abusivos.
      </p>

      <h2>4. Limitaciones</h2>
      <p>
        El resultado no certifica propiedad, ausencia absoluta de cargas,
        condicion mecanica, kilometraje real ni inexistencia de problemas no
        visibles en las fuentes consultadas.
      </p>

      <h2>5. Revocatoria</h2>
      <p>
        El cliente puede pedir detener el procesamiento antes de que el equipo
        inicie la revision operativa. Si ya se generaron consultas, evidencias o
        trabajo humano, la atencion se regira por los terminos comerciales.
      </p>
    </LegalPageShell>
  );
}
