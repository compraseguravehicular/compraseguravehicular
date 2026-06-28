# Wireframe Panel Interno v1

Fecha: 28 de junio de 2026  
Uso: especificacion funcional antes de programar.  
Usuarios internos: operador, supervisor, administrador.  
Objetivo: gestionar ordenes, fuentes, evidencias, riesgo, PDF y entrega por WhatsApp.

## 1. Principios De Producto

El panel debe optimizar tres cosas:

- Velocidad: reducir tiempo por reporte.
- Trazabilidad: cada resultado debe tener fuente, fecha y evidencia.
- Control: evitar promesas indebidas, errores humanos y entregas incompletas.

No debe empezar como CRM complejo. Debe ser una consola de produccion de reportes.

## 2. Roles

### Operador

Puede:

- Ver ordenes asignadas.
- Registrar resultados por fuente.
- Subir evidencias.
- Marcar fuentes como no disponibles.
- Generar borrador de PDF.
- Preparar resumen WhatsApp.

No puede:

- Cambiar reglas del motor de riesgo.
- Borrar evidencias.
- Editar precio despues de pago confirmado sin permiso.

### Supervisor

Puede:

- Revisar reportes antes de entrega.
- Corregir recomendacion si hay sustento.
- Aprobar reportes Rojo o casos sensibles.
- Reasignar ordenes.

### Admin

Puede:

- Configurar paquetes.
- Configurar fuentes activas.
- Ver metricas.
- Gestionar usuarios.
- Exportar datos.

## 3. Navegacion Principal

Sidebar:

- Dashboard.
- Ordenes.
- Nueva orden.
- Fuentes.
- Reportes.
- Clientes.
- Pagos.
- Metricas.
- Configuracion.

Top bar:

- Busqueda por placa, cliente o codigo de reporte.
- Boton Nueva orden.
- Usuario actual.

## 4. Dashboard

Objetivo:

Dar control operativo del dia.

Widgets:

- Ordenes creadas hoy.
- Ordenes pagadas.
- Ordenes en procesamiento.
- Ordenes pendientes de revision manual.
- Reportes entregados.
- Tiempo promedio de entrega.
- Fuentes con fallas hoy.
- Ventas del dia.

Tabla "Atencion inmediata":

| Prioridad | Orden | Placa | Paquete | Estado | Tiempo abierto | Accion |
|---|---|---|---|---|---|---|

Alertas:

- Orden pagada sin procesar por mas de 5 minutos.
- Reporte Compra Segura con mas de 15 minutos.
- Fuente critica fallando repetidamente.
- Reporte Rojo pendiente de aprobacion.

## 5. Listado De Ordenes

Filtros:

- Estado.
- Paquete.
- Riesgo.
- Fecha.
- Operador.
- Canal.
- Pago.

Columnas:

- Codigo.
- Fecha.
- Placa.
- Cliente.
- WhatsApp.
- Paquete.
- Pago.
- Estado.
- Riesgo.
- Operador.
- Tiempo.
- Acciones.

Acciones rapidas:

- Abrir.
- Copiar WhatsApp.
- Marcar pago confirmado.
- Asignar operador.
- Generar PDF.

Estados:

- created
- pending_payment
- paid
- processing
- manual_review_required
- completed
- delivered
- cancelled
- failed

## 6. Nueva Orden

Campos obligatorios:

- Placa.
- Nombre cliente.
- WhatsApp.
- Paquete.
- Canal de origen.
- Ciudad principal.

Campos opcionales:

- Email.
- Tipo de vehiculo.
- Nombre del vendedor.
- DNI/RUC vendedor.
- Link del anuncio.
- VIN.
- Kilometraje declarado.
- Observaciones.

Acciones:

- Guardar como pendiente de pago.
- Guardar y marcar pago confirmado.
- Enviar mensaje WhatsApp de confirmacion.

Validaciones:

- No permitir placa vacia.
- Alertar si placa ya fue consultada en ultimos 7 dias.
- Validar telefono.
- Requerir consentimiento informativo.

## 7. Detalle De Orden

Header:

- Codigo de orden.
- Placa.
- Cliente.
- Paquete.
- Estado.
- Riesgo actual.
- Tiempo transcurrido.

Acciones principales:

