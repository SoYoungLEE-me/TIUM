
CREATE OR REPLACE FUNCTION public.apply_leave(
    p_leave_type_id uuid,
    p_start_date date,
    p_end_date date,
    p_reason text DEFAULT NULL
)
RETURNS public.leave_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid;
    v_employee_id uuid;

    v_leave_type_id uuid;
    v_min_notice_days integer;
    v_max_consecutive_days integer;
    v_active_rule_count integer;

    v_total_days integer;
    v_total_balance numeric;
    v_used_balance numeric;

    v_request public.leave_requests;
BEGIN
    -- 1. 로그인 사용자 확인
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 2. 날짜 검증
    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        RAISE EXCEPTION 'Start date and end date are required.';
    END IF;

    IF p_end_date < p_start_date THEN
        RAISE EXCEPTION 'End date must not be earlier than start date.';
    END IF;

    -- 과거 날짜 신청 차단 (한국 시간 기준)
    IF p_start_date <
       (now() AT TIME ZONE 'Asia/Seoul')::date THEN
        RAISE EXCEPTION
            'Leave start date cannot be in the past.';
    END IF;

    -- 다른 연도로 넘어가는 신청 거절
    IF EXTRACT(YEAR FROM p_start_date)
       <> EXTRACT(YEAR FROM p_end_date) THEN
        RAISE EXCEPTION 'Leave requests cannot span multiple years.';
    END IF;

    -- 달력 날짜 기준 일수 계산 (시작일과 종료일 포함)
    v_total_days := p_end_date - p_start_date + 1;

    -- 3. 직원 행 잠금
    SELECT id
    INTO v_employee_id
    FROM public.employees
    WHERE id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Employee profile not found.';
    END IF;

    -- 4. 활성 휴가 유형 확인
    SELECT id
    INTO v_leave_type_id
    FROM public.leave_types
    WHERE id = p_leave_type_id
      AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or inactive leave type.';
    END IF;

    -- 5. 활성 승인 규칙 확인
    SELECT COUNT(*)
    INTO v_active_rule_count
    FROM public.approval_rules
    WHERE is_active = true;

    IF v_active_rule_count <> 1 THEN
        RAISE EXCEPTION
            'Exactly one active approval rule must exist.';
    END IF;

    SELECT
        min_notice_days,
        max_consecutive_days
    INTO
        v_min_notice_days,
        v_max_consecutive_days
    FROM public.approval_rules
    WHERE is_active = true
    FOR SHARE;

    -- 6. 최소 사전 신청일 검증 (한국 시간 기준)
    IF p_start_date <
       (
           (now() AT TIME ZONE 'Asia/Seoul')::date
           + v_min_notice_days
       ) THEN
        RAISE EXCEPTION
            'Leave must be requested at least % days in advance.',
            v_min_notice_days;
    END IF;

    -- 7. 최대 연속 휴가 일수 검증
    IF v_max_consecutive_days IS NOT NULL
       AND v_total_days > v_max_consecutive_days THEN
        RAISE EXCEPTION
            'Leave duration exceeds the maximum of % days.',
            v_max_consecutive_days;
    END IF;

    -- 8. 중복 신청 확인
    IF EXISTS (
        SELECT 1
        FROM public.leave_requests
        WHERE employee_id = v_user_id
          AND status IN ('pending', 'approved')
          AND start_date <= p_end_date
          AND end_date >= p_start_date
    ) THEN
        RAISE EXCEPTION
            'Leave dates overlap with an existing pending or approved request.';
    END IF;

    -- 9. 해당 연도 잔여 연차 확인 및 잔액 행 잠금
    SELECT total_days, used_days
    INTO v_total_balance, v_used_balance
    FROM public.leave_balances
    WHERE employee_id = v_user_id
      AND year = EXTRACT(YEAR FROM p_start_date)::integer
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Leave balance not found for the requested year.';
    END IF;

    IF v_total_balance - v_used_balance < v_total_days THEN
        RAISE EXCEPTION
            'Insufficient leave balance. Remaining: %, Requested: %.',
            v_total_balance - v_used_balance,
            v_total_days;
    END IF;

    -- 10. 휴가 신청 생성
    INSERT INTO public.leave_requests (
        employee_id,
        leave_type_id,
        start_date,
        end_date,
        total_days,
        reason,
        status
    )
    VALUES (
        v_user_id,
        v_leave_type_id,
        p_start_date,
        p_end_date,
        v_total_days,
        NULLIF(TRIM(p_reason), ''),
        'pending'
    )
    RETURNING * INTO v_request;

    RETURN v_request;
END;
$function$;
