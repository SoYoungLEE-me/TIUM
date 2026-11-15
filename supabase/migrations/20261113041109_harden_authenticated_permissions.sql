-- Harden authenticated table permissions.
-- All authenticated users can read through RLS,
-- while write operations must go through approved database functions.

-- 1. Remove obsolete write policies.

DROP POLICY IF EXISTS "attendance_insert_own"
ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_hr_admin_insert"
ON public.attendance_records;
DROP POLICY IF EXISTS "leave_balances_hr_admin_insert"
ON public.leave_balances;
DROP POLICY IF EXISTS "leave_balances_hr_admin_update"
ON public.leave_balances;
DROP POLICY IF EXISTS "leave_balance_transactions_hr_admin_insert"
ON public.leave_balance_transactions;
DROP POLICY IF EXISTS "company_settings_hr_admin_update"
ON public.company_settings;
DROP POLICY IF EXISTS "leave_types_hr_admin_insert"
ON public.leave_types;
DROP POLICY IF EXISTS "leave_types_hr_admin_update"
ON public.leave_types;
DROP POLICY IF EXISTS "approval_rules_hr_admin_insert"
ON public.approval_rules;
DROP POLICY IF EXISTS "approval_rules_hr_admin_update"
ON public.approval_rules;
DROP POLICY IF EXISTS "approval_rules_hr_admin_delete"
ON public.approval_rules;
DROP POLICY IF EXISTS "leave_requests_own_insert"
ON public.leave_requests;
DROP POLICY IF EXISTS "leave_requests_hr_admin_update"
ON public.leave_requests;
-- 2. Revoke all direct table privileges from client roles.

REVOKE ALL PRIVILEGES ON TABLE
    public.employees,
    public.attendance_records,
    public.leave_balances,
    public.leave_balance_transactions,
    public.company_settings,
    public.leave_types,
    public.approval_rules,
    public.leave_requests
FROM PUBLIC, anon, authenticated;
-- 3. Grant read-only access to authenticated users.
-- RLS policies determine which rows each user can read.

GRANT SELECT ON TABLE
    public.employees,
    public.attendance_records,
    public.leave_balances,
    public.leave_balance_transactions,
    public.company_settings,
    public.leave_types,
    public.approval_rules,
    public.leave_requests
TO authenticated;
