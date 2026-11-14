# HR Management System — Business Rules Document

**Backend:** Supabase (PostgreSQL, Auth, RLS, Database Functions)

---

## 1. Service Overview

본 서비스는 직원과 HR 관리자를 위한 통합 인사관리 시스템이다.

### 1.1 Main Features

1. 연차 관리 (Leave Management)
2. 출퇴근 관리 (Attendance Management)
3. 승인 규칙 관리 (Approval Rules Management)
4. 회사 설정 관리 (Company Settings Management)
5. 직원 관리 (Employee Management)
6. 인증 및 권한 관리 (Authentication & Authorization)

### 1.2 User Roles

| Role | Description |
|---|---|
| Employee | 연차 신청 및 본인의 출퇴근 기록 관리 |
| HR Admin | 직원 관리, 연차 승인 및 거절, 인사 관련 설정 관리 |

---

## 2

### 2.1 Leave Application

| ID | Policy | Description |
|---|---|---|
| LR-01 | Leave Application | 직원은 연차를 신청할 수 있다. |
| LR-02 | Application Date | 과거 날짜로 연차를 신청할 수 없다. |
| LR-03 | Date Validation | 종료일은 시작일보다 빠를 수 없다. |
| LR-04 | Overlapping Applications | 기존 연차 신청과 날짜가 겹치는 신청은 허용하지 않는다. |
| LR-05 | Leave Balance Validation | 사용 가능한 연차보다 많은 일수는 승인할 수 없다. |
| LR-06 | Initial Status | 새로운 연차 신청은 `pending` 상태로 생성된다. |
| LR-07 | Application Reason | 연차 신청 사유는 선택 사항이다. |

### 2.2 Leave Balance

Pending 상태의 연차 신청은 잔액을 차감하지 않으며, 사용 가능 연차에서도 제외하지 않는다.

| ID | Policy | Description |
|---|---|---|
| LB-01 | Pending Application | Pending 신청은 연차 잔액을 차감하지 않는다. |
| LB-02 | Available Balance | Pending 신청은 사용 가능 연차에서 제외하지 않는다. |
| LB-03 | Approved Application | HR Admin이 신청을 승인하면 연차를 차감한다. |
| LB-04 | Rejected Application | 거절된 신청은 연차 잔액에 영향을 주지 않는다. |
| LB-05 | Balance Validation | 승인 직전에 잔여 연차를 다시 확인한다. |
| LB-06 | Transaction History | 모든 연차 잔액 변경은 `leave_balance_transactions`에 기록한다. |
| LB-07 | Leave Cancellation | 승인된 연차를 취소하면 차감된 연차를 복구한다. |
| LB-08 | Annual Leave Grant | 연간 연차 부여 방식을 별도로 정의한다. |

**Available Leave Balance Calculation**

```text
Available Leave Balance = Total Days - Used Days
```

Pending 상태의 신청은 계산에 포함하지 않는다.

### 2.3 Leave Approval & Rejection

| ID | Policy | Description |
|---|---|---|
| LA-01 | Approval Permission | HR Admin만 연차 신청을 승인할 수 있다. |
| LA-02 | Rejection Permission | HR Admin만 연차 신청을 거절할 수 있다. |
| LA-03 | Approval Condition | Pending 상태의 신청만 승인할 수 있다. |
| LA-04 | Rejection Condition | Pending 상태의 신청만 거절할 수 있다. |
| LA-05 | Approval Record | 승인자와 승인 시간을 기록한다. |
| LA-06 | Approval Method | 수동 승인 또는 자동 승인 정책을 정의한다. |

### 2.4 Leave Cancellation

| ID | Policy | Description |
|---|---|---|
| LC-01 | Pending Cancellation | 직원이 Pending 신청을 취소할 수 있다. |
| LC-02 | Approved Cancellation | 승인된 연차를 취소할 수 있는 조건을 정의한다. |
| LC-03 | Balance Restoration | 취소가 허용된 승인 연차는 차감된 잔액을 복구한다. |
| LC-04 | Cancellation Record | 취소 사유와 취소 내역을 기록한다. |

---

## 3. Attendance Management

### 3.1 Check-in

| ID | Policy | Description |
|---|---|---|
| AT-01 | Check-in Registration | 직원은 출근 시간을 등록할 수 있다. |
| AT-02 | Duplicate Check-in Prevention | 직원당 하루 하나의 출근 기록만 허용한다. |
| AT-03 | Check-in Time | 서버 시간을 기준으로 출근 시간을 기록한다. |
| AT-04 | Late Detection | 회사 설정에 등록된 지각 허용 시간을 기준으로 판단한다. |

