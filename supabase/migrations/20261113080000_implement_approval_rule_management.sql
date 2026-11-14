
-- 승인 규칙 관리 (Approval Rule Management)
-- 기준 시간대: Asia/Seoul (한국 표준시)

BEGIN;


-- 1. 활성 승인 규칙은 최대 1개만 허용
--    활성 규칙이 0개인 상태도 허용

CREATE UNIQUE INDEX IF NOT EXISTS approval_rules_single_active_idx
ON public.approval_rules ((is_active))
WHERE is_active = true;


DROP FUNCTION IF EXISTS public.create_approval_rule(
    character varying,
    integer,
    integer,
    boolean
);

DROP FUNCTION IF EXISTS public.update_approval_rule(
    uuid,
    character varying,
    integer,
    integer,
    boolean
);

DROP FUNCTION IF EXISTS public.apply_leave(
    uuid,
    date,
    date,
    numeric,
    text
);



-- 3. 승인 규칙 생성 (CREATE APPROVAL RULE)

CREATE OR REPLACE FUNCTION public.create_approval_rule(
    p_rule_name text,
    p_min_notice_days integer,
    p_max_consecutive_days integer,
    p_is_active boolean
)
RETURNS public.approval_rules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid;
    v_user_role text;
    v_rule public.approval_rules;
BEGIN
    -- 1. 사용자 인증 확인
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 2. HR 관리자 권한 확인
    v_user_role := (
        SELECT public.get_current_user_role()
    );

    IF v_user_role IS DISTINCT FROM 'hr_admin' THEN
        RAISE EXCEPTION
            'Only HR administrators can create approval rules.';
    END IF;

    -- 3. 입력값 검증
    -- 규칙 이름은 필수이며 공백만 입력할 수 없음
    IF p_rule_name IS NULL
       OR LENGTH(TRIM(p_rule_name)) = 0 THEN
        RAISE EXCEPTION 'Rule name is required.';
    END IF;

    -- 규칙 이름은 최대 100자까지 허용
    IF LENGTH(TRIM(p_rule_name)) > 100 THEN
        RAISE EXCEPTION
            'Rule name cannot exceed 100 characters.';
    END IF;

    -- 최소 사전 신청일은 0일 이상이어야 함
    IF p_min_notice_days IS NULL
       OR p_min_notice_days < 0 THEN
        RAISE EXCEPTION
            'Minimum notice days must be zero or greater.';
    END IF;

    -- 최대 연속 휴가 일수는 NULL 또는 1일 이상이어야 함
    IF p_max_consecutive_days IS NOT NULL
       AND p_max_consecutive_days <= 0 THEN
        RAISE EXCEPTION
            'Maximum consecutive days must be greater than zero.';
    END IF;

    -- 활성 상태는 반드시 입력해야 함
    IF p_is_active IS NULL THEN
        RAISE EXCEPTION 'Active status is required.';
    END IF;

    -- 4. 승인 규칙 변경 작업의 동시성 제어
    -- 동일한 잠금 키를 사용하여 규칙 생성 및 수정 작업이
    -- 동시에 실행되지 않도록 방지
    PERFORM pg_advisory_xact_lock(2026, 1);

    -- 5. 이미 활성화된 규칙이 있는지 확인
    -- 활성 규칙이 존재하면 새로운 활성 규칙 생성 거부
    IF p_is_active
       AND EXISTS (
           SELECT 1
           FROM public.approval_rules
           WHERE is_active = true
       ) THEN
        RAISE EXCEPTION
            'An active approval rule already exists.';
    END IF;

    -- 6. 승인 규칙 생성
    INSERT INTO public.approval_rules (
        rule_name,
        min_notice_days,
        max_consecutive_days,
        is_active
    )
    VALUES (
        TRIM(p_rule_name),
        p_min_notice_days,
        p_max_consecutive_days,
        p_is_active
    )
    RETURNING * INTO v_rule;

    RETURN v_rule;
END;
$function$;



-- 4. 승인 규칙 수정 (UPDATE APPROVAL RULE)

CREATE OR REPLACE FUNCTION public.update_approval_rule(
    p_rule_id uuid,
    p_rule_name text,
    p_min_notice_days integer,
    p_max_consecutive_days integer,
    p_is_active boolean
)
RETURNS public.approval_rules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid;
    v_user_role text;
    v_existing_rule public.approval_rules;
    v_rule public.approval_rules;
