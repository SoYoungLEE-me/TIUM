create table public.approval_rules (
  id uuid not null default gen_random_uuid (),
  rule_name character varying(100) not null,
  max_consecutive_days integer null,
  min_notice_days integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint approval_rules_pkey primary key (id),
  constraint valid_max_consecutive_days check (
    (
      (max_consecutive_days is null)
      or (max_consecutive_days > 0)
    )
  ),
  constraint valid_min_notice_days check ((min_notice_days >= 0))
) TABLESPACE pg_default;