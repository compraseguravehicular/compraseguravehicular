# Motor De Riesgo v1 - Reglas Detalladas

Fecha: 28 de junio de 2026  
Uso: calculo interno de semaforo y recomendacion.  
Objetivo: convertir datos dispersos en una decision consistente.

## 1. Principios

El motor no debe decidir por intuicion del operador. Debe usar reglas trazables.

Cada regla debe indicar:

- ID.
- Categoria.
- Condicion.
- Evidencia minima.
- Severidad.
- Puntos.
- Recomendacion.
- Texto para PDF.

Regla legal:

Las inferencias deben presentarse como inferencias. Los hechos confirmados deben tener fuente.

## 2. Resultado Final

### Verde

Score: 0 a 24

Interpretacion:

No se detectan alertas relevantes en fuentes consultadas.

Recomendacion:

Compra viable, sujeta a revision mecanica, validacion documental y firma formal.

### Amarillo

Score: 25 a 59

Interpretacion:

Existen observaciones que requieren regularizacion, negociacion o documentos adicionales.

Recomendacion:

No pagar sin resolver alertas o ajustar precio.

### Rojo

Score: 60 o mas, o cualquier regla critica.

Interpretacion:

Existe alerta relevante que puede afectar la compra.

Recomendacion:

No comprar todavia. Solicitar regularizacion o documentos oficiales.

## 3. Severidades

| Severidad | Puntos base | Uso |
|---|---:|---|
| info | 0 | Dato informativo |
| low | 5 | Observacion menor |
| medium | 15 | Riesgo regularizable |
| high | 30 | Riesgo importante |
| critical | 60 | Bloquea decision de compra |

Regla:

Una regla critical fuerza Rojo, aunque el score total sea menor.

## 4. Reglas Registrales

| ID | Condicion | Evidencia minima | Severidad | Puntos | Recomendacion |
|---|---|---|---|---:|---|
| REG-001 | SUNARP no encuentra vehiculo | Captura de fuente | medium | 15 | Verificar placa y documentos originales |
| REG-002 | Datos de placa no coinciden con tarjeta o anuncio | SUNARP + dato cliente/anuncio | high | 30 | No avanzar sin aclaracion documental |
| REG-003 | Titular no coincide con vendedor declarado | SUNARP + dato cliente | high | 30 | Pedir poder, contrato o presencia del titular |
| REG-004 | Titular no disponible por fuente limitada | Fuente consultada | low | 5 | Pedir documento adicional si el caso lo requiere |
| REG-005 | Anotacion de robo o alerta grave en fuente registral | Fuente oficial/captura | critical | 60 | No comprar todavia |
| REG-006 | Gravamen o carga confirmada por documento SUNARP | Boleta/CRV/literal | critical | 60 | No comprar hasta regularizacion |
| REG-007 | Medida cautelar confirmada | Documento SUNARP | critical | 60 | No comprar hasta sustento legal |
| REG-008 | Garantia mobiliaria activa | Fuente/SUNARP | high | 30 | Pedir levantamiento o sustento financiero |
| REG-009 | Titulo pendiente o acto registral en tramite | Documento SUNARP | high | 30 | Esperar definicion registral |

Texto PDF recomendado:

"Se detecta una observacion registral que requiere revision documental antes de continuar con la compra."

## 5. Reglas De SOAT Y Seguro

| ID | Condicion | Evidencia minima | Severidad | Puntos | Recomendacion |
|---|---|---|---|---:|---|
| SOAT-001 | SOAT vigente | APESEG/SBS | info | 0 | Sin alerta |
| SOAT-002 | SOAT vencido | APESEG/SBS | medium | 15 | Regularizar antes de circular |
| SOAT-003 | SOAT no encontrado | APESEG/SBS | medium | 15 | Confirmar con documento fisico o aseguradora |
| SOAT-004 | Diferencia entre SBS y APESEG | Ambas fuentes | medium | 15 | Revision manual |
| SOAT-005 | Siniestro/accidente reportado por fuente | SBS u otra fuente | high | 30 | Pedir inspeccion mecanica y documentos |

