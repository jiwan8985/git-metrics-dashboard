# Git Metrics Dashboard

**Git 히스토리를 리포지토리 헬스 스코어로** — 리스크 감지, 리팩터 레이더, 기여자 분석, 팀 리포트 내보내기. 로그인 불필요. 클라우드 업로드 없음. 로컬 퍼스트.

[![VS Code에서 설치](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:extension/jiwan-dev.git-metrics-dashboard)
![Version](https://img.shields.io/badge/version-0.2.11-blue.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-1.85.0+-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Languages](https://img.shields.io/badge/UI%20languages-4-brightgreen.svg)

[English](./README.md) | **한국어** | [日本語](./README.ja.md) | [简体中文](./README.zh-CN.md)

---

## ✨ 주요 기능

### 📈 대시보드 분석
- **🧠 리포지토리 커맨드 센터** *(v0.2.4)* — 모멘텀, 체인, 커밋 품질, 협업, 브랜치 위생을 기반으로 한 종합 헬스 스코어
- **🌿 브랜치 범위 분석** *(v0.2.4)* — 특정 브랜치를 선택해 헬스, 체인, 기여자, 리포트를 재계산
- **🔀 베이스 브랜치 비교** *(v0.2.4)* — `main`, `master`, `develop` 대비 ahead/behind 커밋 및 PR 규모 diff 통계
- **🎯 추천 다음 액션** *(v0.2.4)* — 실제 리포지토리 신호를 기반으로 생성된 우선순위 행동 제안
- **🔥 리팩터 레이더** *(v0.2.4)* — 체인, 커밋 빈도, 변경량을 결합한 고위험 파일 강조
- **📋 브리프 복사** *(v0.2.4)* — 스탠드업용 헬스 요약 + 다음 액션 + 리팩터 후보 클립보드 복사
- **📅 커밋 캘린더 히트맵** *(v0.2.3)* — GitHub 스타일 16주 활동 그리드 (5단계 색상 강도)
- **🏆 Top 3 기여자 포디엄** *(v0.2.3)* — 금/은/동 포디엄
- **📋 요약 복사** *(v0.2.3)* — 포맷된 통계 요약 원클릭 복사
- **커밋 스트릭** — 현재/최장 연속 커밋 일수 + 활동률
- **주간 트렌드** — 기간 전반부/후반부 커밋량 비교 (▲▼ 지표)
- **컨벤셔널 커밋 분석** — feat/fix/chore/docs 등 준수율 + 도넛 차트
- **브랜치 현황** — 현재 브랜치, 전체/활성 브랜치 수
- **실시간 Git 통계** — 총 커밋 수, 파일 변경, 기여자 메트릭
- **실시간 변경 감지** — 커밋, 브랜치 전환, 파일 스테이징 시 자동 새로고침
- **인터랙티브 차트** — Chart.js 시각화
- **기여자 순위** — 저자별 기여 메트릭 및 활동 패턴
- **파일 타입 분석** — 70개 이상 프로그래밍 언어 지원
- **시간 기반 분석** — 시간대별/요일별 활동 히트맵
- **달성 배지** — 5단계 희귀도, 34개 배지 게임화 시스템
- **스마트 테마** — 다크/라이트/자동 테마 전환
- **세련된 반응형 UI** — 현대적 커맨드 센터, 인사이트 카드, 빠른 탐색

### 📄 리포트 내보내기
- **4가지 포맷**: HTML, JSON, CSV, Markdown
- **4가지 템플릿 프리셋**: Full / Executive / PR / Developer
- **커맨드 센터 리포트**: 헬스 스코어, 리스크 신호, 다음 액션, 리팩터 후보 포함
- **브랜치 인식 리포트**: 선택한 브랜치를 기준으로 내보내기
- **테마 통합**: VS Code 테마가 HTML 리포트에 자동 적용
- **커스터마이즈**: 기간, 포맷, 포함 섹션 선택 가능
- **배지 통합**: 달성 배지 리포트 포함
- **전문가 품질**: 팀 프레젠테이션 및 문서화에 적합

### 🆕 릴리즈 노트 생성기 *(v0.2.10)*
- `Git Metrics: Generate Release Notes` 커맨드로 마지막 태그 이후 커밋을 Conventional Commit 타입별로 자동 그룹핑
- 클립보드 복사 또는 `RELEASE_NOTES.md`로 저장

---

## 🚀 설치

**가장 빠른 방법 — VS Code에서 바로 열기:**

[![VS Code에서 설치](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:extension/jiwan-dev.git-metrics-dashboard)

또는 수동 설치:
1. VS Code 열기 → `Ctrl+Shift+X`
2. **"Git Metrics Dashboard"** 검색
3. **설치** 클릭
4. 워크스페이스에 Git 리포지토리 열기

---

## 📋 사용법

### 대시보드 열기
| 방법 | 동작 |
|------|------|
| 상태바 | `📊 Git Stats` 버튼 클릭 |
| 커맨드 팔레트 | `Ctrl+Shift+P` → **Git Metrics: Open Dashboard** |
| 키보드 단축키 | `Ctrl+Shift+G` → `Ctrl+Shift+D` (Win/Linux) / `Cmd+Shift+G` → `Cmd+Shift+D` (Mac) |

### 리포트 내보내기
| 방법 | 동작 |
|------|------|
| 빠른 내보내기 | `Ctrl+Shift+G` → `Ctrl+Shift+E` |
| 사용자 정의 내보내기 | 커맨드 팔레트 → **Git Metrics: Custom Export Report** |
| 대시보드 버튼 | 대시보드 내 **📄 Export Report** 클릭 |

### 테마 전환
- 상태바 테마 버튼: 🔄 자동 / ☀️ 라이트 / 🌙 다크
- 키보드: `Ctrl+Shift+G` → `Ctrl+Shift+T`

---

## 📊 리포트 포맷

| 포맷 | 최적 용도 |
|------|----------|
| **HTML** | 브라우저 인터랙티브 뷰, 팀 프레젠테이션, 인쇄용 |
| **JSON** | 프로그래밍 처리, API 연동, 자동화 |
| **CSV** | Excel / Google Sheets 분석, 통계 도구 |
| **Markdown** | GitHub README 삽입, 프로젝트 문서 |

리포트는 기본적으로 `<워크스페이스>/git-metrics-reports/`에 저장됩니다 (설정 변경 가능).

---

## ⚙️ 설정

```json
{
  "gitMetrics.defaultPeriod": 30,
  "gitMetrics.maxTopFiles": 10,
  "gitMetrics.theme": "auto",
  "gitMetrics.language": "auto",
  "gitMetrics.autoRefresh": false,
  "gitMetrics.autoRefreshInterval": 5000,
  "gitMetrics.showChangeNotification": false,
  "gitMetrics.export.defaultFormat": "html",
  "gitMetrics.export.useThemeInReports": true,
  "gitMetrics.export.autoOpenAfterExport": false,
  "gitMetrics.export.customReportsPath": ""
}
```

| 설정 | 기본값 | 설명 |
|------|--------|------|
| `defaultPeriod` | `30` | 분석 기간 (일, 1–365) |
| `theme` | `"auto"` | 대시보드 테마: `auto` / `light` / `dark` |
| `language` | `"auto"` | UI 언어: `auto` / `en` / `ko` / `ja` / `zh-CN` |
| `autoRefresh` | `false` | Git 변경 시 자동 새로고침 |
| `autoRefreshInterval` | `5000` | 변경 감지 간격 (ms) |

---

## 🎯 사용 사례

**팀 리더 / 매니저**
- 스탠드업 또는 리뷰 전 즉시 리포지토리 헬스 스코어 확인
- Git 로그를 직접 읽지 않고 납기, 소유권, 브랜치 위생 리스크 파악
- 기여자별 메트릭 및 속도 분석
- 월간/분기 리포트 생성

**개발자 개인**
- 리팩터 레이더에서 리팩터링 후보 파악
- 추천 다음 액션으로 다음 클린업 결정
- 개인 코딩 활동 및 스트릭 추적
- 기술 스택 사용 현황 분석

**프로젝트 관리**
- Git 활동을 명확한 헬스/리스크 신호로 변환
- 코드베이스 건강 개요
- 기술 부채 핫스팟 식별

---

## 👥 팀에 설치하기

`.vscode/extensions.json`에 추가하면 팀원이 프로젝트를 열 때 자동으로 설치 권유를 받습니다.

```json
{
  "recommendations": ["jiwan-dev.git-metrics-dashboard"]
}
```

커밋 & 푸시하면 완료. 또는 대시보드 내 **🤝 Share with Team**을 클릭해 스니펫을 복사하세요.

---

## 🔧 커맨드

| 커맨드 | 단축키 | 설명 |
|--------|--------|------|
| `gitMetrics.showDashboard` | `Ctrl+Shift+G D` | 분석 대시보드 열기 |
| `gitMetrics.quickExport` | `Ctrl+Shift+G E` | 빠른 내보내기 |
| `gitMetrics.customExport` | — | 커스텀 내보내기 |
| `gitMetrics.generateReleaseNotes` | — | 릴리즈 노트 생성 |
| `gitMetrics.toggleTheme` | `Ctrl+Shift+G T` | 테마 전환 |
| `gitMetrics.openReportsFolder` | — | 리포트 폴더 열기 |
| `gitMetrics.changeLanguage` | — | UI 언어 변경 |

---

## 🛠️ 문제 해결

**사이드바에 "There is no data provider" 표시 또는 커맨드 없음**
1. VS Code 1.85.0 이상인지 확인
2. 커맨드 팔레트에서 `Developer: Reload Window` 실행
3. Git 리포지토리가 포함된 폴더를 열어주세요

**대시보드에 데이터 없음**
1. 워크스페이스에 Git 리포지토리가 있는지 확인 (`git status`)
2. 선택한 기간 내 커밋이 있는지 확인
3. `gitMetrics.defaultPeriod` 값을 늘려보세요

**리포트 내보내기 실패**
1. 워크스페이스 폴더 쓰기 권한 확인
2. `gitMetrics.export.customReportsPath`로 경로 직접 지정
3. 필요한 경우 관리자 권한으로 VS Code 재시작

---

## 📄 라이선스

MIT License — 자세한 내용은 [LICENSE](LICENSE)를 참조하세요.

---

⭐ 유용하다면 [GitHub에서 스타](https://github.com/jiwan8985/git-metrics-dashboard)를 눌러주시고 [VS Code 마켓플레이스에 리뷰](https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard)를 남겨주세요!

[![VS Code에서 설치](https://img.shields.io/badge/Install%20in-VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](vscode:extension/jiwan-dev.git-metrics-dashboard)
