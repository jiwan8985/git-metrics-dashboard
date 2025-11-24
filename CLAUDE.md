# Git Metrics Dashboard - 코드 분석 문서

## 📋 프로젝트 개요

**프로젝트명:** Git Metrics Dashboard
**버전:** 0.0.8
**타입:** VS Code Extension
**언어:** TypeScript
**라이선스:** MIT
**레포지토리:** https://github.com/jiwan8985/git-metrics-dashboard

**설명:** 개발자별 Git 커밋 통계 및 메트릭 대시보드 - Git 저장소의 커밋 통계, 개발자 기여도 분석, 시각적 리포트 생성, 그리고 게임화된 배지 시스템을 통한 개발자 성취도 추적을 제공하는 VS Code 확장 도구입니다.

---

## 🏗️ 프로젝트 구조

```
git-metrics-dashboard/
├── src/
│   ├── extension.ts              (348줄)   - 메인 진입점 및 명령어 등록
│   ├── gitAnalyzer.ts            (817줄)   - Git 데이터 추출 및 메트릭 계산
│   ├── dashboardProvider.ts      (4,350줄) - 대시보드 UI 생성 및 관리
│   ├── reportGenerator.ts        (1,904줄) - 리포트 생성 (HTML/JSON/CSV/Markdown)
│   ├── badgeSystem.ts            (579줄)   - 게임화 배지 시스템
│   ├── cacheManager.ts           (27줄)    - 데이터 캐싱 유틸
│   └── test/
│       └── extension.test.ts           - 확장 기능 테스트
├── images/                       - 마케팅 자산 및 스크린샷
├── package.json                  - 확장 매니페스트 및 NPM 설정
├── tsconfig.json                 - TypeScript 설정
├── .eslintrc.json                - ESLint 규칙
├── CHANGELOG.md                  - 버전 히스토리
├── README.md                     - 사용자 문서
└── LICENSE                       - MIT 라이선스
```

**총 소스 코드:** 8,025줄 TypeScript

---

## 🎯 핵심 기능

### 1. 실시간 Git 분석 대시보드
- 커밋 통계 시각화
- 개발자별 기여도 분석
- 파일 변경 추적
- 시계열 활동 데이터

### 2. 다중 형식 리포트 생성
- **HTML 리포트:** 인터랙티브 브라우저 뷰, 차트 포함
- **JSON 리포트:** 구조화된 데이터 내보내기
- **CSV 리포트:** 스프레드시트 호환
- **Markdown 리포트:** GitHub/문서용
- 테마 적용 (다크/라이트 모드)

### 3. 개발자 성취 배지 시스템
- 20개 이상의 배지 (7개 카테고리)
- 5개 레어도 레벨 (COMMON ~ LEGENDARY)
- 진행도 추적 (0-100%)
- 카테고리:
  - COMMIT_MASTER: 커밋 스트릭 및 빈도
  - CODE_QUALITY: 코드 품질 지표
  - COLLABORATOR: 팀 협력 지표
  - TIME_WARRIOR: 활동 시간대 패턴
  - MILESTONE: 달성 마일스톤
  - CONSISTENCY: 신뢰성 지표
  - EXPLORER: 코드 다양성

### 4. 언어 지원 (70개 이상)
- 프론트엔드: JavaScript, TypeScript, React, Vue.js 등
- 백엔드: Python, Java, Go, Rust, PHP 등
- 모바일: Swift, Dart, Objective-C
- 함수형: Haskell, Elm, F# 등
- 레거시: COBOL, Fortran, LISP 등

### 5. 시간 기반 분석
- 시간별 활동 패턴
- 주중/주말 분석
- 야간 커밋 추적 (22:00-06:00)
- 최고 활동 시간 탐지
- 업무 시간대 패턴 (8시간 윈도우)
- 활동 히트맵 시각화

### 6. 테마 시스템
- 자동 감지 (VS Code 테마 동기화)
- 라이트/다크 모드
- 내보낸 리포트에 테마 적용
- 실시간 테마 전환

---

## 🔧 기술 스택

### 개발 도구
- **TypeScript 5.8.3** - 타입 안전 언어
- **VS Code API 1.102.0+** - 확장 프레임워크
- **Node.js** - 런타임 환경

### 빌드 및 품질
- **tsc** - TypeScript 컴파일러
- **ESLint 9.25.1** - 코드 린팅
- **@typescript-eslint** - TS 전용 린팅 규칙

### 테스트
- **@vscode/test-cli** - CLI 테스트 러너
- **@vscode/test-electron** - Electron 테스트
- **Mocha** - 테스트 프레임워크

### 퍼블리싱
- **@vscode/vsce 2.19.0** - VS Code 패키징/퍼블리싱
- **npm** - 패키지 관리

