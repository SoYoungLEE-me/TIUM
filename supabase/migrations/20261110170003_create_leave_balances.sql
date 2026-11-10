create table public.leave_balances (
  id uuid not null default gen_random_uuid (),
  employee_id uuid not null,
  year integer not null,
  total_days numeric(5, 2) not null default 0,
  used_days numeric(5, 2) not null default 0,
  updated_at timestamp with time zone not null default now(),
  constraint leave_balances_pkey primary key (id),
  constraint unique_employee_year unique (employee_id, year),
  constraint leave_balances_employee_id_fkey foreign KEY (employee_id) references employees (id),
  constraint valid_leave_balance check (
    (
      (total_days >= (0)::numeric)
      and (used_days >= (0)::numeric)
      and (used_days <= total_days)
    )
  )
) TABLESPACE pg_default;