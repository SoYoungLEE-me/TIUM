-- 메시지 출처 채널: chatbot(직원 챗봇) | admin(관리자 문의함)
-- 말풍선 방향은 sender_role 이 아니라 channel 기준으로 판별

ALTER TABLE public.inquiry_messages
  ADD COLUMN IF NOT EXISTS channel text
    CHECK (channel IS NULL OR channel IN ('chatbot', 'admin'));

-- 기존 데이터 보정
UPDATE public.inquiry_messages
SET channel = 'chatbot'
WHERE kind = 'user' AND sender_role = 'employee' AND channel IS NULL;

UPDATE public.inquiry_messages
SET channel = 'admin'
WHERE kind = 'user' AND sender_role = 'hr_admin' AND channel IS NULL;
