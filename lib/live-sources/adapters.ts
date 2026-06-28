import type { SourceDefinition } from "@/lib/sources/types";
import type {
  IntegrationMode,
  LiveSourceCheck,
  LiveSourceEvidence,
  LiveSourceStatus,
  PortalAvailability
} from "@/lib/live-sources/types";

type IntegrationBlueprint = {
  statusWhenUnconfigured: LiveSourceStatus;
  integrationMode: IntegrationMode;
  providerName: string;
  requiredEnv: string[];
  technicalFinding: string;
  limitation: string;
  nextTechnologyStep: string;
  evidence: LiveSourceEvidence[];
};

type PortalCheck = {
  availability: PortalAvailability;
  httpStatus?: number;
  detail: string;
};

type ProviderCall =
  | {
      ok: true;
      httpStatus: number;
      payload: unknown;
      detail: string;
    }
  | {
      ok: false;
      status: LiveSourceStatus;
      httpStatus?: number;
      detail: string;
    };

const requestHeaders = {
  "user-agent":
    "CompraSeguraVehicular/1.0 (+https://compraseguravehicular.vercel.app)",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

const sourceBlueprints: Record<string, IntegrationBlueprint> = {
  sunarp_consulta_vehicular: {
    statusWhenUnconfigured: "api_credentials_missing",
    integrationMode: "provider_api",
    providerName: "SUNARP API Provider",
    requiredEnv: ["CSV_SUNARP_API_URL", "CSV_SUNARP_API_KEY"],
    technicalFinding:
      "SUNARP publica consulta por placa con validacion antiabuso en el portal web. La solucion tecnologica estable es API oficial, convenio o proveedor autorizado.",
    limitation:
      "El portal web no debe usarse como API oculta. Para produccion se requiere contrato/API con cuotas, auditoria y respuesta estructurada.",
    nextTechnologyStep:
      "Configurar CSV_SUNARP_API_URL y CSV_SUNARP_API_KEY para recibir datos registrales estructurados por placa.",
    evidence: [
      {
        label: "SUNARP Consulta Vehicular",
        url: "https://consultavehicular.sunarp.gob.pe/",
        detail: "Fuente oficial de consulta vehicular por placa."
      }
    ]
  },
  apeseg_soat: {
    statusWhenUnconfigured: "api_credentials_missing",
    integrationMode: "provider_api",
    providerName: "SOAT API Provider",
    requiredEnv: ["CSV_SOAT_API_URL", "CSV_SOAT_API_KEY"],
    technicalFinding:
      "APESEG expone consulta web de SOAT por placa con validacion antiabuso. La via de producto es API de SOAT o convenio con proveedor.",
    limitation:
      "Sin token de proveedor no se puede obtener aseguradora, estado o vigencia de forma estructurada y confiable.",
    nextTechnologyStep:
      "Configurar CSV_SOAT_API_URL y CSV_SOAT_API_KEY para devolver estado, aseguradora y vigencia.",
    evidence: [
      {
        label: "Consulta SOAT APESEG",
        url: "https://www.apeseg.org.pe/consultas-soat/",
        detail: "Portal de referencia para consulta SOAT/CAT por placa."
      }
    ]
  },
  mtc_citv: {
    statusWhenUnconfigured: "api_credentials_missing",
    integrationMode: "provider_api",
    providerName: "CITV API Provider",
    requiredEnv: ["CSV_CITV_API_URL", "CSV_CITV_API_KEY"],
    technicalFinding:
      "MTC CITV usa formulario con validacion antiabuso y tokens. La resolucion profesional es API autorizada o proveedor que entregue vigencia CITV.",
    limitation:
      "Un worker no debe evadir protecciones ni depender de tokens privados del portal.",
    nextTechnologyStep:
      "Configurar CSV_CITV_API_URL y CSV_CITV_API_KEY para obtener vencimiento, planta y resultado de inspeccion.",
    evidence: [
      {
        label: "MTC Consulta CITV",
        url: "https://portal.mtc.gob.pe/reportedgtt/form/frmconsultaplacaitv.aspx",
        detail: "Portal oficial de certificados de inspeccion tecnica vehicular."
      }
    ]
  },
  sat_lima_papeletas: {
    statusWhenUnconfigured: "session_protected",
    integrationMode: "provider_api",
    providerName: "SAT Lima API Provider",
    requiredEnv: ["CSV_SAT_LIMA_API_URL", "CSV_SAT_LIMA_API_KEY"],
    technicalFinding:
      "SAT Lima funciona con sesion web dinamica. Para escalar se necesita API, proveedor de datos o integracion autorizada con control de sesiones.",
    limitation:
      "No conviene depender de HTML dinamico del SAT para vender reportes de alto volumen.",
    nextTechnologyStep:
      "Configurar CSV_SAT_LIMA_API_URL y CSV_SAT_LIMA_API_KEY para devolver papeletas, deuda, estado y captura administrativa.",
    evidence: [
      {
        label: "SAT Lima Papeletas",
        url: "https://www.sat.gob.pe/VirtualSAT/modulos/papeletas.aspx",
        detail: "Portal municipal para papeletas y deuda en Lima."
      }
    ]
  },
  callao_papeletas: {
    statusWhenUnconfigured: "api_credentials_missing",
    integrationMode: "provider_api",
    providerName: "Callao Papeletas API Provider",
    requiredEnv: ["CSV_CALLAO_API_URL", "CSV_CALLAO_API_KEY"],
    technicalFinding:
      "Callao usa validacion antiabuso y CSRF en portal web. En produccion se requiere API/proveedor o convenio municipal.",
    limitation:
      "El flujo web sirve para consulta individual, pero no como backend de producto escalable.",
    nextTechnologyStep:
      "Configurar CSV_CALLAO_API_URL y CSV_CALLAO_API_KEY para consultar papeletas y deuda por placa.",
    evidence: [
      {
        label: "Papeletas Callao",
        url: "https://pagopapeletascallao.pe/",
        detail: "Portal de pago y consulta de papeletas del Callao."
      }
    ]
  },
  sutran_infracciones: {
    statusWhenUnconfigured: "worker_candidate",
    integrationMode: "browser_worker",
    providerName: "SUTRAN Worker",
    requiredEnv: ["CSV_WORKER_SIGNING_KEY"],
    technicalFinding:
      "SUTRAN publica servicios separados. La solucion es un worker con flujos por servicio, evidencia y monitoreo de cambios.",
    limitation:
      "Antes de activar el worker hay que fijar el servicio exacto, selectores, rate limits y esquema de evidencia.",
    nextTechnologyStep:
      "Crear flujo Playwright versionado para el servicio SUTRAN aplicable y firmar evidencias con CSV_WORKER_SIGNING_KEY.",
    evidence: [
      {
        label: "SUTRAN",
        url: "https://www.gob.pe/sutran",
        detail: "Portal oficial para servicios y consultas de la entidad."
      }
    ]
  },
  atu_infracciones: {
    statusWhenUnconfigured: "worker_candidate",
    integrationMode: "browser_worker",
    providerName: "ATU Worker",
    requiredEnv: ["CSV_WORKER_SIGNING_KEY"],
    technicalFinding:
      "ATU separa datos por autorizaciones, sanciones y servicios. Requiere worker por flujo o API de proveedor.",
    limitation:
      "No hay endpoint unico confirmado por placa para todos los casos de uso.",
    nextTechnologyStep:
      "Mapear flujo ATU por tipo de vehiculo y activar worker con evidencia firmada.",
    evidence: [
      {
        label: "ATU",
        url: "https://www.atu.gob.pe/",
        detail: "Portal oficial de la Autoridad de Transporte Urbano."
      }
    ]
  },
  aap_placas: {
    statusWhenUnconfigured: "api_credentials_missing",
    integrationMode: "provider_api",
    providerName: "AAP / Mercado API Provider",
    requiredEnv: ["CSV_AAP_API_URL", "CSV_AAP_API_KEY"],
    technicalFinding:
      "AAP es una fuente complementaria. Para usarla en producto debe entrar como API de enriquecimiento o dataset licenciado.",
    limitation:
      "No reemplaza SUNARP, SOAT ni entidades oficiales.",
    nextTechnologyStep:
      "Configurar CSV_AAP_API_URL y CSV_AAP_API_KEY para enriquecer contexto de placa/mercado.",
    evidence: [
      {
        label: "AAP",
        url: "https://aap.org.pe/",
        detail: "Fuente complementaria del ecosistema vehicular peruano."
      }
    ]
  },
  infogas_gnv: {
    statusWhenUnconfigured: "api_credentials_missing",
    integrationMode: "provider_api",
    providerName: "Infogas / GNV API Provider",
    requiredEnv: ["CSV_INFOGAS_API_URL", "CSV_INFOGAS_API_KEY"],
    technicalFinding:
      "Infogas/GNV protege la consulta web. La via estable es integracion autorizada o proveedor especializado.",
    limitation:
      "No se debe depender de protecciones antiabuso como parte del backend.",
    nextTechnologyStep:
      "Configurar CSV_INFOGAS_API_URL y CSV_INFOGAS_API_KEY para devolver conversion GNV y senales de uso intensivo.",
    evidence: [
      {
        label: "Infogas",
        url: "https://infogas.com.pe/",
        detail: "Fuente para informacion relacionada con GNV."
      }
    ]
  },
  sunarp_documentos_pagados: {
    statusWhenUnconfigured: "partner_required",
    integrationMode: "partner_api",
    providerName: "SUNARP Document Provider",
    requiredEnv: ["CSV_SUNARP_DOCS_API_URL", "CSV_SUNARP_DOCS_API_KEY"],
    technicalFinding:
      "Los documentos registrales requieren cuenta, pago, autorizacion o integracion formal.",
    limitation:
      "El costo y consentimiento del cliente deben quedar trazados antes de comprar documentos.",
    nextTechnologyStep:
      "Configurar CSV_SUNARP_DOCS_API_URL y CSV_SUNARP_DOCS_API_KEY con control de costo por documento.",
    evidence: [
      {
        label: "SUNARP en linea",
        url: "https://enlinea.sunarp.gob.pe/",
        detail: "Portal oficial para servicios registrales en linea."
      }
    ]
  },
  municipalidades_provinciales: {
    statusWhenUnconfigured: "matrix_required",
    integrationMode: "data_matrix",
    providerName: "Municipal Matrix Engine",
    requiredEnv: ["CSV_MUNICIPAL_MATRIX_API_URL", "CSV_MUNICIPAL_MATRIX_API_KEY"],
    technicalFinding:
      "No existe fuente unica nacional para municipalidades provinciales. La solucion es matriz por ciudad con adaptador propio.",
    limitation:
      "Cada ciudad puede tener portal, requisitos, campos y estabilidad diferentes.",
    nextTechnologyStep:
      "Configurar CSV_MUNICIPAL_MATRIX_API_URL y CSV_MUNICIPAL_MATRIX_API_KEY para resolver ciudad, portal y adaptador.",
    evidence: [
      {
        label: "Municipalidades en Gob.pe",
        url: "https://www.gob.pe/estado/gobiernos-locales",
        detail: "Directorio oficial para ubicar municipalidades y servicios locales."
      }
    ]
  }
};

function envValue(name: string) {
  return process.env[name]?.trim();
}

function missingEnv(requiredEnv: string[]) {
  return requiredEnv.filter((name) => !envValue(name));
}

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

async function callConfiguredProvider(
  blueprint: IntegrationBlueprint,
  source: SourceDefinition,
  plate: string
): Promise<ProviderCall | undefined> {
  const [urlEnv, keyEnv] = blueprint.requiredEnv;
  const endpoint = urlEnv ? envValue(urlEnv) : undefined;
  const apiKey = keyEnv ? envValue(keyEnv) : undefined;

  if (!endpoint || !apiKey) {
    return undefined;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        authorization: `Bearer ${apiKey}`,
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        plate,
        sourceId: source.id,
        requestedFields: source.fields
      }),
      cache: "no-store",
      signal: controller.signal
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return {
        ok: false,
        status: response.status === 401 || response.status === 403
          ? "api_credentials_missing"
          : "failed",
        httpStatus: response.status,
        detail: `Proveedor ${blueprint.providerName} respondio HTTP ${response.status}.`
      };
    }

    return {
      ok: true,
      httpStatus: response.status,
      payload,
      detail: `Proveedor ${blueprint.providerName} devolvio datos estructurados HTTP ${response.status}.`
    };
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      detail:
        error instanceof Error
          ? `Proveedor ${blueprint.providerName} fallo: ${error.message}.`
          : `Proveedor ${blueprint.providerName} fallo.`
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function validateLiveSource(
  source: SourceDefinition,
  plate: string
): Promise<LiveSourceCheck> {
  const blueprint =
    sourceBlueprints[source.id] ??
    ({
      statusWhenUnconfigured: "worker_candidate",
      integrationMode: "browser_worker",
      providerName: `${source.name} Worker`,
      requiredEnv: ["CSV_WORKER_SIGNING_KEY"],
      technicalFinding:
        "Fuente registrada sin integracion especifica. Queda como candidata a worker o proveedor API.",
      limitation:
        "Se requiere disenar adaptador, contrato de datos y evidencia antes de usarla en produccion.",
      nextTechnologyStep:
        "Crear adaptador dedicado, configurar credenciales y registrar esquema de respuesta.",
      evidence: [
        {
          label: source.name,
          url: source.officialUrl,
          detail: "Fuente oficial o fuente operativa registrada."
        }
      ]
    } satisfies IntegrationBlueprint);

  const [provider, portal] = await Promise.all([
    callConfiguredProvider(blueprint, source, plate),
    checkPortal(source.officialUrl)
  ]);
  const checkedAt = new Date().toISOString();
  const missing = missingEnv(blueprint.requiredEnv);
  const providerConfigured = missing.length === 0;
  const providerPayload = provider?.ok ? provider.payload : undefined;
  const status =
    provider?.ok
      ? "api_result"
      : provider?.ok === false
        ? provider.status
        : portal.availability === "offline"
          ? "unavailable"
          : blueprint.statusWhenUnconfigured;
  const availabilityLabel =
    portal.availability === "online"
      ? "portal visible"
      : portal.availability === "protected"
        ? "portal protegido"
        : portal.availability === "offline"
          ? "portal no disponible"
          : "portal no confirmado";
  const integrationLabel =
    status === "api_result"
      ? "datos estructurados recibidos"
      : providerConfigured
        ? "proveedor configurado sin resultado exitoso"
        : "credenciales de integracion pendientes";
  const providerDetail = provider
    ? provider.detail
    : providerConfigured
      ? "Proveedor configurado, pero no se ejecuto llamada."
      : `Faltan variables: ${missing.join(", ")}.`;

  return {
    sourceId: source.id,
    sourceName: source.name,
    category: source.category,
    officialUrl: source.officialUrl,
    plate,
    status,
    integrationMode: blueprint.integrationMode,
    providerName: blueprint.providerName,
    providerConfigured,
    requiredEnv: blueprint.requiredEnv,
    availability: portal.availability,
    httpStatus: provider?.httpStatus ?? portal.httpStatus,
    confidence: source.confidence,
    checkedAt,
    fields: source.fields,
    summary: `${source.name}: ${integrationLabel} para ${plate}; ${availabilityLabel}.`,
    technicalFinding: `${blueprint.technicalFinding} ${portal.detail} ${providerDetail}`,
    limitation: blueprint.limitation,
    operatorAction: blueprint.nextTechnologyStep,
    nextTechnologyStep: blueprint.nextTechnologyStep,
    evidence: blueprint.evidence,
    providerPayload
  };
}
