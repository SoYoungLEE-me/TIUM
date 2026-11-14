-- Inquiry: system messages, close, delete (closed only), block insert on closed

ALTER TABLE public.inquiry_messages
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'user'
    CHECK (kind IN ('user', 'system'));

ALTER TABLE public.inquiry_messages
  ALTER COLUMN sender_id DROP NOT NULL;

ALTER TABLE public.inquiry_messages
  ALTER COLUMN sender_role DROP NOT NULL;

ALTER TABLE public.inquiry_messages
  DROP CONSTRAINT IF EXISTS inquiry_messages_sender_role_check;

ALTER TABLE public.inquiry_messages
  ADD CONSTRAINT inquiry_messages_sender_role_check CHECK (
    (kind = 'system' AND sender_role IS NULL AND sender_id IS NULL)
    OR (kind = 'user' AND sender_role IN ('employee', 'hr_admin') AND sender_id IS NOT NULL)
  );

CREATE OR REPLACE FUNCTION public.prevent_inquiry_message_on_closed()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  v_status text;
BEGIN
  SELECT status INTO v_status
  FROM public.inquiry_threads
  WHERE id = NEW.thread_id;

  IF v_status = 'closed' THEN
    RAISE EXCEPTION 'Cannot send messages on a closed inquiry.';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_prevent_inquiry_message_on_closed ON public.inquiry_messages;
CREATE TRIGGER trg_prevent_inquiry_message_on_closed
  BEFORE INSERT ON public.inquiry_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_inquiry_message_on_closed();

CREATE OR REPLACE FUNCTION public.close_inquiry(p_thread_id uuid)
RETURNS public.inquiry_threads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_thread public.inquiry_threads;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  v_role := public.get_current_user_role();

  SELECT * INTO v_thread
  FROM public.inquiry_threads
  WHERE id = p_thread_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inquiry not found.';
  END IF;

  IF v_role IS DISTINCT FROM 'hr_admin' AND v_thread.employee_id <> v_uid THEN
    RAISE EXCEPTION 'Forbidden.';
  END IF;

  IF v_thread.status = 'closed' THEN
    RETURN v_thread;
  END IF;

  -- closed 가드 트리거 전에 시스템 메시지 삽입
  INSERT INTO public.inquiry_messages (thread_id, sender_id, sender_role, body, kind)
  VALUES (p_thread_id, NULL, NULL, '문의가 종료되었습니다.', 'system');

  UPDATE public.inquiry_threads
  SET status = 'closed', last_message_at = now()
  WHERE id = p_thread_id
  RETURNING * INTO v_thread;

  RETURN v_thread;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_inquiry(p_thread_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_thread public.inquiry_threads;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  v_role := public.get_current_user_role();

  SELECT * INTO v_thread
  FROM public.inquiry_threads
  WHERE id = p_thread_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inquiry not found.';
  END IF;

  IF v_thread.status <> 'closed' THEN
    RAISE EXCEPTION 'Only closed inquiries can be deleted.';
  END IF;

  IF v_role IS DISTINCT FROM 'hr_admin' AND v_thread.employee_id <> v_uid THEN
    RAISE EXCEPTION 'Forbidden.';
  END IF;

  DELETE FROM public.inquiry_threads WHERE id = p_thread_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.insert_inquiry_system_message(
  p_thread_id uuid,
  p_body text
)
RETURNS public.inquiry_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_thread public.inquiry_threads;
  v_msg public.inquiry_messages;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  v_role := public.get_current_user_role();

  SELECT * INTO v_thread FROM public.inquiry_threads WHERE id = p_thread_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inquiry not found.';
  END IF;

  IF v_role IS DISTINCT FROM 'hr_admin' AND v_thread.employee_id <> v_uid THEN
    RAISE EXCEPTION 'Forbidden.';
  END IF;

  IF v_thread.status = 'closed' THEN
    RAISE EXCEPTION 'Cannot send messages on a closed inquiry.';
  END IF;

  INSERT INTO public.inquiry_messages (thread_id, sender_id, sender_role, body, kind)
  VALUES (p_thread_id, NULL, NULL, p_body, 'system')
  RETURNING * INTO v_msg;

  UPDATE public.inquiry_threads
  SET last_message_at = now()
  WHERE id = p_thread_id;

  RETURN v_msg;
END;
$function$;

REVOKE ALL ON FUNCTION public.close_inquiry(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_inquiry(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.insert_inquiry_system_message(uuid, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.close_inquiry(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_inquiry(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_inquiry_system_message(uuid, text) TO authenticated;