BEGIN
    -- 1. 사용자 인증 확인
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 2. HR 관리자 권한 확인
    v_user_role := (
        SELECT public.get_current_user_role()
    );

    IF v_user_role IS DISTINCT FROM 'hr_admin' THEN
        RAISE EXCEPTION
            'Only HR administrators can update approval rules.';
    END IF;

    -- 3. 수정할 승인 규칙 ID 검증
    IF p_rule_id IS NULL THEN
        RAISE EXCEPTION 'Rule ID is required.';
    END IF;

    -- 4. 승인 규칙 변경 작업의 동시성 제어
    PERFORM pg_advisory_xact_lock(2026, 1);

    -- 5. 수정할 승인 규칙 조회 및 행 잠금
    -- 다른 트랜잭션에서 동일한 규칙을 동시에 수정하지 못하도록 방지
    SELECT *
    INTO v_existing_rule
    FROM public.approval_rules
    WHERE id = p_rule_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Approval rule not found.';
    END IF;

    -- 6. 입력값 검증
    -- 규칙 이름은 필수이며 공백만 입력할 수 없음
    IF p_rule_name IS NULL
       OR LENGTH(TRIM(p_rule_name)) = 0 THEN
        RAISE EXCEPTION 'Rule name is required.';
    END IF;

    -- 규칙 이름은 최대 100자까지 허용
    IF LENGTH(TRIM(p_rule_name)) > 100 THEN
        RAISE EXCEPTION
            'Rule name cannot exceed 100 characters.';
    END IF;

    -- 최소 사전 신청일은 0일 이상이어야 함
    IF p_min_notice_days IS NULL
       OR p_min_notice_days < 0 THEN
        RAISE EXCEPTION
            'Minimum notice days must be zero or greater.';
    END IF;

    -- 최대 연속 휴가 일수는 NULL 또는 1일 이상이어야 함
    IF p_max_consecutive_days IS NOT NULL
       AND p_max_consecutive_days <= 0 THEN
        RAISE EXCEPTION
            'Maximum consecutive days must be greater than zero.';
    END IF;

    -- 활성 상태는 반드시 입력해야 함
    IF p_is_active IS NULL THEN
        RAISE EXCEPTION 'Active status is required.';
    END IF;

    -- 7. 다른 활성 규칙과의 중복 확인
    -- 다른 규칙이 이미 활성화되어 있다면 현재 규칙 활성화 거부
    IF p_is_active
       AND EXISTS (
           SELECT 1
           FROM public.approval_rules
           WHERE is_active = true
             AND id <> p_rule_id
       ) THEN
        RAISE EXCEPTION
            'Another active approval rule already exists.';
    END IF;

    -- 8. 승인 규칙 수정
    -- 마지막 활성 규칙을 비활성화하는 것도 허용
    -- 수정 시 updated_at을 현재 시각으로 갱신
    UPDATE public.approval_rules
    SET
        rule_name = TRIM(p_rule_name),
        min_notice_days = p_min_notice_days,
        max_consecutive_days = p_max_consecutive_days,
        is_active = p_is_active,
        updated_at = clock_timestamp()
    WHERE id = p_rule_id
    RETURNING * INTO v_rule;

    RETURN v_rule;
END;
$function$;

