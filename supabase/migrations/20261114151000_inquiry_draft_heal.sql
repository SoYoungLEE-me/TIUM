-- Heal open threads with no user messages → draft; allow delete when no user msg

UPDATE public.inquiry_threads t
SET status = 'draft'
WHERE t.status = 'open'
  AND NOT EXISTS (
    SELECT 1
    FROM public.inquiry_messages m
    WHERE m.thread_id = t.id
      AND m.kind = 'user'
  );

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
  v_has_user_msg boolean;
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

  SELECT EXISTS (
    SELECT 1
    FROM public.inquiry_messages m
    WHERE m.thread_id = p_thread_id
      AND m.kind = 'user'
  ) INTO v_has_user_msg;

  IF v_thread.status = 'open' AND v_has_user_msg THEN
    RAISE EXCEPTION 'Only closed or draft inquiries can be deleted.';
  END IF;

  IF v_role IS DISTINCT FROM 'hr_admin' AND v_thread.employee_id <> v_uid THEN
    RAISE EXCEPTION 'Forbidden.';
  END IF;

  DELETE FROM public.inquiry_threads WHERE id = p_thread_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.delete_inquiry(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_inquiry(uuid) TO authenticated;
