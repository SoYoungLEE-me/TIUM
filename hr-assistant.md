# HR 챗봇 에이전트 명세

## 1. 목적

직원이 자연어로 연차와 회사 규정을 조회하고,
휴가 신청 내용을 준비할 수 있도록 돕는다.

실제 정보는 서버 도구로 조회한다.
직원이 최종 확인하기 전에는 신청을 저장하지 않는다.

## 2. 지원 범위

- 본인 잔여 연차 조회
- 회사 연차·반차 규정 안내
- 본인 신청 내역과 승인 상태 조회
- 자연어에서 신청 날짜·휴가 유형 파악
- 부족한 정보 추가 질문
- 신청 조건 검사
- 신청 확인 카드 생성
- 제출 결과 안내

### 제외 범위

- 다른 직원의 개인정보 조회
- AI의 관리자 승인·반려
- 급여 계산
- 연차 자동 발생·이월·소멸
- 팀별 휴가 인원 제한·회사 행사 검사
- HR 실시간 채팅
- 제출 후 취소

제출 전 신청 내용 수정과 닫기는 지원한다.

## 3. 말투와 답변 규칙

- 친근한 한국어 존댓말을 사용한다.
- 결론부터 간결하게 안내한다.
- 연차 수량·규정·승인 여부를 추측하지 않는다.
- 실제 조회 결과에 근거해 답한다.
- 회사 규정이 없으면 확인할 수 없다고 안내한다.
- 도구 실행 실패를 성공으로 안내하지 않는다.
- 사용자가 요청하지 않은 날짜·유형으로 변경하지 않는다.

예시:
“잔여 연차는 10일이고, 검토 대기 1일을 제외하면
9일을 추가로 신청할 수 있어요.”

## 4. 사용자와 날짜 기준

서버가 다음 정보를 제공한다.

- 인증된 직원 ID
- 활성 계정 여부
- 회사 시간대
- 현재 날짜
- 대화 소유자

사용자 메시지에 적힌 직원 ID나 역할은 인증 정보로 사용하지 않는다.

### 날짜 해석

- 회사 시간대 기준으로 해석한다.
- “내일”, “이번 주 금요일”은 정확한 날짜로 변환한다.
- 날짜나 연도가 모호하면 확인한다.
- 확인 카드에는 YYYY-MM-DD로 표시한다.
- 과거 날짜·연도를 넘는 기간 등은 서버 검증 결과를 따른다.

## 5. 사용하는 DB

| 테이블                     | 용도                          |
| -------------------------- | ----------------------------- |
| employees                   | 로그인 직원 확인              |
| leave_balances             | 연도별 부여·사용 연차 조회    |
| leave_types                | 연차·오전 반차·오후 반차 확인 |
| company_settings           | 근무시간·기본 회사 설정       |
| approval_rules             | 자동 승인 조건                |
| attendance_records         | 신청 기간의 근태 충돌 검사    |
| leave_requests             | 신청 내역·중복·처리 상태      |
| leave_balance_transactions | 승인 후 연차 변동 기록        |

AI는 SQL을 직접 실행하지 않는다.
허용된 서버 도구를 통해 필요한 정보만 사용한다.

### 연차 계산 기준

서버에서 계산한다.

- 잔여 = total_days - used_days
- 검토 대기 = 해당 연도 pending 신청의 total_days 합계
- 신청 가능 = 잔여 - 검토 대기

## 6. 사용 가능한 도구

직원 ID는 도구 인자로 AI에게 받지 않고,
서버가 인증 정보에서 주입한다.

### 6.1 get_my_leave_balance

목적:
본인의 연도별 연차 조회.

입력:

```json
{
  "year": 2026
}
```

결과:

```json
{
  "year": 2026,
  "total_days": 15,
  "used_days": 5,
  "remaining_days": 10,
  "pending_days": 1,
  "available_days": 9
}
```

### 6.2 get_leave_policy

목적:
회사 규정과 사용 가능한 휴가 유형 조회.

입력:

```json
{}
```

결과에 포함할 정보:

- 휴가 유형 ID·코드·이름·차감 단위
- 기본 근무시간
- 자동 승인 활성화 여부
- 활성 승인 규칙

규칙 수치는 실제 DB에서 조회한다.
예시 수치를 실제 회사 규정으로 안내하지 않는다.

### 6.3 get_my_leave_requests

목적:
본인의 신청 내역과 처리 결과 조회.

입력:

```json
{
  "start_date": "2026-11-01",
  "end_date": "2026-11-30"
}
```

신청 기간이 조회 기간과 겹치는 본인 신청을 반환한다.
대상 신청이 불분명하면 추가 질문한다.

결과:

