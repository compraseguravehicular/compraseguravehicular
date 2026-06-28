# Especificacion MVP Compra Segura Vehicular v1

Fecha de corte: 28 de junio de 2026  
Mercado inicial: Peru  
Objetivo: validar un negocio rentable de diagnostico vehicular por placa antes de construir una plataforma grande.

## 1. Decision Ejecutiva

El proyecto es viable si se posiciona como un servicio de diagnostico para compra segura, no como una simple consulta por placa.

La competencia ya ofrece reportes baratos y consultas automatizadas. Por eso, la ventaja no debe ser "tenemos mas fuentes", sino:

- Evidencia por fuente.
- Fecha y hora de consulta.
- Nivel de confianza del dato.
- Semaforo de riesgo.
- Recomendacion accionable: comprar, negociar, evitar o pedir documentos.
- Entrega rapida por WhatsApp.

Decision recomendada:

Ejecutar un MVP semi-automatizado durante 30 dias. No construir app movil. No hacer scraping agresivo. No prometer cobertura absoluta. Vender reportes reales desde el dia 1.

## 2. Posicionamiento

### Promesa Principal

Antes de separar o comprar un vehiculo usado, recibe un diagnostico de riesgo con fuentes verificadas, evidencia y recomendacion clara.

### Lo Que No Se Debe Prometer

- No prometer historial completo absoluto.
- No prometer captura policial automatica.
- No prometer gravamen PNP automatico.
- No prometer accidentes completos si la fuente no lo respalda.
- No vender acceso a base de datos.

### Lo Que Si Se Debe Prometer

- Consulta estructurada de fuentes disponibles.
- Reporte informativo con fecha, hora y evidencia.
- Interpretacion de riesgos.
- Recomendacion no vinculante para decidir mejor.
- Transparencia cuando una fuente no este disponible.

## 3. Paquetes Comerciales

### 3.1 Express

Objetivo: producto de entrada, rapido y barato.

Precio sugerido: S/ 14.90 a S/ 19.90

Incluye:

- SUNARP consulta vehicular.
- SOAT / APESEG o SBS.
- Revision tecnica MTC.
- SAT Lima y Callao cuando aplique.
- SUTRAN.
- ATU basico para Lima/Callao.
- Semaforo simple.
- Resumen por WhatsApp.

No incluye:

- PDF detallado.
- Documentos SUNARP pagados.
- Revision humana profunda.
- Municipalidades provinciales extendidas.

Uso comercial:

Sirve para captar usuarios y demostrar valor. No debe ser el producto principal.

### 3.2 Compra Segura

Objetivo: producto principal.

Precio sugerido: S/ 29.90 a S/ 39.90

Incluye:

- Todas las fuentes Express.
- PDF profesional.
- Semaforo de riesgo.
- Evidencia por fuente.
- Recomendacion: comprar, negociar, evitar o pedir documentos.
- Checklist antes de pagar separacion.
- Revision humana asistida.
- Alerta de inconsistencias: titular, SOAT, CITV, papeletas, captura administrativa, uso intensivo probable.

Uso comercial:

Debe ser el paquete ancla. Es el producto que justifica margen, confianza y diferenciacion.

### 3.3 Compra Segura Pro

Objetivo: ticket alto para compradores serios.

Precio sugerido: S/ 59 a S/ 99, dependiendo de costos de documentos pagados.

Incluye:

- Todo Compra Segura.
- Boleta informativa SUNARP si aplica.
- Certificado registral vehicular si el cliente lo paga o autoriza.
- Copia literal si el caso lo justifica.
- Infogas / GNV.
- Municipalidades provinciales relevantes.
- Recalls o campanas de seguridad por VIN cuando el usuario lo proporcione.
- Tasacion referencial.
- Senales de subasta/remate cuando sea posible.
- Analisis de posible uso intensivo: taxi, flota, carga, delivery, transporte publico.

Uso comercial:

Producto premium para autos de mayor valor, compradores desconfiados, concesionarios pequenos y operaciones donde ya hay intencion seria de compra.

### 3.4 B2B Flotas / Concesionarios

Objetivo: ingresos recurrentes.

Precio sugerido:

- S/ 149 a S/ 299 mensual para planes pequenos.
- S/ 8 a S/ 12 por placa consultada en volumen.

Incluye:

- Monitoreo mensual de placas.
- Alertas de SOAT, CITV y papeletas.
- Score de riesgo por unidad.
- Reporte consolidado.
- Exportable CSV/PDF.
- Soporte para talleres, peritos, concesionarios pequenos y flotas.

