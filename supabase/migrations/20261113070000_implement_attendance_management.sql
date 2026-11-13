-- ============================================================
-- 근태 관리 (Attendance Management)
-- 기준 시간대: Asia/Seoul
-- ============================================================

-- 1. 출근 처리
CREATE OR REPLACE FUNCTION public.check_in()
RETURNS public.attendance_records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid;
    v_user_role text;
    v_now timestamptz;
    v_work_date date;
    v_local_time time;
    v_allowed_until time;
    v_settings public.company_settings;
    v_attendance public.attendance_records;
BEGIN
    -- 사용자 인증 확인
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 일반 직원(employee) 역할만 허용
    v_user_role := (SELECT public.get_current_user_role());

    IF v_user_role IS DISTINCT FROM 'employee' THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 서버 시간을 가져오고 한국 시간 기준 근무 날짜 계산
    v_now := clock_timestamp();
    v_work_date := (v_now AT TIME ZONE 'Asia/Seoul')::date;
    v_local_time := (v_now AT TIME ZONE 'Asia/Seoul')::time;

    -- 직원 행 잠금 (동시 요청 방지)
    PERFORM 1
    FROM public.employees
    WHERE id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 회사 설정 조회
    SELECT *
    INTO v_settings
    FROM public.company_settings
    WHERE id = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'SETTINGS_NOT_FOUND';
    END IF;

    -- 지각 허용 시간 계산
    v_allowed_until :=
        v_settings.work_start_time
        + make_interval(mins => v_settings.late_threshold);

    -- 근태 기록 생성
    INSERT INTO public.attendance_records (
        employee_id,
        work_date,
        check_in,
        check_out,
        status
    )
    VALUES (
        v_user_id,
        v_work_date,
        v_now,
        NULL,
        CASE
            WHEN v_local_time > v_allowed_until THEN 'late'
            ELSE 'present'
        END
    )
    RETURNING * INTO v_attendance;

    RETURN v_attendance;

EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'ALREADY_CHECKED_IN';
END;
$function$;


-- 2. 퇴근 처리
CREATE OR REPLACE FUNCTION public.check_out()
RETURNS public.attendance_records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid;
    v_user_role text;
    v_now timestamptz;
    v_work_date date;
    v_attendance public.attendance_records;
BEGIN
    -- 사용자 인증 확인
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 일반 직원(employee) 역할만 허용
    v_user_role := (SELECT public.get_current_user_role());

    IF v_user_role IS DISTINCT FROM 'employee' THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 서버 시간을 가져오고 한국 시간 기준 근무 날짜 계산
    v_now := clock_timestamp();
    v_work_date := (v_now AT TIME ZONE 'Asia/Seoul')::date;

    -- 직원 행 잠금 (동시 요청 방지)
    PERFORM 1
    FROM public.employees
    WHERE id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 오늘의 근태 기록 조회 및 잠금
    SELECT *
    INTO v_attendance
    FROM public.attendance_records
    WHERE employee_id = v_user_id
      AND work_date = v_work_date
    FOR UPDATE;

    IF NOT FOUND OR v_attendance.check_in IS NULL THEN
        RAISE EXCEPTION 'CHECK_IN_REQUIRED';
    END IF;

    -- 중복 퇴근 방지
    IF v_attendance.check_out IS NOT NULL THEN
        RAISE EXCEPTION 'ALREADY_CHECKED_OUT';
    END IF;

    -- 퇴근 시간 저장
    UPDATE public.attendance_records
    SET check_out = v_now
    WHERE id = v_attendance.id
    RETURNING * INTO v_attendance;

    RETURN v_attendance;
END;
$function$;


-- 3. 근태 기록 조회
-- 기존 인자가 없는 함수 삭제
DROP FUNCTION IF EXISTS public.get_attendance_records();

CREATE FUNCTION public.get_attendance_records(
    p_start_date date,
    p_end_date date,
    p_employee_id uuid DEFAULT NULL
)
RETURNS SETOF public.attendance_records
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid;
    v_user_role text;
BEGIN
    -- 사용자 인증 확인
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 사용자 역할 검증
    v_user_role := (SELECT public.get_current_user_role());

    IF v_user_role IS NULL
       OR v_user_role NOT IN ('employee', 'hr_admin') THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 조회 날짜 범위 검증
    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        RAISE EXCEPTION 'INVALID_DATE_RANGE';
    END IF;

    IF p_end_date < p_start_date THEN
        RAISE EXCEPTION 'INVALID_DATE_RANGE';
    END IF;

    -- 일반 직원은 본인의 근태 기록만 조회 가능
    -- HR Admin은 전체 직원 조회 또는 특정 직원별 조회 가능
    RETURN QUERY
    SELECT ar.*
    FROM public.attendance_records AS ar
    WHERE ar.work_date BETWEEN p_start_date AND p_end_date
      AND (
          (
              v_user_role = 'employee'
              AND ar.employee_id = v_user_id
          )
          OR
          (
              v_user_role = 'hr_admin'
              AND (
                  p_employee_id IS NULL
                  OR ar.employee_id = p_employee_id
              )
          )
      )
    ORDER BY ar.work_date DESC, ar.check_in DESC NULLS LAST;
END;
$function$;


-- 4. 함수 소유자 설정
ALTER FUNCTION public.check_in()
OWNER TO postgres;

ALTER FUNCTION public.check_out()
OWNER TO postgres;

ALTER FUNCTION public.get_attendance_records(date, date, uuid)
OWNER TO postgres;


-- 5. 함수 실행 권한 설정
REVOKE ALL ON FUNCTION public.check_in()
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.check_out()
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.get_attendance_records(date, date, uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.check_in()
TO authenticated;

GRANT EXECUTE ON FUNCTION public.check_out()
TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_attendance_records(date, date, uuid)
TO authenticated;
