# RLS 테스트 결과 (RLS Test Results)

## 1. 테스트 개요 (Overview)

본 문서는 Supabase PostgreSQL 데이터베이스에 적용된 Row Level Security(RLS) 정책이 사용자 역할에 따라 올바르게 동작하는지 검증한 결과를 기록한다.

테스트의 주요 목적은 다음과 같다.

- Employee는 본인의 데이터에만 접근할 수 있는가?
- HR Admin은 전체 직원 및 연차 신청 데이터를 조회할 수 있는가?
- Employee가 다른 직원의 데이터를 생성하거나 수정할 수 없는가?
- Employee가 본인의 승인 상태를 임의로 변경할 수 없는가?
- 허용되지 않은 사용자가 데이터를 삭제할 수 없는가?

### 테스트 계정

| 사용자 | 역할 |
|---|---|
| Employee A | employee |
| Employee B | employee |
| HR Admin | hr_admin |

## 3. SELECT 테스트 (Data Access Control)

**목적:** 각 사용자 계정으로 로그인했을 때 데이터베이스에서 어떤 데이터까지 조회할 수 있는지 검증한다.

| ID | 테스트 항목 | 기대 결과 | 결과 |
|---|---|---|---|
| 1-1 | Employee A가 본인의 데이터 조회 | 본인 데이터만 조회 가능 | PASS |
| 1-2 | Employee B가 본인의 데이터 조회 | 본인 데이터만 조회 가능 | PASS |
| 1-3 | 직원 간 데이터 격리 | 다른 직원의 데이터 조회 차단 | PASS |
| 1-4 | HR Admin의 전체 직원 조회 | 전체 직원 데이터 조회 가능 | PASS |
| 1-5 | HR Admin의 전체 연차 신청 조회 | 전체 연차 신청 데이터 조회 가능 | PASS |
| 1-6 | auth.uid() 사용자 식별 | 현재 인증된 사용자 ID 식별 | PASS |
| 1-7 | get_current_user_role() 역할 식별 | 현재 사용자의 역할 식별 | PASS |

**테스트 결과: PASS (7/7)**

## 4. INSERT 테스트 (Data Creation Control)

**목적:** 사용자가 연차 신청 데이터를 생성할 때 본인의 권한 범위 내에서만 데이터를 생성할 수 있는지 검증한다.

| ID | 테스트 항목 | 기대 결과 | 결과 |
|---|---|---|---|
| 2-1 | Employee A의 정상적인 연차 신청 | 본인 명의의 연차 신청 생성 가능 | PASS |
| 2-2 | Employee A가 다른 직원의 이름으로 연차 신청 | 다른 직원 명의의 데이터 생성 차단 | PASS |
| 2-3 | Employee의 승인 상태 조작 | 승인 상태 임의 변경 차단 | PASS |
| 2-4 | Employee의 비활성화된 연차 종류 사용 | 비활성화된 연차 종류의 신청 차단 | PASS |

**테스트 결과: PASS (4/4)**

## 5. UPDATE 테스트 (Data Modification Control)

**목적:** Employee와 HR Admin의 데이터 수정 권한이 올바르게 구분되는지 검증한다.

| ID | 테스트 항목 | 기대 결과 | 결과 |
|---|---|---|---|
| 3-1 | HR Admin이 직원의 연차 신청 상태를 approved로 변경 | 승인 상태 변경 가능 | PASS |
| 3-2 | Employee A가 Employee B의 연차 신청 상태 변경 시도 | 다른 직원의 연차 신청 상태 변경 차단 | PASS |

**테스트 결과: PASS (2/2)**

## 6. DELETE 테스트 (Data Deletion Control)

**목적:** 허용되지 않은 사용자가 다른 직원의 연차 신청 데이터를 삭제할 수 없는지 검증한다.

| ID | 테스트 항목 | 기대 결과 | 결과 |
|---|---|---|---|
| 4-1 | Employee A가 Employee B의 연차 신청 삭제 시도 | 데이터베이스 권한 단계에서 삭제 차단 | PASS |

**테스트 결과: PASS (1/1)**

## 7. 테스트 결과 요약 (Test Summary)

| 테스트 유형 | 통과 | 실패 | 합계 |
|---|---:|---:|---:|
| SELECT | 7 | 0 | 7 |
| INSERT | 4 | 0 | 4 |
| UPDATE | 2 | 0 | 2 |
| DELETE | 1 | 0 | 1 |
| **합계** | **14** | **0** | **14** |

현재까지 총 14개의 테스트 항목을 실행했으며, 모든 테스트가 통과하였다.

이를 통해 SQL Editor에서 수동으로 설정한 JWT 정보를 기반으로 Employee와 HR Admin의 데이터 접근 및 수정 권한이 의도한 정책에 따라 동작하는 것을 확인하였다.

## 8. 테스트 범위 및 제한 사항 (Testing Scope & Limitations)

### 8.1 현재 검증한 범위

이번 테스트는 Supabase SQL Editor에서 JWT 정보를 수동으로 설정하여 데이터베이스의 RLS 정책을 검증하는 방식으로 진행하였다.

다음 항목을 확인하였다.

- 인증된 사용자의 ID 식별 (`auth.uid()`)
- 사용자 역할 식별 (`get_current_user_role()`)
- Employee 간 데이터 접근 격리
- HR Admin의 전체 데이터 조회 권한
- 연차 신청 데이터의 생성 및 승인 권한 제어
- 허용되지 않은 데이터 수정 및 삭제 차단

### 8.2 아직 검증하지 않은 범위

이번 테스트는 실제 Frontend 로그인부터 Supabase API를 거쳐 PostgreSQL 데이터베이스까지 연결되는 전체 흐름을 검증한 것은 아니다.

따라서 다음 항목은 추후 통합 테스트에서 검증할 예정이다.

- Frontend에서 Supabase Auth를 이용한 실제 로그인
- 로그인 후 JWT 발급 및 Session 유지
- Supabase Client를 통한 실제 API 요청
- 실제 로그인 사용자에 따른 RLS 정책 적용
- Employee 및 HR Admin 계정별 실제 서비스 접근 권한
- 로그아웃 이후 인증이 필요한 API 요청 차단
