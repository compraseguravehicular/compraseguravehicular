import type { SourceDefinition } from "@/lib/sources/types";
import type {
  LiveSourceCheck,
  LiveSourceEvidence,
  LiveSourceStatus,
  PortalAvailability
} from "@/lib/live-sources/types";

type StaticFinding = {
  status: LiveSourceStatus;
  technicalFinding: string;
  limitation: string;
  operatorAction: string;
  evidence: LiveSourceEvidence[];
};

type PortalCheck = {
  availability: PortalAvailability;
  httpStatus?: number;
  detail: string;
};

const requestHeaders = {
  "user-agent":
    "CompraSeguraVehicular/1.0 (+https://compraseguravehicular.vercel.app)",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

const liveSourceFindings: Record<string, StaticFinding> = {
  sunarp_consulta_vehicular: {
    status: "blocked_by_captcha",
    technicalFinding:
      "La consulta operativa de SUNARP carga proteccion Cloudflare Turnstile y un captcha generado por el portal.",
    limitation:
      "No se debe saltar CAPTCHA ni automatizar el flujo con tecnicas evasivas. La verificacion final requiere operador o convenio/API permitido.",
    operatorAction:
      "Abrir SUNARP Consulta Vehicular, ingresar la placa normalizada, resolver validacion humana y adjuntar evidencia del resultado.",
    evidence: [
      {
        label: "SUNARP Consulta Vehicular",
        url: "https://consultavehicular.sunarp.gob.pe/",
        detail: "Fuente oficial para consulta registral vehicular por placa."
      }
    ]
  },
  apeseg_soat: {
    status: "blocked_by_captcha",
    technicalFinding:
      "La consulta SOAT de APESEG usa una aplicacion web con captcha para validar la solicitud por placa.",
    limitation:
      "No existe API publica confirmada para automatizacion directa desde esta aplicacion. Se debe preservar la evidencia consultada manualmente.",
    operatorAction:
      "Consultar SOAT por placa en APESEG, registrar aseguradora, vigencia y captura o constancia disponible.",
    evidence: [
      {
        label: "Consulta SOAT APESEG",
        url: "https://www.apeseg.org.pe/consultas-soat/",
        detail: "Portal oficial de consulta SOAT/CAT por placa."
      }
    ]
  },
  mtc_citv: {
    status: "blocked_by_captcha",
    technicalFinding:
      "El formulario CITV del MTC incluye campo de captcha y tokens de sesion antes de entregar resultados.",
    limitation:
      "La revision tecnica debe consultarse con intervencion humana o integracion autorizada.",
    operatorAction:
      "Consultar CITV por placa, registrar fecha de vencimiento, planta, resultado y evidencia.",
    evidence: [
      {
        label: "MTC Consulta CITV",
        url: "https://portal.mtc.gob.pe/reportedgtt/form/frmconsultaplacaitv.aspx",
        detail: "Fuente oficial de certificados de inspeccion tecnica vehicular."
      }
    ]
  },
  sat_lima_papeletas: {
    status: "session_required",
    technicalFinding:
      "SAT Lima redirige a un flujo ASP.NET con sesion dinamica. El formulario operativo no queda estable como endpoint publico simple.",
    limitation:
      "Automatizarlo exige control de sesion, monitoreo de cambios y validacion legal de uso. Por ahora queda como manual asistida.",
    operatorAction:
      "Abrir SAT Lima, consultar papeletas/deuda por placa, registrar monto, estado y si existe captura administrativa.",
    evidence: [
      {
        label: "SAT Lima Papeletas",
        url: "https://www.sat.gob.pe/VirtualSAT/modulos/papeletas.aspx",
        detail: "Portal municipal para papeletas y deuda en Lima."
      }
    ]
  },
  callao_papeletas: {
    status: "blocked_by_captcha",
    technicalFinding:
      "El portal de papeletas Callao exige captcha, CSRF y datos de formulario antes de mostrar resultados.",
    limitation:
      "No se debe automatizar saltando captcha. La evidencia debe capturarse desde el portal oficial.",
    operatorAction:
      "Consultar placa en Callao, registrar papeletas, deuda y estado con fecha/hora.",
    evidence: [
      {
        label: "Papeletas Callao",
        url: "https://pagopapeletascallao.pe/",
        detail: "Portal de pago y consulta de papeletas del Callao."
      }
    ]
  },
  sutran_infracciones: {
    status: "manual_assisted",
    technicalFinding:
      "SUTRAN publica servicios y tramites separados; la consulta aplicable depende del tipo de infraccion o servicio.",
    limitation:
      "Se necesita seleccionar el servicio correcto y documentar la fuente consultada para no mezclar resultados.",
    operatorAction:
      "Revisar servicios SUTRAN aplicables a placa, actas o cinemometro y registrar evidencia si corresponde.",
    evidence: [
      {
        label: "SUTRAN",
        url: "https://www.gob.pe/sutran",
        detail: "Portal oficial para servicios y consultas de la entidad."
      }
    ]
  },
  atu_infracciones: {
    status: "manual_assisted",
    technicalFinding:
      "ATU separa informacion por autorizaciones, servicios y sanciones; no se confirmo endpoint unico estable por placa.",
    limitation:
      "Debe revisarse segun tipo de vehiculo y uso probable, especialmente transporte urbano o uso intensivo.",
    operatorAction:
      "Validar si la placa figura en autorizaciones, sanciones o servicios ATU y guardar evidencia.",
    evidence: [
      {
        label: "ATU",
        url: "https://www.atu.gob.pe/",
        detail: "Portal oficial de la Autoridad de Transporte Urbano."
      }
    ]
  },
  aap_placas: {
    status: "manual_assisted",
    technicalFinding:
      "AAP funciona como fuente complementaria de mercado/placas, no reemplaza fuentes registrales oficiales.",
    limitation:
      "Solo debe usarse para enriquecer contexto, nunca como evidencia principal de titularidad o deudas.",
    operatorAction:
      "Usar AAP como apoyo de trazabilidad cuando aporte informacion relevante al caso.",
    evidence: [
      {
        label: "AAP",
        url: "https://aap.org.pe/",
        detail: "Fuente complementaria del ecosistema vehicular peruano."
      }
    ]
  },
  infogas_gnv: {
    status: "blocked_by_captcha",
    technicalFinding:
      "La consulta de Infogas/GNV carga validaciones antiabuso, incluyendo reCAPTCHA o proteccion similar.",
    limitation:
      "La verificacion de GNV o uso intensivo requiere consulta manual o acceso autorizado.",
    operatorAction:
      "Consultar placa en Infogas, registrar conversion GNV, estado y senales de uso intensivo.",
    evidence: [
      {
        label: "Infogas",
        url: "https://infogas.com.pe/",
        detail: "Fuente para informacion relacionada con GNV."
      }
    ]
  },
  sunarp_documentos_pagados: {
    status: "paid_or_partner",
    technicalFinding:
      "Los documentos SUNARP de mayor valor pueden requerir cuenta, pago, autorizacion o flujo formal.",
    limitation:
      "No debe ejecutarse compra de documentos sin consentimiento del cliente y control de costos.",
    operatorAction:
      "Solicitar autorizacion del cliente, comprar documento cuando aplique y adjuntar constancia oficial.",
    evidence: [
      {
        label: "SUNARP en linea",
        url: "https://enlinea.sunarp.gob.pe/",
        detail: "Portal oficial para servicios registrales en linea."
      }
    ]
  },
  municipalidades_provinciales: {
    status: "blocked",
    technicalFinding:
      "No existe fuente unica nacional para todas las municipalidades provinciales con consulta uniforme por placa.",
    limitation:
      "La cobertura debe construirse como matriz por ciudad con URL, requisitos y evidencia esperada.",
    operatorAction:
      "Seleccionar municipalidad segun ciudad de uso/venta y documentar fuente local consultada.",
    evidence: [
      {
        label: "Municipalidades en Gob.pe",
        url: "https://www.gob.pe/estado/gobiernos-locales",
        detail: "Directorio oficial para ubicar municipalidades y servicios locales."
      }
    ]
  }
};

function availabilityFromStatus(status: number): PortalAvailability {
  if (status >= 200 && status < 400) {
    return "online";
  }

  if ([401, 403, 405, 409, 422, 429].includes(status)) {
    return "protected";
  }

  if (status >= 500) {
    return "offline";
  }

  return "unknown";
}

async function tryRequest(url: string, method: "HEAD" | "GET") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal
    });

    return {
      ok: true,
      status: response.status,
      url: response.url
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkPortal(url: string): Promise<PortalCheck> {
  const head = await tryRequest(url, "HEAD");

  if (head.ok && head.status && ![405, 501].includes(head.status)) {
    return {
      availability: availabilityFromStatus(head.status),
      httpStatus: head.status,
      detail: `Respuesta HEAD ${head.status}.`
    };
  }

  const get = await tryRequest(url, "GET");

  if (get.ok && get.status) {
    return {
      availability: availabilityFromStatus(get.status),
      httpStatus: get.status,
      detail: `Respuesta GET ${get.status}.`
    };
  }

  return {
    availability: "unknown",
    detail:
      "No se pudo confirmar disponibilidad con una solicitud segura de lectura."
  };
}

export async function validateLiveSource(
  source: SourceDefinition,
  plate: string
): Promise<LiveSourceCheck> {
  const finding =
    liveSourceFindings[source.id] ??
    ({
      status: "manual_assisted",
      technicalFinding:
        "Fuente registrada sin adaptador especifico. Se mantiene como manual asistida hasta validar automatizacion.",
      limitation:
        "No hay suficiente evidencia tecnica para automatizar esta fuente con seguridad.",
      operatorAction: source.operatorAction,
      evidence: [
        {
          label: source.name,
          url: source.officialUrl,
          detail: "Fuente oficial o fuente operativa registrada."
        }
      ]
    } satisfies StaticFinding);

  const portal = await checkPortal(source.officialUrl);
  const checkedAt = new Date().toISOString();
  const status =
    portal.availability === "offline" ? "unavailable" : finding.status;

  const availabilityLabel =
    portal.availability === "online"
      ? "portal disponible"
      : portal.availability === "protected"
        ? "portal protegido"
        : portal.availability === "offline"
          ? "portal no disponible"
          : "disponibilidad no confirmada";

  return {
    sourceId: source.id,
    sourceName: source.name,
    category: source.category,
    officialUrl: source.officialUrl,
    plate,
    status,
    availability: portal.availability,
    httpStatus: portal.httpStatus,
    confidence: source.confidence,
    checkedAt,
    fields: source.fields,
    summary: `${source.name}: ${availabilityLabel} para revisar placa ${plate}. ${finding.operatorAction}`,
    technicalFinding: `${finding.technicalFinding} ${portal.detail}`,
    limitation: finding.limitation,
    operatorAction: finding.operatorAction,
    evidence: finding.evidence
  };
}
