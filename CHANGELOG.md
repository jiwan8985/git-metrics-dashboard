# Changelog

All notable changes to the "Git Metrics Dashboard" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.7] - 2025-07-30
- **문서 개선**: README 및 CHANGELOG 수정
- **버그 개선**: 테마 변경 시 로딩 수정
  
## [0.0.6] - 2025-07-30

### 🎨 Major Improvements - 테마 & 언어 지원 대폭 개선
- **완전한 테마 통합**: 다크/라이트 테마 완벽 지원, 차트 툴팁 가독성 향상
- **70+ 언어 지원**: 기존 20+에서 70+ 언어로 확장 (250% 증가)
- **새로운 카테고리**: Functional, System, Infrastructure, Scientific, Legacy, Blockchain 등 추가
- **테마 적용 리포트**: HTML 리포트에 VS Code 테마 반영

### ✨ New Features
- **스마트 테마 감지**: VS Code 테마 자동 감지 및 실시간 적용
- **테마 전환 버튼**: 상태바에서 원클릭 테마 변경
- **확장된 파일 아이콘**: 70+ 언어별 직관적 이모지 아이콘

### 🔧 Technical Improvements
- **차트 시스템 재설계**: 테마별 최적화된 툴팁 색상
- **성능 최적화**: 대용량 프로젝트 분석 속도 20% 향상
- **코드 구조 개선**: 중복 제거 및 모듈화 강화

### ⚙️ New Settings
- `gitMetrics.export.useThemeInReports`: 리포트에 테마 적용 여부

### 🐛 Bug Fixes
- 다크 테마에서 차트 텍스트 가독성 문제 해결
- 언어 분류 오류 수정
- 테마 전환 시 깜빡임 현상 제거

## [0.0.5] - 2025-07-29

### ✨ Added - README 업데이트
- **문서 개선**: 사용법 및 설정 옵션 상세화
- **스크린샷 추가**: 기능별 시각적 가이드 제공
  
## [0.0.4] - 2025-07-28

### ✨ Added - README 수정
- **README Update**

## [0.0.3] - 2025-07-28

### ✨ Added - 리포트 내보내기 기능
- **다양한 형식 지원**: HTML, JSON, CSV, Markdown 형식으로 리포트 내보내기
- **빠른 내보내기**: 상태바의 "📄 Export" 버튼으로 원클릭 내보내기
- **사용자 정의 리포트**: 분석 기간, 포함 섹션, 형식을 자유롭게 선택
- **프로페셔널 HTML 리포트**: 회사 보고서나 프레젠테이션에 적합한 고품질 HTML 리포트
- **데이터 친화적 형식**: JSON/CSV 형식으로 추가 분석 도구와 연동 가능
- **마크다운 문서**: GitHub README나 프로젝트 문서화에 바로 사용 가능

### 🎨 Improved - 사용자 경험 개선
- **향상된 대시보드 UI**: 리포트 내보내기 버튼이 대시보드에 통합
- **키보드 단축키**: `Ctrl+Shift+G` → `Ctrl+Shift+E`로 빠른 내보내기
- **컨텍스트 메뉴**: 탐색기에서 우클릭으로 바로 접근 가능
- **개선된 차트 상호작용**: 툴팁과 애니메이션 품질 향상
- **에러 처리 강화**: 더 친화적인 오류 메시지와 해결 방법 제공

### 🔧 Technical Improvements
- **모듈화된 아키텍처**: ReportGenerator 클래스로 깔끔한 코드 분리
- **타입 안전성**: TypeScript 타입 정의 강화
- **성능 최적화**: 메모리 사용량 최적화 및 렌더링 성능 개선
- **설정 옵션 확장**: 내보내기 관련 세부 설정 추가

### 📋 New Commands
- `gitMetrics.quickExport`: 빠른 리포트 내보내기
- `gitMetrics.customExport`: 사용자 정의 리포트 내보내기  
- `gitMetrics.openReportsFolder`: 리포트 폴더 열기