### 외부 의존성
**없음** - VS Code API와 Node.js 내장 모듈만 사용

---

## 🏛️ 아키텍처

```
┌─────────────────────────────────────────────┐
│        VS Code Extension Host               │
│          (extension.ts)                     │
└──────────────┬────────────────────────────┘
               │
        ┌──────┴──────────────────────────┐
        │                                 │
        v                                 v
┌──────────────────┐        ┌──────────────────┐
│ DashboardProvider │        │ ReportGenerator  │
│ (4,350 줄)       │        │ (1,904 줄)       │
│                  │        │                  │
│ - Webview UI     │        │ - HTML 리포트    │
│ - 메시지 처리    │        │ - JSON 내보내기  │
│ - 테마 제어      │        │ - CSV 내보내기   │
│ - 내보내기 대화  │        │ - 마크다운 문서  │
└────────┬─────────┘        └────────┬─────────┘
         │                          │
         └──────────┬───────────────┘
                    │
                    v
            ┌──────────────────┐
            │   GitAnalyzer    │
            │    (817 줄)      │
            │                  │
            │ - Git log 실행   │
            │ - 커밋 파싱      │
            │ - 메트릭 계산    │
            │ - 작성자 통계    │
            │ - 파일 분석      │
            │ - 시간 분석      │
            └────────┬─────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         v           v           v
    ┌─────────┐┌──────────┐┌───────────┐
    │BadgeSystem│CacheManager│ChildProcess│
    │(579 줄) │(27 줄)   │(git log)  │
    │          │          │           │
    │- 배지평가│- 5분캐시│- 커밋히스토리│
    │- 진행도추  │- 데이터저장│          │
    │  적     │          │           │
    └──────────┴──────────┴───────────┘
```

---

## 📊 주요 컴포넌트 상세 분석

### 1. Extension.ts (진입점)
**책임:** VS Code와의 상호작용, 명령어 등록

**등록된 명령어 (5개):**
- `gitMetrics.showDashboard` - 대시보드 표시
- `gitMetrics.quickExport` - 빠른 내보내기
- `gitMetrics.customExport` - 커스텀 내보내기
- `gitMetrics.openReportsFolder` - 리포트 폴더 열기
- `gitMetrics.toggleTheme` - 테마 전환

**활성화 이벤트:**
- 명령어 실행 시
- 워크스페이스에 .git 존재 시

**상태 바 항목:**
- 📊 Git Stats 버튼
- 📄 Export 버튼
- 테마 토글 버튼

### 2. GitAnalyzer.ts (데이터 추출)
**책임:** Git 저장소 분석 및 메트릭 계산

**주요 메서드:**
```typescript
getCommitHistory(days: number): Promise<CommitData[]>
  → git log 실행 및 커밋 데이터 파싱

generateMetrics(commits: CommitData[]): Promise<MetricsData>
  → 모든 분석 메트릭 계산

getDetailedCommitStats(days: number): Promise<ExtendedMetricsData>
  → 상세 통계 with 일일 평균
```

**분석 항목:**
- 작성자별 통계 (커밋 수, 파일 수, 삽입/삭제 라인)
- 파일 타입 분석 (70+ 언어)
- 시간 기반 패턴 (시간별, 요일별, 야간 커밋 등)
- 배지 평가 데이터

### 3. DashboardProvider.ts (UI 관리)
**책임:** VS Code Webview 생성 및 상호작용 관리

**기능:**
- HTML 대시보드 생성 (Chart.js 포함)
- 테마 적용 및 동적 업데이트
- Webview와의 메시지 통신
- 내보내기 대화 처리
- 실시간 데이터 시각화

**Webview 컴포넌트:**
- 요약 통계 패널
- 작성자 기여도 차트
- 파일 타입 분석
- 시간 기반 활동 히트맵
- 배지 표시
- 인터랙티브 내보내기 제어

### 4. ReportGenerator.ts (리포트 생성)
**책임:** 다양한 형식의 리포트 생성

**지원 형식:**
1. **HTML** - 인터랙티브, 브라우저 뷰 가능
2. **JSON** - 구조화된 데이터
3. **CSV** - 스프레드시트 호환
4. **Markdown** - GitHub/문서용

**특징:**
- 테마 인식 스타일링
- 요약 섹션 포함
- 작성자/파일 통계
- 시간 분석 시각화
- Print-friendly 레이아웃

### 5. BadgeSystem.ts (배지 시스템)
**책임:** 개발자 성취 배지 평가 및 관리

**배지 예시:**
- COMMIT_MASTER: 7일 연속 커밋, 30일 연속 커밋
- CODE_QUALITY: 작은 커밋, 설명형 커밋
- COLLABORATOR: 다국어 코더 (Polyglot Master)
- TIME_WARRIOR: 조기 등교 (Early Bird), 야행성 (Night Owl)
- MILESTONE: 100 커밋 달성

