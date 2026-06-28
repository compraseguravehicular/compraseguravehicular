# Checklist Operativo Por Fuente v1

Fecha: 28 de junio de 2026  
Uso: SOP interno para operadores y futura automatizacion.  
Objetivo: producir reportes consistentes, trazables y defendibles.

## 1. Reglas Generales

Toda consulta debe registrar:

- Placa consultada.
- Fuente.
- Fecha y hora.
- Resultado resumido.
- Estado de la fuente.
- Evidencia o captura.
- Nivel de confianza.
- Observacion si la fuente no estuvo disponible.

Estados permitidos:

- pending
- consulted_no_alert
- consulted_with_alert
- unavailable
- not_applicable
- not_included
- requires_manual_document
- failed

Niveles de confianza:

- Alta: documento oficial, certificado pagado o fuente directa formal.
- Media: portal oficial/semioficial gratuito con limitaciones.
- Baja: inferencia, fuente complementaria o dato no confirmatorio.

Regla de oro:

Si una fuente no se consulto, no se debe escribir como si estuviera limpia. Se marca como no consultada, no disponible o no incluida.

## 2. Orden Recomendado De Consulta

### Express

1. SUNARP Consulta Vehicular.
2. SOAT / APESEG o SBS.
3. MTC CITV.
4. SAT Lima.
5. Callao.
6. SUTRAN.
7. ATU.
8. AAP placas.

### Compra Segura

1. Todas las fuentes Express.
2. SAT captura administrativa.
3. Fuentes de ciudad declarada.
4. Revision humana de coherencia.
5. Score de riesgo.
6. PDF.

### Compra Segura Pro

1. Todas las fuentes Compra Segura.
2. SUNARP pagado si corresponde.
3. Infogas/GNV.
4. Municipalidades provinciales relevantes.
5. Recalls por VIN.
6. Tasacion referencial.
7. Subastas/remates si hay datos suficientes.
8. Checklist de documentos adicionales.

## 3. Checklist De Entrada

Datos minimos:

- Placa.
- WhatsApp.
- Ciudad donde circula o se vende.
- Paquete.
- Comprobante de pago.

Datos utiles opcionales:

- Nombre del vendedor.
- DNI/RUC del vendedor si el cliente lo tiene.
- Link del anuncio.
- VIN.
- Foto de tarjeta de identificacion vehicular.
- Foto del kilometraje.
- Uso declarado: particular, taxi, delivery, carga, flota.

## 4. Fuentes MVP

### 4.1 SUNARP Consulta Vehicular

Objetivo:

Obtener datos base del vehiculo y validar coincidencia general.

Entrada:

- Placa.

Salida esperada:

- Marca.
- Modelo.
- Color.
- VIN/serie si aparece.
- Motor si aparece.
- Titular o datos registrales disponibles.
- Estado/anotacion relevante.

Evidencia:

- Captura del resultado.
- Fecha y hora.

Riesgos:

- Captcha.
- Dato referencial.
- Datos personales.

Manejo:

- Minimizar datos personales en PDF.
- No decir que reemplaza certificado registral.
- Si hay anotacion de robo o inconsistencia relevante, escalar a Amarillo/Rojo segun detalle.

Tiempo objetivo:

2 a 4 minutos.

### 4.2 SBS Reporte SOAT/CAT

Objetivo:

Consultar seguro, SOAT/CAT e informacion relacionada disponible.

Entrada:

- Placa.

Salida esperada:

- SOAT/CAT vigente o vencido.
- Aseguradora.
- Historial relacionado si aparece.
- Accidentes/siniestros si la fuente los reporta.

Evidencia:

- Captura o resumen estructurado.

Riesgos:

- Formulario puede cambiar.
- Dato sensible de seguro.

Manejo:

- Reportar solo lo necesario.
- Diferenciar "accidente reportado por fuente" de "historial completo de accidentes".

Tiempo objetivo:

2 a 4 minutos.

### 4.3 APESEG SOAT

Objetivo:

Validar SOAT vigente, compania y vigencia.

