# HR 관리 시스템 — 백엔드 함수 명세서 (MVP)
237645

## Document Information

| 항목 | 내용 |
| :--- | :--- |
| **Backend Stack** | Supabase (PostgreSQL, Auth, RLS, Database Functions, Edge Functions) |
| **Document Type** | Backend Function Specification |
| **Scope** | MVP |
| **Purpose** | 현재 Supabase 테이블 구조, 제약 조건 및 RLS 정책을 기반으로 백엔드 구현 범위 정의 |

구현 원칙: 기존 데이터베이스 구조를 최대한 유지하고, MVP에 필요한 핵심 비즈니스 로직만 구현한다.

---

## 1. 서비스 개요
본 서비스는 직원과 HR 관리자를 위한 통합 인사관리 시스템이다.

### 1.1 주요 기능
1. 연차 관리 (Leave Management)
2. 출퇴근 관리 (Attendance Management)
3. 승인 규칙 관리 (Approval Rule Management)
4. 회사 설정 관리 (Company Settings Management)
5. 직원 관리 (Employee Management)
6. 인증 및 권한 관리 (Authentication & Authorization)

### 1.2 사용자 역할

| 역할 | 설명 |
| :--- | :--- |
| `employee` | 본인의 연차 신청, 연차 잔액 및 출퇴근 기록 조회·관리 |
| `hr_admin` | 직원 정보 관리, 연차 승인·거절, 회사 설정 및 승인 규칙 관리 |

### 1.3 백엔드 처리 구조

| 구성 요소 | 책임 |
| :--- | :--- |
| Supabase Auth | 사용자 인증 및 계정 관리 |
| PostgreSQL Functions | 핵심 비즈니스 로직 검증 및 데이터 변경 |
| Supabase Edge Functions | Auth Admin API 호출 등 서버 측 작업 |
| RLS | 사용자별 데이터 접근 범위 제한 |
| Database Constraints | 데이터 무결성 보장 |
| Supabase Client | RLS가 적용되는 단순 데이터 조회 |

---

## 2. 백엔드 함수 전체 목록
핵심 데이터 변경은 PostgreSQL Function으로 처리한다. 단순 조회는 기존 RLS 정책을 활용한 Supabase SELECT를 사용할 수 있다.

### 2.1 인증 및 권한 관리

| 함수 | 실행 권한 | 주요 목적 | 구현 방식 |
| :--- | :--- | :--- | :--- |
| `get_current_user_role()` | 로그인 사용자 | 현재 사용자의 역할 조회 | 기존 함수 재사용 |

### 2.2 직원 관리

| 함수 | 실행 권한 | 주요 목적 | 구현 방식 |
| :--- | :--- | :--- | :--- |
| `get_employee_profile()` | 직원 / HR 관리자 | 현재 로그인한 사용자의 프로필 조회 | PostgreSQL Function 또는 SELECT |
| `create_employee()` | HR 관리자 | 직원 계정 및 프로필 생성 | Edge Function |
| `update_employee_profile()` | HR 관리자 | 직원 프로필 수정 | Edge Function + DB UPDATE |

### 2.3 연차 관리

| 함수 | 실행 권한 | 주요 목적 | 구현 방식 |
| :--- | :--- | :--- | :--- |
| `apply_leave()` | 직원 | 연차 신청 | PostgreSQL Function |
| `get_leave_balance()` | 직원 | 본인의 연차 잔액 조회 | SELECT 또는 Function |
| `get_my_leave_requests()` | 직원 | 본인의 연차 신청 내역 조회 | SELECT |
| `approve_leave()` | HR 관리자 | 연차 신청 승인 | PostgreSQL Function |
| `reject_leave()` | HR 관리자 | 연차 신청 거절 | PostgreSQL Function |
| `cancel_leave()` | 직원 | 대기 중인 연차 신청 취소 | PostgreSQL Function |

### 2.4 출퇴근 관리

| 함수 | 실행 권한 | 주요 목적 | 구현 방식 |
| :--- | :--- | :--- | :--- |
| `check_in()` | 직원 | 출근 등록 | PostgreSQL Function |
| `check_out()` | 직원 | 퇴근 등록 | PostgreSQL Function |
| `get_attendance_records()` | 직원 / HR 관리자 | 출퇴근 기록 조회 | SELECT 또는 Function |

### 2.5 승인 규칙 관리

| 함수 | 실행 권한 | 주요 목적 | 구현 방식 |
| :--- | :--- | :--- | :--- |
| `create_approval_rule()` | HR 관리자 | 승인 규칙 생성 | PostgreSQL Function |
| `update_approval_rule()` | HR 관리자 | 승인 규칙 수정 | PostgreSQL Function |