## 4. Matriz De Fuentes

### 4.1 Fuentes MVP

| Fuente | Dato | Valor | Riesgo | Uso |
|---|---|---:|---|---|
| SUNARP Consulta Vehicular | Datos del vehiculo, titular, VIN, motor, estado | Alto | Medio por datos personales | MVP |
| SBS Reporte SOAT/CAT | SOAT/CAT, seguros y posibles accidentes reportados | Muy alto | Medio | MVP |
| APESEG SOAT | SOAT, aseguradora, vigencia | Alto | Bajo/medio | MVP |
| MTC CITV | Revision tecnica, vigencia, certificado | Muy alto | Bajo/medio | MVP |
| SAT Lima | Papeletas, deudas, tributos | Muy alto | Medio | MVP |
| SAT Captura | Captura administrativa por deuda | Muy alto | Medio | MVP |
| Callao Papeletas | Papeletas Callao | Alto | Medio | MVP |
| SUTRAN | Infracciones nacionales | Alto | Medio | MVP |
| ATU | Infracciones y autorizaciones Lima/Callao | Alto | Medio | MVP |
| AAP Placas | Estado/cambio de placa | Medio/alto | Bajo | MVP |

### 4.2 Fuentes Premium

| Fuente | Dato | Valor | Uso |
|---|---|---:|---|
| SUNARP Boleta Informativa | Datos registrales resumidos, cargas, estado | Muy alto | Premium |
| SUNARP Certificado Registral Vehicular | Gravamenes, cargas, medidas cautelares | Muy alto | Premium |
| SUNARP Copia Literal | Historial registral formal | Muy alto | Premium |
| Garantia mobiliaria SUNARP | Vehiculo usado como garantia financiera | Muy alto | Premium |
| Infogas | GNV, cilindro, revision anual, habilitacion | Alto | Premium |
| PNP Lunas Polarizadas | Permiso de lunas | Medio | Premium |
| Municipalidades provinciales | Papeletas/deudas fuera de Lima | Alto | Premium |
| Recalls por VIN | Campanas de seguridad | Alto | Premium |
| Subastas/remates | Posible remate, siniestro o recuperado | Alto | Premium |
| Tasacion referencial | Comparacion de precio de mercado | Muy alto | Premium |

### 4.3 Fuentes B2B

| Fuente | Dato | Cliente Ideal |
|---|---|---|
| MTC Transporte Personas | Habilitacion para transporte | Flotas, vans, buses |
| MTC Transporte Carga | Registro de mercancias/carga | Flotas, logistica |
| ATU Autorizaciones | Taxi/transporte urbano | Taxis, movilidad, concesionarios |
| Osinergmin Hidrocarburos | Transporte de hidrocarburos | Empresas reguladas |
| TUC Municipal | Tarjeta de circulacion local | Transporte local |
| APIs privadas | Datos estructurados y automatizables | B2B con volumen |

### 4.4 Fuentes Que No Deben Prometerse Como Automaticas

| Fuente | Motivo | Tratamiento |
|---|---|---|
| PNP Gravamen Policial | Requiere tramite presencial y titular | Premium manual con vendedor/titular |
| Requisitoria policial completa | No hay fuente publica confiable para automatizar | Checklist/documento recomendado |
| Historial total de accidentes | Cobertura incompleta por fuentes disponibles | Declarar alcance y fuentes |
| Todos los propietarios anteriores | Depende de documentos registrales pagados | Premium con SUNARP |

## 5. Flujo Operativo MVP

1. Cliente llega por landing, WhatsApp o referido.
2. Ingresa placa y tipo de paquete.
3. Sistema crea orden.
4. Cliente paga por Yape, Plin, transferencia o link de pago.
5. Operador valida pago.
6. Sistema o operador ejecuta fuentes MVP.
7. Se guardan resultados resumidos y evidencias.
8. Se calcula semaforo de riesgo.
9. Se genera PDF si el paquete lo incluye.
10. Se entrega por WhatsApp.
11. Se registra tiempo de entrega, observaciones y reclamos.

Estados de orden:

- created
- pending_payment
- paid
- processing
- manual_review_required
- completed
- delivered
- cancelled
- failed

## 6. Modelo De Datos Inicial

### customers

- id
- name
- phone
- email
- created_at

### vehicle_checks

- id
- customer_id
- plate
- package_type
- status
- risk_level
- recommendation
- total_price
- payment_status
- started_at
- completed_at
- delivered_at

### source_results

- id
- check_id
- source_name
- source_category
- status
- confidence_level
- summary
- raw_data_json
- evidence_url
- checked_at