Entrada:

- Placa.

Salida esperada:

- Vigente / vencido / no encontrado.
- Compania.
- Fecha de inicio y fin si aparece.

Evidencia:

- Captura.

Manejo:

- Si SBS y APESEG difieren, marcar revision manual.
- Si SOAT vencido, riesgo Amarillo.

Tiempo objetivo:

1 a 3 minutos.

### 4.4 MTC CITV

Objetivo:

Validar revision tecnica.

Entrada:

- Placa.

Salida esperada:

- CITV vigente o vencido.
- Fecha de vencimiento.
- Centro de inspeccion si aparece.
- Certificado si aparece.

Evidencia:

- Captura.

Manejo:

- CITV vencido: Amarillo.
- Resultado no encontrado: revisar si el vehiculo esta obligado a CITV segun antiguedad/uso.
- Si fuente cae, marcar no disponible.

Tiempo objetivo:

2 a 5 minutos.

### 4.5 SAT Lima

Objetivo:

Consultar deuda, papeletas, multas o tributos en Lima.

Entrada:

- Placa.

Salida esperada:

- Monto total si aparece.
- Numero de papeletas/deudas.
- Estado.

Evidencia:

- Captura con placa y resultado.

Manejo:

- Deuda menor y regularizable: Amarillo bajo.
- Deuda alta o multiple: Amarillo alto.
- No confundir con deuda nacional.

Tiempo objetivo:

2 a 5 minutos.

### 4.6 SAT Captura Administrativa

Objetivo:

Detectar captura administrativa por deuda o papeletas.

Entrada:

- Placa.

Salida esperada:

- Con captura / sin captura / no disponible.

Evidencia:

- Captura.

Manejo:

- Siempre nombrar como "captura administrativa SAT".
- No llamar "captura policial".
- Si vigente, riesgo Rojo o Amarillo alto segun monto y contexto.

Tiempo objetivo:

1 a 3 minutos.

### 4.7 Callao Papeletas

Objetivo:

Consultar papeletas en Callao.

Entrada:

- Placa.

Salida esperada:

- Papeletas.
- Estado.
- Monto si aparece.

Evidencia:

- Captura.

Manejo:

- Si el vehiculo circula en Lima/Callao, es fuente MVP.
- Si la fuente falla, marcar no disponible.

Tiempo objetivo:

2 a 5 minutos.

### 4.8 SUTRAN

Objetivo:

Consultar infracciones nacionales o de transporte.

Entrada:

- Placa.

Salida esperada:

- Infracciones.
- Actas.
- Fechas.
- Estado.

Evidencia:

- Captura.

Manejo:

- Infracciones activas: Amarillo.
- Si hay infraccion grave o recurrente: Amarillo alto.
- Indicar cobertura si la fuente limita historial.

Tiempo objetivo:

2 a 5 minutos.

### 4.9 ATU

Objetivo:

Consultar infracciones y posibles autorizaciones de transporte urbano Lima/Callao.

Entrada:

- Placa.

Salida esperada:

- Infracciones ATU.
- Autorizacion taxi/transporte si se consulta.
- Modalidad si aparece.

Evidencia:

- Captura.

Manejo:

- Si aparece como taxi/transporte y se vende como particular, marcar senal de uso intensivo.
- Infracciones activas: Amarillo.

Tiempo objetivo:

2 a 5 minutos.

### 4.10 AAP Placas

Objetivo:

Consultar estado de placa, cambio de placa o tercera placa cuando aplique.

Entrada:

- Placa.

Salida esperada:

- Estado.
- Obligacion de cambio.
- Observaciones.

Evidencia:

- Captura.

Manejo:

- Si requiere regularizacion, Amarillo bajo.

Tiempo objetivo:

1 a 3 minutos.

## 5. Fuentes Premium

### 5.1 SUNARP Boleta Informativa

Objetivo:

Mejorar certeza registral con documento oficial pagado.

Entrada:

- Placa o datos registrales requeridos.
- Autorizacion/costo aceptado por cliente.

Salida esperada:

