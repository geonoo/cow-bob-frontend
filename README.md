# 물류기사 배차 관리 시스템 - 프론트엔드

물류기사들을 위한 공정한 배차 관리 시스템의 웹 인터페이스입니다.

## 🛠 기술 스택

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Query
- **Forms**: React Hook Form
- **UI Components**: Custom components with Tailwind
- **Charts**: Chart.js with react-chartjs-2
- **Date Handling**: date-fns, react-datepicker
- **Notifications**: react-toastify

## 🚀 실행 방법

### 1. 사전 요구사항
- Node.js 16 이상
- NPM 또는 Yarn

### 2. 프로젝트 클론
```bash
git clone https://github.com/YOUR_USERNAME/cow-bob-frontend.git
cd cow-bob-frontend
```

### 3. 의존성 설치
```bash
npm install
```

### 4. 🔐 Private 설정 파일 설정
**중요**: 이 프로젝트는 환경 설정을 별도의 private 저장소에서 관리합니다.

```bash
# Private 저장소 클론 (동일한 상위 디렉토리에)
cd ..
git clone https://github.com/YOUR_USERNAME/cow-bob-private.git
cd cow-bob-frontend

# 심볼릭 링크 생성
ln -sf ../cow-bob-private/frontend.env .env.local
```

**디렉토리 구조:**
```
your-project/
├── cow-bob-backend/     # 백엔드 저장소
├── cow-bob-frontend/    # 이 저장소
└── cow-bob-private/     # Private 저장소
    ├── backend.env
    ├── frontend.env
    └── data/
```

### 5. 개발 서버 실행
```bash
npm run dev
```

애플리케이션이 http://localhost:3000 에서 실행됩니다.

## 📂 프로젝트 구조

```
src/
├── components/               # 재사용 가능한 UI 컴포넌트
│   └── Layout.tsx           # 메인 레이아웃 래퍼
├── pages/                   # Next.js 페이지 (파일 기반 라우팅)
│   ├── _app.tsx            # 앱 래퍼
│   ├── index.tsx           # 대시보드 (/)
│   ├── assignments.tsx     # 배차 관리
│   ├── deliveries.tsx      # 배송 관리
│   ├── drivers.tsx         # 기사 관리
│   └── vacations.tsx       # 휴가 관리
├── services/               # API 통합
│   └── apiClient.ts        # 중앙화된 API 클라이언트
├── types/                  # TypeScript 타입 정의
│   └── index.ts           # 공유 인터페이스
├── styles/                 # 전역 스타일
│   └── globals.css        # Tailwind CSS imports
└── utils/                  # 유틸리티 함수
```

## 📱 화면 구성

### 대시보드 (/)
- 전체 통계 카드 (기사 수, 배송 현황)
- 최근 배송 목록
- 빠른 액션 버튼

### 기사 관리 (/drivers)
- 기사 목록 테이블
- 기사 등록/수정 모달
- 기사 상태 관리 (활성/비활성/휴가)

### 배송 관리 (/deliveries)
- 배송 목록 테이블
- 배송 등록/수정 모달
- 배송 상태 추적 (대기/배정/진행중/완료/취소)

### 배차 관리 (/assignments)
- 대기 중인 배송 목록
- 배차 추천 시스템
- 자동/수동 배차 기능

### 휴가 관리 (/vacations)
- 휴가 신청 목록
- 휴가 신청 모달
- 휴가 승인/반려 기능

## 🎨 UI/UX 특징

- **반응형 디자인**: 다양한 화면 크기에 최적화
- **직관적인 네비게이션**: 사이드바 기반 메뉴
- **실시간 상태 표시**: 색상 코딩된 상태 배지
- **모달 기반 폼**: 사용자 친화적인 데이터 입력
- **테이블 기반 데이터 표시**: 정렬 및 필터링 지원

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린팅
npm run lint

# 타입 체크
npm run type-check
```

## 🌐 API 연동

백엔드 API와의 통신은 `src/services/apiClient.ts`를 통해 중앙화되어 있습니다:

- **기사 API**: `driverApi`
- **배송 API**: `deliveryApi`
- **휴가 API**: `vacationApi`

모든 API 호출은 Axios를 사용하며, 에러 처리와 로딩 상태 관리가 포함되어 있습니다.

## 🔧 환경 설정

### 개발 환경
- API URL: `http://localhost:8080`
- 포트: 3000

### 프로덕션 환경
환경 변수를 통해 API URL을 설정할 수 있습니다:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.