-- 5. 연차 신청 (APPLY LEAVE)
--    기존 4개 인자 인터페이스 유지
--    신청 일수는 서버에서 날짜를 기준으로 계산

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
    -- 1. 사용자 인증 확인
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 2. 연차 신청 날짜 검증
    -- 시작일과 종료일은 필수 입력값
    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        RAISE EXCEPTION
            'Start date and end date are required.';
    END IF;

    -- 종료일은 시작일보다 빠를 수 없음
    IF p_end_date < p_start_date THEN
        RAISE EXCEPTION
            'End date must not be earlier than start date.';
    END IF;

    -- 한국 시간 기준 과거 날짜 신청 차단
    IF p_start_date <
       (clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date THEN
        RAISE EXCEPTION
            'Leave start date cannot be in the past.';
    END IF;

    -- 서로 다른 연도에 걸친 연차 신청 차단
    IF EXTRACT(YEAR FROM p_start_date)
       <> EXTRACT(YEAR FROM p_end_date) THEN
        RAISE EXCEPTION
            'Leave requests cannot span multiple years.';
    END IF;

    -- 시작일과 종료일을 모두 포함한 달력 날짜 기준 신청 일수 계산
    -- 클라이언트가 전달한 값이 아닌 서버에서 직접 계산
    v_total_days := p_end_date - p_start_date + 1;

    -- 3. 직원 프로필 확인 및 행 잠금
    -- 로그인한 사용자의 직원 정보만 조회
    -- 연차 신청과 관련된 동시 작업을 방지하기 위해 행 잠금
    SELECT id
    INTO v_employee_id
    FROM public.employees
    WHERE id = v_user_id
      AND role = 'employee'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Employee profile not found or user is not an employee.';
    END IF;

    -- 4. 활성 휴가 유형 확인
    -- 존재하지 않거나 비활성화된 휴가 유형은 신청 불가
    SELECT id
    INTO v_leave_type_id
    FROM public.leave_types
    WHERE id = p_leave_type_id
      AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Invalid or inactive leave type.';
    END IF;

    -- 5. 활성 승인 규칙 조회 및 동시성 제어
    -- 승인 규칙 생성 및 수정 함수에서 사용하는 잠금과 동일한 키 사용
    -- 공유 잠금을 사용하여 연차 신청 중 승인 규칙 변경 방지

    PERFORM pg_advisory_xact_lock_shared(2026, 1);

    -- 현재 활성화된 승인 규칙 개수 확인
    SELECT COUNT(*)
    INTO v_active_rule_count
    FROM public.approval_rules
    WHERE is_active = true;

    -- 활성 승인 규칙은 최대 1개만 허용
    IF v_active_rule_count > 1 THEN
        RAISE EXCEPTION
            'Multiple active approval rules exist.';
    END IF;

    -- 활성 승인 규칙이 존재하는 경우에만 해당 규칙 적용
    -- 활성 규칙이 없다면 사전 신청일 및 최대 연속 일수 제한을 적용하지 않음
    IF v_active_rule_count = 1 THEN

        -- 현재 활성 승인 규칙의 조건 조회 및 행 잠금
        SELECT
            min_notice_days,
            max_consecutive_days
        INTO
            v_min_notice_days,
            v_max_consecutive_days
        FROM public.approval_rules
        WHERE is_active = true
        FOR SHARE;

        -- 6. 최소 사전 신청일 검증
        -- 한국 시간 기준 신청일과 휴가 시작일 사이의 기간 확인
        IF p_start_date <
           (
               (clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date
               + v_min_notice_days
           ) THEN
            RAISE EXCEPTION
                'Leave must be requested at least % days in advance.',
                v_min_notice_days;
        END IF;

        -- 7. 최대 연속 휴가 일수 검증
        -- 주말 및 공휴일을 포함한 달력 날짜 기준으로 검증
        IF v_max_consecutive_days IS NOT NULL
           AND v_total_days > v_max_consecutive_days THEN
            RAISE EXCEPTION
                'Leave duration exceeds the maximum of % days.',
                v_max_consecutive_days;
        END IF;

    END IF;

    -- 8. 기존 연차 신청과 날짜 중복 여부 확인
    -- 대기 중이거나 승인 완료된 신청과 기간이 겹치면 신청 거부
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

    -- 9. 해당 연도의 잔여 연차 조회 및 잔액 행 잠금
    -- 동시에 여러 연차 신청이 발생할 때 잔액 검증의 동시성 문제 방지
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

    -- 잔여 연차가 신청 일수보다 적으면 신청 거부
    IF v_total_balance - v_used_balance < v_total_days THEN
        RAISE EXCEPTION
            'Insufficient leave balance. Remaining: %, Requested: %.',
            v_total_balance - v_used_balance,
            v_total_days;
    END IF;

    -- 10. 연차 신청 생성
    -- 신청자는 auth.uid()를 통해 확인한 사용자로 설정
    -- 신청 상태는 pending으로 생성
    -- 입력된 사유가 공백뿐이면 NULL로 저장
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
        v_employee_id,
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



-- 6. 함수 소유자 설정

-- 세 함수의 소유자를 postgres로 설정
-- SECURITY DEFINER 함수가 지정된 소유자 권한으로 실행되도록 설정

ALTER FUNCTION public.create_approval_rule(
    text,
    integer,
    integer,
    boolean
) OWNER TO postgres;

ALTER FUNCTION public.update_approval_rule(
    uuid,
    text,
    integer,
    integer,
    boolean
) OWNER TO postgres;

ALTER FUNCTION public.apply_leave(
    uuid,
    date,
    date,
    text
) OWNER TO postgres;



-- 7. 함수 실행 권한 설정

-- 기본적으로 모든 역할의 기존 실행 권한 제거
-- PUBLIC, anon, authenticated의 기존 권한 제거

REVOKE ALL ON FUNCTION public.create_approval_rule(
    text,
    integer,
    integer,
    boolean
) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.update_approval_rule(
    uuid,
    text,
    integer,
    integer,
    boolean
) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.apply_leave(
    uuid,
    date,
    date,
    text
) FROM PUBLIC, anon, authenticated;

-- 로그인한 사용자(authenticated)에게만 함수 실행 권한 부여
-- 실제 관리자 권한 및 사용자 역할은 함수 내부에서 별도로 검증

GRANT EXECUTE ON FUNCTION public.create_approval_rule(
    text,
    integer,
    integer,
    boolean
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.update_approval_rule(
    uuid,
    text,
    integer,
    integer,
    boolean
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.apply_leave(
    uuid,
    date,
    date,
    text
) TO authenticated;



-- 8. 테이블 직접 수정 권한 제한

-- 승인 규칙 테이블의 직접 INSERT, UPDATE, DELETE 권한 제거
-- 승인 규칙 변경은 SECURITY DEFINER 함수로만 수행하도록 제한

REVOKE INSERT, UPDATE, DELETE
ON TABLE public.approval_rules
FROM authenticated;

-- 연차 신청 테이블의 직접 INSERT 권한 제거
-- 연차 신청은 apply_leave() 함수를 통해서만 생성하도록 제한

REVOKE INSERT
ON TABLE public.leave_requests
FROM authenticated;


COMMIT;
