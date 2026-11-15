-- 최대 연속 신청 일수 초과 시 HR 검토가 아니라 신청 불가로 처리

CREATE OR REPLACE FUNCTION public.prepare_leave_request(
  p_leave_type_id uuid,
  p_start_date date,
  p_end_date date,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user_id uuid;
  v_type_name text;
  v_deduction numeric;
  v_total_days numeric;
  v_balance jsonb;
  v_auto boolean;
  v_min_notice integer;
  v_max_consecutive integer;
  v_review_reasons text[] := ARRAY[]::text[];
  v_expected text;
  v_can_submit boolean := true;
  v_blocked text[] := ARRAY[]::text[];
  v_token text;
  v_expires timestamptz;
  v_today date;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  v_today := (now() AT TIME ZONE 'Asia/Seoul')::date;

  SELECT name, deduction_days INTO v_type_name, v_deduction
  FROM public.leave_types
  WHERE id = p_leave_type_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_submit', false,
      'expected_status', NULL,
      'review_reasons', ARRAY['HALF_DAY_DISABLED'],
      'reason_codes', ARRAY['HALF_DAY_DISABLED'],
      'confirmation_token', NULL,
      'expires_at', NULL
    );
  END IF;

  IF p_start_date IS NULL OR p_end_date IS NULL OR p_end_date < p_start_date THEN
    v_can_submit := false;
    v_blocked := array_append(v_blocked, 'INVALID_DATE_RANGE');
  END IF;

  IF p_start_date < v_today THEN
    v_can_submit := false;
    v_blocked := array_append(v_blocked, 'INVALID_DATE_RANGE');
  END IF;

  IF EXTRACT(YEAR FROM p_start_date) <> EXTRACT(YEAR FROM p_end_date) THEN
    v_can_submit := false;
    v_blocked := array_append(v_blocked, 'INVALID_DATE_RANGE');
  END IF;

  BEGIN
    v_total_days := public.compute_leave_total_days(p_leave_type_id, p_start_date, p_end_date);
  EXCEPTION WHEN OTHERS THEN
    v_can_submit := false;
    v_blocked := array_append(v_blocked, 'INVALID_HALF_DAY_RANGE');
    v_total_days := 0;
  END;

  v_balance := public.get_leave_balance_snapshot(
    v_user_id,
    EXTRACT(YEAR FROM p_start_date)::integer
  );

  IF v_balance IS NULL THEN
    v_can_submit := false;
    v_blocked := array_append(v_blocked, 'INSUFFICIENT_BALANCE');
  ELSIF (v_balance->>'available_days')::numeric < v_total_days THEN
    v_can_submit := false;
    v_blocked := array_append(v_blocked, 'INSUFFICIENT_BALANCE');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.leave_requests
    WHERE employee_id = v_user_id
      AND status IN ('pending', 'approved')
      AND start_date <= p_end_date
      AND end_date >= p_start_date
  ) THEN
    v_can_submit := false;
    v_blocked := array_append(v_blocked, 'OVERLAPPING_REQUEST');
  END IF;

  SELECT auto_approval_enabled INTO v_auto
  FROM public.company_settings WHERE id = true;

  SELECT min_notice_days, max_consecutive_days
  INTO v_min_notice, v_max_consecutive
  FROM public.approval_rules
  WHERE is_active = true
  LIMIT 1;

  -- 연속 한도 초과는 제출 불가
  IF v_max_consecutive IS NOT NULL AND v_total_days > v_max_consecutive THEN
    v_can_submit := false;
    v_blocked := array_append(v_blocked, 'EXCEEDS_MAX_CONSECUTIVE_DAYS');
  END IF;

  IF COALESCE(v_auto, false) = false THEN
    v_review_reasons := array_append(v_review_reasons, 'AUTO_APPROVAL_DISABLED');
  END IF;

  IF v_min_notice IS NOT NULL AND p_start_date < (v_today + v_min_notice) THEN
    v_review_reasons := array_append(v_review_reasons, 'INSUFFICIENT_NOTICE');
  END IF;

  IF NOT v_can_submit THEN
    RETURN jsonb_build_object(
      'leave_type_id', p_leave_type_id,
      'leave_type_name', v_type_name,
      'start_date', p_start_date,
      'end_date', p_end_date,
      'total_days', v_total_days,
      'balance', v_balance,
      'can_submit', false,
      'expected_status', NULL,
      'review_reasons', v_blocked,
      'reason_codes', v_blocked,
      'available_days', CASE WHEN v_balance IS NULL THEN NULL ELSE (v_balance->>'available_days')::numeric END,
      'requested_days', v_total_days,
      'max_consecutive_days', v_max_consecutive,
      'confirmation_token', NULL,
      'expires_at', NULL
    );
  END IF;

  IF COALESCE(v_auto, false) AND cardinality(v_review_reasons) = 0 THEN
    v_expected := 'approved';
  ELSE
    v_expected := 'pending';
    IF cardinality(v_review_reasons) = 0 THEN
      v_review_reasons := array_append(v_review_reasons, 'AUTO_APPROVAL_DISABLED');
    END IF;
  END IF;

  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  v_expires := now() + interval '10 minutes';

  INSERT INTO public.leave_confirmation_tokens (token, employee_id, payload, expires_at)
  VALUES (
    v_token,
    v_user_id,
    jsonb_build_object(
      'leave_type_id', p_leave_type_id,
      'leave_type_name', v_type_name,
      'start_date', p_start_date,
      'end_date', p_end_date,
      'total_days', v_total_days,
      'reason', NULLIF(trim(COALESCE(p_reason, '')), ''),
      'expected_status', v_expected,
      'review_reasons', to_jsonb(v_review_reasons)
    ),
    v_expires
  );

  RETURN jsonb_build_object(
    'leave_type_id', p_leave_type_id,
    'leave_type_name', v_type_name,
    'start_date', p_start_date,
    'end_date', p_end_date,
    'total_days', v_total_days,
    'balance', v_balance,
    'can_submit', true,
    'expected_status', v_expected,
    'review_reasons', v_review_reasons,
    'confirmation_token', v_token,
    'expires_at', v_expires
  );