### 2.6 회사 설정 관리

| 함수 | 실행 권한 | 주요 목적 | 구현 방식 |
| :--- | :--- | :--- | :--- |
| `get_company_settings()` | 로그인 사용자 | 회사 설정 조회 | SELECT 또는 Function |
| `update_company_settings()` | HR 관리자 | 회사 설정 수정 | PostgreSQL Function |

> 참고: `get_current_user_role()`은 이미 구현되어 있으므로 기존 함수를 재사용한다. 조회 함수는 별도 PostgreSQL Function으로 만들 필요가 없으며, RLS로 접근 범위가 안전하게 제한된다면 일반 Supabase SELECT를 사용해도 된다.

---

## 3. 인증 및 권한 관리 (Authentication & Authorization)

### 3.1 `get_current_user_role()`
목적: 현재 로그인한 사용자의 역할을 확인한다.

| 항목 | 내용 |
| :--- | :--- |
| 실행 권한 | 로그인한 사용자 |
| 입력값 | 없음 |
| 반환값 | `employee`, `hr_admin` 또는 `NULL` |
| 참조 테이블 | `employees` |
| 구현 상태 | 기존 함수 재사용 |

**처리 로직**
1. `auth.uid()`로 현재 로그인한 사용자의 ID를 가져온다.
2. `employees.id`와 사용자 ID를 비교한다.
3. 일치하는 직원의 `role`을 반환한다.
4. 직원 정보가 존재하지 않으면 `NULL`을 반환한다.

### 3.2 `get_employee_profile()`
목적: 현재 로그인한 사용자의 직원 프로필을 조회한다.

| 항목 | 내용 |
| :--- | :--- |
| 실행 권한 | 직원 / HR 관리자 |
| 입력값 | 없음 |
| 반환값 | 현재 로그인한 사용자의 직원 프로필 |
| 참조 테이블 | `employees` |

**처리 로직**
1. 로그인 여부를 확인한다.
2. `auth.uid()`로 사용자 ID를 가져온다.
3. `employees`에서 해당 사용자의 정보를 조회한다.
4. 다음 정보를 반환한다.
   - `id`
   - `full_name`
   - `email`
   - `role`
   - `department`

**오류 상황**

| 오류 코드 | 발생 조건 |
| :--- | :--- |
| `UNAUTHENTICATED` | 로그인하지 않은 사용자 |
| `EMPLOYEE_NOT_FOUND` | 직원 프로필이 존재하지 않음 |

> 구현 참고: HR 관리자가 특정 직원의 프로필을 조회하는 기능은 이 함수와 구분한다. 필요하다면 `get_employee_by_id(p_employee_id)`를 별도로 구현한다.

### 3.3 `create_employee()`
목적: HR 관리자가 새로운 직원 계정을 생성하고 초대한다.

**입력값**

| 매개변수 | 자료형 | 필수 여부 |
| :--- | :--- | :--- |
| `p_email` | `TEXT` | 필수 |
| `p_full_name` | `TEXT` | 필수 |
| `p_role` | `TEXT` | 필수 |
| `p_department` | `TEXT` | 선택 |

**처리 로직**
1. 현재 사용자가 HR 관리자인지 확인한다.
2. 이메일 형식과 중복 여부를 확인한다.
3. 서버 측 Edge Function에서 Supabase Auth Admin API를 호출한다.
4. 직원의 Auth 계정을 생성하거나 초대한다.
5. Auth에서 반환된 사용자 UUID를 사용해 `employees`에 프로필을 등록한다.
6. 직원에게 초대 이메일을 발송한다.
7. 프로필 생성이 실패하면 생성된 Auth 계정을 정리하거나 재시도 가능한 상태로 처리한다.

**구현 시 주의사항**
현재 `employees.id`는 `auth.users.id`를 참조한다.
따라서 `employees`에만 INSERT하는 것으로는 로그인 가능한 계정이 만들어지지 않는다.

**MVP 구현 방식**
- HR 관리자가 직원 이메일과 정보를 입력한다.
- Edge Function에서 Supabase Auth Admin API를 호출한다.
- 생성된 Auth UUID를 사용해 `employees` 프로필을 생성한다.
- 직원은 초대 이메일을 통해 계정을 활성화하고 로그인한다.
`service_role` 키는 절대로 프론트엔드에 노출하지 않는다.