- Confirmar pago.
- Iniciar procesamiento.
- Calcular riesgo.
- Generar PDF.
- Marcar como entregado.
- Cancelar orden.

Tabs:

- Resumen.
- Fuentes.
- Evidencias.
- Riesgo.
- PDF.
- WhatsApp.
- Historial.

## 8. Tab Resumen

Bloques:

- Datos del cliente.
- Datos del vehiculo.
- Paquete y precio.
- Estado operativo.
- Alertas principales.
- Recomendacion actual.

Campos editables controlados:

- Ciudad.
- Tipo de vehiculo.
- Observaciones del cliente.
- Datos adicionales proporcionados.

Campos no editables despues de cierre:

- Placa.
- Codigo de reporte.
- Evidencias.
- Reglas activadas.

## 9. Tab Fuentes

Tabla:

| Fuente | Paquete | Estado | Resultado | Confianza | Ultima consulta | Evidencia | Accion |
|---|---|---|---|---|---|---|---|

Estados por fuente:

- pending
- consulted_no_alert
- consulted_with_alert
- unavailable
- not_applicable
- not_included
- requires_manual_document
- failed

Acciones:

- Marcar consultada.
- Marcar alerta.
- Marcar no disponible.
- Subir evidencia.
- Agregar resumen.
- Reintentar.

Requisitos por fuente:

- Estado.
- Resumen.
- Fecha/hora.
- Evidencia si hubo alerta.

Regla:

No se puede generar PDF final si una fuente MVP esta pendiente, salvo que se marque como no disponible o no aplicable.

## 10. Formulario De Resultado Por Fuente

Campos:

- Fuente.
- Estado.
- Resultado corto.
- Detalle.
- Monto si aplica.
- Fecha de vencimiento si aplica.
- Nivel de confianza.
- Evidencia.
- Observacion interna.
- Visible en PDF: si/no.

Checkboxes:

- Genera alerta.
- Requiere revision manual.
- Dato sensible.
- No mostrar completo en PDF.

## 11. Tab Evidencias

Vista:

- Galeria/lista de capturas.
- Fuente.
- Fecha/hora.
- Tipo de archivo.
- Visible en PDF.
- Descargar.

Reglas:

- No borrar evidencias; solo archivar.
- Cada evidencia debe estar asociada a una fuente.
- Las evidencias con datos personales deben tener acceso restringido.

## 12. Tab Riesgo

Bloques:

- Score actual.
- Semaforo.
- Recomendacion.
- Reglas activadas.
- Alertas principales.
- Limitaciones.

Tabla de reglas activadas:

| Regla | Categoria | Severidad | Puntos | Evidencia | Texto PDF |
|---|---|---|---:|---|---|

Acciones:

- Recalcular.
- Solicitar revision supervisor.
- Agregar nota supervisor.

Regla:

Si hay regla critical, el semaforo debe ser Rojo y requerir revision antes de entrega.

## 13. Tab PDF

Estados:

- No generado.
- Borrador.
- En revision.
- Aprobado.
- Entregado.

Acciones:

- Generar borrador.
- Previsualizar.
- Regenerar.
- Aprobar.
- Descargar.

Checklist antes de aprobar:

- Placa correcta.
- Riesgo coherente.
- Fuentes pendientes justificadas.
- Captura SAT no confundida con policial.
- Datos personales minimizados.
- Descargo legal incluido.

## 14. Tab WhatsApp

Campos:

- Mensaje inicial.
- Solicitud de pago.
- Pago confirmado.
- Entrega final.
- Upsell Pro.
- Solicitud de documento adicional.

Botones:

- Copiar mensaje.
- Abrir WhatsApp.
- Marcar mensaje enviado.

Resumen final estandar:

Resultado: {{risk_level}}  
Recomendacion: {{recommendation}}  
Alertas principales:  
1. {{alert_1}}  
2. {{alert_2}}  
3. {{alert_3}}  
Reporte: {{pdf_link}}

## 15. Tab Historial

Debe registrar:

- Orden creada.
- Pago confirmado.
- Operador asignado.
- Fuente actualizada.
- Evidencia subida.
- Riesgo calculado.
- PDF generado.
- Supervisor aprobo.
- Reporte entregado.
- Cliente reclamo.

Formato:

| Fecha/hora | Usuario | Evento | Detalle |
|---|---|---|---|