END;
$function$;

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
  v_total_days numeric;
  v_total_balance numeric;
  v_used_balance numeric;
  v_pending numeric;
  v_auto boolean;
  v_min_notice integer;
  v_max_consecutive integer;
  v_today date;
  v_status text := 'pending';
  v_approval_type text := NULL;
  v_decision text := NULL;
  v_balance_id uuid;
  v_request public.leave_requests;
  v_rules_ok boolean := true;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  v_today := (now() AT TIME ZONE 'Asia/Seoul')::date;

  IF p_start_date IS NULL OR p_end_date IS NULL THEN
    RAISE EXCEPTION 'Start date and end date are required.';
  END IF;
  IF p_end_date < p_start_date THEN
    RAISE EXCEPTION 'End date must not be earlier than start date.';
  END IF;
  IF p_start_date < v_today THEN
    RAISE EXCEPTION 'Leave start date cannot be in the past.';
  END IF;
  IF EXTRACT(YEAR FROM p_start_date) <> EXTRACT(YEAR FROM p_end_date) THEN
    RAISE EXCEPTION 'Leave requests cannot span multiple years.';
  END IF;

  v_total_days := public.compute_leave_total_days(p_leave_type_id, p_start_date, p_end_date);

  SELECT id INTO v_employee_id
  FROM public.employees WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Employee profile not found.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.leave_requests
    WHERE employee_id = v_user_id
      AND status IN ('pending', 'approved')
      AND start_date <= p_end_date
      AND end_date >= p_start_date
  ) THEN
    RAISE EXCEPTION 'Leave dates overlap with an existing pending or approved request.';
  END IF;

  SELECT id, total_days, used_days
  INTO v_balance_id, v_total_balance, v_used_balance
  FROM public.leave_balances
  WHERE employee_id = v_user_id
    AND year = EXTRACT(YEAR FROM p_start_date)::integer
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Leave balance not found for the requested year.';
  END IF;

  SELECT COALESCE(SUM(total_days), 0) INTO v_pending
  FROM public.leave_requests
  WHERE employee_id = v_user_id
    AND status = 'pending'
    AND EXTRACT(YEAR FROM start_date)::integer = EXTRACT(YEAR FROM p_start_date)::integer;

  IF v_total_balance - v_used_balance - v_pending < v_total_days THEN
    RAISE EXCEPTION 'Insufficient leave balance. Remaining available: %, Requested: %.',
      v_total_balance - v_used_balance - v_pending, v_total_days;
  END IF;

  SELECT auto_approval_enabled INTO v_auto FROM public.company_settings WHERE id = true;

  SELECT min_notice_days, max_consecutive_days
  INTO v_min_notice, v_max_consecutive
  FROM public.approval_rules WHERE is_active = true LIMIT 1;

  -- 연속 한도 초과는 신청 자체 거부
  IF v_max_consecutive IS NOT NULL AND v_total_days > v_max_consecutive THEN
    RAISE EXCEPTION
      'Leave duration exceeds the maximum of % consecutive days.',
      v_max_consecutive;
  END IF;

  IF COALESCE(v_auto, false) = false THEN
    v_rules_ok := false;
    v_decision := '자동 승인이 비활성화되어 HR 검토가 필요합니다.';
  END IF;

  IF v_min_notice IS NOT NULL AND p_start_date < (v_today + v_min_notice) THEN
    v_rules_ok := false;
    v_decision := COALESCE(v_decision, '사전 신청 기간 부족으로 HR 검토가 필요합니다.');
  END IF;

  IF COALESCE(v_auto, false) AND v_rules_ok THEN
    v_status := 'approved';
    v_approval_type := 'auto';
    v_decision := '자동 승인 조건 충족';
  END IF;

  INSERT INTO public.leave_requests (
    employee_id, leave_type_id, start_date, end_date, total_days, reason,
    status, approval_type, decision_reason, reviewed_at
  )
  VALUES (
    v_user_id, p_leave_type_id, p_start_date, p_end_date, v_total_days,
    NULLIF(trim(COALESCE(p_reason, '')), ''),
    v_status, v_approval_type, v_decision,
    CASE WHEN v_status = 'approved' THEN now() ELSE NULL END
  )
  RETURNING * INTO v_request;

  IF v_status = 'approved' THEN
    UPDATE public.leave_balances
    SET used_days = used_days + v_total_days, updated_at = now()
    WHERE id = v_balance_id;

    INSERT INTO public.leave_balance_transactions (
      leave_balance_id, leave_request_id, transaction_type, amount
    ) VALUES (v_balance_id, v_request.id, 'deduction', -v_total_days);
  END IF;

  RETURN v_request;
END;
$function$;
