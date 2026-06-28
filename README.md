# Compra Segura Vehicular

MVP profesional para validar y operar reportes vehiculares por placa en Peru.

Incluye:

- Landing SEO y orientada a conversion.
- Formulario real de creacion de ordenes.
- API server-side para ordenes.
- Esquema Supabase.
- Panel interno MVP.
- Reporte demo imprimible.
- Fallback demo cuando Supabase no esta configurado.

## Stack

- Next.js 16.
- TypeScript.
- Tailwind CSS.
- Supabase-ready.
- Zod para validacion.
- Playwright para verificacion visual.

## Rutas

- `/`: landing y formulario de solicitud.
- `/api/orders`: API para crear ordenes.
- `/panel`: panel interno MVP.
- `/reporte`: reporte demo imprimible.
- `/robots.txt` y `/sitemap.xml`: SEO tecnico.

## Variables De Entorno

Copia `.env.example` a `.env.local` y completa:

```bash
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=51999999999
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

El esquema activa RLS y no crea politicas publicas. El MVP usa route handlers server-side con service role.

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
supabase/
  schema.sql               base de datos
```

## Siguiente Paso Tecnico

1. Crear proyecto Supabase.
2. Ejecutar `supabase/schema.sql`.
3. Completar `.env.local` con anon key y service role key.
4. Crear una orden desde la landing.
5. Verificar que aparezca en `/panel`.
6. Agregar autenticacion interna para operadores.
7. Implementar carga real de evidencias y generacion de PDF.
