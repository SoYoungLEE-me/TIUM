# HR 챗봇 에이전트 명세

> 기준: `supabase/migrations/*.sql` 및 시드에 정의된 테이블·RPC만 사용한다.  
> OpenAPI·business-logic-specification.md는 구현 근거로 쓰지 않는다.

## 1. 목적

직원이 자연어 또는 UI 뱃지(퀵액션)로 연차·회사 규정을 조회하고,
휴가 신청을 확인 카드로 준비한 뒤 제출한다.
범위 밖 요청은 거절하고, 필요 시 관리자 비동기 문의로 연결한다.

실제 수치·규정은 서버 도구(DB)로만 조회한다.
직원이 확인 카드에서 제출하기 전에는 `leave_requests`에 INSERT하지 않는다.

## 2. 지원 범위

- 본인 잔여 연차 조회 (`leave_balances` + pending 합)
- 휴가 유형·자동승인 설정·승인 규칙 안내
- 회사 handbook(`company_knowledge`) 기반 일반 규정 답변
- 본인 신청 내역 조회 (`leave_requests`)
- 자연어/뱃지로 신청 의도 파악 → 부족 정보 clarification
- `prepare_leave_request`로 검사·확인 카드
- 확인 카드 제출 → `submit_leave_from_token` (자동승인 또는 pending)
- 관리자 비동기 문의 스레드

### 제외

- 다른 직원 개인정보
- AI의 승인·반려 대행
- 급여, 연차 발생·이월·소멸
- 관리자가 AI 세션에 실시간 join
- 제출 후 취소

## 3. 말투

- 친근한 한국어 존댓말, 결론 먼저
- 잔여·규정·승인 여부를 추측하지 않음
- 범위 밖: “제가 처리할 수 없거나 진행할 수 없는 사안이에요. 관리자 문의로 남겨 주세요.”

## 4. 인증·날짜

- 직원 ID = `auth.uid()` = `employees.id` (도구 인자로 받지 않음)
- 시간대: Asia/Seoul
- 상대 날짜는 절대 날짜(YYYY-MM-DD)로 변환 후 도구에 전달

## 5. 기존 DB (마이그레이션)

| 테이블 | 챗봇 관련 컬럼 |
|--------|----------------|
| `employees` | id, full_name, email, role, department |
| `leave_balances` | employee_id, year, total_days, used_days |
| `leave_types` | id, name, deduction_days, is_active (**code 없음**) |
| `company_settings` | auto_approval_enabled, work_start_time, work_end_time, late_threshold |
| `approval_rules` | rule_name, max_consecutive_days, min_notice_days, is_active |
| `leave_requests` | leave_type_id, start_date, end_date, total_days, reason, status, approval_type(`auto`\|`manual`), … |
| `leave_balance_transactions` | grant / deduction / restoration |
| `attendance_records` | 근태(충돌 검사는 MVP에서 선택) |

### 연차 계산 (서버)

```
remaining_days = total_days - used_days
pending_days   = 같은 연도 status='pending' 인 leave_requests.total_days 합
available_days = remaining_days - pending_days
```

pending은 `used_days`를 바꾸지 않는다. 승인 시에만 used_days·deduction 트랜잭션.

### 신청 일수

- `leave_types.deduction_days < 1` (반차): `start_date = end_date` 필수, `total_days = deduction_days`
- 그 외: `total_days = (end_date - start_date + 1) * deduction_days` (통상 deduction_days=1)

### 자동승인 (제출 시)

| 결과 | 조건 |
|------|------|
| blocked (제출 불가) | 과거일, 연도 스팬, 비활성 유형, 잔여(available) 부족, 날짜 중복(pending/approved) |
| pending | `auto_approval_enabled = false` 이거나 min_notice / max_consecutive 미충족 |
| approved + approval_type=`auto` | auto ON 이고 규칙 충족 → used_days·deduction 동시 반영 |

clarification 옵션 `value`는 **leave_types.id (uuid)** 또는 서버가 준 식별자. code 필드 없음.

## 6. 신규 스키마 (챗봇용)

### 6.1 `assistant_conversations`

- id uuid PK
- employee_id uuid → employees
- created_at, expires_at timestamptz

### 6.2 `assistant_messages`

- id uuid PK
- conversation_id → assistant_conversations
- role text (`user` \| `assistant`)
- content text
- response_json jsonb null
- created_at

### 6.3 `leave_confirmation_tokens`

- token text PK
- employee_id uuid
- payload jsonb (leave_type_id, start_date, end_date, total_days, reason, expected_status, review_reasons)
- expires_at, used_at
- submission_key text null

### 6.4 `company_knowledge`

- id uuid, slug text unique, title text, body_md text, updated_at

### 6.5 `inquiry_threads` / `inquiry_messages`

- threads: employee_id, subject, status(`open`\|`closed`), last_message_at, unread_admin, unread_employee
- messages: thread_id, sender_id, sender_role(`employee`\|`hr_admin`), body, created_at

RLS: conversation·token·inquiry는 본인(직원) / hr_admin은 inquiry 전체.

## 7. 도구 (직원 ID 서버 주입)

### get_my_leave_balance

입력: `{ "year": 2026 }`  
출력: year, total_days, used_days, remaining_days, pending_days, available_days

### get_leave_policy

입력: `{}`  
출력: leave_types[], company_settings(auto_approval_enabled, 근무시간), active approval_rules

### get_company_handbook

입력: `{ "query": "..." }` (선택)  
출력: knowledge documents body_md

### get_my_leave_requests

입력: `{ "start_date"?, "end_date"? }`  
출력: 본인 leave_requests (+ leave_type name)

### prepare_leave_request

입력: `{ "leave_type_id", "start_date", "end_date", "reason"? }`  
처리: 일수 계산·잔여·중복·자동승인 예상 → 토큰 발급 (INSERT leave_requests 없음)  
출력: LeavePreview (can_submit, expected_status, review_reasons, confirmation_token, expires_at)

## 8. 프론트 응답 JSON (`POST` Edge `assistant-messages`)

요청: `{ conversation_id?: string|null, message: string }`  
응답: `{ data: { conversation_id, type, message, payload } }`

| type | 용도 |
|------|------|
| answer | 일반·규정·잔여 답변 |
| clarification | 추가 질문 + options(뱃지) |
| leave_confirmation | 신청 확인 카드 |
| blocked | 신청 불가 |

제출은 프론트가 `submit_leave_from_token(confirmation_token, submission_key)` RPC 호출.  
결과는 채팅에 표시하며 AI 재호출 불필요.

## 9. UI 진입

- 자연어 입력 또는 퀵액션 뱃지 (동일 message 경로)
- 기본 뱃지: 잔여 연차 확인, 회사 휴가 규정, 관리자 문의
- AI 불가·대화 마무리 시에도 관리자 문의 뱃지 노출
- 관리자: 문의함 목록 → 챗봇형 스레드 UI; Navbar 알림; 사이드바 뱃지

## 10. 서버 강제 규칙

- JWT·활성 직원 확인, 대화·토큰 소유권
- AI 키는 Edge secrets만
- 도구 입력 검증, rate limit
- 제출 전 재검사, 중복 차감 방지
