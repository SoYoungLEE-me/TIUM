create table public.leave_balance_transactions (
  id uuid not null default gen_random_uuid (),
  leave_balance_id uuid not null,
  leave_request_id uuid null,
  transaction_type character varying(20) not null,
  amount numeric(5, 2) not null,
  created_at timestamp with time zone not null default now(),
  constraint leave_balance_transactions_pkey primary key (id),
  constraint leave_balance_transactions_leave_balance_id_fkey foreign KEY (leave_balance_id) references leave_balances (id),
  constraint leave_balance_transactions_leave_request_id_fkey foreign KEY (leave_request_id) references leave_requests (id),
  constraint leave_balance_transactions_transaction_type_check check (
    (
      (transaction_type)::text = any (
        (
          array[
            'grant'::character varying,
            'deduction'::character varying,
            'restoration'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint non_zero_transaction_amount check ((amount <> (0)::numeric)),
  constraint valid_transaction_amount check (
    (
      (
        ((transaction_type)::text = 'grant'::text)
        and (amount > (0)::numeric)
      )
      or (
        ((transaction_type)::text = 'deduction'::text)
        and (amount < (0)::numeric)
      )
      or (
        ((transaction_type)::text = 'restoration'::text)
        and (amount > (0)::numeric)
      )
    )
  )
) TABLESPACE pg_default;