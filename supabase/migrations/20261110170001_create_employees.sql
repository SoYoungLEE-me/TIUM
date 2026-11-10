create table public.employees (
  id uuid not null,
  full_name character varying(100) not null,
  email character varying(255) not null,
  role character varying(20) not null,
  department character varying(100) null,
  created_at timestamp with time zone not null default now(),
  constraint employees_pkey primary key (id),
  constraint employees_email_key unique (email),
  constraint employees_id_fkey foreign KEY (id) references auth.users (id),
  constraint employees_role_check check (
    (
      (role)::text = any (
        (
          array[
            'employee'::character varying,
            'hr_admin'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;