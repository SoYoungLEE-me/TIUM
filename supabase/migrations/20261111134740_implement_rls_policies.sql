-- Get the role of the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT e.role::TEXT
    FROM public.employees AS e
    WHERE e.id = (SELECT auth.uid())
    LIMIT 1;
$$;

-- Set function owner
ALTER FUNCTION public.get_current_user_role()
OWNER TO postgres;

-- Restrict function execution
REVOKE ALL ON FUNCTION public.get_current_user_role()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_current_user_role()
TO authenticated;

-- Enable Row Level Security on all tables

ALTER TABLE public.employees
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.attendance_records
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.leave_balances
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.leave_balance_transactions
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.company_settings
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.leave_types
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.approval_rules
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.leave_requests
ENABLE ROW LEVEL SECURITY;

-- Employees 정책

-- 1. Employees: employees can view their own profile
CREATE POLICY "employees_select_own"
ON public.employees
FOR SELECT
TO authenticated
USING (
    id = (SELECT auth.uid())
);

-- 2. Employees: HR admins can view all employee profiles
CREATE POLICY "employees_hr_admin_select_all"
ON public.employees
FOR SELECT
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- Attendance Records 정책

-- Employee: view own attendance records
CREATE POLICY "attendance_select_own"
ON public.attendance_records
FOR SELECT
TO authenticated
USING (
    employee_id = (SELECT auth.uid())
);

-- HR Admin: view all attendance records
CREATE POLICY "attendance_hr_admin_select_all"
ON public.attendance_records
FOR SELECT
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- Employee: create own attendance records

CREATE POLICY "attendance_insert_own"
ON public.attendance_records
FOR INSERT
TO authenticated
WITH CHECK (
    employee_id = (SELECT auth.uid())
    AND check_out IS NULL
    AND status IS NULL
);

-- HR Admin: create attendance records
CREATE POLICY "attendance_hr_admin_insert"
ON public.attendance_records
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- Leave Balances 정책

-- Employee: view own leave balance
CREATE POLICY "leave_balances_select_own"
ON public.leave_balances
FOR SELECT
TO authenticated
USING (
    employee_id = (SELECT auth.uid())
);

-- HR Admin: view all leave balances
CREATE POLICY "leave_balances_hr_admin_select_all"
ON public.leave_balances
FOR SELECT
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- HR Admin: insert leave balances
CREATE POLICY "leave_balances_hr_admin_insert"
ON public.leave_balances
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- HR Admin: update leave balances
CREATE POLICY "leave_balances_hr_admin_update"
ON public.leave_balances
FOR UPDATE
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
)
WITH CHECK (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- Leave Balance Transactions 정책

-- Employee: view own transaction history
CREATE POLICY "leave_balance_transactions_select_own"
ON public.leave_balance_transactions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.leave_balances AS lb
        WHERE lb.id = public.leave_balance_transactions.leave_balance_id
          AND lb.employee_id = (SELECT auth.uid())
    )
);

-- HR Admin: view all transaction history
CREATE POLICY "leave_balance_transactions_hr_admin_select_all"
ON public.leave_balance_transactions
FOR SELECT
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- HR Admin: insert transactions
CREATE POLICY "leave_balance_transactions_hr_admin_insert"
ON public.leave_balance_transactions
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- Company Settings 정책

-- Authenticated users: view company settings
CREATE POLICY "company_settings_select_authenticated"
ON public.company_settings
FOR SELECT
TO authenticated
USING (true);

-- HR Admin: update company settings
CREATE POLICY "company_settings_hr_admin_update"
ON public.company_settings
FOR UPDATE
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
)
WITH CHECK (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- Leave Types 정책

-- Employee: view active leave types
CREATE POLICY "leave_types_select_active"
ON public.leave_types
FOR SELECT
TO authenticated
USING (
    is_active = true
);

-- HR Admin: view all leave types
CREATE POLICY "leave_types_hr_admin_select_all"
ON public.leave_types
FOR SELECT
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- HR Admin: insert leave types
CREATE POLICY "leave_types_hr_admin_insert"
ON public.leave_types
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- HR Admin: update leave types
CREATE POLICY "leave_types_hr_admin_update"
ON public.leave_types
FOR UPDATE
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
)
WITH CHECK (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- Approval Rules 정책

-- Employee: view active approval rules
CREATE POLICY "approval_rules_select_active"
ON public.approval_rules
FOR SELECT
TO authenticated
USING (
    is_active = true
);

-- HR Admin: view all approval rules
CREATE POLICY "approval_rules_hr_admin_select_all"
ON public.approval_rules
FOR SELECT
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- HR Admin: insert approval rules
CREATE POLICY "approval_rules_hr_admin_insert"
ON public.approval_rules
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- HR Admin: update approval rules
CREATE POLICY "approval_rules_hr_admin_update"
ON public.approval_rules
FOR UPDATE
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
)
WITH CHECK (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- HR Admin: delete approval rules
CREATE POLICY "approval_rules_hr_admin_delete"
ON public.approval_rules
FOR DELETE
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

--leave_requests 정책

-- Employee: view own leave requests
CREATE POLICY "leave_requests_select_own"
ON public.leave_requests
FOR SELECT
TO authenticated
USING (
    employee_id = (SELECT auth.uid())
);

-- HR Admin: view all leave requests
CREATE POLICY "leave_requests_hr_admin_select_all"
ON public.leave_requests
FOR SELECT
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);

-- Employee: create own leave requests
CREATE POLICY "leave_requests_insert_own"
ON public.leave_requests
FOR INSERT
TO authenticated
WITH CHECK (
    employee_id = (SELECT auth.uid())
    AND status = 'pending'
    AND approval_type IS NULL
    AND decision_reason IS NULL
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND EXISTS (
        SELECT 1
        FROM public.leave_types AS lt
        WHERE lt.id = public.leave_requests.leave_type_id
          AND lt.is_active = true
    )
);

-- HR Admin: update leave requests
CREATE POLICY "leave_requests_hr_admin_update"
ON public.leave_requests
FOR UPDATE
TO authenticated
USING (
    (SELECT public.get_current_user_role()) = 'hr_admin'
)
WITH CHECK (
    (SELECT public.get_current_user_role()) = 'hr_admin'
);


-- 1. Remove existing table privileges
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


-- 2. Grant minimum required privileges to authenticated users

GRANT SELECT ON public.employees
TO authenticated;

GRANT SELECT, INSERT ON public.attendance_records
TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.leave_balances
TO authenticated;

GRANT SELECT, INSERT ON public.leave_balance_transactions
TO authenticated;

GRANT SELECT, UPDATE ON public.company_settings
TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.leave_types
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.approval_rules
TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.leave_requests
TO authenticated;