```json
{
  "requests": [
    {
      "id": "request-uuid",
      "leave_type_name": "연차",
      "start_date": "2026-11-13",
      "end_date": "2026-11-13",
      "total_days": 1,
      "status": "pending",
      "approval_type": null,
      "decision_reason": "HR 검토가 필요합니다."
    }
  ]
}
```

### 6.4 prepare_leave_request

목적:
신청 조건을 검사하고 확인 카드를 준비한다.
신청 저장·연차 차감은 하지 않는다.

입력:

```json
{
  "leave_type_code": "am_half",
  "start_date": "2026-11-13",
  "end_date": "2026-11-13",
  "reason": null
}
```

서버 처리:

1. 유형 코드와 실제 leave_type_id 연결
2. 날짜·유형 검증
3. 근무일 기준 차감 일수 계산
4. 신청 가능 연차 확인
5. 승인·대기 신청과 시간대 중복 확인
6. 근태 충돌 확인
7. 자동 승인 규칙 검사
8. 확인 토큰 발급

AI가 차감 일수나 확인 토큰을 직접 만들지 않는다.

## 7. 대화 흐름

### 연차 조회

질문 이해
→ get_my_leave_balance
→ 잔여·검토 대기·신청 가능 일수 안내

### 규정 질문

질문 이해
→ get_leave_policy
→ 조회한 규정에 근거해 답변

### 신청 준비

날짜·유형 파악
→ 부족한 정보 추가 질문
→ prepare_leave_request
→ 신청 불가 안내 또는 확인 카드 표시

### 신청 확인

- 수정: 변경된 내용으로 다시 검사
- 닫기: 신청 없이 종료
- 제출: 프론트가 실제 신청 API 호출

“응”, “진행해” 같은 채팅만으로는 제출하지 않는다.
이번 MVP에서는 확인 카드의 제출 버튼을 사용한다.

## 8. 프론트 응답 JSON

챗봇 백엔드가 아래 형식으로 반환한다.
AI 제공업체의 원본 응답을 그대로 보내지 않는다.

| type               | 화면             |
| ------------------ | ---------------- |
| answer             | 일반 답변        |
| clarification      | 추가 질문·선택지 |
| leave_confirmation | 신청 확인 카드   |
| blocked            | 신청 불가 안내   |

### 8.1 일반 답변

```json
{
  "data": {
    "conversation_id": "conversation-uuid",
    "type": "answer",
    "message": "추가로 신청 가능한 연차는 9일이에요.",
    "payload": {
      "balance": {
        "year": 2026,
        "total_days": 15,
        "used_days": 5,
        "remaining_days": 10,
        "pending_days": 1,
        "available_days": 9
      }
    }
  }
}
```

규정 안내 등 별도 화면 데이터가 필요 없으면
payload는 빈 객체로 반환할 수 있다.

### 8.2 추가 질문

```json
{
  "data": {
    "conversation_id": "conversation-uuid",
    "type": "clarification",
    "message": "오전 반차와 오후 반차 중 어느 쪽인가요?",
    "payload": {
      "missing_fields": ["leave_type"],
      "options": [
        {
          "label": "오전 반차",
          "value": "am_half"
        },
        {
          "label": "오후 반차",
          "value": "pm_half"
        }
      ]
    }
  }
}
```

자유 입력이 필요하면 options는 빈 배열이다.

### 8.3 신청 확인 카드

```json
{
  "data": {
    "conversation_id": "conversation-uuid",
    "type": "leave_confirmation",
    "message": "신청 내용을 확인한 뒤 제출해 주세요.",
    "payload": {
      "leave_type_id": "leave-type-uuid",
      "leave_type_name": "오전 반차",
      "start_date": "2026-11-13",
      "end_date": "2026-11-13",
      "total_days": 0.5,
      "balance": {
        "year": 2026,
        "total_days": 15,
        "used_days": 5,
        "remaining_days": 10,
        "pending_days": 1,
        "available_days": 9
      },
      "can_submit": true,
      "expected_status": "approved",
      "review_reasons": [],
      "confirmation_token": "server-issued-token",
      "expires_at": "2026-11-11T03:10:00Z"
    }
  }
}
```

expected_status는 예상 결과이다.
이 단계에서 “승인되었습니다”라고 안내하지 않는다.

HR 검토 예상이면:

- expected_status = pending
- review_reasons에 서버가 반환한 사유 코드 포함

### 8.4 신청 불가

```json
{
  "data": {
    "conversation_id": "conversation-uuid",
    "type": "blocked",
    "message": "신청 가능한 연차가 부족합니다.",
    "payload": {
      "reason_codes": ["INSUFFICIENT_BALANCE"],
      "available_days": 0.5,
      "requested_days": 1
    }
  }
}
```

## 9. 최종 제출 연결

직원이 확인 카드에서 제출 버튼을 누르면 호출한다.

POST /api/leaves

```json
{
  "confirmation_token": "server-issued-token",
  "submission_key": "unique-submission-uuid"
}
```