> 참고: Auth 계정 생성과 DB 프로필 생성은 하나의 PostgreSQL 트랜잭션으로 묶이지 않는다. 따라서 실패 시 보상 처리 또는 재시도 로직이 필요하다.

### 3.4 `update_employee_profile()`
목적: HR 관리자가 직원 프로필을 수정한다.

**입력값**

| 매개변수 | 자료형 | 필수 여부 |
| :--- | :--- | :--- |
| `p_employee_id` | `UUID` | 필수 |
| `p_full_name` | `TEXT` | 필수 |
| `p_email` | `TEXT` | 필수 |
| `p_department` | `TEXT` | 선택 |

**처리 로직**
1. HR 관리자 권한을 확인한다.
2. 대상 직원이 존재하는지 확인한다.
3. 이메일이 다른 직원과 중복되는지 확인한다.
4. 서버 측에서 Supabase Auth 이메일을 변경한다.
5. `employees.email`을 새로운 이메일로 동기화한다.
6. 프로필 정보를 업데이트한다.

**MVP 범위**
- 이름 수정
- 이메일 수정
- 부서 수정
계정 비활성화 및 역할 변경은 MVP에서 제외한다.

> 구현 참고: 이메일 변경은 Supabase Auth Admin API와 `employees` 업데이트가 함께 필요하므로 서버 측 Edge Function에서 처리한다. 두 시스템 간 변경 실패에 대비한 재시도 및 오류 처리도 고려한다.

---

## 4. 연차 관리 (Leave Management)

### 4.1 `apply_leave()`
목적: 직원이 새로운 연차를 신청한다.

**입력값**

| 매개변수 | 자료형 | 필수 여부 |
| :--- | :--- | :--- |
| `p_leave_type_id` | `UUID` | 필수 |
| `p_start_date` | `DATE` | 필수 |
| `p_end_date` | `DATE` | 필수 |
| `p_reason` | `TEXT` | 선택 |

**처리 로직**
1. 로그인한 사용자의 역할이 `employee`인지 확인한다.
2. 신청 시작일이 오늘보다 이전인지 확인한다.
3. 종료일이 시작일보다 빠르지 않은지 확인한다.
4. 해당 연차 유형이 존재하고 활성화되어 있는지 확인한다.
5. 기존 `pending` 또는 `approved` 신청과 날짜가 겹치는지 확인한다.
6. 활성화된 승인 규칙이 있다면 다음 항목을 검사한다.
   - 최소 사전 신청 기간
   - 최대 연속 사용 일수
7. 신청 일수를 계산한다.
8. `leave_requests`에 신청 정보를 INSERT한다.
9. 신청 상태를 `pending`으로 저장한다.

**MVP 연차 일수 계산 정책**
현재 데이터베이스에는 공휴일, 직원별 근무 일정 및 반차 정보가 없으므로 다음과 같이 단순화한다.
- 시작일과 종료일을 모두 포함한다.
- 주말을 포함한다.
- 공휴일을 포함한다.
- 반차 및 시간 단위 연차는 지원하지 않는다.
- `total_days = 종료일 - 시작일 + 1`
- 연도를 넘는 신청은 허용하지 않는다.

**예시**

| 항목 | 값 |
| :--- | :--- |
| 시작일 | 2026-11-16 |
| 종료일 | 2026-11-18 |
| 신청 일수 | 3일 |

**오류 상황**

| 오류 코드 | 발생 조건 |
| :--- | :--- |
| `UNAUTHENTICATED` | 로그인하지 않음 |
| `UNAUTHORIZED` | 직원 역할이 아님 |
| `INVALID_START_DATE` | 과거 날짜로 신청 |
| `INVALID_DATE_RANGE` | 종료일이 시작일보다 빠름 |
| `INVALID_LEAVE_TYPE` | 존재하지 않거나 비활성화된 연차 유형 |
| `OVERLAPPING_REQUEST` | 기존 대기 또는 승인 신청과 날짜가 겹침 |
| `APPROVAL_RULE_VIOLATION` | 활성 승인 규칙을 충족하지 못함 |

**중요 구현 사항**
- `employee_id`는 클라이언트 입력을 받지 않고 `auth.uid()`로 설정한다.
- `total_days`는 클라이언트 값을 신뢰하지 않고 데이터베이스에서 계산한다.
- 신청 생성은 하나의 PostgreSQL Function에서 검증 후 INSERT한다.
- 중복 신청을 방지하기 위해 동시 요청에 대한 트랜잭션 잠금 또는 적절한 DB 제약 조건을 검토한다.

### 4.2 `get_leave_balance()`
목적: 연도별 연차 잔액을 조회한다.