Texto PDF recomendado:

"El estado del seguro debe validarse antes de circular o cerrar la compra."

## 6. Reglas De Revision Tecnica

| ID | Condicion | Evidencia minima | Severidad | Puntos | Recomendacion |
|---|---|---|---|---:|---|
| CITV-001 | Revision tecnica vigente | MTC | info | 0 | Sin alerta |
| CITV-002 | Revision tecnica vencida | MTC | medium | 15 | Regularizar o negociar costo |
| CITV-003 | Revision tecnica no encontrada | MTC | medium | 15 | Validar si aplica por antiguedad/uso |
| CITV-004 | Revision frecuente compatible con uso intensivo | Historial MTC si disponible | medium | 15 | Revisar kilometraje y uso declarado |

## 7. Reglas De Papeletas, Deudas Y Capturas Administrativas

| ID | Condicion | Evidencia minima | Severidad | Puntos | Recomendacion |
|---|---|---|---|---:|---|
| DEBT-001 | Sin deuda relevante en fuente consultada | Fuente | info | 0 | Sin alerta |
| DEBT-002 | Deuda/papeletas menores | SAT/Callao/SUTRAN/ATU | medium | 15 | Negociar o exigir pago |
| DEBT-003 | Deuda/papeletas altas | Fuente + monto | high | 30 | No pagar hasta regularizacion |
| DEBT-004 | Multiples papeletas activas | Fuente | high | 30 | Evaluar costo total y habitos de uso |
| DEBT-005 | Captura administrativa SAT vigente | SAT captura | critical | 60 | No comprar hasta levantar captura |
| DEBT-006 | Vehiculo internado/deposito | Fuente deposito | critical | 60 | No comprar hasta aclaracion formal |
| DEBT-007 | Fuente municipal relevante no disponible | Registro de intento | low | 5 | Informar limite y reintentar |

Umbrales sugeridos:

- Deuda menor: hasta S/ 300.
- Deuda media: S/ 301 a S/ 1,000.
- Deuda alta: mas de S/ 1,000.

Los umbrales deben ajustarse con datos reales.

## 8. Reglas De Uso Intensivo

| ID | Condicion | Evidencia minima | Severidad | Puntos | Recomendacion |
|---|---|---|---|---:|---|
| USE-001 | ATU/MTC indica taxi, transporte o habilitacion | Fuente oficial | medium | 15 | Revisar desgaste y precio |
| USE-002 | GNV activo | Infogas | low | 5 | Revisar cilindro, revision anual y uso |
| USE-003 | GNV + transporte/taxi | Infogas + ATU/MTC | high | 30 | Considerar uso intensivo |
| USE-004 | Kilometraje alto declarado para antiguedad | Foto/anuncio | medium | 15 | Negociar o inspeccionar |
| USE-005 | Kilometraje incoherente o sospechoso | Evidencia comparativa | high | 30 | Pedir peritaje |
| USE-006 | Vehiculo de carga/personas vendido como particular | MTC + anuncio/cliente | high | 30 | Verificar uso y desgaste |

Regla de lenguaje:

No escribir "fue taxi" salvo que la fuente lo confirme. Usar "se detecta senal compatible con uso intensivo".

## 9. Reglas De GNV / Infogas

| ID | Condicion | Evidencia minima | Severidad | Puntos | Recomendacion |
|---|---|---|---|---:|---|
| GNV-001 | GNV habilitado y revision vigente | Infogas | info | 0 | Sin alerta critica |
| GNV-002 | Revision anual vencida | Infogas | medium | 15 | Regularizar |
| GNV-003 | Cilindro observado o vencido | Infogas | high | 30 | No usar hasta inspeccion |
| GNV-004 | Credito/estado financiero sensible aparece | Infogas | low | 5 | Minimizar dato y no explotarlo comercialmente |

## 10. Reglas Premium

