# Compra Segura Vehicular

MVP profesional para validar y operar reportes vehiculares por placa en Peru.

Incluye:

- Landing SEO y orientada a conversion.
- Formulario real de creacion de ordenes.
- API server-side para ordenes.
- Esquema Supabase.
- Panel interno MVP.
- Reporte demo imprimible.
- Paginas legales publicas.
- Libro de Reclamaciones con API server-side.
- Motor interno de fuentes vehiculares.
- Vercel Analytics y Speed Insights.
- Fallback demo cuando Supabase no esta configurado.

## Stack

- Next.js 16.
- TypeScript.
- Tailwind CSS.
- Supabase-ready.
- Zod para validacion.
- Playwright para verificacion visual.
- Vercel Analytics para eventos sin datos personales.

## Rutas

- `/`: landing y formulario de solicitud.
- `/api/orders`: API para crear ordenes.
- `/panel`: panel interno MVP.
- `/reporte`: reporte demo imprimible.
- `/terminos`: terminos comerciales.
- `/privacidad`: politica de privacidad.
- `/consentimiento`: consentimiento informado.
- `/libro-de-reclamaciones`: formulario de reclamos/quejas.
- `/fuentes`: orquestador interno de fuentes por placa.
- `/api/claims`: API para registrar reclamos/quejas.
- `/api/source-runs`: API para preparar plan de consulta por placa/paquete.
- `/robots.txt` y `/sitemap.xml`: SEO tecnico.

## Variables De Entorno

Copia `.env.example` a `.env.local` y completa:

```bash
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=51999999999
NEXT_PUBLIC_SUPPORT_EMAIL=compraseguravehicular@gmail.com
NEXT_PUBLIC_BUSINESS_LEGAL_NAME=Compra Segura Vehicular
NEXT_PUBLIC_BUSINESS_RUC=
NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME=Compra Segura Vehicular
NEXT_PUBLIC_PAYMENT_YAPE_NUMBER=51999999999
NEXT_PUBLIC_PAYMENT_PLIN_NUMBER=51999999999
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_SUPABASE_URL=https://ncpfiaopqaizspnwznbo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Regla importante:

`SUPABASE_SERVICE_ROLE_KEY` solo debe usarse en servidor. No debe pasar a componentes cliente.

## Base De Datos

Proyecto Supabase:

```text
https://supabase.com/dashboard/project/ncpfiaopqaizspnwznbo
```

Ejecuta el SQL de:

```text
supabase/schema.sql
```

Tablas principales:

- `customers`
- `vehicle_checks`
- `source_results`
- `evidence_files`
- `reports`
- `payments`
- `customer_claims`

El esquema activa RLS y no crea politicas publicas. El MVP usa route handlers server-side con service role.

Si la base ya existe, ejecuta solo:

```text
supabase/customer_claims_migration.sql
```

## Desarrollo

```bash
npm install
npm run dev
```

Servidor:

```text
http://127.0.0.1:3000
```

## Verificacion

```bash
npm run build
npm audit --audit-level=moderate
```

Estado actual:

- Build correcto.
- Auditoria sin vulnerabilidades.
- API `/api/orders` probada en modo demo.

## Arquitectura

```text
app/
  api/orders/route.ts      API server-side
  page.tsx                 landing
  panel/page.tsx           panel dinamico
  reporte/page.tsx         reporte demo
components/
  order-intake-form.tsx    formulario cliente
lib/
  domain.ts                tipos de negocio
  validators.ts            validacion Zod
  supabase/server.ts       cliente server-side
  orders/repository.ts     capa de datos
  orders/pricing.ts        precios
  orders/source-templates.ts fuentes iniciales
  sources/registry.ts      matriz profesional de fuentes
  sources/runner.ts        orquestador de fuentes
supabase/
  schema.sql               base de datos
```

## Siguiente Paso Tecnico

1. Crear proyecto Supabase.
2. Ejecutar `supabase/schema.sql`.
3. Completar `.env.local` con anon key y service role key.
4. Crear una orden desde la landing.
5. Verificar que aparezca en `/panel`.
6. Ejecutar `supabase/customer_claims_migration.sql` si el proyecto ya estaba creado.
7. Completar razon social, RUC, Yape/Plin y verificacion de Google Search Console.
8. Probar `/fuentes` con placas reales y registrar que fuentes permiten automatizacion estable.
9. Agregar autenticacion interna para operadores.
10. Implementar carga real de evidencias y generacion de PDF.
