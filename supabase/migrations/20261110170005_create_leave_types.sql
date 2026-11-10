create table public.leave_types (
  id uuid not null default gen_random_uuid (),
  name character varying(50) not null,
  deduction_days numeric(3, 2) not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint leave_types_pkey primary key (id),
  constraint leave_types_name_key unique (name),
  constraint positive_deduction_days check ((deduction_days > (0)::numeric))
) TABLESPACE pg_default;