**입력값**

| 매개변수 | 자료형 | 필수 여부 |
| :--- | :--- | :--- |
| `p_year` | `INTEGER` | 필수 |

**처리 로직**
1. 현재 사용자의 ID를 가져온다.
2. `leave_balances`에서 해당 연도의 잔액을 조회한다.
3. 총 연차와 사용 연차를 가져온다.
4. 사용 가능 연차를 계산해 반환한다.

**계산식**
`available_days = total_days - used_days`

**반환 항목**

| 필드 | 설명 |
| :--- | :--- |
| `total_days` | 총 부여 연차 |
| `used_days` | 사용한 연차 |
| `available_days` | 사용 가능한 연차 |

MVP에서는 직원 본인의 잔액 조회를 우선 구현한다. HR 관리자의 특정 직원 잔액 조회는 필요할 경우 `p_employee_id`를 추가해 확장한다.

### 4.3 `get_my_leave_requests()`
목적: 직원이 본인의 연차 신청 내역을 조회한다.

| 항목 | 내용 |
| :--- | :--- |
| 입력값 | 없음 |
| 실행 권한 | 직원 |
| 참조 테이블 | `leave_requests` |

**처리 로직**
1. 현재 로그인한 사용자의 ID를 가져온다.
2. `leave_requests`에서 해당 직원의 신청 내역을 조회한다.
3. 최신 신청 순으로 반환한다.

**반환 항목**
- 신청 ID
- 연차 유형
- 시작일 및 종료일
- 신청 일수
- 신청 사유
- 신청 상태
- 승인 유형
- 승인자
- 승인 시간

본인 데이터만 조회되도록 기존 RLS 정책을 활용할 수 있다.

### 4.4 `approve_leave()`
목적: HR 관리자가 대기 중인 연차 신청을 승인한다.

**입력값**

| 매개변수 | 자료형 | 필수 여부 |
| :--- | :--- | :--- |
| `p_request_id` | `UUID` | 필수 |

**처리 로직**
1. 현재 사용자가 HR 관리자인지 확인한다.
2. 연차 신청이 존재하는지 확인한다.
3. 신청 상태가 `pending`인지 확인한다.
4. 신청자의 해당 연도 `leave_balances` 행을 잠근다.
5. 잔여 연차가 신청 일수보다 충분한지 확인한다.
6. `leave_balances.used_days`를 신청 일수만큼 증가시킨다.
7. `leave_balance_transactions`에 차감 내역을 기록한다.
8. `leave_requests.status`를 `approved`로 변경한다.
9. `approval_type`을 `manual`로 설정한다.
10. `reviewed_by`와 `reviewed_at`을 기록한다.

**함께 변경되는 테이블**
- `leave_balances`
- `leave_balance_transactions`
- `leave_requests`

반드시 하나의 트랜잭션으로 처리한다.
중간 작업이 실패하면 잔액 변경, 거래 내역 및 신청 상태 변경이 모두 롤백되어야 한다.

**오류 상황**

| 오류 코드 | 발생 조건 |
| :--- | :--- |
| `UNAUTHORIZED` | HR 관리자가 아님 |
| `REQUEST_NOT_FOUND` | 신청이 존재하지 않음 |
| `INVALID_STATUS` | 신청 상태가 `pending`이 아님 |
| `BALANCE_NOT_FOUND` | 해당 연도의 잔액 정보가 없음 |
| `INSUFFICIENT_BALANCE` | 잔여 연차 부족 |

**동시성 처리**
- 승인 대상 신청 행을 잠근다.
- 잔액 행도 `FOR UPDATE`로 잠근다.
- 잠금 이후 신청 상태와 잔액을 다시 확인한다.
- 동일 신청이 동시에 두 번 승인되지 않도록 한다.

### 4.5 `reject_leave()`
목적: HR 관리자가 대기 중인 연차 신청을 거절한다.

**입력값**

| 매개변수 | 자료형 | 필수 여부 |
| :--- | :--- | :--- |
| `p_request_id` | `UUID` | 필수 |
| `p_decision_reason` | `TEXT` | 선택 |

**처리 로직**
1. HR 관리자 권한을 확인한다.
2. 신청이 존재하는지 확인한다.
3. 신청 상태가 `pending`인지 확인한다.
4. `status`를 `rejected`로 변경한다.
5. `decision_reason`을 저장한다.
6. `reviewed_by`와 `reviewed_at`을 기록한다.

거절된 신청은 연차 잔액에 영향을 주지 않는다.

