CREATE OR REPLACE FUNCTION public.approve_leave(
    p_leave_request_id uuid
)
RETURNS public.leave_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid;
    v_user_role text;

    v_employee_id uuid;
    v_request public.leave_requests;

    v_balance_id uuid;
    v_balance_total numeric;
    v_balance_used numeric;
BEGIN
    -- 1. 로그인 사용자 및 HR 권한 확인
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    v_user_role := (SELECT public.get_current_user_role());

    IF v_user_role IS DISTINCT FROM 'hr_admin' THEN
        RAISE EXCEPTION 'Only HR administrators can approve leave.';
    END IF;

    -- 2. 휴가 신청의 직원 ID 확인
    SELECT employee_id
    INTO v_employee_id
    FROM public.leave_requests
    WHERE id = p_leave_request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Leave request not found.';
    END IF;

    -- 3. 직원 행 잠금
    PERFORM 1
    FROM public.employees
    WHERE id = v_employee_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Employee profile not found.';
    END IF;

    -- 4. 휴가 신청 조회 및 행 잠금
    SELECT *
    INTO v_request
    FROM public.leave_requests
    WHERE id = p_leave_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Leave request not found.';
    END IF;

    -- 5. pending 상태인지 확인
    IF v_request.status <> 'pending' THEN
        RAISE EXCEPTION
            'Only pending leave requests can be approved.';
    END IF;

    -- 6. 다른 승인된 신청과 날짜가 겹치는지 확인
    IF EXISTS (
        SELECT 1
        FROM public.leave_requests AS lr
        WHERE lr.employee_id = v_request.employee_id
          AND lr.id <> v_request.id
          AND lr.status = 'approved'
          AND lr.start_date <= v_request.end_date
          AND lr.end_date >= v_request.start_date
    ) THEN
        RAISE EXCEPTION
            'Leave dates overlap with another approved request.';
    END IF;

    -- 7. 연차 잔액 조회 및 행 잠금
    SELECT
        lb.id,
        lb.total_days,
        lb.used_days
    INTO
        v_balance_id,
        v_balance_total,
        v_balance_used
    FROM public.leave_balances AS lb
    WHERE lb.employee_id = v_request.employee_id
      AND lb.year = EXTRACT(YEAR FROM v_request.start_date)::integer
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Leave balance not found for this employee and year.';
    END IF;

    -- 8. 잔여 연차 재검증
    IF v_balance_total - v_balance_used < v_request.total_days THEN
        RAISE EXCEPTION
            'Insufficient leave balance. Remaining: %, Requested: %.',
            v_balance_total - v_balance_used,
            v_request.total_days;
    END IF;

    -- 9. 사용 연차 증가
    UPDATE public.leave_balances
    SET
        used_days = used_days + v_request.total_days,
        updated_at = now()
    WHERE id = v_balance_id;

    -- 10. 휴가 신청 승인
    UPDATE public.leave_requests
    SET
        status = 'approved',
        approval_type = 'manual',
        reviewed_by = v_user_id,
        reviewed_at = now()
    WHERE id = v_request.id
    RETURNING * INTO v_request;

    -- 11. 연차 차감 거래 기록 생성
    INSERT INTO public.leave_balance_transactions (
        leave_balance_id,
        leave_request_id,
        transaction_type,
        amount
    )
    VALUES (
        v_balance_id,
        v_request.id,
        'deduction',
        -v_request.total_days
    );

    RETURN v_request;
END;
$function$;

REVOKE ALL ON FUNCTION public.approve_leave(uuid)
FROM PUBLIC, anon, service_role;

GRANT EXECUTE ON FUNCTION public.approve_leave(uuid)
TO authenticated;