### reports

- id
- check_id
- pdf_url
- whatsapp_summary
- report_code
- created_at

### payments

- id
- check_id
- method
- amount
- status
- proof_url
- confirmed_at

### evidence_files

- id
- check_id
- source_name
- file_url
- file_type
- created_at

## 7. Motor De Riesgo v1

### Rojo

Indica riesgo alto. Recomendacion general: no comprar todavia.

Condiciones:

- Robo o anotacion grave confirmada.
- Gravamen, medida cautelar o carga relevante confirmada por documento SUNARP.
- Captura administrativa vigente por deuda importante.
- Inconsistencia fuerte entre vendedor y titular, si el cliente reporta vendedor.
- Documento oficial pagado muestra afectacion seria.

### Amarillo

Indica riesgo medio. Recomendacion general: negociar, pedir documentos o regularizar antes de pagar.

Condiciones:

- SOAT vencido.
- Revision tecnica vencida.
- Papeletas o deudas pendientes.
- Fuente critica no disponible.
- Vehiculo con senales de uso intensivo.
- GNV con revision vencida o estado irregular.
- Historial de infracciones relevante.

### Verde

Indica riesgo bajo segun fuentes consultadas. Recomendacion general: compra viable con revision mecanica y documentos formales.

Condiciones:

- Fuentes principales sin alertas.
- SOAT vigente.
- CITV vigente.
- Sin deudas/papeletas relevantes en fuentes revisadas.
- Sin alertas de titularidad o estado.

Importante:

Verde no significa garantia absoluta. Significa que no se detectaron alertas relevantes en las fuentes consultadas.

## 8. PDF Compra Segura

El PDF es el producto principal. Debe verse profesional, claro y trazable.

### Estructura

1. Portada
   - Codigo de reporte.
   - Placa.
   - Fecha y hora.
   - Paquete.

2. Resumen ejecutivo
   - Semaforo.
   - Recomendacion.
   - Riesgos principales.

3. Datos del vehiculo
   - Marca.
   - Modelo.
   - Ano si disponible.
   - VIN si disponible.
   - Motor.
   - Color.
   - Titular o coincidencia parcial, con cuidado de datos personales.

4. Estado legal/documentario
   - SUNARP.
   - Gravamenes si hay documento premium.
   - Observaciones.

5. Circulacion
   - SOAT.
   - Revision tecnica.
   - AAP/placa.

6. Multas, deudas e infracciones
   - SAT Lima.
   - Callao.
   - SUTRAN.
   - ATU.
   - Provincias si aplica.

7. Senales avanzadas
   - GNV.
   - Uso taxi/transporte/flota.
   - Recalls.
   - Subastas/remates.
   - Tasacion.

8. Evidencias
   - Fuente.
   - Fecha/hora.
   - Estado.
   - Captura o resumen.
   - Nivel de confianza.

9. Checklist antes de pagar
   - Verificar DNI del vendedor.
   - Confirmar titularidad.
   - Pedir boleta/CRV si hay duda.
   - Revision mecanica.
   - Contrato/notaria.

10. Descargo legal
   - Reporte informativo.
   - No reemplaza certificados oficiales.
   - No garantiza inexistencia absoluta de riesgos.
   - Datos sujetos a disponibilidad de fuentes.

## 9. Compliance Y Cuidado Legal

Reglas operativas:

- Consultar datos solo por solicitud del cliente.
- No vender bases de datos.
- No almacenar mas informacion de la necesaria.
- No publicar datos personales completos sin necesidad.
- No romper captchas ni hacer scraping masivo agresivo.
- Guardar evidencia minima para trazabilidad.
- Mostrar fuente, fecha y limitacion.
- Usar terminos: "reporte informativo", "fuentes consultadas", "nivel de riesgo", "recomendacion no vinculante".
- Separar claramente datos confirmados, datos no disponibles e inferencias.
- Toda inferencia debe explicar su base: fuente, senal observada y nivel de confianza.
- Los datos personales deben tratarse bajo minimizacion, finalidad especifica y acceso restringido.

Textos prohibidos:

- "Garantizamos que el vehiculo esta limpio."
- "Tenemos acceso a todas las bases policiales."
- "Detectamos todos los accidentes."
- "Historial completo de propietarios."
- "Consulta 100% oficial."

Textos recomendados:

- "Diagnostico vehicular con fuentes verificadas."
- "Reporte informativo basado en fuentes disponibles."
- "Semaforo de riesgo para tomar una mejor decision."
- "Recomendacion no vinculante."

## 10. Arquitectura Tecnica Recomendada

