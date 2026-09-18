# Marketplace 다운로드 증대를 위한 개선 로드맵

작성일: 2026-09-18 · 분석 대상: `git-metrics-dashboard` v0.3.0 (branch: `feature/develop`)
최종 갱신: 2026-09-18 (P0 + P1 + P2 + P4 구현 + 디자인/기능 추가 라운드 반영, 스크린샷 제외)

> **진행 현황 요약** — 스크린샷/GIF(P0-1, P1-2, P2-4)를 제외한 P0/P1/P2/P4 전 항목을 구현했습니다
> (사용자 지시로 스크린샷은 가장 마지막 단계로 미룸). 세부 내용은
> [8. 이번 세션에서 실제로 적용된 변경 사항](#8-이번-세션에서-실제로-적용된-변경-사항)과
> [9. P1 / P2 / P4 구현 내역](#9-p1--p2--p4-구현-내역-2번째-라운드-스크린샷-제외)을 참고하세요.
> **CI/CD는 이 프로젝트에서 사용하지 않기로 결정했습니다.** GitHub Actions 워크플로(`ci.yml`, `publish.yml`)는
> 삭제되었고, 아래 문서의 P3 CI 관련 항목(3, 4번)은 더 이상 유효하지 않습니다 — 참고용으로만 남겨두고 취소선 처리했습니다.
> P3의 나머지 항목(테스트 커버리지 상향, 이슈 템플릿/CONTRIBUTING.md)은 아직 미착수입니다.
>
> **2026-09-18 추가 업데이트** — 실제 설치 수가 89개로 확인됨. 이 단계에서는 기능 추가보다 스크린샷/GIF와
> 첫 리뷰 확보가 압도적으로 높은 우선순위라고 판단해 사용자에게 알렸고, 사용자는 "랭킹에 도움되는 작은 기능
> 추가"를 선택. [11. 랭킹 중심 소규모 기능 추가](#11-랭킹-중심-소규모-기능-추가-4번째-라운드) 참고.
> **스크린샷은 여전히 미착수 — 다음으로 가장 우선순위가 높은 작업입니다.**

이 문서는 현재 코드베이스, `package.json` 리스팅 메타데이터, README, CI/배포 파이프라인을 직접 읽고 확인한
사실을 근거로 작성되었습니다. 마켓플레이스 실제 설치 수/평점 등 라이브 통계는 이 세션에서 조회할 수 없으므로
포함하지 않았고, 대신 퍼블리셔 대시보드(marketplace.visualstudio.com/manage)에서 직접 확인할 항목으로 표시했습니다.

---

## 0. 왜 이 순서인가

VS Code Marketplace에서 다운로드가 늘어나는 경로는 사실상 두 단계뿐입니다.

1. **검색/리스팅에서 클릭을 받는다** — 키워드 매칭, 아이콘, 제목, 첫 줄 설명, 그리고 무엇보다 **스크린샷/GIF**.
2. **리스팅 페이지에서 설치로 전환시킨다** — README 첫 화면, 설치 난이도, "이게 내 문제를 푸는가"에 대한 확신.

기능 자체는 이미 상당히 풍부합니다(레포 헬스 스코어, 리팩터 레이더, PR readiness, 뱃지 시스템, 4개 언어 등).
**문제는 기능 부족이 아니라 "그 기능이 리스팅 페이지에서 전혀 보이지 않는다"는 것**입니다. 그래서 아래 우선순위는
"보이지 않는 것을 보이게 만드는 작업"을 최우선(P0)으로 두었습니다.

---

## 1. 확인된 사실 — 현재 상태 스냅샷

| 항목 | 상태 | 근거 |
|---|---|---|
| `images/` 폴더 내용물 | `icon.png`, `icon-sidebar.svg` **뿐** — 스크린샷/GIF 0개 | `images/` 디렉터리 조회 |
| README(4개 언어) 버전 배지 | 전부 `0.2.13`로 표기, 실제 `package.json` 버전은 `0.3.0` | README*.md 6행, package.json 5행 |
| `contributes.commands` (15개) vs README "Commands" 표 (8개) | `shareWithTeam`, `generateReleaseNotes`, `generateMonthlyBrief`, `conventionalCommit`, `copyReadmeBadge`, `windowsTroubleshoot` 등 최소 6개 커맨드가 README 표에 없음 | package.json 99–176행 vs README.md 180–190행 |
| CLAUDE.md의 "Registered commands" 목록 | 8개만 기재, 실제 15개 존재 | package.json vs CLAUDE.md |
| CI 워크플로 (`ci.yml`) | `compile → lint → test` 만 수행. `test:integration`, VSIX 패키징 검증, 번들 크기 체크 없음 | `.github/workflows/ci.yml` |
| Publish 워크플로 (`publish.yml`) | 태그 push 시 자동 배포하지만 **CHANGELOG.md 업데이트 여부, README 버전 배지 동기화를 검증하지 않음** | `.github/workflows/publish.yml` |
| `.vscodeignore`에 남아있는 죽은 참조 | `docs/MARKETPLACE_GROWTH_ROADMAP.md`, `docs/PHASE_0_BASELINE.md`, `scripts/phase0-baseline.cjs`, `scripts/phase0-capture.cjs`, `TODO.md`, `MARKETPLACE_STRATEGY.md`, `DEVELOPMENT_GUIDE.md`, `DEPLOYMENT_GUIDE.md`, `PHASE_1_COMPLETE.md`, `REFACTORING_SUMMARY.md` 등이 명시돼 있지만 **현재 저장소에 실물이 없음** | `.vscodeignore` vs 저장소 파일 트리 |
| `package.json`의 `baseline:phase0` 스크립트 | `scripts/phase0-baseline.cjs`를 실행하도록 되어 있으나 해당 파일이 존재하지 않음 → 실행 시 즉시 실패 | package.json 454행 |
| GitHub 저장소 위생 | 이슈 템플릿(`.github/ISSUE_TEMPLATE/`), `CONTRIBUTING.md` 없음 | `.github/` 트리 조회 |
| 테스트 커버리지 임계값 | branches/functions/lines/statements 모두 **25%** | jest.config.js (CLAUDE.md에도 명시) |
| 소스 규모 | `dashboardProvider.ts` 3,332줄, `reportGenerator.ts` 2,556줄 — webview HTML/JS/CSS가 문자열로 인라인됨 | `wc -l src/*.ts` |
| 개인정보/보안 문서 | `PRIVACY.md`, `SECURITY.md`, `SUPPORT.md` 존재, README에서 "Local-first, no login" 신뢰 카피 사용 중 | 루트 파일 목록, README 50–56행 |
| 과거 성장 전략 문서의 흔적 | git 로그상 `MARKETPLACE_STRATEGY.md`, `docs/MARKETPLACE_GROWTH_ROADMAP.md` 등이 한때 커밋되었다가 이후 삭제됨 (stash/워킹트리에 없음) | `git log --all -- docs/ scripts/ ...` |

> 마지막 항목은 과거에 이미 한 번 "마켓플레이스 성장 로드맵" 문서를 만들었다가 사라졌다는 뜻입니다.
> 이번 문서(`docs/marketplace-growth-improvements.md`)를 커밋해두고, 향후 정리 스크립트나 `.vscodeignore` 정돈 시
> 실수로 삭제되지 않도록 주의하는 게 좋습니다.

---

## 2. P0 — 즉시, 비용 대비 효과 최대 (1~3일 내 가능)

이 항목들은 **코드 변경 없이** 전환율에 가장 직접적인 영향을 줍니다.

1. **스크린샷 / GIF 최소 4~6장 추가** *(가장 중요)*
   - Marketplace 리스팅 카드와 상세 페이지는 README에 임베드된 이미지로 채워집니다. 현재 이미지가 전혀 없어
     검색 결과에서 "설치 전에 뭘 보여주는 앱인지" 알 수 없는 상태입니다.
   - 최소 세트: (1) Repository Command Center 헬스 스코어 화면, (2) 커밋 캘린더 히트맵 + 기여자 podium,
     (3) Refactor Radar / Recommended Next Moves, (4) HTML 리포트 export 결과, (5) 뱃지/업적 토스트,
     (6) 다크/라이트 테마 비교(반반 스크린샷).
   - 가능하면 상단 히어로 이미지 1개는 GIF로 — "Open Dashboard → Health Score 등장" 3~5초 루프가
     체감 전환율이 가장 높습니다.
   - `images/screenshots/` 디렉터리를 만들고 README 상단(현재 배지 바로 아래)에 삽입하세요.

2. **버전 배지 동기화** — README 4개 파일의 `0.2.13` → `0.3.0`으로 수정.
   - 재발 방지: `publish.yml`에 `grep` 기반 체크 스텝을 추가해 README 배지 버전과 `package.json` 버전이
     다르면 배포를 막도록 하거나, `scripts/`에 버전 동기화 스크립트를 두고 `vscode:prepublish`에서 실행.

3. **README "Commands" 표를 실제 15개 커맨드와 일치시키기**
   - `shareWithTeam`, `generateReleaseNotes`, `generateMonthlyBrief`, `conventionalCommit`,
     `copyReadmeBadge` 등은 실제로 구현된 성장 지렛대(바이럴 공유, 팀 온보딩)인데 README에 문서화가
     안 돼 사용자가 존재 자체를 모릅니다. 기능은 있는데 발견되지 않는 상태 — 가장 아까운 손실입니다.

4. **`description` 필드의 "왜 이게 다른가" 한 줄 보강 검토**
   - 현재: *"Turn your Git history into a repository health score with risk detection, refactor radar,
     contributor analytics, and exportable team reports."*
   - 이미 검색 최적화가 잘 되어 있는 편(CHANGELOG 0.2.6에 기록된 의도적 SEO 작업 확인됨)이므로 큰 변경은
     불필요. 다만 "GitLens/Git Graph와 뭐가 다른가"에 대한 차별점(health score, export, no-login)이 첫 문장에
     압축돼 있는지만 재확인.

5. **CLAUDE.md의 "Registered commands" 목록 갱신** — 개발 문서 자체가 stale하면 이후 기능 추가 시 마켓플레이스
   문서화 누락이 반복됩니다. 근본 원인 성격의 수정.

---

## 3. P1 — 리스팅 최적화 (1주 내)

1. **`.vscodeignore`의 죽은 참조 정리** — 존재하지 않는 6개 이상의 파일 경로를 리스트에서 제거하거나,
   해당 문서들을 실제로 복원해 `docs/`에 다시 둘지 결정. 지금 상태는 "문서가 있는 척하는 ignore 규칙"이라
   패키징 시 혼란의 원인이 됩니다.
2. **GIF/스크린샷을 위한 `docs:screenshot` 스크립트화** — `scripts/phase0-capture.cjs`가 참조만 남고 사라진
   것으로 보아 한 번 시도했던 자동 캡처 파이프라인이 있었을 가능성. VS Code 확장 스크린샷은 보통 수동 캡처가
   더 빠르므로, 자동화보다는 "스크린샷 촬영 체크리스트"(어떤 화면 6장, 어떤 리포지토리 데이터로) 문서화가 더
   실용적.
3. **Marketplace 카테고리/키워드 재검토**
   - 현재 `categories: ["Visualization", "Other"]`. `"Data Science"`는 범주가 다르지만, 경쟁 확장(GitLens 등)이
     걸어놓는 카테고리를 참고해 `"Notebooks"` 등 오탐 카테고리는 피하고 그대로 유지가 합리적.
   - 키워드 27개는 VS Code 권장 범위 내. 다만 `manager-report` 같은 낮은 검색량 키워드보다
     `git blame`, `code review`, `developer productivity` 같은 인접 고검색량 키워드 A/B 여지 있음 —
     퍼블리셔 대시보드에서 실제 검색 유입 키워드를 확인 후 조정 권장(라이브 데이터 필요, 이 세션에서 확인 불가).
4. **README 최상단 "30초 안에 무엇을 얻는가" 압축**
   - 현재 구조는 나쁘지 않지만 Key Features 섹션이 매우 길어(60줄+) 마켓플레이스 상세 패널의 접힘(fold) 안에
     스크린샷이 들어갈 자리가 없음. 배지 → 스크린샷/GIF → 3줄 요약 → Key Features 순으로 재배치 권장.
5. **평점/리뷰 유도 로직 강화**
   - CHANGELOG 0.2.6에 "리뷰 프롬프트 트리거를 3회 성공 후로 변경 + 30일 스누즈"가 이미 구현되어 있음(좋은 설계).
     추가로 **뱃지 언락 시점**(감정적으로 가장 긍정적인 순간)에 리뷰 유도를 한 번 더 붙이는 것을 검토 —
     현재는 export/badge copy 성공 기준만 사용 중인 것으로 보임(정확한 트리거는 `extension.ts` 리뷰 로직 확인 필요).

---

## 4. P2 — 발견성·바이럴 기능 강화 (2~3주)

기능 자체는 이미 바이럴 지향적으로 잘 설계되어 있습니다(Git Wrapped, Copy Streak Card, Share Score →
Twitter intent, Weekly Brief에 Marketplace attribution footer 삽입 등, CHANGELOG 0.2.7~0.2.9 확인).
이 레이어를 넓히는 방향이 새 기능을 처음부터 만드는 것보다 ROI가 높습니다.

1. **모든 "Copy" / "Export" 계열 출력물에 attribution footer 일관 적용 여부 점검**
   - Weekly Brief, Copy Brief에는 이미 적용됨(CHANGELOG 확인). PR Summary/PR Description, HTML 리포트,
     Streak Card 등 다른 export 경로에도 동일하게 적용되어 있는지 `reportGenerator.ts` / `dashboardProvider.ts`
     전수 점검 — 팀에 공유되는 산출물마다 설치 링크가 따라가는 것이 가장 저비용 획득 채널.
2. **`shareWithTeam` 커맨드의 노출 강화**
   - 기능은 이미 "1개 설치 → 팀 전체 설치"로 이어지는 가장 강력한 성장 루프인데 README Commands 표,
     Command Palette 메뉴, 온보딩 walkthrough에서의 강조가 부족(walkthrough에는 포함됨, README에는 누락 — P0-3과 연동).
3. **GitHub README 배지(`copyReadmeBadge` 커맨드로 생성)의 가시성**
   - 사용자가 자기 프로젝트 README에 "Analyzed with Git Metrics Dashboard" 배지를 붙이면 발견성 채널이 됨.
     이 커맨드의 존재와 사용법을 README/랜딩에 명시적으로 안내.
4. **Walkthrough 이미지 보강**
   - `walkthroughs/step-share.md` 하나를 4단계 모두에서 재사용 중(package.json 405/414/423/432행 전부 동일
     마크다운 참조). 단계별로 실제 해당 화면 스크린샷을 넣으면 온보딩 완료율이 올라감 — P0 스크린샷 작업과
     동일 리소스 재사용 가능.

---

## 5. P3 — 엔지니어링/배포 인프라 (지속적, 신뢰도 기반 성장)

다운로드 자체보다는 **평점 유지·이탈 방지**에 기여하는 항목. 낮은 평점 1~2개가 전환율을 크게 깎으므로 무시할
수 없습니다.

1. **테스트 커버리지 임계값 25% → 단계적 상향**
   - 현재 임계값 자체가 낮아 회귀를 못 잡을 위험. `gitAnalyzer.ts`(1,243줄), `dashboardProvider.ts`(3,332줄)처럼
     사용자 체감 버그가 바로 리뷰로 이어지는 핵심 모듈부터 커버리지를 올리는 게 효율적.
2. ~~**CI에 `test:integration` 및 VSIX 패키징 드라이런 추가**~~ — **취소.** GitHub Actions를 사용하지 않기로
   결정(사용자 지시)했으며 `.github/workflows/ci.yml`, `publish.yml`을 삭제했습니다. 패키징 검증은 로컬에서
   `npm run package`(vsce) 실행 시 수동으로 확인합니다.
3. ~~**`publish.yml`에 배포 전 체크리스트 자동화**~~ — **취소.** 같은 이유로 자동화 게이트 대신, README 버전
   배지와 `package.json` 버전을 수동 배포 전 눈으로 확인하는 절차를 유지합니다.
4. **GitHub 저장소 위생: 이슈 템플릿 + `CONTRIBUTING.md` 추가**
   - 현재 버그 리포트/기능 요청 템플릿이 없어 이슈 품질이 낮아지기 쉽고, 오픈소스 기여자 유입에도 불리.
5. **`.vscodeignore` 정리** (P1-1과 동일 항목, 배포 안정성 관점에서도 중요) — 죽은 경로는 실제 패키징에는
   해가 없지만(무시 대상이 애초에 없을 뿐) 팀/미래의 자신에게 "이 문서들이 어딘가 있어야 하는데?"라는 혼란을
   줌.

---

## 6. P4 — 웹뷰 UI/디자인 개선 (선택적, 기능 완성도 이후)

코드를 직접 실행해 시각적으로 검증하지는 않았으므로(웹뷰 렌더링 확인 필요), 아래는 구조상 확인 가능한
리스크 위주입니다. 실제 착수 전 `npm run compile` 후 Extension Development Host로 대시보드를 열어
라이트/다크 테마 양쪽에서 직접 확인 권장.

1. **`dashboardProvider.ts`(3,332줄)와 `dashboardStyles.ts`(298줄) 분리도 점검**
   - HTML/CSS/JS가 문자열 템플릿으로 인라인되어 있어 디자인 변경 시 회귀 위험이 큼. 스크린샷 촬영(P0) 과정에서
     레이아웃 깨짐/반응형 이슈를 함께 발견하고 고치는 것이 효율적 — 이번 스크린샷 작업을 "시각 QA 패스"로
     겸하는 것을 권장.
2. **모바일/좁은 패널 폭 대응 재검증**
   - README에 "mobile-friendly dashboard layout" 문구가 있으나, VS Code 웹뷰는 사이드바 폭에서도 열릴 수
     있으므로 좁은 폭(300~400px)에서의 차트/카드 레이아웃을 실제로 확인.
3. **아이콘 리소스**
   - `images/icon.png`(마켓플레이스 128×128), `icon-sidebar.svg`(액티비티바) 외에 별도 다크/라이트 사이드바
     아이콘 variant는 없음 — VS Code가 자동 대비 처리를 하는지, 저대비 테마에서 아이콘이 보이는지 확인.

---

## 7. 실행 체크리스트 (요약)

- [ ] 스크린샷/GIF 4~6장 촬영 후 README 상단에 삽입 (P0-1) — **가장 마지막에 진행하기로 결정 (사용자 지시)**
- [x] README 버전 배지 `0.3.0`으로 수정 (P0-2)
- [x] README Commands 표에 누락된 커맨드 전부 추가 (P0-3)
- [x] CLAUDE.md의 Registered commands 목록 + 최소 VS Code 버전 갱신 (P0-5)
- [x] `.vscodeignore` 죽은 경로 정리 (P1-1)
- [ ] GIF/스크린샷 자동 캡처 스크립트 or 촬영 체크리스트 (P1-2) — 스크린샷 작업과 함께 마지막에 진행
- [x] Marketplace 키워드 재검토 (P1-3) — `manager-report` 제거, `pull request`/`pr readiness`/`release notes`/`conventional commits` 추가 (실제 기능과 매칭되는 키워드만 채택)
- [x] README 상단에 3줄 요약 + 스크린샷 삽입 위치 주석 추가 (P1-4) — 실제 이미지는 스크린샷 작업 때 채움
- [x] 리뷰 프롬프트를 배지 언락 시점에도 트리거 (P1-5)
- [x] ~~`publish.yml`에 버전/체인지로그 동기화 게이트 추가 (P3-3)~~ — 취소 (GitHub Actions 미사용 결정)
- [x] ~~`ci.yml`에 VSIX 패키징 드라이런 추가 (P3-2)~~ — 취소 (GitHub Actions 미사용 결정, 워크플로 삭제됨)
- [x] 이슈 템플릿 + `CONTRIBUTING.md` 추가 (P3-4)
- [x] Export/Copy 산출물 전체에 attribution footer 일관 적용 점검 (P2-1) — 2건 발견 및 수정(아래 9번 참고), 나머지는 이미 일관 적용되어 있었음을 확인
- [x] `shareWithTeam` 노출 강화 (P2-2) — 탐색기 우클릭 메뉴에 추가
- [x] `copyReadmeBadge` 가시성 (P2-3) — README P0 갱신으로 이미 반영됨, 커맨드 팔레트는 기본 노출이라 추가 조치 불필요
- [ ] Walkthrough 이미지 보강 (P2-4) — 스크린샷 작업과 함께 마지막에 진행
- [x] `dashboardProvider.ts`/`dashboardStyles.ts` 구조 점검 (P4-1) — `dashboardStyles.ts`의 죽은 코드(테마/차트 색상 시스템, ~150줄) 제거
- [x] 모바일/좁은 패널 대응 재검증 (P4-2) — 실제 렌더링 CSS(`dashboardProvider.ts` 인라인 `<style>`)는 이미 `auto-fit` 그리드 + `flex-wrap` + 2단계 미디어쿼리로 잘 되어 있었음 확인. 표(table) 오버플로 대응만 누락돼 있어 추가
- [x] 아이콘 다크/라이트 대비 확인 (P4-3) — `icon-sidebar.svg`가 `fill="currentColor"` 사용 중이라 이미 테마 대응됨, 수정 불필요

---

## 8. 이번 세션에서 실제로 적용된 변경 사항

**문서 통일 (P0 관련)**
- README.md 재작성: 버전 배지 `0.3.0`, VS Code 최소 버전 `1.85.0`, 배지 개수 `35개`로 수정.
  실제 15개 커맨드 전체를 Commands 표에 반영. `템플릿 프리셋(Full/Executive/PR/Developer)`, `릴리즈 노트
  생성기`, `개발 워크플로 도구(Conventional Commit Helper / Monthly Brief / Windows Troubleshooter)` 섹션을
  4개 언어에서 공통으로 존재하던 내용 기준으로 새로 추가.
- `CLAUDE.md`의 "Registered commands" 목록과 "Minimum VS Code version"(`1.102.0` → `1.85.0`, 실제
  `package.json`의 `engines.vscode` 기준으로 수정) 갱신.

**문서/커맨드 구조 정리 (사용자 결정)**
- **`README.ko.md`, `README.ja.md`, `README.zh-CN.md` 전부 삭제** — README는 영어(`README.md`) 단일 버전으로
  축소. 제품 자체의 UI 다국어 지원(`src/locales/`, `gitMetrics.language` 설정의 `ko`/`ja`/`zh-CN`)은 영향받지
  않음 — 마켓플레이스 리스팅 문서만 영어로 통일된 것. `README.md`의 언어 내비게이션 줄도 제거.
- **`SECURITY.md` 삭제**, 핵심 내용(보안 모델, 취약점 신고 절차, 범위)을 `PRIVACY.md`에 병합. `PRIVACY.md`는
  `gitMetrics.openPrivacySecurity` 커맨드가 실제로 여는 파일이므로, 제목("Privacy & Security")과 실제 내용이
  이제 일치함.
- **`SUPPORT.md` 삭제**, `gitMetrics.openSupport` 커맨드는 더 이상 번들 파일을 열지 않고 GitHub Issues
  페이지(`https://github.com/jiwan8985/git-metrics-dashboard/issues`)를 브라우저로 엽니다
  (`src/extension.ts`, `vscode.env.openExternal` 사용). 커맨드 타이틀도 `Get Support (GitHub Issues)`로 변경.
  README Commands 표의 설명도 함께 수정.
- **`.github/workflows/ci.yml`, `.github/workflows/publish.yml` 삭제** — GitHub Actions를 사용하지 않기로
  결정. 컴파일/린트/테스트/패키징/배포는 전부 로컬에서 `npm run compile` / `npm run lint` / `npm run test` /
  `npm run package` / `npm run publish`로 수동 실행.
- **`.vscodeignore` 정리** — 존재하지 않는 파일을 가리키던 죽은 항목(`TODO.md`, `REFACTORING_SUMMARY.md`,
  `DEVELOPMENT_GUIDE.md`, `MARKETPLACE_STRATEGY.md`, `PHASE_1_COMPLETE.md`, `DEPLOYMENT_GUIDE.md`,
  `docs/MARKETPLACE_GROWTH_ROADMAP.md`, `docs/PHASE_0_BASELINE.md`, `scripts/phase0-*.cjs`)을 제거하고
  `docs/**` 전체(이 문서 포함, 내부 개발 문서이므로 VSIX에 포함되면 안 됨)를 패키징 제외 대상으로 명시.

**남은 것**
- 스크린샷/GIF 촬영(P0-1)은 사용자 지시에 따라 **가장 마지막 단계로 의도적으로 미룸** — Extension Development
  Host를 열어 실제 대시보드를 캡처하는 수동 작업이 필요합니다.
- `AGENTS.md`는 `CLAUDE.md`와 내용이 상당 부분 겹치지만, 이번 정리에서는 삭제 대상에 포함되지 않았습니다
  (다른 AI 코딩 도구들이 참조하는 별도 관례 파일이라 임의로 지우지 않았습니다). 필요하면 알려주세요.

---

## 9. P1 / P2 / P4 구현 내역 (2번째 라운드, 스크린샷 제외)

**P1 — 리스팅 최적화**
- **키워드 재검토**: `package.json`의 `keywords`에서 `manager-report`(검색 의도가 불분명한 하이픈 키워드)를
  제거하고, 실제 구현된 기능과 정확히 매칭되는 `pull request`, `pr readiness`, `release notes`,
  `conventional commits`를 추가(27개 → 30개). 키워드 스터핑이 되지 않도록 실존하지 않는 기능(예: git blame)에
  대한 키워드는 추가하지 않음. 실제 검색 유입 데이터가 없어 더 공격적인 변경은 보류.
- **README 상단 재구성**: 배지 아래에 3줄 핵심 가치 요약(헬스 스코어 / 리포트 내보내기 / 로컬 전용)을 추가하고,
  스크린샷을 나중에 삽입할 위치에 HTML 주석 placeholder를 남겨둠 — 스크린샷 작업 때 이 자리를 채우면 됨.
- **리뷰 유도 로직 확장**: `src/extension.ts`의 배지 달성 토스트(`dashboardProvider.setBadgeUnlockCallback`)
  끝에 `triggerReviewPromptIfReady(context)` 호출을 추가. 기존에는 리포트 내보내기 성공 2곳과 README 배지
  복사 시에만 트리거되었고, "배지 획득"이라는 가장 긍정적인 순간에는 연결돼 있지 않았음. 기존 3회 성공 게이트 /
  30일 스누즈 / "다시 보지 않기" 로직은 그대로 재사용되므로 스팸 위험 없음.

**P2 — 발견성·바이럴 기능**
- **attribution footer 전수 점검** — `reportGenerator.ts`와 `repositoryIntelligence.ts`의 모든 Copy/Export
  빌더 함수(Executive Brief, PR Summary, PR Description, Streak Card, Git Wrapped, Weekly Brief, Monthly
  Brief, HTML/Markdown 리포트)를 하나씩 읽고 확인한 결과, **이미 전부 일관되게** 마켓플레이스 링크 footer가
  붙어 있었습니다. 다만 2곳은 빠져 있어서 이번에 추가했습니다:
  1. **`copyStats()`(기본 "📋 복사" / Copy Summary 버튼)** — 가장 자주 클릭될 가능성이 높은 버튼인데 마켓플레이스
     링크가 전혀 없었음. 한 줄 요약 뒤에 `— Git Metrics Dashboard for VS Code · <marketplace-url>`을 추가.
     (`src/dashboardProvider.ts`)
  2. **CSV 리포트** — HTML/Markdown 리포트에는 footer가 있었지만 CSV는 없었음. 마지막에 `Generated By,URL` 행을
     추가. (`src/reportGenerator.ts`의 `generateCSVReport`)
- **`shareWithTeam` 노출 강화** — 이미 Command Palette, 온보딩 walkthrough, 대시보드 버튼, README에는 노출돼
  있었음을 확인. 추가로 **탐색기(Explorer) 우클릭 컨텍스트 메뉴**(`explorer/context`)에도 노출시켜, 프로젝트
  폴더를 열자마자 바로 접근할 수 있게 함. (`package.json`)
- **`copyReadmeBadge` 가시성** — VS Code는 `contributes.commands`에 등록된 커맨드를 `menus.commandPalette`에
  명시적으로 배제하지 않는 한 기본적으로 팔레트에 노출하므로 이미 접근 가능했음. README Commands 표 반영은
  P0에서 이미 완료. 추가 코드 변경 불필요로 판단.

**P4 — 웹뷰 UI/디자인**
- **`dashboardStyles.ts` 죽은 코드 제거** — 이 파일 전체를 읽고 각 export의 실제 사용처를 `grep`으로 추적한
  결과, `ThemeColors`/`LIGHT_THEME`/`DARK_THEME`/`getChartColors`/`generateCSS`/`getLevelColor`/
  `BADGE_RARITY_COLORS`/`MONTH_NAMES`(총 ~180줄)가 **어디서도 import되지 않는 죽은 코드**였습니다. 실제 대시보드
  렌더링 CSS는 `dashboardProvider.ts`에, 리포트 렌더링 CSS는 `reportGenerator.ts`에 각각 자체적인
  `getThemeColors()` 메서드로 따로 구현돼 있어 이 파일과 완전히 분리되어 있었음. 실사용 중인
  `LANGUAGE_COLORS`/`FILE_TYPE_ICONS`/`WEEKDAY_NAMES`만 남기고 정리(298줄 → 약 100줄). 컴파일/린트/유닛테스트
  43개 전부 통과 확인.
- **반응형 레이아웃 재검증** — `dashboardStyles.ts`의 `generateCSS()`가 죽은 코드였기 때문에 애초에 그 파일에는
  미디어쿼리가 없었던 것이고, **실제로 렌더링되는 CSS는 `dashboardProvider.ts`의 인라인 `<style>`**에 있습니다.
  확인해보니 이미 `grid-template-columns: repeat(auto-fit, minmax(...))` 패턴과 `.command-actions { flex-wrap:
  wrap }`로 대부분의 그리드가 자체적으로 반응형이고, `780px`/`520px` 두 단계 미디어쿼리로 `.intelligence-hero`,
  `.kpi-grid`, `.header`도 재배치됩니다. 유일하게 빠져 있던 것은 **테이블 오버플로 처리** — 좁은 화면에서 저자별
  통계/파일 타입 표가 깨질 수 있어 `780px` 미디어쿼리에 `table { display: block; overflow-x: auto; }`를 추가.
  (실제 시각적 확인은 아직 못 했습니다 — 스크린샷 작업 때 Extension Development Host로 함께 검증 필요.)
- **아이콘 다크/라이트 대비** — `images/icon-sidebar.svg`를 확인한 결과 `fill="currentColor"`를 사용하고 있어
  VS Code의 아이콘 전경색을 그대로 상속받습니다. 즉 라이트/다크/고대비 테마 전환 시 자동으로 대비가 맞춰지는
  올바른 패턴이 이미 적용돼 있었고, 수정할 필요가 없었습니다.

**부수적으로 함께 정리한 것**
- `package.json`의 `activationEvents`에서 IDE가 직접 경고한 중복 항목(`onView:gitMetrics`와 13개의
  `onCommand:gitMetrics.*`)을 제거 — VS Code가 `contributes` 블록에서 자동으로 추론하는 항목이라 명시할 필요가
  없었습니다. `workspaceContains:.git`, `onStartupFinished`만 남김. `CLAUDE.md`의 activation events 설명도
  함께 갱신.

---

## 10. 디자인 정리 + 기능 추가 (3번째 라운드)

사용자가 직접 Extension Development Host로 테스트해본 뒤 "디자인 최적화 + 기능 추가"를 요청. 두 가지를
질문으로 좁힌 뒤(디자인 방향, 기능 우선순위) 아래를 구현.

**디자인 — 이모지 줄이고 프로페셔널하게**
- `src/dashboardProvider.ts`의 대시보드 화면과 `src/reportGenerator.ts`의 내보낸 HTML 리포트에서 섹션
  제목(`.section-title`/`.metric-title`/`<h1>`/`<h2>`), 주요 버튼 라벨, 요약 칩(summary-chip)에 붙어있던
  선행 이모지(🔥📊🏆🎯📁👥✅💻🔀🐦🤝🎁🧠🔄📋📝 등, 약 53곳)를 제거. 정확한 문자열 매칭 스크립트로 처리해
  의도치 않은 곳(빈 상태 아이콘 `.empty-icon`, 배지 데이터 아이콘 `${badge.icon}`, 스트릭 공유 pill 버튼)은
  건드리지 않음 — 이 세 가지는 장식이 아니라 실제 기능/데이터의 일부라 유지.
- HTML 리포트(경영진 공유용)도 동일 기준으로 정리 — README의 "Executive reporting" 포지셔닝과 실제
  산출물 톤을 맞춤.
- **참고**: `extension.ts`의 토스트/알림 메시지(예: "📋 통계가 복사되었습니다!")는 이번 범위에서 제외함 —
  원하면 이어서 정리 가능.

**기능 1 — 에디터 연동 (가장 추천했던 항목)**
- Refactor Radar 카드와 파일 핫스팟(Churn) 테이블의 파일명을 클릭하면 VS Code 에디터에서 해당 파일이 대시보드
  옆(`ViewColumn.Beside`)에 바로 열림. 새 메시지 타입 `openFile` 추가, `DashboardProvider.handleOpenFile()`이
  `vscode.workspace.openTextDocument` + `showTextDocument` 처리. 경로는 `escapeHtml`로 이스케이프한 뒤
  `data-file` 속성에 담고 `this.dataset.file`로 읽어 XSS/속성 이스케이프 문제 없이 안전하게 전달.

**기능 2 — 커스텀 기간 선택**
- 기존 7/30/90/180/365일 고정 버튼 옆에 "기간 지정" 버튼 추가 → 시작일을 달력으로 선택하면 오늘까지의 일수를
  계산해 기존 `changeRange` 메시지로 전달(백엔드 `gitAnalyzer.getCommitHistory(days)`가 원래 "최근 N일"
  기반이라, 완전히 임의인 시작~종료 범위가 아니라 "임의 시작일 → 오늘"로 구현 — 종료일까지 임의로 잡으려면
  `gitAnalyzer`에 `--until` 지원을 추가하는 더 큰 변경이 필요해서 이번엔 이 범위로 제한함, 필요하면 후속 작업
  가능). 1~365일 범위로 클램프.

**기능 3 — "나 vs 팀 평균" (포커스 모드 + 팀 비교를 하나로 통합)**
- 커맨드 팔레트/설정 변경 없이, 이미 계산되어 있던 `metrics.authorStats`(커밋 수/파일 수/+-라인/일평균)를
  그대로 재사용해 클라이언트 사이드에서 구현 — 새로운 git 쿼리 없이 즉시 반영됨.
- `gitAnalyzer.ts`에 `getCurrentUserName()` 추가(`git config user.name` 조회)해서 대시보드를 열면 "나"에
  해당하는 기여자가 자동으로 드롭다운에 선택되어 있음(있을 경우).
- 드롭다운에서 기여자를 고르면 팀 평균 대비 +/-% 차이를 5개 지표(커밋 수, 수정 파일 수, 추가/삭제 라인,
  일평균 커밋)로 보여줌. 기여자가 2명 이상일 때만 섹션 노출(1인 레포에서는 "팀 평균"이 의미 없으므로 숨김).
- **한계**: 이건 "요청받은 대로 통합한 가벼운 버전"입니다. 원래 후보였던 "1인 포커스 모드"(선택한 사람의
  커밋만으로 캘린더 히트맵·차트 전체를 다시 그리는 것)는 이번에 구현한 것보다 훨씬 큰 작업 —
  `gitAnalyzer`에 `--author` 필터를 추가하고 캐시 키/메트릭 재계산 전체를 다시 설계해야 함. 지금 버전은
  이미 계산된 요약 통계를 비교하는 수준이고, 전체 대시보드를 한 사람 것만으로 다시 그리는 건 아닙니다.
  더 깊은 버전을 원하면 알려주세요.

**검증**: 매 단계마다 `npm run compile` + `npm run lint` 통과 확인, 최종적으로 `npm run test:unit`
43개 테스트 전부 통과.

---

## 11. 랭킹 중심 소규모 기능 추가 (4번째 라운드)

사용자가 실제 설치 수(89개)를 공유하면서 "더 추가할 기능 없냐"고 질문. 89개 단계에서는 기능 추가보다
스크린샷/리뷰 확보가 훨씬 높은 레버리지라고 판단해 먼저 알렸고, 그럼에도 코드로 할 수 있는 걸 원해
"랭킹에 도움되는 작은 기능"으로 범위를 좁힌 뒤 아래를 구현. 착수 전 기존 코드를 먼저 점검했더니 이미
잘 구현되어 있던 성장 장치들이 많아서(헬스 스코어 상태바 + 트렌드 화살표 + 점수 상승 시 트위터 공유,
스트릭 마일스톤 알림, 첫 실행 웰컴 + 리뷰 유도 등) 중복 구현을 피하고 진짜 빈틈만 채움.

**이미 있어서 손대지 않은 것** (점검 결과, 참고용)
- 상태바 헬스 스코어 + 트렌드 화살표(↑↓→) + 30개 히스토리 추적 + 5점 이상 향상 시 트위터 공유 유도
- 스트릭 마일스톤(7/14/30/50/100일) 알림 + 공유
- 첫 설치 시 웰컴 메시지(대시보드 자동 오픈 + 리뷰 유도 버튼)

**새로 추가한 것**
1. **업데이트 시 "새 소식" 알림 (What's New)** — `src/extension.ts`의 웰컴 로직 옆에 추가. 확장이 자동
   업데이트되면 다음 활성화 시 `context.extension.packageJSON.version`과 `globalState`에 저장해둔
   `lastSeenVersion`을 비교해서, 버전이 바뀌었을 때만 "✨ vX.X.X로 업데이트되었습니다!" 알림을 한 번 띄우고
   `CHANGELOG.md`로 바로 연결. 최초 설치 때는 뜨지 않도록(웰컴 메시지와 겹치지 않게) 분기 처리.
   **왜 랭킹에 도움되나**: VS Code는 업데이트를 조용히 백그라운드로 설치하기 때문에, 사용자가 "이게 왜 깔려
   있지" 하고 잊어버리다가 지우는 경우가 실제로 많음 — 업데이트 직후 짧은 재참여 알림은 GitLens 등 상위권
   확장들이 공통으로 쓰는 이탈 방지 장치.
2. **`gitMetrics.rateExtension` 커맨드 추가** — 기존 리뷰 유도는 "3회 성공 후에만" 뜨는 게이트 방식이라,
   당장 만족한 사용자가 바로 리뷰를 남기고 싶어도 방법이 없었음. 커맨드 팔레트에서 언제든 바로 마켓플레이스
   리뷰 페이지로 이동하는 커맨드를 추가(기존 자동 유도 로직과는 별개, 서로 방해 안 함). `package.json`
   Commands 목록과 README 표에도 반영.

**검토했지만 이번엔 스킵한 것**
- 상태바 "⭐ Rate" 상시 버튼: 이미 상태바에 헬스 스코어/스트릭/오늘 커밋/Export/Theme 버튼이 5개 떠 있어서
  더 추가하면 좁은 화면에서 상태바가 밀릴 위험 — 대신 커맨드로만 제공.
- Slack/웹훅 연동, 팀 리더보드 클라우드 동기화 등: "local-first, no cloud upload" 포지셔닝과 정면으로
  충돌하고, 89 설치 단계에서 ROI도 낮다고 판단해 제안만 하고 구현은 보류.

**검증**: `npm run compile` / `npm run lint` 통과, `npm run test:unit` 43개 전부 통과.

---

## 12. 이번 분석에서 확인하지 못한 것 (다음 단계 필요)

- **실제 설치 수, 평점, 검색 유입 키워드** — VS Code Marketplace 퍼블리셔 대시보드에서 직접 확인 필요.
  이 수치 없이는 P1의 키워드 조정 우선순위를 확정할 수 없음.
- **웹뷰 실제 렌더링 결과** — 이 세션에서는 정적 코드만 검토했고 브라우저/Extension Host에서 직접 실행해
  보지 않았습니다. P4 항목 착수 전 반드시 실행 확인 필요.
- **경쟁 확장(GitLens, Git Graph, Git History 등) 대비 상세 포지셔닝 비교** — 요청 시 별도로 진행 가능.

---

## 13. 이슈 템플릿/CONTRIBUTING.md 추가 + 정확성(보안) 리뷰 (5번째 라운드)

사용자가 "분석하고 추가/수정 필요한 부분 있으면 개발해줘"라고 요청. 이번 라운드까지는 전부 마켓플레이스
포지셔닝/성장 관점이었고 **실제 코드 정확성(버그) 리뷰는 한 번도 하지 않았다는 점**을 확인한 뒤 두 갈래로 진행.

**P3-4 완료 — 이슈 템플릿 + `CONTRIBUTING.md`**
- `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml`(GitHub YAML 이슈 폼, 필수 필드/드롭다운 포함),
  `config.yml`(빈 이슈 비활성화 + 마켓플레이스 리뷰로 안내하는 contact link) 추가.
- `CONTRIBUTING.md` 추가 — 빌드/테스트 명령어, `escapeHtml` 규칙, local-first 원칙 유지 안내 포함.

**정확성 리뷰 — 실제 발견된 보안 버그 수정**
백그라운드 서브에이전트로 `gitAnalyzer.ts`/`dashboardProvider.ts`/`reportGenerator.ts`/
`repositoryIntelligence.ts`/`badgeSystem.ts`/`extension.ts`를 정독 리뷰한 결과, 다음 실사용자가 겪을 수 있는
버그를 발견하고 즉시 수정:

1. **저장형 XSS — 대시보드 작성자명 미이스케이프 (High)**: `dashboardProvider.ts`의 TOP 3 기여자 포디움
   (podium-name × 3곳), 개발자 순위 리스트(author-name), 요약 칩의 TOP 기여자(topAuthor) — 총 5곳이
   `author.name`을 `escapeHtml()` 없이 그대로 HTML에 삽입하고 있었음. `git config user.name` + 커밋 한 번으로
   누구나 조작 가능한 값이라 실제 공격 경로. 5곳 모두 `this.escapeHtml()` 적용.
2. **저장형 XSS — 내보낸 HTML 리포트 (High)**: `reportGenerator.ts`에 `escapeHTML()` 메서드가 정의만 되어
   있고 **어디서도 호출되지 않는 죽은 코드**였음(`@ts-ignore`로 컴파일 경고만 억제된 상태). 개발자별 기여도
   표의 작성자명, Refactor Radar의 파일 경로/사유, PR Readiness의 브랜치명, 리포트 헤더의 브랜치명/프로젝트명
   등 Git에서 유래한 문자열이 전부 미이스케이프 상태로 HTML에 삽입되고 있었음. 이 리포트는 웹뷰 샌드박스를
   벗어나 실제 브라우저에서 열리고 팀에 공유되는 산출물(README의 "Executive reporting" 포지셔닝)이라
   위험도가 더 높음. 위 지점 전부에 `this.escapeHTML()` 적용.
3. **CSV 수식 인젝션 방지 로직의 순서 버그 (Medium)**: `escapeCSV()`가 수식 인젝션 문자(`=+@-\t`)로 시작하는
   값을 만나면 즉시 `return`해버려서, 그 뒤에 있는 쉼표/따옴표 감싸기 로직이 실행되지 않았음. 예를 들어
   작성자명이 `-John, Doe`처럼 수식 문자로 시작하면서 쉼표도 포함하면 `'-John, Doe`로 따옴표 없이 반환되어
   CSV 행이 추가 컬럼으로 깨짐. 조기 `return`을 제거하고 값을 변형한 뒤 이어서 따옴표 감싸기 로직을 타도록 수정.
4. **numstat 라인 오인식 (Low)**: 커밋 헤더(`hash|author|date|message`)와 `--numstat` 라인을 `'|'` 포함
   여부만으로 구분하고 있어서, 파일명에 리터럴 `|` 문자가 포함된 경우(Linux/macOS에서 합법) numstat 라인이
   새 커밋 헤더로 오인식되어 해당 커밋과 다음 커밋의 데이터가 조용히 깨질 수 있었음. 판별 조건을
   `trimmedLine.includes('|')` → `/^[0-9a-f]{40}\|/.test(trimmedLine)`(40자리 hex 해시로 시작하는지)로 변경.

**회귀 테스트 추가**: `gitAnalyzer.test.ts`에 파일명에 `|`가 포함된 numstat 라인 케이스,
`reportGenerator.test.ts`에 CSV 이스케이프(따옴표/수식+쉼표 동시 발생) 및 HTML 리포트 작성자명 XSS 케이스를
추가(46개 테스트로 증가, 이전 43개). `src/__mocks__/vscode.js`에 `window.activeColorTheme`/`ColorThemeKind`가
없어 `generateHTMLReport()`를 직접 테스트할 수 없던 테스트 인프라 공백도 함께 메움 — 이 공백이 바로
`reportGenerator.ts` 커버리지가 12%에 머물러 있던 이유 중 하나였음(수정 후 25%로 상승).

**검증**: `npm run compile` / `npm run lint` / `npm run test:unit` 46개 전부 통과.

**참고**: 이 라운드에서 서브에이전트 하나가 지시(읽기 전용 리뷰)를 벗어나 `CONTRIBUTING.md`/이슈 템플릿을
중복으로 편집하려 시도해 중단시키고 재실행한 일이 있었음 — 결과물은 정리(더 품질 좋은 YAML 이슈 폼은 유지,
중복된 마크다운 템플릿은 제거)했고 코드 변경에는 영향 없음.

**경쟁 확장 대비 기능 검토 + 디자인 폴리시** — 사용자에게 GitLens/Git Graph/Git History류에서 이 프로젝트
니치(로컬 전용 헬스/분석 대시보드)에 맞는 기능 후보(코드 소유권/Bus Factor 뱃지, 파일별 히스토리 패널,
브랜치 커밋 타임라인, 디자인 폴리시만)를 제시한 뒤 "디자인 폴리시만" 선택받음. `src/dashboardProvider.ts`에
다음을 추가:
- **새로고침 로딩 오버레이**: `refresh()`/`changePeriod()`/`applyCustomRange()`/`changeBranch()`는 전부
  `webview.html`을 통째로 교체하는 방식이라 응답이 올 때까지(특히 대형 레포에서 git log 재분석 시간 동안)
  아무 피드백이 없었음. 기존에 정의만 되고 마크업에서 전혀 쓰이지 않던 죽은 CSS 클래스 `.loading`을 실제
  오버레이(`#loading-overlay` + 스피너 + "새로고침 중..." 텍스트)로 되살려 클릭 즉시 표시되도록 연결.
- **스크롤 패널 슬림 스크롤바**: `.author-list`/`.file-list`/`.file-type-list`에 테마 색상에 맞춘
  `::-webkit-scrollbar` 스타일 추가(VS Code 웹뷰는 Chromium 기반이라 안전하게 사용 가능).
- **키보드 포커스 표시**: 버튼/파일 링크/select/input에 `:focus-visible` 아웃라인 추가(접근성 폴리시,
  기존에는 전무했음).

**검증**: `npm run compile` / `npm run lint` / `npm run test:unit` 46개 전부 통과. **다만 이 디자인 변경은
Extension Development Host에서 시각적으로 직접 확인하지 못했음** — 이 세션은 VS Code GUI를 실행/캡처할 수
없는 환경이라 CSS/마크업/JS를 코드 리뷰 수준으로만 검증함. `F5`로 Extension Development Host를 열어
라이트/다크 테마 양쪽에서 새로고침·기간 변경·브랜치 변경 시 오버레이가 올바르게 뜨는지 직접 확인 필요.