Regla:

El historial no debe poder editarse manualmente.

## 16. Modulo Fuentes

Objetivo:

Configurar fuentes y su comportamiento.

Campos:

- Nombre.
- Categoria.
- URL.
- Paquete: Express, Compra Segura, Pro, B2B.
- Critica: si/no.
- Automatizable: si/no.
- Requiere captcha: si/no.
- Requiere pago: si/no.
- Requiere documento cliente: si/no.
- Riesgo legal: bajo, medio, alto.
- Estado: activa, pausada, monitoreo.

Acciones:

- Pausar fuente.
- Editar instrucciones.
- Ver fallas.

## 17. Modulo Reportes

Objetivo:

Buscar y auditar PDFs generados.

Filtros:

- Fecha.
- Riesgo.
- Paquete.
- Operador.
- Fuente con alerta.
- Estado de entrega.

Acciones:

- Descargar PDF.
- Ver evidencias.
- Ver reglas activadas.
- Reenviar link.

## 18. Modulo Pagos

Campos:

- Metodo: Yape, Plin, transferencia, link de pago.
- Monto.
- Estado.
- Comprobante.
- Confirmado por.
- Fecha.

Reglas:

- No procesar orden si pago no esta confirmado, salvo orden de prueba interna.
- Si hay diferencia de monto, marcar revision manual.

## 19. Modulo Metricas

KPIs:

- Leads.
- Ordenes pagadas.
- Conversion por canal.
- Ticket promedio.
- Tiempo promedio por paquete.
- Tiempo promedio por fuente.
- Fuentes con mas fallas.
- Porcentaje Verde/Amarillo/Rojo.
- Reclamos.
- Reembolsos.
- Ventas B2B potenciales.

Visualizaciones:

- Tabla diaria.
- Grafico de conversion.
- Ranking de fuentes lentas.
- Ranking de alertas frecuentes.

## 20. Requisitos No Funcionales

Seguridad:

- Login obligatorio.
- Roles.
- Acceso restringido a evidencias.
- No mostrar datos sensibles innecesarios.

Auditoria:

- Historial inmutable.
- Timestamp en cada accion.
- Usuario responsable.

Performance:

- Listado de ordenes debe cargar rapido.
- Busqueda por placa inmediata.

Resiliencia:

- Permitir marcar fuentes como no disponibles.
- No bloquear reporte completo por una fuente no critica.

## 21. Wireframe Textual

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Top bar: Buscar placa / cliente / reporte                 Nueva orden   │
├──────────────┬──────────────────────────────────────────────────────────┤
│ Dashboard    │ Orden #CV-2026-0001                      Estado: paid    │
│ Ordenes      │ Placa ABC-123 | Compra Segura | Tiempo 07:32             │
│ Nueva orden  ├──────────────────────────────────────────────────────────┤
│ Fuentes      │ Tabs: Resumen | Fuentes | Evidencias | Riesgo | PDF | WA │
│ Reportes     ├──────────────────────────────────────────────────────────┤
│ Clientes     │ Fuentes                                                  │
│ Pagos        │ SUNARP        consulted_no_alert   Media   Ver evidencia │
│ Metricas     │ SOAT/SBS      consulted_with_alert Media   Ver evidencia │
│ Config       │ MTC CITV      pending              -       Consultar     │
│              │ SAT Lima      consulted_no_alert   Media   Ver evidencia │
│              ├──────────────────────────────────────────────────────────┤
│              │ Riesgo actual: Amarillo | Score 35                       │
│              │ Acciones: Calcular riesgo | Generar PDF | Entregar WA    │
└──────────────┴──────────────────────────────────────────────────────────┘
```

## 22. Criterio Para Primera Version Programable

La primera version programable debe incluir:

- Login interno.
- Crear orden.
- Confirmar pago.
- Gestionar fuentes manualmente.
- Subir evidencias.
- Calcular riesgo con reglas v1.
- Generar PDF.
- Copiar mensaje WhatsApp.
- Ver metricas basicas.

No incluir al inicio:

- App movil.
- Automatizacion completa de fuentes.
- Chatbot complejo.
- Multiempresa B2B avanzado.
- API publica.

Eso se agrega cuando existan ventas, volumen y patrones repetibles.
