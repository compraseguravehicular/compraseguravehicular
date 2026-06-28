# Source Integration Gateway

Compra Segura Vehicular no debe depender de scraping fragil ni de bypass antiabuso. El gateway resuelve las fuentes por tres vias tecnologicas:

1. API de proveedor u organismo autorizado.
2. Worker Playwright solo para flujos permitidos y estables.
3. Matriz de datos por ciudad/proveedor cuando no existe fuente nacional unica.

## Contrato de proveedor

Cada proveedor se configura con dos variables server-side:

```txt
CSV_<SOURCE>_API_URL=
CSV_<SOURCE>_API_KEY=
```

El gateway envia:

```json
{
  "plate": "5075-CD",
  "sourceId": "apeseg_soat",
  "requestedFields": ["estado SOAT", "aseguradora", "vigencia"]
}
```

Headers:

```txt
Authorization: Bearer <CSV_<SOURCE>_API_KEY>
X-API-Key: <CSV_<SOURCE>_API_KEY>
Content-Type: application/json
Accept: application/json
```

Respuesta esperada:

```json
{
  "ok": true,
  "source": "apeseg_soat",
  "plate": "5075-CD",
  "checkedAt": "2026-06-28T21:30:00.000Z",
  "data": {
    "status": "vigente",
    "company": "Proveedor",
    "expiresAt": "2026-12-31"
  },
  "evidence": {
    "type": "api",
    "reference": "provider-request-id"
  }
}
```

El gateway no normaliza respuestas especificas todavia; conserva el payload en `providerPayload` para mapear cada proveedor con seguridad cuando haya contrato real.

## Fuentes configurables

| Fuente | Variables | Estrategia |
| --- | --- | --- |
| SUNARP Consulta Vehicular | `CSV_SUNARP_API_URL`, `CSV_SUNARP_API_KEY` | API/convenio/proveedor autorizado |
| SOAT | `CSV_SOAT_API_URL`, `CSV_SOAT_API_KEY` | API SOAT/proveedor |
| MTC CITV | `CSV_CITV_API_URL`, `CSV_CITV_API_KEY` | API/proveedor CITV |
| SAT Lima | `CSV_SAT_LIMA_API_URL`, `CSV_SAT_LIMA_API_KEY` | API/proveedor con sesion controlada |
| Callao Papeletas | `CSV_CALLAO_API_URL`, `CSV_CALLAO_API_KEY` | API/proveedor municipal |
| AAP / mercado | `CSV_AAP_API_URL`, `CSV_AAP_API_KEY` | API de enriquecimiento |
| Infogas / GNV | `CSV_INFOGAS_API_URL`, `CSV_INFOGAS_API_KEY` | API/proveedor especializado |
| SUNARP documentos | `CSV_SUNARP_DOCS_API_URL`, `CSV_SUNARP_DOCS_API_KEY` | Partner con control de costo |
| Municipalidades | `CSV_MUNICIPAL_MATRIX_API_URL`, `CSV_MUNICIPAL_MATRIX_API_KEY` | Matriz por ciudad |
| Workers | `CSV_WORKER_SIGNING_KEY` | Evidencia firmada y flujos versionados |

## Estados del gateway

- `api_result`: el proveedor devolvio datos estructurados.
- `api_credentials_missing`: faltan URL/API key del proveedor.
- `worker_candidate`: fuente apta para worker versionado.
- `portal_protected`: portal con proteccion antiabuso.
- `session_protected`: flujo con sesion dinamica.
- `partner_required`: requiere partner, pago o convenio.
- `matrix_required`: requiere matriz de datos.
- `unavailable`: portal oficial no disponible.
- `failed`: proveedor configurado fallo.

## Activacion profesional

1. Contratar o validar proveedor.
2. Configurar variables en Vercel.
3. Ejecutar `/api/live-report` con placa de prueba.
4. Revisar `providerPayload` y mapear campos al motor de riesgo.
5. Agregar pruebas por fuente antes de vender esa cobertura como automatizada.
