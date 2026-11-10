# AI 기반 근태·연차 관리 시스템

직원의 근태 및 연차 사용 현황을 관리하고, AI Agent를 활용하여 연차 신청과 자동 승인 과정을 지원하는 HR 서비스

## Tech Stack

| 구분               | 기술                       |
| ------------------ | -------------------------- |
| Language           | TypeScript                 |
| Frontend           | React, Vite                |
| Routing            | React Router               |
| State Management   | Zustand                    |
| Server State       | TanStack Query             |
| UI                 | Material UI (MUI), Emotion |
| Backend / Database | Supabase                   |
| Package Manager    | npm                        |

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

## Scripts

| 명령어            | 설명                             |
| ----------------- | -------------------------------- |
| `npm run dev`     | 개발 서버 실행                   |
| `npm run build`   | TypeScript 검사 및 프로덕션 빌드 |
| `npm run lint`    | ESLint 검사                      |
| `npm run preview` | 빌드 결과 미리보기               |

## Project Structure

```text
project/
├── .github/
│   ├── ISSUE_TEMPLATE/    # GitHub 이슈 템플릿
│   ├── workflows/         # GitHub Actions CI
│   └── pull_request_template.md
│
├── public/                # 정적 리소스
├── src/
│   ├── apis/              # 외부 API 및 Edge Functions 호출
│   ├── assets/            # 이미지 및 정적 리소스
│   ├── common/            # 공통 컴포넌트
│   ├── hooks/             # 커스텀 훅
│   ├── layouts/           # 공통 레이아웃
│   ├── libs/              # Supabase 클라이언트 등 공통 설정
│   ├── models/            # TypeScript 타입 및 인터페이스
│   ├── routes/            # 라우팅 및 접근 제어
│   ├── services/          # 데이터 조회 및 저장 로직
│   ├── utils/             # 유틸리티 함수
│   └── theme.ts           # MUI 테마
│
└── README.md
```

## GitHub Collaboration

기능 개발 및 버그 수정은 Issue와 Pull Request를 기반으로 진행합니다.

1. Issue 생성 및 담당자 지정
2. 작업 브랜치 생성
3. 기능 개발 및 커밋
4. Pull Request 생성
5. GitHub Actions 자동 검사
6. 코드 리뷰 후 develop 브랜치에 병합

GitHub Actions를 통해 ESLint 검사와 빌드를 자동으로 실행합니다.
