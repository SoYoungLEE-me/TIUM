
CREATE OR REPLACE FUNCTION public.reject_leave(
    p_leave_request_id uuid,
    p_decision_reason text DEFAULT NULL
)
RETURNS public.leave_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid;
    v_user_role text;
    v_request public.leave_requests;
    v_reason text;
BEGIN
    -- 1. 로그인 사용자 확인
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 2. HR 관리자 권한 확인
    v_user_role := (SELECT public.get_current_user_role());

    IF v_user_role IS DISTINCT FROM 'hr_admin' THEN
        RAISE EXCEPTION
            'Only HR administrators can reject leave requests.';
    END IF;

    -- 3. 거절 사유 검증 (선택 사항)
    v_reason := NULLIF(TRIM(p_decision_reason), '');

    -- 4. 신청 조회 및 행 잠금
    SELECT *
    INTO v_request
    FROM public.leave_requests
    WHERE id = p_leave_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Leave request not found.';
    END IF;

    -- 5. pending 상태 확인
    IF v_request.status <> 'pending' THEN
        RAISE EXCEPTION
            'Only pending leave requests can be rejected.';
    END IF;

    -- 6. 신청 거절 처리
    UPDATE public.leave_requests
    SET
        status = 'rejected',
        decision_reason = v_reason,
        reviewed_by = v_user_id,
        reviewed_at = now()
    WHERE id = v_request.id
    RETURNING * INTO v_request;

    RETURN v_request;
END;
$function$;
