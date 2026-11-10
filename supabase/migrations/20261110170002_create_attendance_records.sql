create table public.attendance_records (
  id uuid not null default gen_random_uuid (),
  employee_id uuid not null,
  work_date date not null,
  check_in timestamp with time zone null,
  check_out timestamp with time zone null,
  status character varying(20) null,
  constraint attendance_records_pkey primary key (id),
  constraint unique_employee_work_date unique (employee_id, work_date),
  constraint attendance_records_employee_id_fkey foreign KEY (employee_id) references employees (id),
  constraint attendance_records_status_check check (
    (
      (status)::text = any (
        (
          array[
            'present'::character varying,
            'late'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint valid_attendance_time check (
    (
      (check_out is null)
      or (check_in is null)
      or (check_out >= check_in)
    )
  )
) TABLESPACE pg_default;