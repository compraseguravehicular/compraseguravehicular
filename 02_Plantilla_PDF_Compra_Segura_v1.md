# Plantilla PDF Compra Segura v1

Fecha: 28 de junio de 2026  
Uso: reporte entregable al cliente final.  
Formato objetivo: PDF generado desde HTML con datos estructurados.  
Tono: profesional, claro, sobrio y no alarmista.

## 1. Principios Del Reporte

El PDF debe cumplir cuatro objetivos:

- Responder rapido si el vehiculo conviene o no.
- Mostrar evidencia y fuentes, no opiniones sueltas.
- Separar hechos, limites e inferencias.
- Reducir riesgo legal con lenguaje informativo y no absoluto.

Regla central:

> Cada alerta debe tener fuente, fecha/hora, estado y nivel de confianza.

## 2. Portada

Titulo:

Reporte Compra Segura Vehicular

Subtitulo:

Diagnostico informativo por placa con fuentes disponibles, evidencia y recomendacion.

Campos:

- Codigo de reporte: {{report_code}}
- Placa: {{plate}}
- Paquete: {{package_type}}
- Fecha de emision: {{issued_at}}
- Cliente: {{customer_name}}
- Ciudad principal: {{city}}

Bloque de resultado:

- Semaforo: {{risk_level}}
- Recomendacion: {{recommendation}}
- Tiempo de consulta: {{processing_time}}

Microcopy:

Este reporte es informativo. No reemplaza certificados oficiales ni revision mecanica presencial.

## 3. Resumen Ejecutivo

Titulo:

Resultado General

Texto dinamico por riesgo:

### Verde

No se detectaron alertas relevantes en las fuentes consultadas. La compra puede continuar, siempre que se realice revision mecanica, validacion de documentos originales y firma por canal formal.

### Amarillo

Se detectaron observaciones que deben revisarse antes de pagar o firmar. Recomendamos negociar, pedir documentos adicionales o regularizar las alertas indicadas.

### Rojo

Se detectaron alertas relevantes que pueden afectar la compra. Recomendamos no pagar ni firmar hasta que el vendedor regularice o sustente la situacion con documentos oficiales.

Campos:

- Riesgos principales:
  - {{top_risk_1}}
  - {{top_risk_2}}
  - {{top_risk_3}}
- Accion recomendada:
  - {{next_action}}

## 4. Datos Del Vehiculo

Tabla:

| Campo | Resultado | Fuente | Confianza |
|---|---|---|---|
| Placa | {{plate}} | {{source_plate}} | {{confidence_plate}} |
| Marca | {{brand}} | {{source_brand}} | {{confidence_brand}} |
| Modelo | {{model}} | {{source_model}} | {{confidence_model}} |
| Color | {{color}} | {{source_color}} | {{confidence_color}} |
| VIN / Serie | {{vin_masked}} | {{source_vin}} | {{confidence_vin}} |
| Motor | {{engine_masked}} | {{source_engine}} | {{confidence_engine}} |
| Titular / coincidencia | {{owner_match_summary}} | {{source_owner}} | {{confidence_owner}} |
| Estado registral | {{registry_status}} | {{source_registry}} | {{confidence_registry}} |

Nota de datos personales:

Por proteccion de datos personales, el reporte puede mostrar datos minimizados o parcialmente ocultos cuando no sean necesarios para la decision.

## 5. Semaforo De Riesgo

Bloque visual:

- Verde: riesgo bajo segun fuentes consultadas.
- Amarillo: riesgo medio; requiere revision o regularizacion.
- Rojo: riesgo alto; no avanzar sin sustento.

Resultado:

{{risk_level}} - {{risk_summary}}

Score interno:

{{risk_score}} / 100

Nota:

El score es una herramienta interna de interpretacion. No representa certificacion oficial.

## 6. Estado Documentario Y Legal

Tabla:

| Categoria | Estado | Detalle | Riesgo |
|---|---|---|---|
| SUNARP consulta vehicular | {{sunarp_status}} | {{sunarp_summary}} | {{sunarp_risk}} |
| Titularidad / coincidencia | {{owner_status}} | {{owner_summary}} | {{owner_risk}} |
| Gravamenes / cargas | {{lien_status}} | {{lien_summary}} | {{lien_risk}} |
| Robo/anotacion | {{theft_status}} | {{theft_summary}} | {{theft_risk}} |
| Documentos SUNARP pagados | {{sunarp_paid_status}} | {{sunarp_paid_summary}} | {{sunarp_paid_risk}} |

Regla:

Si no se consulto un documento pagado, mostrar:

No consultado en este paquete. Para mayor certeza registral, solicitar Boleta Informativa, Certificado Registral Vehicular o Copia Literal segun el caso.

## 7. Circulacion

Tabla:

| Fuente | Resultado | Vigencia / monto | Riesgo |
|---|---|---|---|
| SOAT / APESEG | {{soat_status}} | {{soat_validity}} | {{soat_risk}} |
| SBS SOAT/CAT | {{sbs_status}} | {{sbs_summary}} | {{sbs_risk}} |
| Revision tecnica MTC | {{citv_status}} | {{citv_validity}} | {{citv_risk}} |
| AAP / placa | {{aap_status}} | {{aap_summary}} | {{aap_risk}} |

Texto dinamico:

{{circulation_recommendation}}

## 8. Multas, Deudas E Infracciones

Tabla:

| Fuente | Cobertura | Resultado | Riesgo |
|---|---|---|---|
| SAT Lima | Lima | {{sat_lima_summary}} | {{sat_lima_risk}} |
| SAT captura administrativa | Lima | {{sat_capture_summary}} | {{sat_capture_risk}} |
| SAT internamiento | Lima | {{sat_deposit_summary}} | {{sat_deposit_risk}} |
| Callao | Callao | {{callao_summary}} | {{callao_risk}} |
| SUTRAN | Nacional | {{sutran_summary}} | {{sutran_risk}} |
| ATU | Lima/Callao | {{atu_summary}} | {{atu_risk}} |
| Provincias | {{province_scope}} | {{province_summary}} | {{province_risk}} |

Nota:

Las papeletas, pagos y estados pueden cambiar. El reporte refleja la consulta realizada en la fecha y hora indicadas.

## 9. Senales Avanzadas

Mostrar solo si aplica o si el paquete lo incluye.

Tabla:

| Senal | Resultado | Interpretacion | Riesgo |
|---|---|---|---|
| GNV / Infogas | {{gnv_summary}} | {{gnv_interpretation}} | {{gnv_risk}} |
| Uso taxi/transporte | {{transport_use_summary}} | {{transport_use_interpretation}} | {{transport_use_risk}} |
| Transporte carga/personas | {{mtc_transport_summary}} | {{mtc_transport_interpretation}} | {{mtc_transport_risk}} |
| Recalls / campanas | {{recall_summary}} | {{recall_interpretation}} | {{recall_risk}} |
| Subastas/remates | {{auction_summary}} | {{auction_interpretation}} | {{auction_risk}} |
| Tasacion | {{valuation_summary}} | {{valuation_interpretation}} | {{valuation_risk}} |

Regla de inferencias:

Nunca afirmar "fue taxi", "fue chocado" o "fue rematado" sin evidencia directa. Usar:

- "Se detecta senal compatible con..."
- "Requiere confirmacion documental..."
- "No se encontro evidencia en las fuentes consultadas..."

## 10. Evidencias Por Fuente

Tabla:

| Fuente | Estado | Consultado | Evidencia | Confianza |
|---|---|---|---|---|
| {{source_name_1}} | {{source_status_1}} | {{checked_at_1}} | {{evidence_ref_1}} | {{confidence_1}} |
| {{source_name_2}} | {{source_status_2}} | {{checked_at_2}} | {{evidence_ref_2}} | {{confidence_2}} |
| {{source_name_3}} | {{source_status_3}} | {{checked_at_3}} | {{evidence_ref_3}} | {{confidence_3}} |

Estados permitidos:

- Sin alerta detectada.
- Alerta detectada.
- No disponible.
- No aplica.
- No incluido en paquete.
- Requiere documento adicional.

Niveles de confianza:

- Alta: dato directo de fuente oficial o documento formal.
- Media: dato de portal oficial/semioficial con limitaciones.
- Baja: inferencia o fuente complementaria.

## 11. Recomendacion Final

Titulo:

Recomendacion

Texto:

{{final_recommendation_text}}

Opciones permitidas:

- Comprar con revision mecanica y documentaria final.
- Negociar antes de pagar.
- Pedir documentos adicionales.
- Regularizar alertas antes de firmar.
- No comprar todavia.

## 12. Checklist Antes De Pagar

Checklist:

- Confirmar identidad del vendedor.
- Confirmar que el vendedor es titular o tiene poder valido.
- Validar tarjeta de identificacion vehicular.
- Verificar documentos originales.
- No pagar separacion sin comprobante.
- Hacer revision mecanica.
- Firmar por notaria o canal formal.
- Solicitar documento SUNARP pagado si existe duda registral.
- Confirmar que deudas y papeletas esten regularizadas antes de transferencia.

## 13. Descargo Legal

Texto recomendado:

Este reporte es informativo y ha sido elaborado con base en fuentes disponibles al momento de la consulta. No constituye certificado oficial, publicidad registral, peritaje mecanico, asesoria legal ni garantia de inexistencia absoluta de riesgos.

Los resultados pueden cambiar por actualizaciones, pagos, rectificaciones, caidas de sistemas o limitaciones de cada fuente. Cuando una fuente no esta disponible, el reporte lo indica expresamente.

La recomendacion final es no vinculante y debe complementarse con documentos oficiales, revision mecanica y asesoria especializada cuando corresponda.

## 14. Footer

Campos:

- Reporte: {{report_code}}
- Placa: {{plate}}
- Pagina: {{page_number}} / {{total_pages}}
- Emitido: {{issued_at}}

Texto breve:

Reporte informativo. Uso exclusivo del solicitante.

## 15. Reglas De Diseno

Estilo:

- Sobrio, limpio, profesional.
- Semaforo visible en portada y resumen.
- Tablas compactas y legibles.
- Evidencias numeradas.
- No saturar con capturas grandes en el cuerpo; anexarlas si es necesario.

Colores sugeridos:

- Verde riesgo bajo: #15803D
- Amarillo riesgo medio: #B45309
- Rojo riesgo alto: #B91C1C
- Texto principal: #111827
- Texto secundario: #4B5563
- Lineas/bordes: #E5E7EB

Tipografia:

- Inter, Arial o similar sans-serif.

Tamano:

- A4 vertical.
- Margen 18 mm.
- Tablas maximo 9 pt si son densas.

## 16. Control De Calidad Antes De Entregar

Checklist interno:

- Placa correcta.
- Fecha y hora visibles.
- Riesgo calculado.
- Recomendacion coherente con alertas.
- Fuentes no disponibles marcadas.
- Datos personales minimizados.
- Captura administrativa no confundida con captura policial.
- Documento SUNARP pagado no mencionado como consultado si no se hizo.
- PDF abre correctamente.
- WhatsApp resume los tres hallazgos principales.
