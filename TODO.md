# Git Metrics Dashboard — 설치 수 증가 로드맵

최종 업데이트: 2026-05-02
기준 버전: 0.2.9
현재 총 설치 수: 553 (VS Code + Marketplace 합산)

> 설치 수 = **노출** × **전환율** × **바이럴**
> 모든 항목은 이 세 가지 중 하나에 직접 연결된다.

---

## 현재 상황

- Total Acquisition: 553 (VS Code 설치 + Marketplace 웹 설치 합산)
- VS Code Extensions 탭에서 보이는 다운로드 수 = 두 채널 합산 전체
- 현재 Marketplace 웹 설치 비중이 더 높음 → VS Code 검색 최적화 여지 있음
- 문제: 낮은 설치 수 → 검색 하위 노출 → 설치 더 적음 → 악순환

통계 확인: https://marketplace.visualstudio.com/manage/publishers/jiwan-dev/extensions/git-metrics-dashboard/hub?_a=acquisition

---

## 설치 수 증가 공식

```
설치 수
  ├── 노출 (얼마나 많이 발견되는가)
  │     ├── VS Code Extensions 탭 검색 순위
  │     ├── 카테고리/Featured 노출
  │     └── 바이럴로 인한 간접 유입
  │
  ├── 전환율 (발견 후 설치로 이어지는가)
  │     ├── 아이콘 + displayName 첫인상
  │     ├── description 설치 동기 부여
  │     ├── 별점/리뷰 신뢰도
  │     ├── README 첫 화면 (스크린샷, 핵심 가치)
  │     └── 설치 후 즉시 가치 (Walkthrough, 첫 실행)
  │
  └── 바이럴 (1명 설치 → N명 설치)
        ├── 팀 전파 (.vscode/extensions.json)
        ├── 리포트/배지 공유
        ├── PR Summary 복사 → 팀이 보고 설치
        ├── 스트릭/배지 달성 → 소셜 공유
        └── Git Wrapped → 매년 SNS 공유
```

---

## P0 — 즉시 실행 (이번 주)

### VS Code 검색 노출 최적화

- [ ] VS Code Extensions 탭에서 핵심 검색어별 현재 순위 기록 (baseline)
- [x] `package.json` description 재작성 — 검색어 포함 + 설치 동기
- [x] `package.json` keywords 재정렬 — 설치 의도 높은 검색어 앞쪽
- [x] `categories` 재검토 — SCM Providers 제거, `["Visualization", "Other"]`
- [ ] `displayName` 재검토: `Git Health & Metrics Dashboard` 후보 (기존 인지도 우선)

### 마켓플레이스 전환율 개선

- [ ] 아이콘 — 작은 검색 카드에서 구분되는지 확인
- [ ] 스크린샷 교체 — 실제 데이터 기반 고화질 (대시보드, 헬스 스코어, 리포트)
- [ ] 데모 GIF 제작 (15-30초) — 설치 → 대시보드 → 헬스 스코어 → 리포트 내보내기
- [x] README 최상단 재작성 — `No login. No cloud upload. Local-first.` trust copy
- [ ] CHANGELOG 최신화 — 살아있는 프로젝트처럼 보이게

### 별점/리뷰 확보 (전환율 직결)

- [x] 리뷰 프롬프트 — export/badge copy 3회 성공 후 트리거
- [x] 리뷰 프롬프트 cooldown (30일 snooze / 다시 보지 않기)
- [ ] 낮은 별점 방지 — 오류/빈 상태 UX 보강 ✅ (generateErrorHTML 구현)

### 릴리스 주기 (freshness 신호)

- [ ] 2-3주마다 릴리스 유지 — VS Code 검색 "최근 업데이트" 신호
- [x] v0.2.6 ~ v0.2.8 빠른 연속 릴리스 완료

---

## P1 — 리텐션 + 첫 실행 경험 (구현 완료 + 잔여)

### 첫 실행 aha moment

- [x] `contributes.walkthroughs` 4단계 온보딩 등록
- [x] 분석 진행 상태 표시 (`vscode.window.withProgress`)
- [x] 빈 저장소 / Git 없는 폴더 전용 empty state + 진단 가이드
- [ ] 첫 실행 quick actions (1회만 노출) — Copy README Badge / Export Report / Open Refactor Radar
- [x] `onStartupFinished` activation → 상태바 스트릭 즉시 표시 (**구현 필요**)

### 상태바 강화 (항상 보이는 동기 루프)

- [x] Health score 상태바 (`$(pass) Git: 87/100`)
- [x] Export 버튼 상태바
- [x] **스트릭 카운터 상태바** — `🔥 12일` 항상 표시 → 동료가 보고 궁금해함
- [ ] **오늘 커밋 수 상태바** — `📝 3 today` (**구현 필요**)