**평가 유형:**
- `count` - 절대값 기준
- `percentage` - 백분율 기준
- `streak` - 연속 일 패턴
- `pattern` - 복합 시간 패턴
- `milestone` - 고정된 달성값
- `ratio` - 비율 기반

### 6. CacheManager.ts (캐싱)
**책임:** 성능 최적화를 위한 데이터 캐싱

**특성:**
- TTL: 5분
- 목적: 중복된 Git 작업 감소
- 메서드: `set()`, `get()`, `clear()`

---

## 📋 설정 및 명령어

### 설정 (gitMetrics 네임스페이스)

```javascript
{
  "gitMetrics.defaultPeriod": 30,                     // 분석 기간 (일)
  "gitMetrics.autoRefresh": false,                    // 자동 새로고침
  "gitMetrics.showAuthorStats": true,                 // 작성자 통계 표시
  "gitMetrics.maxTopFiles": 10,                       // 상위 파일 개수
  "gitMetrics.theme": "auto",                         // 테마 (auto/light/dark)
  "gitMetrics.export.defaultFormat": "html",          // 기본 내보내기 형식
  "gitMetrics.export.includeSummary": true,           // 요약 포함
  "gitMetrics.export.includeAuthorStats": true,       // 작성자 통계 포함
  "gitMetrics.export.includeFileStats": true,         // 파일 통계 포함
  "gitMetrics.export.includeTimeAnalysis": true,      // 시간 분석 포함
  "gitMetrics.export.autoOpenAfterExport": false,     // 내보내기 후 자동 열기
  "gitMetrics.export.customReportsPath": "",          // 커스텀 출력 폴더
  "gitMetrics.export.useThemeInReports": true         // 리포트에 테마 적용
}
```

### 키보드 단축키

- `Ctrl+Shift+G Ctrl+Shift+D` (Win/Linux) / `Cmd+Shift+G Cmd+Shift+D` (Mac) → 대시보드
- `Ctrl+Shift+G Ctrl+Shift+E` / `Cmd+Shift+G Cmd+Shift+E` → 빠른 내보내기
- `Ctrl+Shift+G Ctrl+Shift+T` / `Cmd+Shift+G Cmd+Shift+T` → 테마 전환

---

## 📈 데이터 흐름

```
사용자 액션 (명령어/버튼)
    ↓
Extension 핸들러 (extension.ts)
    ↓
Git 분석기 (gitAnalyzer.ts)
├─ 실행: git log --since="date" --name-only
└─ 파싱: CommitData[]
    ↓
메트릭 계산
├─ 작성자 통계
├─ 파일 타입 분석
├─ 시간 기반 패턴
└─ 배지 평가
    ↓
대시보드 제공자 (dashboardProvider.ts)
├─ 분석기에서 메트릭 가져오기
├─ 현재 테마 적용
└─ HTML 생성 → Webview 표시
    ↓
사용자 상호작용 (대시보드)
├─ 내보내기 클릭 → 리포트 생성기
│   ├─ 형식 선택 (HTML/JSON/CSV/Markdown)
│   ├─ 테마 적용
│   ├─ 파일 시스템 쓰기
│   └─ 결과 알림 표시
└─ 테마 토글 클릭
    ├─ 설정 업데이트
    └─ 대시보드 새로고침
```

---

## 🔒 기술적 특징

### 강점
- ✅ 강타입 TypeScript (strict 모드)
- ✅ 외부 런타임 의존성 없음
- ✅ VS Code API 네이티브 통합
- ✅ 포괄적인 Git 데이터 분석
- ✅ 게임화 시스템으로 사용자 참여 증대
- ✅ 다중 형식 내보내기
- ✅ 테마 인식 UI/리포트
- ✅ 70+ 언어 지원

### 아키텍처 품질
- ✅ 관심사의 분리 (분석기, 대시보드, 리포트 생성기)
- ✅ Command 패턴 확장성
- ✅ 설정 기반 동작
- ✅ 친절한 에러 처리
- ✅ Windows 특화 문제 해결

### 성능 최적화
- ✅ 5분 캐싱 (git 작업 중복 감소)
- ✅ 설정 가능한 분석 기간 (1-365일)
- ✅ 비동기 명령어 실행
- ✅ 지연 Webview 생성/재사용

---

## 📝 버전 히스토리

| 버전 | 날짜 | 주요 내용 |
|------|------|----------|
| 0.0.8 | 2025-08-18 | 배지 시스템 추가 |
| 0.0.7 | 2025-07-30 | 문서 개선 |
| 0.0.6 | 2025-07-30 | 테마 시스템 & 70+ 언어 지원 |
| 0.0.5 | 2025-07-29 | README 업데이트 |
| 0.0.4 | 2025-07-28 | README 개선 |
| 0.0.3 | 2025-07-28 | 다중 형식 내보내기 |

