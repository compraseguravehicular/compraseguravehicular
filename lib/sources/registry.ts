import type { SourceDefinition } from "@/lib/sources/types";

export const vehicleSourceRegistry: SourceDefinition[] = [
  {
    id: "sunarp_consulta_vehicular",
    name: "SUNARP Consulta Vehicular",
    category: "registral",
    requiredFor: ["express", "compra_segura", "pro"],
    officialUrl: "https://www.sunarp.gob.pe/seccion/servicios/detalles/0/c3.html",
    automationMode: "manual_assisted",
    confidence: "Alta",
    fields: ["caracteristicas", "titularidad", "placa", "estado registral"],
    limitation:
      "SUNARP declara el servicio como gratuito y confiable para ciertos datos, pero la consulta operativa puede requerir interaccion en portal.",
    operatorAction:
      "Abrir fuente oficial, consultar placa, capturar evidencia y registrar titularidad/caracteristicas."
  },
  {
    id: "apeseg_soat",
    name: "SOAT / APESEG",
    category: "circulacion",
    requiredFor: ["express", "compra_segura", "pro"],
    officialUrl: "https://www.apeseg.org.pe/consultas-soat/",
    automationMode: "manual_assisted",
    confidence: "Alta",
    fields: ["estado SOAT", "aseguradora", "vigencia", "historial visible"],
    limitation:
      "APESEG permite verificar estado por placa, pero no publica una API comercial abierta en la pagina consultada.",
    operatorAction:
      "Consultar placa, registrar aseguradora/vigencia y guardar captura si el portal lo permite."
  },
  {
    id: "mtc_citv",
    name: "MTC CITV",
    category: "circulacion",
    requiredFor: ["express", "compra_segura", "pro"],
    officialUrl: "https://portal.mtc.gob.pe/reportedgtt/form/frmconsultaplacaitv.aspx",
    automationMode: "manual_assisted",
    confidence: "Alta",
    fields: ["revision tecnica", "fecha de vencimiento", "planta", "resultado"],
    limitation:
      "Portal estatal con formulario; debe validarse si permite automatizacion estable sin CAPTCHA o token dinamico.",
    operatorAction:
      "Consultar placa, registrar vigencia CITV y marcar alerta si vence pronto o no figura."
  },
  {
    id: "sat_lima_papeletas",
    name: "SAT Lima Papeletas",
    category: "deudas",
    requiredFor: ["express", "compra_segura", "pro"],
    officialUrl: "https://www.sat.gob.pe/VirtualSAT/modulos/papeletas.aspx",
    automationMode: "manual_assisted",
    confidence: "Media",
    fields: ["papeletas", "deuda", "estado", "captura administrativa"],
    limitation:
      "SAT usa sesion web y puede redirigir; automatizar requiere control de cambios y respeto de terminos.",
    operatorAction:
      "Consultar placa, registrar montos/estados y diferenciar deuda de captura administrativa."
  },
  {
    id: "callao_papeletas",
    name: "Callao Papeletas",
    category: "deudas",
    requiredFor: ["express", "compra_segura", "pro"],
    officialUrl: "https://pagopapeletascallao.pe/",
    automationMode: "manual_assisted",
    confidence: "Media",
    fields: ["papeletas Callao", "deuda", "estado"],
    limitation:
      "Portal municipal externo; requiere verificacion operativa de disponibilidad y estabilidad.",
    operatorAction:
      "Consultar placa y registrar deudas o ausencia de resultados con fecha/hora."
  },
  {
    id: "sutran_infracciones",
    name: "SUTRAN",
    category: "infracciones",
    requiredFor: ["express", "compra_segura", "pro"],
    officialUrl: "https://www.gob.pe/sutran",
    automationMode: "manual_assisted",
    confidence: "Media",
    fields: ["record de infracciones", "cinemometro", "actas de control"],
    limitation:
      "La informacion oficial se presenta como tramites/servicios y puede requerir flujo web especifico.",
    operatorAction:
      "Entrar al servicio correspondiente, consultar placa/documento si aplica y registrar evidencia."
  },
  {
    id: "atu_infracciones",
    name: "ATU",
    category: "infracciones",
    requiredFor: ["express", "compra_segura", "pro"],
    officialUrl: "https://www.atu.gob.pe/",
    automationMode: "manual_assisted",
    confidence: "Media",
    fields: ["transporte urbano", "autorizaciones", "sanciones"],
    limitation:
      "ATU puede separar consultas por servicio/autorizacion; requiere flujo manual hasta validar endpoint estable.",
    operatorAction:
      "Validar si la placa figura en servicios autorizados o sanciones relevantes para uso intensivo."
  },
  {
    id: "aap_placas",
    name: "AAP Placas",
    category: "placas",
    requiredFor: ["compra_segura", "pro"],
    officialUrl: "https://aap.org.pe/",
    automationMode: "manual_assisted",
    confidence: "Media",
    fields: ["placa", "asociacion vehicular", "referencias"],
    limitation:
      "Fuente de apoyo, no reemplaza SUNARP ni autoridad estatal.",
    operatorAction:
      "Usar como fuente complementaria cuando aporte trazabilidad de placa o mercado."
  },
  {
    id: "infogas_gnv",
    name: "Infogas / GNV",
    category: "premium",
    requiredFor: ["pro"],
    officialUrl: "https://infogas.com.pe/",
    automationMode: "manual_assisted",
    confidence: "Media",
    fields: ["GNV", "conversion", "uso intensivo", "estado"],
    limitation:
      "La consulta puede depender de portal especializado y disponibilidad del servicio.",
    operatorAction:
      "Consultar si el vehiculo registra conversion GNV o indicios de uso comercial intensivo."
  },
  {
    id: "sunarp_documentos_pagados",
    name: "SUNARP Documentos Pagados",
    category: "premium",
    requiredFor: ["pro"],
    officialUrl: "https://enlinea.sunarp.gob.pe/",
    automationMode: "paid_or_partner",
    confidence: "Alta",
    fields: ["boleta informativa", "gravamenes", "partida", "documentos"],
    limitation:
      "Puede requerir pago, cuenta o documento formal. No debe automatizarse sin autorizacion o flujo permitido.",
    operatorAction:
      "Solicitar autorizacion/pago del documento cuando el caso lo justifique."
  },
  {
    id: "municipalidades_provinciales",
    name: "Municipalidades Provinciales",
    category: "premium",
    requiredFor: ["pro"],
    officialUrl: "https://www.gob.pe/municipalidades",
    automationMode: "blocked",
    confidence: "Baja",
    fields: ["deudas provinciales", "papeletas locales", "tributos"],
    limitation:
      "No existe una fuente unica nacional para todas las municipalidades; requiere matriz por ciudad.",
    operatorAction:
      "Seleccionar municipalidad segun ciudad de operacion y documentar fuente consultada."
  }
];

export function getSourcesForPackage(packageType: string) {
  return vehicleSourceRegistry.filter((source) =>
    source.requiredFor.includes(packageType as never)
  );
}