### 3.2 Check-out

| ID | Policy | Description |
|---|---|---|
| AT-05 | Check-out Registration | 출근 기록이 있어야 퇴근할 수 있다. |
| AT-06 | Duplicate Check-out Prevention | 이미 퇴근 처리된 기록은 다시 퇴근 처리할 수 없다. |
| AT-07 | Time Validation | 퇴근 시간은 출근 시간보다 늦어야 한다. |

### 3.3 Attendance Status

| ID | Policy | Description |
|---|---|---|
| AT-08 | Present | 정상적으로 출근한 상태를 기록한다. |
| AT-09 | Late | 허용된 출근 시간을 초과하면 지각으로 처리한다. |
| AT-10 | Absence | 결근 기록 및 처리 방식을 정의한다. |
| AT-11 | Approved Leave | 승인된 연차가 근태 기록에 미치는 영향을 정의한다. |

---

## 4. Approval Rules Management

| ID | Policy | Description |
|---|---|---|
| AR-01 | Rule Creation | HR Admin이 승인 규칙을 생성하고 관리한다. |
| AR-02 | Rule Activation | 활성화된 승인 규칙만 적용한다. |
| AR-03 | Minimum Notice Period | `min_notice_days` 조건을 적용한다. |
| AR-04 | Maximum Consecutive Leave Days | `max_consecutive_days`가 설정된 경우 해당 조건을 적용한다. |
| AR-05 | Rule Modification | 승인 규칙 변경이 기존 대기 신청에 영향을 주는지 정의한다. |

---

## 5. Company Settings Management

| ID | Policy | Description |
|---|---|---|
| CS-01 | Working Hours | 회사 설정에 따라 근무 시작 및 종료 시간을 관리한다. |
| CS-02 | Late Threshold | 회사 설정에 따라 지각 허용 시간을 관리한다. |
| CS-03 | Automatic Approval | 자동 승인 적용 조건을 정의한다. |
| CS-04 | Settings Permission | 권한이 있는 HR Admin만 회사 설정을 변경할 수 있다. |
| CS-05 | Effective Date | 변경된 설정을 즉시 적용할지 특정 날짜부터 적용할지 정의한다. |

---

## 6. Employee Management

| ID | Policy | Description |
|---|---|---|
| EM-01 | Employee Creation | 직원 계정을 누가 생성할 수 있는지 정의한다. |
| EM-02 | Employee Profile | 직원 정보는 인증된 사용자 계정과 연결한다. |
| EM-03 | Role Modification | 직원은 본인의 권한을 직접 변경할 수 없다. |
| EM-04 | Employee Deactivation | 퇴사 또는 휴직 직원의 계정 처리 방식을 정의한다. |
| EM-05 | Historical Data Preservation | 직원 비활성화 후에도 기존 인사 기록을 보존한다. |

---

## 7. Authentication & Authorization

| ID | Policy | Description |
|---|---|---|
| AU-01 | User Authentication | 보호된 데이터에 접근하려면 로그인해야 한다. |
| AU-02 | Employee Data Access | 직원은 본인의 데이터에 접근할 수 있다. |
| AU-03 | HR Admin Data Access | HR Admin은 역할에 따라 허용된 데이터에 접근할 수 있다. |
| AU-04 | Role Protection | 사용자는 본인의 역할을 직접 변경할 수 없다. |
| AU-05 | Database Security | 데이터 접근 제한은 RLS로 강제한다. |

---

## 8. Backend Implementation Principles

1. 신뢰할 수 있는 데이터베이스 접근이 필요한 비즈니스 로직은 PostgreSQL Functions로 구현한다.
2. 연차 잔액 변경과 거래 내역 기록은 하나의 Transaction으로 처리한다.
3. 동시에 여러 연차 신청이 승인되더라도 잔액이 잘못 계산되지 않도록 동시성 제어를 적용한다.
4. RLS는 데이터 접근 권한을 강제하는 보안 계층으로 유지한다.
5. Database Constraints는 데이터 무결성을 보장한다.
6. 사용자 ID, 역할, 승인 상태 등 중요한 값은 클라이언트 입력을 신뢰하지 않는다.
7. 데이터베이스 변경 사항은 버전 관리되는 Migration으로 관리한다.
8. Frontend 연동 전에 Backend Functions를 테스트한다.