---

## 🎨 디자인 패턴

1. **Singleton 패턴**
   - GitAnalyzer, DashboardProvider, ReportGenerator

2. **Command 패턴**
   - VS Code 명령어 등록 및 실행

3. **Observer 패턴**
   - Webview 메시지 리스닝

4. **Strategy 패턴**
   - 다양한 리포트 생성 전략 (HTML, JSON, CSV, Markdown)

5. **Factory 패턴**
   - 리포트 생성기에서 형식별 생성

---

## 💡 핵심 알고리즘

### 시간대 분석
```typescript
// 시간별 활동 계산
hourlyActivity: 24시간 배열 (0-23)
  └─ 각 시간대 커밋 수 집계

// 주중/주말 분석
weeklyActivity: 7일 배열 (월-일)
  └─ 각 요일별 커밋 수 집계

// 야간 커밋 정의
nightCommits: 22:00-06:00 범위의 커밋
  └─ 개발자의 야행성 지수 추정

// 업무 시간대 탐지
findMostActiveWorkingHours(): 연속 8시간 윈도우
  └─ 최고 커밋이 집중된 시간대 찾기
```

### 배지 평가
```typescript
// 연속 커밋 스트릭
checkCommitStreak(days: number)
  └─ 연속 N일 커밋 여부 확인

// 평균 계산
calculateAverageCommitsPerDay()
  └─ (총 커밋 수) / (커밋한 날의 수)

// 언어 다양성
countUniqueLanguages()
  └─ 파일 타입 분류에서 고유 언어 개수
```

---

## 📦 의존성 분석

### 외부 의존성
- **VS Code API** - 메인 프레임워크
- **Node.js 내장 모듈**
  - `child_process` - Git 명령어 실행
  - `util` - Promise 유틸리티
  - `path` - 파일 경로 조작
  - `fs` - 파일 시스템 작업

### 개발 의존성
- `@vscode/test-cli`
- `@vscode/test-electron`
- `@types/mocha`
- `@vscode/vsce`
- `eslint`
- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`
- `typescript`

---

## 🚀 확장 포인트

1. **새로운 배지 추가**
   - `badgeSystem.ts`에 배지 정의 추가

2. **새로운 리포트 형식**
   - `reportGenerator.ts`에 생성 메서드 추가

3. **새로운 메트릭**
   - `gitAnalyzer.ts`에 계산 로직 추가

4. **새로운 설정**
   - `package.json`의 `configuration` 섹션 확장

5. **새로운 명령어**
   - `extension.ts`에 명령어 등록

---

## 📚 핵심 인터페이스

### CommitData
```typescript
{
  hash: string;          // 커밋 해시
  author: string;        // 작성자 이름
  date: Date;           // 커밋 시간
  message: string;       // 커밋 메시지
  files: string[];       // 변경된 파일들
  insertions?: number;   // 추가 라인 수
  deletions?: number;    // 삭제 라인 수
}
```

### MetricsData
```typescript
{
  totalCommits: number;
  totalAuthors: number;
  dateRange: { start: Date; end: Date };
  authorStats: AuthorStats[];
  fileStats: FileStats[];
  fileTypeStats: FileTypeStats[];
  timeAnalysis: TimeAnalysis;
  badges: BadgeInfo[];
}
```

### Badge Info
```typescript
{
  id: string;            // 배지 고유 ID
  name: string;          // 배지 이름
  category: string;      // 카테고리
  rarity: string;        // 레어도
  progress: number;      // 진행도 (0-100)
  unlocked: boolean;     // 획득 여부
  criterion: string;     // 평가 기준
}
```

---

## 🎓 학습 포인트

1. **VS Code 확장 개발**
   - Webview 생성 및 관리
   - 명령어 등록
   - 상태 바 항목
   - 설정 관리

2. **Child Process 관리**
   - Git 명령어 실행
   - 출력 파싱
   - 에러 처리

3. **HTML 동적 생성**
   - Chart.js 라이브러리 통합
   - 테마별 스타일 적용
   - 복잡한 마크업 생성

4. **파일 시스템 작업**
   - 다양한 형식 파일 쓰기
   - 경로 처리
   - 인코딩 관리

5. **타입 안전성**
   - 엄격한 TypeScript 설정
   - 복잡한 데이터 구조 정의
   - 제네릭 활용

---

## 📞 문의 및 피드백

- 이슈: https://github.com/jiwan8985/git-metrics-dashboard/issues
- 문서: README.md 참조
- 버전 히스토리: CHANGELOG.md 참조

---

**최종 업데이트:** 2025-11-24