### 4.6 `cancel_leave()`
목적: 직원이 본인의 대기 중인 연차 신청을 취소한다.

**입력값**

| 매개변수 | 자료형 | 필수 여부 |
| :--- | :--- | :--- |
| `p_request_id` | `UUID` | 필수 |

**처리 로직**
1. 로그인한 사용자가 신청자 본인인지 확인한다.
2. 신청 상태를 확인한다.
3. 상태가 `pending`이면 `cancelled`로 변경한다.
4. 그 외 상태라면 취소를 거부한다.

**MVP 취소 정책**

| 현재 상태 | 취소 가능 여부 |
| :--- | :--- |
| `pending` | 가능 |
| `approved` | 불가능 |
| `rejected` | 불가능 |
| `cancelled` | 불가능 |

승인된 연차 취소 및 잔액 복구는 MVP 이후 기능으로 둔다.

---

## 5. 출퇴근 관리 (Attendance Management)
MVP에서는 출근과 퇴근 등록 및 기록 조회만 구현한다. 자동 결근 판정이나 복잡한 근무 일정은 제외한다.

### 5.1 `check_in()`
목적: 직원의 출근 시간을 등록한다.

| 항목 | 내용 |
| :--- | :--- |
| 입력값 | 없음 |
| 실행 권한 | 직원 |
| 참조 테이블 | `attendance_records`, `company_settings` |

**처리 로직**
1. 현재 로그인한 사용자의 역할이 `employee`인지 확인한다.
2. 서버의 현재 시각을 가져온다.
3. 회사의 시간대 기준으로 오늘 날짜를 계산한다.
4. 해당 날짜의 출근 기록이 이미 있는지 확인한다.
5. `company_settings`에서 근무 시작 시간과 지각 허용 시간을 조회한다.
6. 출근 허용 시각을 계산한다.
7. 현재 시각이 허용 시각을 초과하면 `late`, 그렇지 않으면 `present`로 설정한다.
8. `attendance_records`에 출근 기록을 INSERT한다.

**지각 판정**
`출근 허용 시각 = 근무 시작 시간 + 지각 허용 시간`

**예시**

| 항목 | 값 |
| :--- | :--- |
| 근무 시작 시간 | 09:00 |
| 지각 허용 시간 | 10분 |
| 09:10까지 출근 | `present` |
| 09:10 초과 출근 | `late` |

**저장 데이터**

| 필드 | 값 |
| :--- | :--- |
| `employee_id` | `auth.uid()` |
| `work_date` | 회사 시간대 기준 오늘 날짜 |
| `check_in` | 서버 현재 시각 |
| `check_out` | `NULL` |
| `status` | `present` 또는 `late` |

**오류 상황**

| 오류 코드 | 발생 조건 |
| :--- | :--- |
| `UNAUTHORIZED` | 직원 역할이 아님 |
| `ALREADY_CHECKED_IN` | 이미 출근 기록이 존재함 |
| `SETTINGS_NOT_FOUND` | 회사 설정이 존재하지 않음 |

기존 `unique_employee_work_date` 제약 조건을 중복 출근 방지의 최종 안전장치로 사용한다.

### 5.2 `check_out()`
목적: 직원의 퇴근 시간을 등록한다.

| 항목 | 내용 |
| :--- | :--- |
| 입력값 | 없음 |
| 실행 권한 | 직원 |
| 참조 테이블 | `attendance_records` |

**처리 로직**
1. 현재 로그인한 사용자의 역할이 `employee`인지 확인한다.
2. 회사 시간대 기준 오늘 날짜의 출근 기록을 조회한다.
3. 출근 기록이 존재하는지 확인한다.
4. 이미 퇴근 처리되었는지 확인한다.
5. 서버 현재 시각을 `check_out`에 저장한다.

**오류 상황**

| 오류 코드 | 발생 조건 |
| :--- | :--- |
| `UNAUTHORIZED` | 직원 역할이 아님 |
| `CHECK_IN_REQUIRED` | 출근 기록이 없음 |
| `ALREADY_CHECKED_OUT` | 이미 퇴근 처리됨 |

### 5.3 `get_attendance_records()`
목적: 지정된 기간의 출퇴근 기록을 조회한다.

**입력값**

| 매개변수 | 자료형 | 필수 여부 |
| :--- | :--- | :--- |
| `p_start_date` | `DATE` | 필수 |
| `p_end_date` | `DATE` | 필수 |
| `p_employee_id` | `UUID` | 선택 (HR 관리자 조회용) |

