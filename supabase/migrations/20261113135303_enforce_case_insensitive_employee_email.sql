-- 직원 이메일 대소문자 구분 없는 중복 방지

CREATE UNIQUE INDEX IF NOT EXISTS employees_email_lower_unique_idx
ON public.employees (LOWER(email));
