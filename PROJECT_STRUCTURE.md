# 📁 Git Metrics Dashboard 프로젝트 구조

```
git-metrics-dashboard/
├── .vscode/                    # VSCode 설정
│   ├── launch.json            # 디버깅 설정
│   └── tasks.json             # 빌드 태스크
├── media/                      # 웹뷰 리소스
│   ├── dashboard.js           # 대시보드 JavaScript
│   └── dashboard.css          # 대시보드 스타일
├── src/                        # 소스 코드
│   ├── extension.ts           # 확장 진입점
│   ├── dashboardPanel.ts      # 웹뷰 패널 관리
│   ├── gitMetricsProvider.ts  # Git 데이터 수집
│   ├── exportManager.ts       # 리포트 내보내기
│   ├── types.ts               # TypeScript 타입 정의
│   ├── utils.ts               # 유틸리티 함수
│   └── test/                  # 테스트 파일
│       └── utils.test.ts      # 유틸리티 테스트
├── out/                        # 컴파일된 JavaScript (자동 생성)
├── node_modules/               # NPM 패키지 (자동 생성)
├── git-metrics-reports/        # 내보낸 리포트 (자동 생성)
├── .eslintrc.json             # ESLint 설정
├── .gitignore                 # Git 제외 파일
├── .vscodeignore              # VSIX 패키징 제외 파일
├── CHANGELOG.md               # 변경 사항
├── DEPLOYMENT.md              # 배포 가이드
├── ICON_INSTRUCTIONS.md       # 아이콘 생성 가이드
├── LICENSE                    # MIT 라이선스
├── PROJECT_STRUCTURE.md       # 이 파일
├── README.md                  # 프로젝트 문서
├── icon.png                   # 확장 아이콘 (128x128)
├── package-lock.json          # NPM 잠금 파일
├── package.json               # 프로젝트 설정
└── tsconfig.json              # TypeScript 설정
```

## 📄 주요 파일 설명

### 🎯 핵심 파일

#### `src/extension.ts`
- VSCode 확장의 진입점
- `activate()`: 확장 활성화 시 실행
- `deactivate()`: 확장 비활성화 시 실행
- 명령 등록 및 자동 새로고침 설정

#### `src/dashboardPanel.ts`
- 웹뷰 패널 생성 및 관리
- HTML 생성 및 메시지 통신
- 차트 데이터 직렬화

#### `src/gitMetricsProvider.ts`
- Git 로그 파싱 및 분석
- 메트릭 계산 (커밋, 작성자, 언어, 시간 패턴)
- simple-git 라이브러리 사용

#### `src/exportManager.ts`
- PDF/PNG/CSV 내보내기 기능
- 각 형식별 포맷팅 로직
- 파일 저장 관리

### 📊 웹뷰 리소스

#### `media/dashboard.js`
- Chart.js를 사용한 차트 렌더링
- VSCode API와 메시지 통신
- 내보내기 다이얼로그 UI

#### `media/dashboard.css`
- 대시보드 스타일링
- VSCode 테마 변수 사용
- 반응형 레이아웃

### ⚙️ 설정 파일

#### `package.json`
- 확장 메타데이터 (이름, 버전, 설명)
- 명령 및 설정 정의
- 의존성 관리

#### `tsconfig.json`
- TypeScript 컴파일 옵션
- strict 모드 활성화
- ES2020 타겟

## 🔧 개발 워크플로우

### 1. 환경 설정
```bash
npm install
```

### 2. 개발 모드
```bash
# 감시 모드로 컴파일
npm run watch

# VSCode에서 F5로 디버깅 시작
```

### 3. 테스트
```bash
npm test
```

### 4. 빌드
```bash
npm run compile
```

### 5. 패키징
```bash
vsce package
```

## 🏗️ 아키텍처

### 데이터 흐름
1. **Git 데이터 수집** → GitMetricsProvider
2. **데이터 처리** → 메트릭 계산 및 집계
3. **웹뷰 렌더링** → DashboardPanel
4. **차트 표시** → Chart.js
5. **내보내기** → ExportManager

### 메시지 통신
```
Extension ←→ Webview
  ├── updateMetrics: 메트릭 데이터 전송
  ├── refresh: 새로고침 요청
  ├── export: 내보내기 요청
  └── changeperiod: 기간 변경
```

## 🚀 확장 기능 추가하기

### 새로운 차트 추가
1. `types.ts`에 데이터 타입 정의
2. `gitMetricsProvider.ts`에서 데이터 수집
3. `dashboard.js`에 Chart.js 차트 추가
4. `dashboard.css`에 스타일 추가

### 새로운 내보내기 형식
1. `exportManager.ts`에 새 메서드 추가
2. `extension.ts`에서 형식 옵션 추가
3. 필요시 새 라이브러리 설치

### 새로운 명령 추가
1. `package.json`의 `contributes.commands`에 추가
2. `extension.ts`에서 명령 핸들러 구현

## 📦 배포 준비

1. 버전 번호 업데이트
2. CHANGELOG.md 작성
3. 아이콘 확인 (icon.png)
4. README.md 스크린샷 업데이트
5. 모든 테스트 통과 확인

---

더 자세한 정보는 각 파일의 주석과 README.md를 참조하세요.