| ID | Condicion | Evidencia minima | Severidad | Puntos | Recomendacion |
|---|---|---|---|---:|---|
| PREM-001 | Recall/campana de seguridad pendiente | Marca/Indecopi/NHTSA | medium | 15 | Consultar concesionario |
| PREM-002 | Senal de remate/subasta con coincidencia fuerte | Fuente + placa/VIN | high | 30 | Pedir inspeccion y documentos |
| PREM-003 | Precio muy por debajo del mercado | Tasacion + anuncio | medium | 15 | Revisar motivo y riesgo de estafa |
| PREM-004 | Precio muy por encima del mercado | Tasacion + anuncio | low | 5 | Negociar |
| PREM-005 | Link de anuncio con datos inconsistentes | Anuncio + fuentes | high | 30 | No separar sin verificar |

## 11. Reglas De Disponibilidad De Fuentes

| ID | Condicion | Evidencia minima | Severidad | Puntos | Recomendacion |
|---|---|---|---|---:|---|
| SRC-001 | Fuente critica no disponible | Registro de intento | low | 5 | Informar limite |
| SRC-002 | Dos o mas fuentes criticas no disponibles | Registro de intentos | medium | 15 | No emitir verde fuerte |
| SRC-003 | Fuente premium no incluida en paquete | Configuracion paquete | info | 0 | Ofrecer upgrade si aporta valor |
| SRC-004 | Fuente devuelve error ambiguo | Captura/error | low | 5 | Reintentar o revisar manual |

Regla:

Si dos o mas fuentes criticas fallan, el reporte no puede quedar Verde fuerte. Debe quedar Verde con limitacion o Amarillo bajo, segun contexto.

## 12. Reglas De Recomendacion Final

### Comprar

Condiciones:

- Riesgo Verde.
- Sin alertas registrales.
- SOAT/CITV vigentes.
- Sin deuda relevante.
- Fuentes criticas disponibles.

Texto:

"La compra puede continuar, siempre que se realice revision mecanica y validacion de documentos originales."

### Negociar

Condiciones:

- Riesgo Amarillo.
- Alertas regularizables: papeletas, SOAT, CITV, deuda menor/media.

Texto:

"Recomendamos negociar el precio o exigir regularizacion antes de pagar."

### Pedir Documentos

Condiciones:

- Dudas de titularidad.
- Fuente registral limitada.
- Operacion de alto valor.
- Senales premium no concluyentes.

Texto:

"Recomendamos pedir documentos adicionales antes de avanzar."

### Evitar / No Comprar Todavia

Condiciones:

- Riesgo Rojo.
- Regla critical.
- Captura administrativa vigente.
- Gravamen/carga seria.
- Robo/anotacion grave.

Texto:

"No recomendamos avanzar con la compra hasta que el vendedor sustente o regularice la alerta."

## 13. Pseudologica

Entrada:

- source_results[]
- package_type
- customer_context

Proceso:

1. Inicializar score = 0.
2. Evaluar reglas por categoria.
3. Sumar puntos.
4. Si existe regla critical, risk_level = Rojo.
5. Si no, clasificar por score.
6. Generar top 3 alertas por severidad.
7. Generar recomendacion.
8. Guardar reglas activadas.

Salida:

- risk_score
- risk_level
- recommendation
- activated_rules[]
- top_alerts[]
- limitations[]

## 14. Ejemplo De Salida Interna

```json
{
  "risk_score": 45,
  "risk_level": "Amarillo",
  "recommendation": "Negociar antes de pagar",
  "activated_rules": ["SOAT-002", "DEBT-003"],
  "top_alerts": [
    "SOAT vencido",
    "Deuda alta registrada en SAT"
  ],
  "limitations": [
    "Fuente municipal provincial no incluida en este paquete"
  ]
}
```

## 15. Control De Calidad

Antes de cerrar una orden:

- Revisar que cada regla activada tenga evidencia.
- Revisar que el texto del PDF no prometa certeza absoluta.
- Confirmar que una regla critical fuerce Rojo.
- Confirmar que el resumen WhatsApp no exagere.
- Guardar reglas activadas en la orden.