### Fase 1: MVP Semi-Automatizado

- Frontend: Next.js.
- Estilos: Tailwind CSS.
- Base de datos: Supabase PostgreSQL.
- Storage: Supabase Storage para PDFs y evidencias.
- Auth interna: Supabase Auth o acceso simple por rol.
- PDF: generacion server-side con plantilla HTML/PDF.
- WhatsApp: link prellenado al inicio; luego WhatsApp Cloud API si hay volumen.
- Pagos: Yape/Plin manual al inicio; luego Culqi, Mercado Pago o Niubiz.

### Fase 2: Automatizacion Selectiva

- Workers para fuentes estables.
- Cola de procesamiento.
- Cache por placa y fuente con expiracion.
- Reintentos.
- Monitoreo de fuentes caidas.
- Logs de consulta.

### Fase 3: B2B

- Panel multi-cliente.
- Monitoreo mensual.
- Alertas.
- Exportaciones.
- API interna.
- Planes por volumen.

## 11. Metricas De Validacion 30 Dias

El MVP se considera prometedor si cumple:

- 100 leads calificados.
- 15 ventas pagadas minimo.
- Conversion WhatsApp a pago mayor a 15%.
- Tiempo promedio de entrega menor a 15 minutos en Compra Segura.
- Margen bruto mayor a 70%.
- Menos de 5% reclamos por dato incompleto.
- Al menos 2 conversaciones B2B serias.

El MVP debe pausarse o corregirse si:

- El tiempo operativo supera 25 minutos por reporte.
- El cliente solo paga precios menores a S/ 15.
- Hay reclamos recurrentes por promesas mal entendidas.
- Las fuentes criticas fallan con frecuencia.
- No hay disposicion de pago despues de 100 leads.

## 12. Plan De Ejecucion

### Dias 1 a 3

- Definir marca operativa.
- Crear landing simple.
- Crear formulario de placa.
- Crear WhatsApp prellenado.
- Preparar PDF manual/profesional.
- Crear checklist operativo.

### Dias 4 a 10

- Vender manualmente.
- Probar precios: S/ 19.90 vs S/ 29.90 vs S/ 39.90.
- Registrar tiempos reales por fuente.
- Crear primeras evidencias.
- Medir objeciones.

### Dias 11 a 20

- Ajustar paquete principal.
- Crear panel interno minimo.
- Automatizar solo registro de ordenes y PDF.
- Contactar talleres, peritos y concesionarios pequenos.

### Dias 21 a 30

- Analizar conversion, margen y reclamos.
- Decidir si se programa backend completo.
- Definir fuentes automatizables.
- Preparar oferta B2B.

## 13. Criterio Para Programar

Se programa la plataforma si se cumple al menos:

- 15 ventas pagadas en 30 dias.
- Tiempo promedio menor a 15 minutos.
- Compra Segura vende mejor que Express.
- Hay margen operativo.
- Existen fuentes repetitivas que justifican automatizar.
- Al menos 2 clientes B2B muestran interes real.

Si no se cumple, no se abandona automaticamente; se revisa oferta, precio, canal o nicho.

## 14. Riesgos De Negocio Que Deben Vigilarse

| Riesgo | Senal temprana | Respuesta |
|---|---|---|
| Competir solo por precio | Usuarios comparan solo contra reportes de S/ 15 | Empujar Compra Segura y Pro con recomendacion, evidencia y soporte |
| Operacion lenta | Reportes demoran mas de 25 minutos | Reducir fuentes del paquete basico y pasar fuentes lentas a Premium |
| Fuentes inestables | Fallas frecuentes de portales oficiales | Registrar fuente no disponible, reintentar y no ocultar limitaciones |
| Reclamos por expectativas | Cliente cree que el reporte es certificado oficial | Mejorar copy, disclaimer y explicacion antes del pago |
| Riesgo legal | Se almacenan datos personales innecesarios | Minimizar datos, restringir acceso y revisar terminos |
| Baja conversion | Muchos leads, pocos pagos | Ajustar precio, canal, promesa o nicho |
| Falta de diferenciacion | Usuario dice que Mi Torito/TotalCheck ya lo hace | Vender decision, evidencia, soporte y fuentes premium |

## 15. Siguiente Entregable

Antes de programar, el siguiente entregable debe ser:

- Landing copy v1.
- Wireframe del panel interno.
- Plantilla PDF Compra Segura.
- Checklist operativo por fuente.
- Tabla de reglas del motor de riesgo.

Con esos cinco elementos, la programacion puede empezar sin improvisacion.