**처리 로직**
- 직원은 본인의 기록만 조회한다.
- HR 관리자는 전체 직원의 기록을 조회할 수 있다.
- HR 관리자가 특정 직원 ID를 전달하면 해당 직원의 기록만 조회한다.
- 지정된 기간의 기록을 반환한다.
- 최신 날짜 순으로 정렬한다.

**반환 항목**
- 직원 ID
- 근무 날짜
- 출근 시간
- 퇴근 시간
- 근태 상태

**MVP 제외 기능**
- 자동 결근 판정
- 초과 근무 시간 계산
- 근무 시간 통계
- 승인된 연차와 근태 기록 자동 연동

---

## 6. 승인 규칙 관리 (Approval Rule Management)
현재 `approval_rules` 테이블을 그대로 활용한다.

### 6.1 `create_approval_rule()`
목적: HR 관리자가 승인 규칙을 생성한다.

**입력값**

| 매개변수 | 자료형 | 설명 |
| :--- | :--- | :--- |
| `p_rule_name` | `TEXT` | 규칙 이름 |
| `p_min_notice_days` | `INTEGER` | 최소 사전 신청 일수 |
| `p_max_consecutive_days` | `INTEGER` | 최대 연속 연차 일수 (선택) |
| `p_is_active` | `BOOLEAN` | 활성화 여부 |

**처리 로직**
1. HR 관리자 권한을 확인한다.
2. 규칙 이름이 비어 있지 않은지 확인한다.
3. `min_notice_days`가 0 이상인지 확인한다.
4. `max_consecutive_days`가 `NULL`이거나 양수인지 확인한다.
5. 활성화 규칙이 이미 존재하는지 확인한다.
6. `approval_rules`에 INSERT한다.

### 6.2 `update_approval_rule()`
목적: HR 관리자가 기존 승인 규칙을 수정한다.

**입력값**
- `p_rule_id`
- `p_rule_name`
- `p_min_notice_days`
- `p_max_consecutive_days`
- `p_is_active`

**처리 로직**
1. HR 관리자 권한을 확인한다.
2. 수정할 규칙이 존재하는지 확인한다.
3. 입력값을 검증한다.
4. 활성화 규칙이 하나만 존재하도록 확인한다.
5. `approval_rules`를 UPDATE한다.
6. `updated_at`을 현재 시각으로 변경한다.

### 6.3 승인 규칙 적용
`apply_leave()`에서 활성화된 승인 규칙을 검사한다.

| 규칙 | 검사 내용 |
| :--- | :--- |
| `min_notice_days` | 신청일과 연차 시작일 사이의 기간이 최소 사전 신청 일수 이상인지 확인 |
| `max_consecutive_days` | 신청 일수가 설정된 최대 연속 사용 일수를 초과하는지 확인 |

**MVP 정책**
- 활성 승인 규칙은 하나만 적용한다.
- 활성 규칙이 없으면 사전 신청 및 최대 연속 사용 제한을 적용하지 않는다.
- 규칙을 위반하면 신청을 생성하지 않고 오류를 반환한다.
- 규칙 변경은 이후 제출되는 신규 신청부터 적용한다.
- 기존 신청은 규칙 변경만으로 다시 검증하지 않는다.

현재 `leave_requests`에는 신청 당시 적용된 규칙 ID가 없다.
MVP에서는 기존 신청의 규칙을 별도로 보존하지 않는다. 추후 신청 당시 규칙을 재현해야 한다면 `approval_rule_id` 또는 규칙 스냅샷 컬럼을 추가한다.

---

## 7. 회사 설정 관리 (Company Settings Management)

### 7.1 `get_company_settings()`
목적: 로그인한 사용자가 회사 근무 설정을 조회한다.

| 항목 | 내용 |
| :--- | :--- |
| 입력값 | 없음 |
| 실행 권한 | 로그인 사용자 |
| 참조 테이블 | `company_settings` |

**처리 로직**
1. 로그인 여부를 확인한다.
2. `company_settings`에서 설정을 조회한다.
3. 현재 설정값을 반환한다.

**반환 항목**

| 필드 | 설명 |
| :--- | :--- |
| `work_start_time` | 근무 시작 시간 |
| `work_end_time` | 근무 종료 시간 |
| `late_threshold` | 지각 허용 시간 (분) |
| `auto_approval_enabled` | 자동 승인 활성화 여부 |

### 7.2 `update_company_settings()`
목적: HR 관리자가 회사 설정을 수정한다.

**입력값**
- `p_work_start_time`
- `p_work_end_time`
- `p_late_threshold`
- `p_auto_approval_enabled`

