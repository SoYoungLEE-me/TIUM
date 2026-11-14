-- Chatbot: conversations, confirmation tokens, knowledge, inquiries
-- + prepare_leave_request / submit_leave_from_token / apply_leave (auto + deduction_days)

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.assistant_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  CONSTRAINT assistant_conversations_pkey PRIMARY KEY (id)
);

CREATE TABLE public.assistant_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.assistant_conversations (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL DEFAULT '',
  response_json jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assistant_messages_pkey PRIMARY KEY (id)
);

CREATE TABLE public.leave_confirmation_tokens (
  token text NOT NULL,
  employee_id uuid NOT NULL REFERENCES public.employees (id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  submission_key text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leave_confirmation_tokens_pkey PRIMARY KEY (token)
);

CREATE UNIQUE INDEX leave_confirmation_tokens_submission_key_uidx
  ON public.leave_confirmation_tokens (employee_id, submission_key)
  WHERE submission_key IS NOT NULL;

CREATE TABLE public.company_knowledge (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  body_md text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT company_knowledge_pkey PRIMARY KEY (id),
  CONSTRAINT company_knowledge_slug_key UNIQUE (slug)
);

CREATE TABLE public.inquiry_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees (id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '관리자 문의',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  unread_admin integer NOT NULL DEFAULT 0 CHECK (unread_admin >= 0),
  unread_employee integer NOT NULL DEFAULT 0 CHECK (unread_employee >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inquiry_threads_pkey PRIMARY KEY (id)
);

CREATE TABLE public.inquiry_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.inquiry_threads (id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.employees (id),
  sender_role text NOT NULL CHECK (sender_role IN ('employee', 'hr_admin')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inquiry_messages_pkey PRIMARY KEY (id),
  CONSTRAINT inquiry_messages_body_nonempty CHECK (length(trim(body)) > 0)
);

CREATE INDEX inquiry_threads_employee_idx ON public.inquiry_threads (employee_id, last_message_at DESC);
CREATE INDEX inquiry_messages_thread_idx ON public.inquiry_messages (thread_id, created_at);

INSERT INTO public.company_knowledge (slug, title, body_md)
VALUES (
  'handbook',
  '회사 핸드북',
  $md$
# 회사 핸드북 (챗봇 지식)

## 근무
- 기본 근무시간은 회사 설정의 출근·퇴근 시간을 따릅니다.
- 지각 기준은 late_threshold(분)입니다.

## 연차·휴가
- 휴가 유형과 차감 일수(deduction_days)는 leave_types를 따릅니다.
- 반차(차감 0.5일)는 같은 날 하루만 신청할 수 있습니다.
- 잔여 = 부여 − 사용. pending은 잔여에서 차감하지 않지만 신청 가능 일수에서는 제외합니다.
- 자동 승인 ON이고 승인 규칙을 충족하면 제출 즉시 승인될 수 있습니다.

## 문의
- 챗봇으로 해결되지 않으면 관리자 문의로 남겨 주세요.
$md$
)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_confirmation_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY assistant_conversations_own ON public.assistant_conversations
  FOR ALL TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY assistant_messages_own ON public.assistant_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assistant_conversations c
      WHERE c.id = conversation_id AND c.employee_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assistant_conversations c
      WHERE c.id = conversation_id AND c.employee_id = auth.uid()
    )
  );

CREATE POLICY leave_confirmation_tokens_own ON public.leave_confirmation_tokens
  FOR ALL TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY company_knowledge_select ON public.company_knowledge
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY company_knowledge_hr_write ON public.company_knowledge
  FOR ALL TO authenticated
  USING (public.get_current_user_role() = 'hr_admin')
  WITH CHECK (public.get_current_user_role() = 'hr_admin');

CREATE POLICY inquiry_threads_employee ON public.inquiry_threads
  FOR ALL TO authenticated
  USING (
    employee_id = auth.uid()
    OR public.get_current_user_role() = 'hr_admin'
  )
  WITH CHECK (
    employee_id = auth.uid()
    OR public.get_current_user_role() = 'hr_admin'
  );

CREATE POLICY inquiry_messages_access ON public.inquiry_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inquiry_threads t
      WHERE t.id = thread_id
        AND (t.employee_id = auth.uid() OR public.get_current_user_role() = 'hr_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inquiry_threads t
      WHERE t.id = thread_id
        AND (t.employee_id = auth.uid() OR public.get_current_user_role() = 'hr_admin')
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_confirmation_tokens TO authenticated;
GRANT SELECT ON public.company_knowledge TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_knowledge TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiry_threads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiry_messages TO authenticated;

-- ---------------------------------------------------------------------------
-- Helpers: balance snapshot + day calc
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.compute_leave_total_days(
  p_leave_type_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SET search_path TO ''
AS $function$
DECLARE
  v_deduction numeric;
BEGIN
  SELECT deduction_days INTO v_deduction
  FROM public.leave_types
  WHERE id = p_leave_type_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or inactive leave type.';
  END IF;

  IF p_end_date < p_start_date THEN
    RAISE EXCEPTION 'End date must not be earlier than start date.';
  END IF;

  IF v_deduction < 1 THEN
    IF p_start_date <> p_end_date THEN
      RAISE EXCEPTION 'Half-day leave must be a single day.';
    END IF;
    RETURN v_deduction;
  END IF;

  RETURN (p_end_date - p_start_date + 1) * v_deduction;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_leave_balance_snapshot(
  p_employee_id uuid,
  p_year integer
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO ''
AS $function$
DECLARE
  v_total numeric;
  v_used numeric;
  v_pending numeric;
BEGIN
  SELECT total_days, used_days INTO v_total, v_used
  FROM public.leave_balances
  WHERE employee_id = p_employee_id AND year = p_year;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(SUM(total_days), 0) INTO v_pending
  FROM public.leave_requests
  WHERE employee_id = p_employee_id
    AND status = 'pending'
    AND EXTRACT(YEAR FROM start_date)::integer = p_year;

  RETURN jsonb_build_object(
    'year', p_year,
    'total_days', v_total,
    'used_days', v_used,
    'remaining_days', v_total - v_used,
    'pending_days', v_pending,
    'available_days', v_total - v_used - v_pending
  );
END;
$function$;

-- ---------------------------------------------------------------------------
-- prepare_leave_request
-- ---------------------------------------------------------------------------

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

  IF COALESCE(v_auto, false) = false THEN
    v_review_reasons := array_append(v_review_reasons, 'AUTO_APPROVAL_DISABLED');
  END IF;

  IF v_min_notice IS NOT NULL AND p_start_date < (v_today + v_min_notice) THEN
    v_review_reasons := array_append(v_review_reasons, 'INSUFFICIENT_NOTICE');
  END IF;

  IF v_max_consecutive IS NOT NULL AND v_total_days > v_max_consecutive THEN
    v_review_reasons := array_append(v_review_reasons, 'EXCEEDS_MAX_CONSECUTIVE_DAYS');
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

-- ---------------------------------------------------------------------------
-- apply_leave: deduction_days + auto approval
-- ---------------------------------------------------------------------------

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

  IF COALESCE(v_auto, false) = false THEN
    v_rules_ok := false;
    v_decision := '자동 승인이 비활성화되어 HR 검토가 필요합니다.';
  END IF;

  IF v_min_notice IS NOT NULL AND p_start_date < (v_today + v_min_notice) THEN
    v_rules_ok := false;
    v_decision := COALESCE(v_decision, '사전 신청 기간 부족으로 HR 검토가 필요합니다.');
  END IF;

  IF v_max_consecutive IS NOT NULL AND v_total_days > v_max_consecutive THEN
    v_rules_ok := false;
    v_decision := COALESCE(v_decision, '최대 연속 일수 초과로 HR 검토가 필요합니다.');
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

-- ---------------------------------------------------------------------------
-- submit_leave_from_token
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.submit_leave_from_token(
  p_confirmation_token text,
  p_submission_key text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user_id uuid;
  v_row public.leave_confirmation_tokens;
  v_payload jsonb;
  v_request public.leave_requests;
  v_type_name text;
  v_msg text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF p_confirmation_token IS NULL OR length(trim(p_confirmation_token)) = 0 THEN
    RAISE EXCEPTION 'confirmation_token is required.';
  END IF;

  -- idempotent replay
  IF p_submission_key IS NOT NULL THEN
    SELECT * INTO v_row
    FROM public.leave_confirmation_tokens
    WHERE employee_id = v_user_id
      AND submission_key = p_submission_key
      AND used_at IS NOT NULL
    LIMIT 1;

    IF FOUND AND v_row.payload ? 'result' THEN
      RETURN v_row.payload->'result';
    END IF;
  END IF;

  SELECT * INTO v_row
  FROM public.leave_confirmation_tokens
  WHERE token = p_confirmation_token
  FOR UPDATE;

  IF NOT FOUND OR v_row.employee_id <> v_user_id THEN
    RAISE EXCEPTION 'Invalid confirmation token.';
  END IF;

  IF v_row.used_at IS NOT NULL THEN
    IF v_row.payload ? 'result' THEN
      RETURN v_row.payload->'result';
    END IF;
    RAISE EXCEPTION 'Confirmation token already used.';
  END IF;

  IF v_row.expires_at < now() THEN
    RAISE EXCEPTION 'Confirmation token expired.';
  END IF;

  v_payload := v_row.payload;

  v_request := public.apply_leave(
    (v_payload->>'leave_type_id')::uuid,
    (v_payload->>'start_date')::date,
    (v_payload->>'end_date')::date,
    v_payload->>'reason'
  );

  SELECT name INTO v_type_name FROM public.leave_types WHERE id = v_request.leave_type_id;

  IF v_request.status = 'approved' THEN
    v_msg := COALESCE(v_type_name, '휴가') || '가 승인되었습니다.';
  ELSE
    v_msg := 'HR 검토 대기로 접수되었습니다.';
  END IF;

  UPDATE public.leave_confirmation_tokens
  SET
    used_at = now(),
    submission_key = COALESCE(p_submission_key, submission_key),
    payload = payload || jsonb_build_object(
      'result', jsonb_build_object(
        'id', v_request.id,
        'status', v_request.status,
        'approval_type', CASE WHEN v_request.approval_type = 'auto' THEN 'auto' ELSE NULL END,
        'total_days', v_request.total_days,
        'decision_reason', COALESCE(v_request.decision_reason, ''),
        'message', v_msg
      )
    )
  WHERE token = p_confirmation_token;

  RETURN jsonb_build_object(
    'id', v_request.id,
    'status', v_request.status,
    'approval_type', CASE WHEN v_request.approval_type = 'auto' THEN 'auto' ELSE NULL END,
    'total_days', v_request.total_days,
    'decision_reason', COALESCE(v_request.decision_reason, ''),
    'message', v_msg
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.prepare_leave_request(uuid, date, date, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_leave_from_token(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.compute_leave_total_days(uuid, date, date) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_leave_balance_snapshot(uuid, integer) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.prepare_leave_request(uuid, date, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_leave_from_token(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_leave(uuid, date, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.compute_leave_total_days(uuid, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leave_balance_snapshot(uuid, integer) TO authenticated;
