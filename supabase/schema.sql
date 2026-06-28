create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicle_checks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  plate text not null,
  package_type text not null check (package_type in ('express', 'compra_segura', 'pro')),
  status text not null default 'pending_payment' check (
    status in (
      'created',
      'pending_payment',
      'paid',
      'processing',
      'manual_review_required',
      'completed',
      'delivered',
      'cancelled',
      'failed'
    )
  ),
  risk_level text not null default 'Pendiente' check (risk_level in ('Pendiente', 'Verde', 'Amarillo', 'Rojo')),
  recommendation text,
  total_price numeric(10, 2) not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'confirmed', 'failed', 'refunded')),
  source_channel text not null default 'landing',
  city text not null,
  vehicle_type text not null,
  seller_name text,
  seller_document text,
  listing_url text,
  vin text,
  mileage integer,
  notes text,
  consent_accepted boolean not null default false,
  started_at timestamptz,
  completed_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vehicle_checks_plate_idx on public.vehicle_checks (plate);
create index if not exists vehicle_checks_status_idx on public.vehicle_checks (status);
create index if not exists vehicle_checks_created_at_idx on public.vehicle_checks (created_at desc);
create index if not exists vehicle_checks_customer_id_idx on public.vehicle_checks (customer_id);

drop trigger if exists vehicle_checks_set_updated_at on public.vehicle_checks;
create trigger vehicle_checks_set_updated_at
before update on public.vehicle_checks
for each row execute function public.set_updated_at();

create table if not exists public.source_results (
  id uuid primary key default gen_random_uuid(),
  check_id uuid not null references public.vehicle_checks(id) on delete cascade,
  source_name text not null,
  source_category text not null,
  status text not null default 'pending' check (
    status in (
      'pending',
      'consulted_no_alert',
      'consulted_with_alert',
      'unavailable',
      'not_applicable',
      'not_included',
      'requires_manual_document',
      'failed'
    )
  ),
  confidence_level text not null default 'Media' check (confidence_level in ('Alta', 'Media', 'Baja', 'No aplica')),
  summary text,
  raw_data jsonb,
  evidence_url text,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists source_results_check_id_idx on public.source_results (check_id);
create index if not exists source_results_status_idx on public.source_results (status);

drop trigger if exists source_results_set_updated_at on public.source_results;
create trigger source_results_set_updated_at
before update on public.source_results
for each row execute function public.set_updated_at();

create table if not exists public.evidence_files (
  id uuid primary key default gen_random_uuid(),
  check_id uuid not null references public.vehicle_checks(id) on delete cascade,
  source_result_id uuid references public.source_results(id) on delete set null,
  source_name text not null,
  file_url text not null,
  file_type text not null,
  contains_personal_data boolean not null default false,
  visible_in_pdf boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists evidence_files_check_id_idx on public.evidence_files (check_id);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  check_id uuid not null references public.vehicle_checks(id) on delete cascade,
  report_code text not null unique,
  pdf_url text,
  whatsapp_summary text,
  status text not null default 'draft' check (status in ('draft', 'review', 'approved', 'delivered')),
  created_at timestamptz not null default now()
);

create index if not exists reports_check_id_idx on public.reports (check_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  check_id uuid not null references public.vehicle_checks(id) on delete cascade,
  method text not null check (method in ('yape', 'plin', 'transfer', 'payment_link', 'cash', 'other')),
  amount numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed', 'refunded')),
  proof_url text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists payments_check_id_idx on public.payments (check_id);
create index if not exists payments_status_idx on public.payments (status);

alter table public.customers enable row level security;
alter table public.vehicle_checks enable row level security;
alter table public.source_results enable row level security;
alter table public.evidence_files enable row level security;
alter table public.reports enable row level security;
alter table public.payments enable row level security;

-- No public policies are created intentionally.
-- The MVP uses server-side route handlers with SUPABASE_SERVICE_ROLE_KEY.
-- Add authenticated role policies only when there is a real internal auth flow.