**처리 로직**
1. HR 관리자 권한을 확인한다.
2. 근무 종료 시간이 근무 시작 시간보다 늦은지 확인한다.
3. 지각 허용 시간이 0 이상인지 확인한다.
4. `company_settings`를 UPDATE한다.
5. `updated_at`을 현재 시각으로 변경한다.

**MVP 정책**
- 회사 설정은 하나만 존재한다.
- 설정 변경은 저장 즉시 적용한다.
- 변경 이후 실행되는 신규 출근 처리부터 새 설정을 적용한다.
- 이미 저장된 출퇴근 기록은 변경하지 않는다.
- `auto_approval_enabled`는 설정값만 저장하며 실제 자동 승인 기능은 구현하지 않는다.

---

## 8. 직원 관리 (Employee Management)

### 8.1 직원 계정 생성
관련 기능: `create_employee()` — 3.3절 참고
MVP에서는 HR 관리자가 직원을 초대하는 방식을 사용한다.
- 서버 측 Edge Function에서 Supabase Auth Admin API를 호출한다.
- Auth 사용자 생성 후 반환된 UUID로 `employees` 프로필을 생성한다.
- 직원에게 초대 이메일을 발송한다.
- 직원은 초대 링크를 통해 계정을 활성화한다.
- `service_role` 키는 프론트엔드에 노출하지 않는다.

### 8.2 직원 프로필 수정
관련 기능: `update_employee_profile()` — 3.4절 참고
MVP에서 수정할 수 있는 항목은 다음과 같다.
- 이름
- 이메일
- 부서
이메일 변경 시 Supabase Auth 이메일과 프로필 이메일을 함께 동기화한다.

### 8.3 MVP 제외 범위
- 직원의 역할 변경
- 직원 계정 비활성화 및 재활성화
- 퇴사·휴직 상태 관리
단, 기존 직원의 연차 및 근태 기록은 삭제하지 않는다.

---

## 9. 보안 및 데이터베이스 규칙 (Security & Database Rules)

### 9.1 보안 계층별 책임

| 보안 계층 | 책임 |
| :--- | :--- |
| Supabase Auth | 사용자 인증 |
| RLS | 사용자별 데이터 접근 범위 제한 |
| PostgreSQL Function | 비즈니스 규칙 검증 및 핵심 데이터 변경 |
| Edge Function | 서버 측 Auth Admin API 호출 및 관리 작업 |
| Database Constraint | 데이터 무결성 보장 |

**예시: 연차 신청**
- RLS: 다른 직원의 데이터에 접근하지 못하도록 제한한다.
- PostgreSQL Function: 날짜 중복, 연차 유형, 신청 일수를 검증한다.
- Database Constraint: 종료일이 시작일보다 빠른 데이터 등을 차단한다.

### 9.2 함수 보안 원칙
`SECURITY DEFINER`가 필요한 함수는 다음 원칙을 따른다.
1. `auth.uid()`를 통해 호출 사용자를 확인한다.
2. `get_current_user_role()` 등을 이용해 역할을 검증한다.
3. `search_path = ''`를 설정한다.
4. 테이블 및 함수 이름을 `public.table_name`처럼 스키마까지 명시한다.
5. 기본 실행 권한을 제거하고 필요한 역할에만 `EXECUTE`를 허용한다.
6. `PUBLIC`, `anon`에는 불필요한 실행 권한을 부여하지 않는다.

---

## 10. MVP 범위 (MVP Scope)

| 기능 | MVP 포함 여부 | 비고 |
| :--- | :--- | :--- |
| 직원 로그인 | 포함 | Supabase Auth |
| 직원 계정 생성 | 포함 | HR 관리자 초대, 서버 측 Auth Admin API |
| 직원 프로필 조회 | 포함 | 본인 및 HR 관리자 권한에 따라 조회 |
| 직원 프로필 수정 | 포함 | 이름, 이메일, 부서 |
| 연차 신청 | 포함 | 날짜 단위 |
| 연차 승인 및 거절 | 포함 | HR 관리자 수동 처리 |
| 연차 잔액 조회 | 포함 | 연도별 잔액 |
| 대기 신청 취소 | 포함 | 직원 본인 신청 |
| 출근 및 퇴근 | 포함 | 하루 한 번 |
| 지각 판정 | 포함 | 회사 설정 기준 |
| 승인 규칙 관리 | 포함 | 사전 신청 기간, 최대 연속 일수 |
| 회사 설정 관리 | 포함 | 근무 시간, 지각 허용 시간 |
| 연간 연차 자동 부여 | 제외 | 추후 구현 |
| 승인된 연차 취소 및 잔액 복구 | 제외 | 추후 구현 |
| 자동 연차 승인 | 제외 | 추후 구현 |
| 자동 결근 처리 | 제외 | 추후 구현 |
| 반차 및 시간 단위 연차 | 제외 | 추후 구현 |
| 공휴일 자동 계산 | 제외 | 추후 구현 |
| 직원별 근무 일정 | 제외 | 추후 구현 |
| AI 기반 승인 판단 | 제외 | 추후 구현 |
| 직원 계정 비활성화 | 제외 | 추후 구현 |

