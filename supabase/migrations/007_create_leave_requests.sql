create table public.leave_requests (
  id uuid not null default gen_random_uuid (),
  employee_id uuid not null,
  leave_type_id uuid not null,
  start_date date not null,
  end_date date not null,
  total_days numeric(5, 2) not null,
  reason text null,
  status character varying(20) not null default 'pending'::character varying,
  approval_type character varying(20) null,
  decision_reason text null,
  reviewed_by uuid null,
  reviewed_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  constraint leave_requests_pkey primary key (id),
  constraint leave_requests_reviewed_by_fkey foreign KEY (reviewed_by) references employees (id),
  constraint leave_requests_employee_id_fkey foreign KEY (employee_id) references employees (id),
  constraint leave_requests_leave_type_id_fkey foreign KEY (leave_type_id) references leave_types (id),
  constraint valid_leave_dates check ((end_date >= start_date)),
  constraint leave_requests_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pending'::character varying,
            'approved'::character varying,
            'rejected'::character varying,
            'cancelled'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint positive_leave_days check ((total_days > (0)::numeric)),
  constraint leave_requests_approval_type_check check (
    (
      (approval_type)::text = any (
        (
          array[
            'auto'::character varying,
            'manual'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;