create table public.company_settings (
  id boolean not null default true,
  work_start_time time without time zone not null default '09:00:00'::time without time zone,
  work_end_time time without time zone not null default '18:00:00'::time without time zone,
  late_threshold integer not null default 0,
  auto_approval_enabled boolean not null default false,
  updated_at timestamp with time zone not null default now(),
  constraint company_settings_pkey primary key (id),
  constraint company_settings_id_check check ((id = true)),
  constraint valid_late_threshold check ((late_threshold >= 0)),
  constraint valid_working_hours check ((work_end_time > work_start_time))
) TABLESPACE pg_default;