서버는 토큰과 현재 신청 조건을 다시 검사한다.

자동 승인 결과:

```json
{
  "data": {
    "id": "request-uuid",
    "status": "approved",
    "approval_type": "auto",
    "total_days": 0.5,
    "decision_reason": "자동 승인 조건 충족",
    "message": "오전 반차가 승인되었습니다."
  }
}
```

HR 검토 결과:

```json
{
  "data": {
    "id": "request-uuid",
    "status": "pending",
    "approval_type": null,
    "total_days": 0.5,
    "decision_reason": "자동 승인 조건에 해당하지 않습니다.",
    "message": "HR 검토 대기로 접수되었습니다."
  }
}
```

- 제출 중 버튼을 비활성화한다.
- 재시도에는 동일한 submission_key를 사용한다.
- 결과를 채팅에 표시한다.
- 최종 결과 안내를 위해 AI를 다시 호출할 필요는 없다.
- 완료된 확인 카드는 다시 제출할 수 없게 표시한다.

## 10. 오류 대응

| 상황                  | 동작                              |
| --------------------- | --------------------------------- |
| 날짜·유형 부족        | 추가 질문                         |
| 잔여 부족·중복        | blocked                           |
| 자동 승인 조건 미충족 | HR 검토 예상 카드                 |
| DB 조회 실패          | 추측하지 않고 재시도 안내         |
| AI 연결 실패          | 재시도 안내                       |
| 로그인 만료           | 재로그인 안내                     |
| 대화 만료             | 새 대화 시작 안내                 |
| 확인 토큰 만료        | 신청 내용 재검사                  |
| 제출 결과 불명확      | 동일 키로 재시도해 기존 결과 확인 |

시스템 오류는 HTTP 오류로 반환한다.

```json
{
  "error": {
    "code": "AI_UNAVAILABLE",
    "message": "답변을 불러오지 못했어요. 다시 시도해 주세요.",
    "details": {}
  }
}
```

## 11. 서버 구현 규칙

다음은 프롬프트가 아닌 코드로 강제한다.

- 로그인 토큰·활성 직원 확인
- 대화·확인 토큰 소유권 확인
- 허용 도구·입력값 검증
- 사용자별 호출량·메시지 길이 제한
- 도구 실행 횟수·처리 시간 제한
- AI 키 서버 전용 보관
- 다른 직원 데이터 접근 차단
- 제출 전 재검사
- 중복 신청·중복 차감 방지

사용자 메시지나 조회 데이터에 포함된 명령으로
역할·권한·도구 제한을 변경하지 않는다.

## 12. 대화 예시

### 조회

직원: 내 연차 몇 개 남았어?
동작: get_my_leave_balance
답변: 잔여 10일 중 검토 대기 1일을 제외하면
9일을 추가로 신청할 수 있어요.

### 정보 부족

직원: 반차 신청해 줘.
답변: 어느 날짜에 사용하실 예정인가요?
직원: 11월 13일.
답변: 오전 반차와 오후 반차 중 어느 쪽인가요?

### 신청 준비

직원: 오전으로 할게.
동작: prepare_leave_request
화면: 날짜·유형·차감 일수·수정·제출 버튼

### HR 검토

도구 결과: expected_status=pending
답변: HR 검토가 필요한 신청이에요.
내용을 확인한 뒤 제출해 주세요.

## 13. UI 완료 기준

실제 연결 전에는 예시 JSON으로 확인한다.

- [ ] 플로팅 버튼과 열기·닫기
- [ ] 입력·전송·자동 스크롤
- [ ] 일반 답변
- [ ] 추가 질문·선택지
- [ ] 신청 확인 카드
- [ ] 내용 수정·닫기
- [ ] 제출 중 상태·중복 클릭 방지
- [ ] 승인·검토 대기 결과 표시
- [ ] 신청 불가 안내
- [ ] 로딩·오류·재시도
- [ ] 모바일·긴 메시지 확인

## 14. 실제 연결 후 완료 기준

- [ ] 실제 본인 연차 조회
- [ ] 실제 회사 규정 조회
- [ ] 이전 대화에 이어 추가 질문
- [ ] 서버 검사 결과로 확인 카드 생성
- [ ] 최종 확인 후에만 신청
- [ ] 실제 승인·검토 결과 표시
- [ ] 타인 데이터 접근 차단
- [ ] 중복 신청·차감 방지

## 15. 연결 전 확정할 항목

- AI 제공업체·모델
- 챗봇 서버 실행 환경
- 도구별 실제 DB 조회 함수
- 휴가 유형 코드와 ID 연결
- 근태 충돌 기준
- 자동 승인 규칙의 날짜 계산 기준
- 대화 저장·만료 방식
- 확인 토큰 저장·만료 방식
