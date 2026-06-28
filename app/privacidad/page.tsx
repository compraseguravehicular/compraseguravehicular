import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { businessConfig, businessIdentityText } from "@/lib/business";

export const metadata: Metadata = {
  title: "Politica de privacidad",
  description:
    "Politica de privacidad y tratamiento de datos personales de Compra Segura Vehicular."
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Datos personales"
      title="Politica de privacidad"
      description="Informacion sobre datos tratados, finalidades, conservacion, proveedores tecnologicos y derechos del titular."
    >
      <h2>1. Responsable</h2>
      <p>
        Responsable del tratamiento: {businessIdentityText} Contacto:
        {" "}{businessConfig.supportEmail}.
      </p>

      <h2>2. Marco de referencia</h2>
      <p>
        Esta politica toma como referencia la Ley N. 29733, Ley de Proteccion
        de Datos Personales, y su normativa complementaria en Peru. La autoridad
        competente puede actualizar criterios o reglamentos, por lo que el
        negocio debera mantener revision periodica. Puedes revisar la norma en
        el portal oficial de{" "}
        <a
          href="https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales/243470-29733"
          target="_blank"
          rel="noreferrer"
        >
          gob.pe
        </a>
        .
      </p>

      <h2>3. Datos tratados</h2>
      <p>
        Podemos tratar nombre, telefono, email, ciudad, placa, tipo de vehiculo,
        datos del anuncio, datos del vendedor entregados por el cliente,
        comprobantes de pago, comunicaciones, reclamos y evidencias necesarias
        para elaborar el reporte.
      </p>

      <h2>4. Finalidades</h2>
      <ul>
        <li>Crear y administrar ordenes de verificacion vehicular.</li>
        <li>Validar pagos y entregar reportes.</li>
        <li>Consultar fuentes disponibles para el diagnostico solicitado.</li>
        <li>Atender soporte, reclamos y auditoria interna.</li>
        <li>Medir conversiones y rendimiento del sitio sin vender datos personales.</li>
      </ul>

      <h2>5. Proveedores</h2>
      <p>
        La operacion puede usar proveedores tecnologicos como Vercel, Supabase,
        WhatsApp, correo electronico, pasarelas de pago y herramientas de
        analitica. Solo se comparte informacion necesaria para prestar el
        servicio, operar seguridad o cumplir obligaciones.
      </p>

      <h2>6. Conservacion</h2>
      <p>
        Los datos se conservan mientras exista una finalidad operativa,
        contractual, contable, legal o de soporte. Luego pueden eliminarse,
        anonimizarse o conservarse bloqueados cuando corresponda.
      </p>

      <h2>7. Derechos del titular</h2>
      <p>
        El titular puede solicitar acceso, rectificacion, cancelacion u oposicion
        al tratamiento cuando corresponda, escribiendo a{" "}
        {businessConfig.supportEmail}. La solicitud debe incluir identificacion
        suficiente para validar titularidad.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        El sistema usa variables de entorno, procesamiento server-side,
        restricciones de base de datos y principio de minimo acceso. Ninguna
        medida es absoluta, pero se aplican controles razonables para reducir
        riesgos de acceso no autorizado.
      </p>

      <h2>9. Cookies y analitica</h2>
      <p>
        El sitio puede usar analitica de Vercel para medir visitas, rendimiento
        y eventos de conversion. Los eventos personalizados no deben incluir
        placa, nombre, telefono, email ni datos de pago.
      </p>
    </LegalPageShell>
  );
}