### ⚙️ New Settings
- `gitMetrics.export.defaultFormat`: 기본 내보내기 형식 설정
- `gitMetrics.export.includeSummary`: 요약 통계 포함 여부
- `gitMetrics.export.includeAuthorStats`: 개발자별 통계 포함 여부
- `gitMetrics.export.includeFileStats`: 파일 타입별 분석 포함 여부
- `gitMetrics.export.includeTimeAnalysis`: 시간대별 분석 포함 여부
- `gitMetrics.export.autoOpenAfterExport`: 내보내기 후 자동 파일 열기
- `gitMetrics.export.customReportsPath`: 사용자 정의 리포트 저장 경로

### 🗂️ File Structure
```
git-metrics-reports/
├── git-metrics-report-2025-01-15-30days.html
├── git-metrics-report-2025-01-15-30days.json
├── git-metrics-report-2025-01-15-30days.csv
└── git-metrics-report-2025-01-15-30days.md
```

## [0.0.2] - 2025-07-25

### ✨ Added - 기본 대시보드 기능
- **실시간 Git 통계**: 커밋 수, 파일 변경, 개발자별 기여도
- **시각적 차트**: Chart.js를 활용한 인터랙티브 차트
- **개발자별 분석**: 순위, 기여도, 활동 패턴 분석
- **파일 타입별 분석**: 프로그래밍 언어별 통계
- **시간대별 분석**: 시간별, 요일별 활동 패턴

### 🎨 UI/UX
- **VS Code 테마 통합**: 다크/라이트 테마 자동 적용
- **반응형 디자인**: 다양한 화면 크기 지원
- **인터랙티브 차트**: 호버 효과 및 애니메이션
- **상태바 통합**: 빠른 접근을 위한 상태바 버튼

### ⚙️ Settings
- `gitMetrics.defaultPeriod`: 기본 분석 기간 설정
- `gitMetrics.autoRefresh`: 자동 새로고침 설정
- `gitMetrics.showAuthorStats`: 작성자별 통계 표시 여부
- `gitMetrics.maxTopFiles`: 상위 파일 표시 개수

## [Unreleased] - 향후 계획

### 🚀 Planned Features
- **팀 대시보드**: 여러 저장소 통합 분석
- **성능 메트릭**: 코드 품질 및 복잡도 분석
- **자동 리포팅**: 정기적인 리포트 자동 생성
- **GitHub 통합**: GitHub API 연동
- **실시간 알림**: 중요한 메트릭 변화 알림
- **커스텀 대시보드**: 사용자 정의 위젯 시스템

### 🔧 Technical Roadmap
- **데이터베이스 지원**: 장기 통계 저장
- **API 서버**: 웹 대시보드 지원
- **플러그인 시스템**: 확장 가능한 아키텍처
- **다국어 지원**: 영어, 일본어 등 추가 언어

---

## 버전 관리 정책

### 버전 번호 규칙
- **Major (X.0.0)**: 주요 기능 추가, Breaking Changes
- **Minor (0.X.0)**: 새로운 기능 추가, 하위 호환성 유지  
- **Patch (0.0.X)**: 버그 수정, 성능 개선

### 릴리즈 주기
- **Major**: 연 1-2회
- **Minor**: 월 1-2회
- **Patch**: 필요시 수시

### 지원 정책
- **최신 버전**: 전체 지원
- **이전 Major 버전**: 보안 업데이트만
- **VS Code 호환성**: 최신 버전 기준 1년간 지원

---

## 기여 가이드

### 버그 리포트
1. [GitHub Issues](https://github.com/jiwan8985/git-metrics-dashboard/issues)에서 중복 확인
2. 재현 가능한 단계 포함
3. VS Code 버전, OS 정보 명시
4. 스크린샷 또는 로그 첨부

### 기능 제안
1. GitHub Issues에 "enhancement" 라벨로 등록
2. 사용 사례와 예상 효과 설명
3. 비슷한 기능을 제공하는 도구 조사 결과

### 풀 리퀘스트
1. Fork & Branch 생성
2. 테스트 케이스 추가
3. 문서 업데이트
4. 코드 스타일 준수 (`npm run lint`)

---

**전체 변경사항**: [GitHub Releases](https://github.com/jiwan8985/git-metrics-dashboard/releases)