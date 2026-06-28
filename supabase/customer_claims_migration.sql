create table if not exists public.customer_claims (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  full_name text not null,
  document_number text not null,
  email text not null,
  phone text not null,
  address text not null,
  order_code text,
  claim_type text not null check (claim_type in ('reclamo', 'queja')),
  product_service text not null,
  amount numeric(10, 2),
  detail text not null,
  request text not null,
  status text not null default 'received' check (
    status in ('received', 'in_review', 'answered', 'closed', 'rejected')
  ),
  response text,
  consent_accepted boolean not null default false,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_claims_code_idx on public.customer_claims (code);
create index if not exists customer_claims_status_idx on public.customer_claims (status);
create index if not exists customer_claims_created_at_idx on public.customer_claims (created_at desc);

drop trigger if exists customer_claims_set_updated_at on public.customer_claims;
create trigger customer_claims_set_updated_at
before update on public.customer_claims
for each row execute function public.set_updated_at();

alter table public.customer_claims enable row level security;