### 팀 전파

- [x] 대시보드 "🤝 Share with Team" 버튼 + `gitMetrics.shareWithTeam`
- [x] README "팀에 설치하기" 섹션
- [x] Walkthrough step 4 팀 공유

### 리포트/배지 공유 바이럴

- [x] HTML report Marketplace CTA footer
- [x] Markdown report shields.io 배지 footer
- [x] Copy Brief attribution footer
- [ ] README badge 다른 저장소 삽입 → 바이럴

---

## P2 — 기능으로 설치 수 늘리기 (구현 완료 + 잔여)

### PR Readiness (팀 내 확산)

- [x] PR readiness score (0-100) + 크기 라벨 (S/M/L/XL)
- [x] PR 크기 경고 + high-churn files 리스크
- [x] Copy PR Summary / Copy PR Description (Markdown)
- [ ] **Changed files 실제 목록** — `git diff --name-only` → 변경 파일별 리스크 랭킹 (**구현 필요**)
- [ ] Suggested reviewers from file ownership (파일 기여자 기반)

### Weekly/Monthly Engineering Brief

- [x] Weekly Engineering Brief 생성 + 복사 버튼
- [ ] **Monthly/Quarterly Brief** — 월간/분기 요약 (**구현 필요**)
- [ ] Manager-safe report mode

### 배지 시스템 강화 (게임화 → 리텐션 + 바이럴)

현재 17개 배지. 목표: 30개+

- [x] 기존 17개 배지 (Streak 3종, Quality 3종, Collaborator 2종, Time Warrior 3종, Milestone 4종, Consistency 2종)
- [x] **새 배지 추가** (v0.2.9 배포됨, 17→29개):
  - `doc_writer` — 문서 커밋 20% 이상 (UNCOMMON)
  - `test_champion` — 테스트 파일 변경 15% 이상 (RARE)
  - `refactor_hero` — 삭제 라인이 추가 라인보다 많은 커밋 30% 이상 (RARE)
  - `branch_cleaner` — stale branch 3개 이하 유지 (UNCOMMON)
  - `speed_demon` — 커밋 평균 간격 4시간 이내 (UNCOMMON)
  - `first_blood` — 하루 첫 커밋자 (COMMON)
  - `hot_streak_14` — 14일 연속 커밋 (UNCOMMON)
  - `hot_streak_50` — 50일 연속 커밋 (LEGENDARY)
  - `code_reviewer` — 다수 파일 짧은 커밋 패턴 (RARE)
  - `midnight_coder` — 자정 이후 커밋 10% 이상 (UNCOMMON)
  - `release_maker` — main/master 브랜치 커밋 20개 이상 (RARE)
  - `mono_focus` — 단일 파일 타입 80% 이상 집중 (COMMON)
- [x] **배지 달성 시 VS Code 토스트 알림 + 공유 옵션**
  - "🏆 새 배지 달성: Commit Legend! 팀에 공유하시겠어요?"
  - 공유 클릭 → 트위터/클립보드로 배지 텍스트 복사

### 소셜 공유 / 바이럴

- [x] Share Score (Twitter pre-filled tweet)
- [ ] **배지 달성 시 소셜 공유 버튼** (배지 토스트 연동)
- [x] **Git Wrapped** — 대시보드 🎁 Git Wrapped 버튼으로 하이라이트 카드 복사
  - 선택 기간의 하이라이트 카드 (커밋, 스트릭, 배지, 최고 기여일)
  - Copy Wrapped Card → Slack/Twitter 바이럴
- [x] **Copy Streak Card** — 대시보드 🔥 Streak Card 버튼으로 스트릭 공유 텍스트 복사
  - "🔥 42-day commit streak on [project]! Tracked with Git Metrics Dashboard"
- [ ] 주간 Git Wrapped — "지난 주 커밋 42개, 최장 스트릭 7일!" + 공유

### 다중 저장소 지원

- [ ] 워크스페이스 내 모든 Git repo 자동 감지
- [ ] 저장소별 탭 네비게이션
- [ ] 전체 health score 비교 대시보드
- [ ] monorepo package-level analysis

---

## P3 — 중장기 기능 확장

### 스트릭 & 동기 시스템

- [x] **스트릭 카운터 상태바** (항상 표시)
- [x] **스트릭 마일스톤 알림** — 7일/14일/30일/50일/100일 달성 시 축하 토스트
- [ ] **Daily first commit 축하** — 오늘 첫 커밋 감지 시 "🎉 오늘의 첫 커밋!" 토스트
- [ ] 일일 커밋 목표 설정 (`gitMetrics.dailyGoal`)
- [ ] 스트릭 복구 알림 ("어제 커밋을 빠뜨렸습니다. 오늘 커밋하면 스트릭 재시작!")

### 헬스 스코어 이력 관리

