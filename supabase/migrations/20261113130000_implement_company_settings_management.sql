
-- 회사 설정 관리 (Company Settings Management)

BEGIN;


-- 1. 회사 설정 조회
--    로그인한 사용자는 회사 설정을 조회할 수 있다.

CREATE OR REPLACE FUNCTION public.get_company_settings()
RETURNS public.company_settings
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid;
    v_settings public.company_settings;
BEGIN
    -- 1. 로그인 여부 확인
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 2. 회사 설정 조회
    SELECT *
    INTO v_settings
    FROM public.company_settings
    WHERE id = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Company settings not found.';
    END IF;

    RETURN v_settings;
END;
$function$;



-- 2. 회사 설정 수정
--    HR 관리자만 회사 설정을 수정할 수 있다.

CREATE OR REPLACE FUNCTION public.update_company_settings(
    p_work_start_time time without time zone,
    p_work_end_time time without time zone,
    p_late_threshold integer,
    p_auto_approval_enabled boolean
)
RETURNS public.company_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid;
    v_user_role text;
    v_settings public.company_settings;
BEGIN
    -- 1. 로그인 여부 확인
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 2. HR 관리자 권한 확인
    v_user_role := (SELECT public.get_current_user_role());

    IF v_user_role IS DISTINCT FROM 'hr_admin' THEN
        RAISE EXCEPTION
            'Only HR administrators can update company settings.';
    END IF;

    -- 3. 입력값 유효성 검사
    IF p_work_start_time IS NULL
       OR p_work_end_time IS NULL THEN
        RAISE EXCEPTION 'Work start and end times are required.';
    END IF;

    IF p_work_end_time <= p_work_start_time THEN
        RAISE EXCEPTION
            'Work end time must be later than work start time.';
    END IF;

    IF p_late_threshold IS NULL OR p_late_threshold < 0 THEN
        RAISE EXCEPTION
            'Late threshold must be zero or greater.';
    END IF;

    IF p_auto_approval_enabled IS NULL THEN
        RAISE EXCEPTION
            'Auto approval setting is required.';
    END IF;

    -- 4. 회사 설정 수정
    UPDATE public.company_settings
    SET
        work_start_time = p_work_start_time,
        work_end_time = p_work_end_time,
        late_threshold = p_late_threshold,
        auto_approval_enabled = p_auto_approval_enabled,
        updated_at = now()
    WHERE id = true
    RETURNING * INTO v_settings;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Company settings not found.';
    END IF;

    RETURN v_settings;
END;
$function$;



-- 3. 함수 실행 권한 설정
--    로그인 사용자만 함수를 실행할 수 있다.

REVOKE ALL ON FUNCTION public.get_company_settings()
FROM PUBLIC, anon, service_role;

GRANT EXECUTE ON FUNCTION public.get_company_settings()
TO authenticated;


REVOKE ALL ON FUNCTION public.update_company_settings(
    time without time zone,
    time without time zone,
    integer,
    boolean
)
FROM PUBLIC, anon, service_role;

GRANT EXECUTE ON FUNCTION public.update_company_settings(
    time without time zone,
    time without time zone,
    integer,
    boolean
)
TO authenticated;

COMMIT;
