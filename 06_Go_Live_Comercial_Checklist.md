# Go-Live Comercial - Compra Segura Vehicular

## Ya implementado en codigo

- Landing productiva con formulario de orden.
- API server-side para ordenes.
- Panel interno conectado a Supabase.
- Paginas de terminos, privacidad y consentimiento.
- Libro de Reclamaciones con formulario y API.
- Vercel Analytics y Speed Insights.
- Eventos de conversion: clicks a WhatsApp, reporte demo, panel interno, orden creada y reclamo creado.
- Sitemap y robots alineados al dominio configurado.
- Variables de entorno para datos legales, pago y Search Console.

## Acciones externas obligatorias

1. Completar identidad legal:
   - Razon social o nombre comercial del titular.
   - RUC.
   - Email formal de soporte.

2. Completar pagos:
   - Numero Yape.
   - Numero Plin.
   - Titular de cuenta.
   - Proceso de validacion de comprobantes.

3. Ejecutar migracion de reclamos en Supabase:
   - Archivo: `supabase/customer_claims_migration.sql`.

4. Conectar dominio propio:
   - Recomendado: `compraseguravehicular.pe`.
   - Actualizar `NEXT_PUBLIC_SITE_URL`.
   - Redeploy en Vercel.

5. Activar Search Console:
   - Crear propiedad con el dominio.
   - Copiar meta token en `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
   - Redeploy.
   - Enviar `/sitemap.xml`.

6. Autorizar GitHub en Vercel:
   - Vercel > Project > Settings > Git > Connect Git Repository.
   - Repo: `compraseguravehicular/compraseguravehicular`.

## Primer proceso comercial

1. Cliente llena formulario o escribe por WhatsApp.
2. Sistema crea orden en Supabase.
3. Cliente paga por Yape/Plin.
4. Operador marca pago confirmado.
5. Operador consulta fuentes y guarda evidencia.
6. Operador entrega resumen/PDF.
7. Orden queda cerrada o en observacion.

## Metricas de la primera semana

- Visitas a landing.
- Clicks a WhatsApp.
- Formularios enviados.
- Ordenes pagadas.
- Tiempo promedio de entrega.
- Reclamos o devoluciones.
- Fuentes que mas fallan.

## Regla de decision

Si en 7 dias hay formularios pero pocos pagos, ajustar oferta/precio/confianza.
Si hay pagos pero mucha demora operativa, automatizar fuentes o reducir alcance.
Si hay reclamos por expectativas, reforzar copy, terminos y muestra de reporte.