- [ ] **Health score history** — 최근 30개 점수를 globalState에 저장 (**구현 필요**)
- [ ] **Trend indicator in status bar** — `↑87` (상승) / `↓72` (하락)
- [ ] Health score trend mini-chart in dashboard
- [ ] "지난번보다 +5점 향상!" 알림

### 커밋 품질 심층 분석

- [ ] **Changed files 실제 목록** (`git diff --name-only baseBranch...HEAD`)
- [ ] 커밋 메시지 품질 점수 (길이, 특수문자, 의미 없는 패턴 감지)
- [ ] "chore: fix" 같은 저품질 메시지 패턴 경고
- [ ] Commit size distribution histogram

### AI 기능 (차별화 → 검색 노출 증가)

- [ ] Optional AI provider (OpenAI / Anthropic / Ollama)
- [ ] BYOK — VS Code SecretStorage에 API key 저장
- [ ] 기본값: AI 비활성화, No-AI 모드 완전 지원
- [ ] AI PR summary 생성
- [ ] AI weekly brief
- [ ] AI 커밋 메시지 품질 분석 + 개선 제안
- [ ] AI refactor risk 설명
- [ ] AI 전송 전 미리보기/redaction

### GitHub/GitLab 연동

- [ ] GitHub PAT 연동 — PR 메트릭, Issue 통계, Actions 상태
- [ ] GitLab token 연동 — MR, 파이프라인
- [ ] Slack webhook — 주간 리포트 자동 전송
- [ ] Microsoft Teams webhook

### 리포트 포맷 확장

- [ ] PDF 리포트 (puppeteer)
- [ ] Excel (.xlsx) 리포트 (ExcelJS)
- [ ] PowerPoint (.pptx) — 경영진 발표용

### 플랫폼 확장

- [ ] Web Extension 지원 (vscode.dev, github.dev)
- [ ] Cursor IDE 호환성 검증
- [ ] GitHub Codespaces 최적화

---

## P4 — 코드 품질 / 운영

### 리팩터링

- [ ] `dashboardProvider.ts` 분할 (현재 3,100+ 줄)
- [ ] `reportGenerator.ts` 분할 (현재 2,230+ 줄)
- [ ] `gitAnalyzer.ts` 분할 (현재 1,150줄)

### 성능

- [ ] 대용량 저장소 스트리밍 파싱 (커밋 10,000+)
- [ ] Worker Thread 오프로드 (분석 중 UI 블로킹 제거)
- [ ] 캐시 전략 개선 (브랜치/기간별 세분화)

### 테스트/CI

- [ ] GitHub Actions — lint + compile + test
- [ ] 테스트 커버리지 50%+ (dashboardDataFormatter, repositoryIntelligence 추가)
- [ ] Marketplace 자동 배포 (git tag 시)

---

## KPI

| 기간 | 설치 수 | 별점 | 핵심 달성 |
|------|---------|------|----------|
| 현재 (0.2.9) | 553 | — | P0~P3 주요 기능 구현 완료 |
| 1개월 | 1,000+ | 4.0+ | 스트릭 상태바, 배지 토스트, Git Wrapped |
| 3개월 | 3,000+ | 4.3+ | AI 기능 옵션, GitHub 연동, 다중 저장소 |
| 6개월 | 10,000+ | 4.5+ | 전체 바이럴 루프 완성 |
| 12개월 | 50,000+ | 4.7+ | 팀/조직 단위 확산, 외부 연동 |

---

## 실험 로그

| 날짜 | 버전 | 변경 내용 | 7일 후 설치 수 | 판단 |
|------|------|----------|--------------|------|
| 2026-05-01 | 0.2.5 | baseline | — | 검색 최적화 시작 |
| 2026-05-01 | 0.2.6 | keywords/description/categories/review prompt | — | — |
| 2026-05-01 | 0.2.7 | Walkthrough, Share with Team, Empty State, Copy Brief 귀속 | — | — |
| 2026-05-02 | 0.2.8 | PR Readiness, Weekly Brief, Share Score | — | — |

---

## 하지 말아야 할 것

- 설치 수가 낮은 상태에서 계정 가입/클라우드 동기화를 먼저 만들지 않는다.
- 첫 실행 경험을 방치한 채 기능만 붙이지 않는다.
- 릴리스 없이 3주 이상 방치하지 않는다.
- contributor ranking을 사람 평가 도구처럼 보이게 만들지 않는다.
- AI 기능은 기본 비활성화, BYOK, 전송 전 미리보기 없이는 넣지 않는다.
- Slack/Teams 자동 전송은 민감 정보 경고 없이는 출시하지 않는다.
- GitHub/GitLab token은 최소 권한 문서화 없이는 출시하지 않는다.

---

**다음 검토:** 2026-05-15