- Datos registrales.
- Cargas o gravamenes si aparecen.
- Estado.

Evidencia:

- Documento descargado o comprobante.

Manejo:

- Confianza Alta.
- Si aparece carga, gravamen o titulo pendiente, escalar segun severidad.

### 5.2 SUNARP Certificado Registral Vehicular

Objetivo:

Confirmar cargas, gravamenes, medidas cautelares u otros actos relevantes.

Entrada:

- Datos requeridos por SUNARP.
- Pago aceptado.

Salida esperada:

- Documento oficial.

Manejo:

- Fuente de mayor valor para Pro.
- Si muestra afectacion seria, Rojo.

### 5.3 SUNARP Copia Literal

Objetivo:

Revisar historial registral formal cuando el caso sea complejo.

Uso:

- Compras de alto valor.
- Dudas de titularidad.
- Operaciones con antecedentes.

Manejo:

- No incluir por defecto en paquetes baratos.
- Cobrar como adicional.

### 5.4 Infogas / GNV

Objetivo:

Detectar GNV, revision anual, cilindro, habilitacion y senales de uso intensivo.

Entrada:

- Placa.

Salida esperada:

- Vehiculo GNV.
- Estado.
- Revision.
- Habilitado para consumo.

Manejo:

- GNV no es malo por si mismo.
- GNV con revision vencida: Amarillo.
- GNV + taxi/transporte + kilometraje alto: senal de uso intensivo.
- Cuidar dato financiero de credito.

### 5.5 Municipalidades Provinciales

Objetivo:

Consultar papeletas o deudas fuera de Lima/Callao.

Entrada:

- Placa.
- Ciudad principal declarada.

Fuentes prioritarias:

- Arequipa.
- Trujillo.
- Chiclayo.
- Piura.
- Cusco.
- Huancayo.
- Ica.
- Tacna.
- Puno.
- Cajamarca.

Manejo:

- Solo consultar ciudades relevantes para no destruir margen.
- Si el cliente no sabe ciudad, consultar top 5 solo en Pro.

### 5.6 Recalls / Campanas Por VIN

Objetivo:

Detectar campanas de seguridad pendientes.

Entrada:

- VIN.
- Marca.
- Modelo.

Fuentes:

- Indecopi alertas.
- Webs de marcas.
- NHTSA para importados cuando aplique.

Manejo:

- No siempre aplica a Peru.
- Usar como alerta preventiva.

### 5.7 Tasacion Referencial

Objetivo:

Comparar precio pedido con mercado.

Entrada:

- Marca.
- Modelo.
- Ano.
- Version si disponible.
- Kilometraje si cliente lo proporciona.

Fuentes:

- Marketplaces.
- MEF tabla vehicular.
- APESEG precios si aplica.

Manejo:

- Evitar scraping masivo.
- Dar rango referencial, no tasacion certificada.

## 6. Checklist De Cierre

Antes de entregar:

- Confirmar placa en todas las capturas.
- Confirmar que el paquete coincide con fuentes consultadas.
- Registrar fuentes no disponibles.
- Revisar que el semaforo coincide con alertas.
- No mezclar captura SAT con captura policial.
- No mostrar datos personales completos innecesarios.
- Verificar PDF.
- Enviar resumen WhatsApp con tres puntos maximos.

## 7. Resumen WhatsApp Estandar

Formato:

Resultado: {{risk_level}}  
Recomendacion: {{recommendation}}  
Alertas principales:
1. {{alert_1}}
2. {{alert_2}}
3. {{alert_3}}

Reporte: {{pdf_link}}

Nota: reporte informativo basado en fuentes consultadas al {{issued_at}}.

## 8. Indicadores Operativos

Registrar por orden:

- Tiempo total.
- Tiempo por fuente.
- Fuente mas lenta.
- Fuente no disponible.
- Motivo de escalamiento manual.
- Reclamo del cliente si existe.
- Paquete vendido.
- Canal de origen.

Objetivo:

Reducir fuentes lentas del Express y reservarlas para Compra Segura o Pro.
