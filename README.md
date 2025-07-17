# 물류기사 배차 관리 시스템 - 프론트엔드

Next.js와 TypeScript로 구현된 물류기사 배차 관리 시스템의 프론트엔드 웹 애플리케이션입니다.

## 📝 업데이트 내역 (2024-06)

- 배송관리 페이지: 유효성 검사 실패 시 모달 알림 추가
- 배송관리 UI: 버튼/글씨 색상 대비, 인풋박스 디자인 개선, 모바일 대응
- 기사 관리 페이지: 월별 매출 조회 기능 추가(버튼, 모달, 연도·월 선택, 표 표시)
- ErrorModal 컴포넌트 추가 및 적용
- 위 변경사항에 따른 주요 UI/UX 개선점

## 🛠 기술 스택

- **Framework**: Next.js 14**Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **UI Components**: 커스텀 모달 및 알림 시스템
- **Build Tool**: NPM/Yarn
- **Package Manager**: NPM

## 📋 시스템 요구사항

- Node.js 16이상
- NPM 또는 Yarn

## 🚀 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd cow-bob/frontend
```

### 2의존성 설치
```bash
npm install
# 또는
yarn install
```

### 3. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

애플리케이션이 http://localhost:300 실행됩니다.

### 4. 프로덕션 빌드
```bash
npm run build
npm start
# 또는
yarn build
yarn start
```

## 📂 프로젝트 구조

```
frontend/
├── src/
│   ├── components/           # 재사용 가능한 컴포넌트
│   │   ├── Layout.tsx       # 레이아웃 컴포넌트
│   │   └── ErrorModal.tsx   # 오류 모달 컴포넌트
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── _app.tsx         # 앱 루트 컴포넌트
│   │   ├── index.tsx        # 대시보드
│   │   ├── drivers.tsx      # 기사 관리
│   │   ├── deliveries.tsx   # 배송 관리
│   │   ├── assignments.tsx  # 배차 관리
│   │   └── vacations.tsx    # 휴가 관리
│   ├── services/            # API 서비스
│   │   └── apiClient.ts     # API 클라이언트
│   ├── types/               # TypeScript 타입 정의
│   │   └── index.ts         # 공통 타입
│   ├── hooks/               # 커스텀 훅
│   └── styles/              # 스타일 파일
│       └── globals.css      # 전역 스타일
├── public/                  # 정적 파일
├── package.json             # 의존성 관리
├── tailwind.config.js       # Tailwind CSS 설정
├── tsconfig.json           # TypeScript 설정
└── next.config.js          # Next.js 설정
```

## 📱 화면 구성

### 대시보드 (/)
- 전체 통계 카드 (기사 수, 배송 현황)
- 최근 배송 목록
- 빠른 액션 버튼

### 기사 관리 (/drivers)
- 기사 목록 테이블
- 기사 등록/수정 모달
- 기사 상태 관리
- 월별 매출 통계

### 배송 관리 (/deliveries)
- 배송 목록 테이블
- 배송 등록/수정 모달
- 배송 상태 추적
- 유효성 검사 및 오류 알림

### 배차 관리 (/assignments)
- 대기 중인 배송 목록
- 배차 추천 시스템
- 자동/수동 배차 기능

### 휴가 관리 (/vacations)
- 휴가 신청 목록
- 휴가 신청 모달
- 휴가 승인/반려 기능

## 🎨 UI/UX 특징

### 반응형 디자인
- 모바일, 태블릿, 데스크톱 모든 기기 지원
- Tailwind CSS를 활용한 유연한 레이아웃
- 터치 친화적인 인터페이스

### 사용자 경험
- 직관적인 네비게이션
- 실시간 상태 업데이트
- 로딩 상태 및 에러 처리
- 모달 기반 오류 알림

### 접근성
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 색상 대비 최적화

## 🔧 개발 도구

### 코드 품질
- ESLint: 코드 린팅
- Prettier: 코드 포맷팅
- TypeScript: 타입 안전성

### 개발 환경
- Hot Reload: 실시간 코드 변경 반영
- Source Maps: 디버깅 지원
- 개발자 도구 통합

## 🧪 테스트

### 테스트 실행
```bash
# 단위 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage

# E2E 테스트 실행 (향후 구현 예정)
npm run test:e2e
```

### 테스트 구조
- **Unit Tests**: 컴포넌트 및 유틸리티 함수 테스트
- **Integration Tests**: API 연동 테스트
- **E2E Tests**: 전체 워크플로우 테스트 (향후 구현)

## 🌐 API 연동

### API 클라이언트
- Axios 기반 HTTP 클라이언트
- 인터셉터를 통한 공통 처리
- 에러 핸들링 및 재시도 로직

### 데이터 관리
- React Hooks를 활용한 상태 관리
- 서버 상태와 클라이언트 상태 분리
- 캐싱 전략 (향후 구현)

## 🚨 오류 처리

### 사용자 피드백
- 모달 기반 오류 알림
- 유효성 검사 실패 시 즉시 피드백
- 네트워크 오류 시 재시도 옵션

### 개발자 경험
- 콘솔 로깅
- 에러 바운더리
- 디버깅 정보 제공

## 📊 성능 최적화

### 번들 최적화
- 코드 스플리팅
- 지연 로딩
- 이미지 최적화

### 런타임 최적화
- React.memo를 통한 불필요한 리렌더링 방지
- useMemo, useCallback 훅 활용
- 가상화된 리스트 (대용량 데이터)

## 🔒 보안

### 입력 검증
- 클라이언트 사이드 유효성 검사
- XSS 방지
- CSRF 토큰 (향후 구현)

### 데이터 보호
- 민감 정보 암호화
- HTTPS 통신
- 세션 관리 (향후 구현)

## 📈 분석 및 모니터링

### 사용자 분석
- 페이지 뷰 추적
- 사용자 행동 분석
- 성능 메트릭 수집

### 오류 모니터링
- 자바스크립트 오류 추적
- API 호출 실패 모니터링
- 사용자 피드백 수집

## 🚀 배포

### 빌드 최적화
```bash
# 프로덕션 빌드
npm run build

# 정적 파일 생성
npm run export
```

### 배포 플랫폼
- Vercel (권장)
- Netlify
- AWS S3 + CloudFront
- Docker 컨테이너

## 🤝 기여하기

1. 저장소를 포크합니다
2. 피처 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)3 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 코딩 컨벤션
- TypeScript 엄격 모드 사용
- 함수형 컴포넌트 및 Hooks 활용
- Tailwind CSS 클래스 네이밍 컨벤션 준수
- ESLint 및 Prettier 설정 준수

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

**물류기사 배차 관리 시스템 프론트엔드** - 공정하고 효율적인 배차 관리를 위한 웹 인터페이스