-- 연차 신청 Realtime (관리자 뱃지/목록 즉시 갱신)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'leave_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
  END IF;
END $$;