---

## 11. MVP에서 사용할 정책 가정 (Business Policy Assumptions)
현재 데이터베이스 구조와 MVP 범위를 바탕으로 다음 정책을 적용한다.

| 결정 항목 | MVP 정책 |
| :--- | :--- |
| 연차 계산 | 시작일과 종료일을 포함한 달력 날짜 기준 |
| 주말 | 연차 일수에 포함 |
| 공휴일 | 별도 계산하지 않으며 연차 일수에 포함 |
| 반차 | 지원하지 않음 |
| 중복 신청 | `pending` 및 `approved` 신청과 날짜가 겹치면 불허 |
| 연도 경계 | 다른 연도로 넘어가는 신청은 불허 |
| 잔액 관리 | 직원별·연도별 공통 연차 잔액 사용 |
| 승인 방식 | HR 관리자 수동 승인 |
| 승인된 연차 취소 | MVP에서 불허 |
| 근태 시간대 | `Asia/Seoul` (Korea) |
| 출퇴근 | 하루 한 번 출근 및 퇴근 |
| 결근 | 자동 처리하지 않음 |
| 승인 규칙 | 활성 규칙 하나만 적용 |
| 규칙 변경 | 신규 신청부터 적용 |
| 직원 계정 생성 | HR 관리자 초대 방식 |
| 직원 비활성화 | MVP에서 제외 |

### 11.1 연차 잔액의 연도 기준
`leave_balances.year`가 존재하므로 신청이 연도를 넘는 경우 잔액 차감 기준이 모호해진다.
MVP에서는 연도를 넘는 신청을 허용하지 않는다.

### 11.2 승인 규칙 변경 이력
현재 `leave_requests`에는 신청 당시 적용한 규칙 ID가 없다.
MVP에서는 기존 신청을 재검증하지 않는 것으로 단순화한다.
신청 당시 규칙을 보존해야 하는 요구가 생기면 `approval_rule_id` 또는 규칙 스냅샷 컬럼을 추가한다.

---

## 12. 테스트 및 프론트엔드 연동
- RLS 권한 테스트
- 정상 입력 및 잘못된 입력 테스트
- 중복 연차 신청 테스트
- 중복 출근 및 퇴근 테스트
- 동시 승인 및 잔액 동시성 테스트
- 직원과 HR 관리자별 접근 권한 테스트
- Auth 계정과 직원 프로필 동기화 테스트
- 프론트엔드 연동 테스트

---

## 13. 백엔드 구현 공통 원칙 (Implementation Principles)
1. 핵심 데이터 변경은 PostgreSQL Function으로 처리한다. 연차 신청·승인·거절·취소 및 출근·퇴근은 검증된 함수로 실행한다.
2. 조회는 단순하게 유지한다. RLS가 조회 범위를 보장한다면 일반 Supabase SELECT를 사용해도 된다.
3. 직원 계정 관리는 서버 측에서 처리한다. Auth Admin API는 Edge Function을 통해 호출하며 `service_role` 키를 클라이언트에 노출하지 않는다.
4. 연차 잔액 변경과 거래 내역 기록은 하나의 트랜잭션으로 처리한다. 중간 작업이 실패하면 모든 변경 사항이 롤백되어야 한다.
5. 동시성 문제를 방지한다. 연차 승인 시 신청 행과 잔액 행을 잠그고 상태 및 잔액을 다시 확인한다.
6. RLS를 유지한다. PostgreSQL Function을 추가하더라도 데이터 접근 보안 정책을 제거하지 않는다.
7. 클라이언트 입력을 신뢰하지 않는다. 사용자 ID, 역할, 승인 상태, 연차 일수 및 서버 시간은 서버에서 검증하거나 결정한다.
8. Migration으로 버전 관리한다. 함수, 정책, 제약 조건 변경 사항을 SQL Migration으로 관리한다.
9. 프론트엔드 연동 전에 함수를 테스트한다. 성공 및 실패 케이스를 모두 검증한다.