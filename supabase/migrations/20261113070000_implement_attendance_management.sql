-- ============================================================
-- Attendance Management
-- Timezone: Asia/Seoul
-- ============================================================

-- 1. CHECK IN
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
    -- Authentication
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Employee role only
    v_user_role := (SELECT public.get_current_user_role());

    IF v_user_role IS DISTINCT FROM 'employee' THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Capture server time and calculate Korean work date
    v_now := clock_timestamp();
    v_work_date := (v_now AT TIME ZONE 'Asia/Seoul')::date;
    v_local_time := (v_now AT TIME ZONE 'Asia/Seoul')::time;

    -- Lock employee row
    PERFORM 1
    FROM public.employees
    WHERE id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Load company settings
    SELECT *
    INTO v_settings
    FROM public.company_settings
    WHERE id = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'SETTINGS_NOT_FOUND';
    END IF;

    -- Calculate allowed check-in time
    v_allowed_until :=
        v_settings.work_start_time
        + make_interval(mins => v_settings.late_threshold);

    -- Insert attendance record
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


-- 2. CHECK OUT
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
    -- Authentication
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Employee role only
    v_user_role := (SELECT public.get_current_user_role());

    IF v_user_role IS DISTINCT FROM 'employee' THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Capture server time and Korean work date
    v_now := clock_timestamp();
    v_work_date := (v_now AT TIME ZONE 'Asia/Seoul')::date;

    -- Lock employee row
    PERFORM 1
    FROM public.employees
    WHERE id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Find and lock today's attendance record
    SELECT *
    INTO v_attendance
    FROM public.attendance_records
    WHERE employee_id = v_user_id
      AND work_date = v_work_date
    FOR UPDATE;

    IF NOT FOUND OR v_attendance.check_in IS NULL THEN
        RAISE EXCEPTION 'CHECK_IN_REQUIRED';
    END IF;

    -- Prevent duplicate check-out
    IF v_attendance.check_out IS NOT NULL THEN
        RAISE EXCEPTION 'ALREADY_CHECKED_OUT';
    END IF;

    -- Save check-out time
    UPDATE public.attendance_records
    SET check_out = v_now
    WHERE id = v_attendance.id
    RETURNING * INTO v_attendance;

    RETURN v_attendance;
END;
$function$;


-- 3. GET ATTENDANCE RECORDS
-- Remove the previous no-argument function.
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
    -- Authentication
    v_user_id := (SELECT auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Role verification
    v_user_role := (SELECT public.get_current_user_role());

    IF v_user_role IS NULL
       OR v_user_role NOT IN ('employee', 'hr_admin') THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- Validate date range
    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        RAISE EXCEPTION 'INVALID_DATE_RANGE';
    END IF;

    IF p_end_date < p_start_date THEN
        RAISE EXCEPTION 'INVALID_DATE_RANGE';
    END IF;

    -- Employees can only retrieve their own records.
    -- HR admins can retrieve all records or filter by employee.
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


-- 4. FUNCTION OWNERS
ALTER FUNCTION public.check_in()
OWNER TO postgres;

ALTER FUNCTION public.check_out()
OWNER TO postgres;

ALTER FUNCTION public.get_attendance_records(date, date, uuid)
OWNER TO postgres;


-- 5. FUNCTION EXECUTION PERMISSIONS
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
