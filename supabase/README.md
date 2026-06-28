# Supabase Setup

Project dashboard:

```text
https://supabase.com/dashboard/project/ncpfiaopqaizspnwznbo
```

Project URL:

```text
https://ncpfiaopqaizspnwznbo.supabase.co
```

## 1. Ejecutar Esquema

Abre el SQL Editor del dashboard y ejecuta:

```text
supabase/schema.sql
```

Esto crea:

- `customers`
- `vehicle_checks`
- `source_results`
- `evidence_files`
- `reports`
- `payments`

Tambien activa RLS sin politicas publicas. El MVP usa route handlers server-side con `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Completar `.env.local`

Desde Supabase Dashboard:

```text
Project Settings -> API
```

Completa:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Regla de seguridad:

La service role key nunca debe ir al navegador, repositorio, screenshots ni mensajes publicos.

## 3. Verificar

1. Reinicia `npm run dev`.
2. Crea una orden desde la landing.
3. Abre `/panel`.
4. La orden debe aparecer como dato real y ya no como modo demo.
