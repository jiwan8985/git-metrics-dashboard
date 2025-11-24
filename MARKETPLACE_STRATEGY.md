# Git Metrics Dashboard - Marketplace 성장 전략 & 개발 로드맵

## 📌 Executive Summary

**현재 상태:** VS Code Marketplace에 배포된 베타 버전 (v0.0.8)
**목표:** 안정적인 프로덕션 플러그인으로 성장 (1년 내)
**주요 과제:** 보안, 테스트, 국제화, 사용자 확보

---

## 🎯 12개월 로드맵

```
2025년 11월-12월          2026년 1월-3월           2026년 4월-6월          2026년 7월-12월
├─ 보안 패치 (v0.0.9)    ├─ 테스트 작성          ├─ 기능 확장             ├─ 커뮤니티 성장
├─ 메타데이터 개선       ├─ i18n 구현            ├─ 다중 저장소 지원      ├─ 프리미엄 검토
├─ GitHub Sponsors 설정  ├─ 마케팅 시작          ├─ v1.0.0 출시          └─ 장기 비전
└─ 사용자 100명 목표     ├─ 다운로드 500         └─ 활성 사용자 500+      └─ 1,000+ stars
```

---

## 📋 Phase 1: 긴급 안정화 (1개월)

### 🔴 Critical Tasks

#### 1.1 보안 패치 배포 (0.0.9)
**상태:** ⏳ 대기 중
**마감:** 2025-12-15

**필수 작업:**
```markdown
- [ ] 명령 인젝션 취약점 제거 (simple-git 라이브러리 사용)
  기대 효과: 사용자 저장소 보안 강화, Marketplace 신뢰도 ↑

- [ ] XSS 취약점 해결 (HTML 이스케이프)
  기대 효과: 악성 커밋 메시지 공격 방어

- [ ] CSV 인젝션 방지
  기대 효과: Excel/Google Sheets 안전 사용

- [ ] 보안 감사 및 테스트
  기대 효과: 알려진 취약점 0개 달성
```

**변경 사항:**
- `package.json`: 보안 업데이트 내용 추가
- `CHANGELOG.md`: 보안 패치 기록
- GitHub Release: 보안 공지

**배포 프로세스:**
```bash
# 1. 브랜치 생성
git checkout -b security/v0.0.9

# 2. 보안 패치 구현
npm install simple-git
# ... 코드 수정 ...

# 3. 테스트
npm run lint
npm run compile
npm test

# 4. 버전 업데이트
npm version patch  # 0.0.8 → 0.0.9

# 5. 배포
npm run publish

# 6. GitHub 릴리스 생성
git tag v0.0.9
git push origin v0.0.9
```

---

#### 1.2 Marketplace 메타데이터 최적화
**상태:** ⏳ 대기 중
**마감:** 2025-12-10

**현재 문제점:**
```json
{
  "category": "Other",           // ❌ 너무 일반적 (검색 불리)
  "keywords": [14개],             // ❌ 부족 (경쟁 플러그인은 20+)
  "description": "기본 설명만"    // ❌ 마케팅 효과 미흡
}
```

**개선 사항:**

1. **Category 변경**
   ```json
   "categories": [
     "Developer Tools",  // 주 카테고리 (분석 도구)
     "Other"            // 보조 카테고리
   ]
   ```
   기대 효과: 검색 순위 ↑ 200-300%

2. **Keywords 확대 (14 → 25개)**
   ```json
   "keywords": [
     // 기존
     "git", "metrics", "dashboard", "statistics", "commits",
     "analytics", "report", "export", "html", "json", "csv",
     "markdown", "theme", "dark", "light",

     // 추가
     "developer-tools", "productivity", "version-control",
     "commit-history", "code-analytics", "repository-metrics",
     "contribution-tracking", "team-dashboard", "vcs",
     "code-quality", "work-statistics"
   ]
   ```

3. **Marketplace 설명 개선 (영문)**
   ```
   Before:
   "개발자별 Git 커밋 통계 및 메트릭 대시보드"

   After:
   "Professional Git Analytics Dashboard for Developers and Teams

   📊 Visualize commit statistics, track contribution patterns,
   and export professional reports in multiple formats (HTML, JSON, CSV).
   Perfect for team leads, project managers, and developers."
   ```

4. **스크린샷 업데이트**
   - 현재: v0.0.7 기준 (구식)
   - 필요: v0.0.9 기준 최신 스크린샷 4장
   - 형식: 1280x720 PNG

5. **데모 GIF 추가**
   ```
   images/
   ├── demo-dashboard.gif (10MB 이하)  # 대시보드 동작 시연
   └── demo-export.gif                 # 리포트 내보내기 시연
   ```

---

#### 1.3 GitHub Sponsors 설정
**상태:** ⏳ 대기 중
**마감:** 2025-12-05

**설정 단계:**
1. GitHub 프로필 Settings → Sponsors
2. Stripe 결제 계정 연결
3. 가격 계획 수립:
   ```
   ☕ $1/월   - Coffee (감사의 표시)
   🍕 $5/월   - Pizza (일반 지원자)
   💻 $20/월  - Developer (우선 버그 수정)
   🎯 $50/월  - Team (기능 요청 투표권)
   ```
4. README에 Sponsor 배지 추가

**수익 예상:**
- Phase 1: $0 (초기 단계)
- Phase 2: $50-100/월 (50-100명 사용자)
- Phase 3: $200-500/월 (1,000명 사용자)

---

### 📈 Phase 1 예상 결과

| 메트릭 | 현재 | 목표 | 차이 |
|-------|------|------|------|
| Marketplace 다운로드 | 100 | 200 | ↑100% |
| 별점 | ? | 4.5+ | 신규 리뷰 기대 |
| GitHub Stars | ~20 | 50 | ↑150% |
| 보안 취약점 | 3개 | 0개 | ✅ |

---

## 📋 Phase 2: 기능 개선 & 안정화 (3개월)

### 📅 Timeline
```
1월 1주: 테스트 프레임워크 설정
1월 2주: GitAnalyzer 단위 테스트
1월 3주: Badge/Report 테스트
1월 4주: 통합 테스트

2월 1주: i18n 프레임워크 (i18next)
2월 2주: 영어/일본어/중국어 번역
2월 3주: 번역 통합 테스트
2월 4주: README 번역

3월 1주: 마케팅 캠페인
3월 2주: 마케팅 캠페인
3월 3주: v0.1.0 배포 준비
3월 4주: v0.1.0 배포 🎉
```

### 🧪 Test Coverage 구현

**목표:** 70% 이상의 테스트 커버리지

#### 단위 테스트 (Unit Tests)
```typescript
// test/gitAnalyzer.test.ts
describe('GitAnalyzer', () => {
  describe('getCommitHistory', () => {
    it('should return commits for valid date range', async () => {
      // ...
    });
    it('should handle empty repository', async () => {
      // ...
    });
    it('should handle special characters in commit messages', async () => {
      // ...
    });
  });

  describe('generateMetrics', () => {
    it('should calculate author stats correctly', async () => {
      // ...
    });
    it('should identify top files', async () => {
      // ...
    });
    it('should analyze time patterns', async () => {
      // ...
    });
  });
});

// test/badgeSystem.test.ts
describe('BadgeSystem', () => {
  it('should unlock commit streak badge at 7 days', () => {
    // ...
  });
  it('should calculate progress correctly', () => {
    // ...
  });
  it('should handle edge cases (0 commits, etc)', () => {
    // ...
  });
});

// test/reportGenerator.test.ts
describe('ReportGenerator', () => {
  describe('HTML Report', () => {
    it('should escape HTML special characters', () => {
      // XSS 방지 검증
    });
    it('should apply theme correctly', () => {
      // 테마 적용 검증
    });
  });

  describe('CSV Report', () => {
    it('should prevent formula injection', () => {
      // CSV 인젝션 방지 검증
    });
  });
});
```

**테스트 실행:**
```bash
npm run test
npm run test -- --coverage
```

**목표 결과:**
```
✅ 100+ 테스트 케이스
✅ 70% 줄 커버리지
✅ 0개 실패 테스트
```

---

### 🌐 i18n (국제화) 구현

#### 라이브러리: i18next
```bash
npm install i18next vscode-i18n
```

#### 파일 구조
```
src/
├── locales/
│   ├── en.json
│   ├── ko.json
│   ├── ja.json
│   ├── zh-CN.json
│   └── es.json
├── i18n.ts
└── extension.ts (i18n 초기화)
```

#### 구현 예시
```typescript
// src/i18n.ts
import i18next from 'i18next';

export function initI18n() {
  i18next.init({
    lng: vscode.env.language || 'en',
    resources: {
      'en': require('../locales/en.json'),
      'ko': require('../locales/ko.json'),
      'ja': require('../locales/ja.json'),
      'zh-CN': require('../locales/zh-CN.json'),
      'es': require('../locales/es.json'),
    }
  });
}

export function t(key: string, args?: any): string {
  return i18next.t(key, args);
}
```

#### 지원 언어
1. **영어 (English)** - 우선순위 1
   - 국제 사용자 확보
   - Marketplace 글로벌 검색

2. **일본어 (日本語)** - 우선순위 2
   - 아시아 시장 진출
   - 기술 블로거 커뮤니티

3. **중국어 간체 (简体中文)** - 우선순위 3
   - 가장 큰 개발자 시장
   - GitHub/GitLab 사용자 많음

4. **스페인어 (Español)** - 선택사항
   - 라틴 아메리카 시장
   - 유럽 시장

**예상 효과:**
- 영문 구현 후: 다운로드 ↑ 300-400%
- 일본어 추가: 다운로드 ↑ 100-150%
- 중국어 추가: 다운로드 ↑ 200-300% (잠재력 큼)

---

### 📢 마케팅 캠페인

#### 1단계: GitHub 중심 (1월)
```markdown
- GitHub README 개선 (영문)
- GitHub Discussions 활성화
- GitHub Trending에 도전
  → Tools: https://github.com/trending
```

#### 2단계: 커뮤니티 참여 (2월)
```markdown
- Dev.to 포스팅: "Git Analytics Dashboard: My VS Code Journey"
- Hacker News 공유
- Reddit 게시 (r/vscode, r/github)
- Medium 블로그 연재: "Building Git Metrics Dashboard" 시리즈
```

#### 3단계: 콘텐츠 제작 (3월)
```markdown
- YouTube 튜토리얼 (영어)
  "How to Analyze Your Git Contributions with VS Code"
  (5분 데모)

- Blog 포스팅: "Advanced Git Analytics for Teams"
- Twitter/X 캠페인: #GitAnalytics #VSCode
```

**기대 리치:**
- Dev.to: 1,000-2,000 조회
- Hacker News: 500-1,000 조회
- Reddit: 200-500 조회
- YouTube: 500-1,000 조회
- **총합:** 5,000-10,000 임프레션

---

### 📊 Phase 2 예상 결과

| 메트릭 | 현재 | 목표 | 달성율 |
|-------|------|------|--------|
| 다운로드 | 200 | 500+ | 150% |
| 활성 사용자 | 50 | 150 | 200% |
| GitHub Stars | 50 | 300 | 500% |
| 테스트 커버리지 | 10% | 70% | 600% |
| 지원 언어 | 1개 (한글) | 5개 | 400% |
| 마켓플레이스 별점 | ? | 4.5+ | 신규 |

**Version:** v0.1.0 출시 🎉

---

## 📋 Phase 3: 기능 확장 (3개월)

### ⭐ 차별화 기능 1: 실시간 Git 변경 감지

**문제점:** 현재는 수동 새로고침만 가능

**해결책:** .git 디렉토리 감시
```typescript
// src/gitChangeDetector.ts
export class GitChangeDetector {
  private watcher: fs.FSWatcher;
  private onChangeCallback: () => void;

  startWatching() {
    const gitPath = path.join(this.workspaceRoot, '.git');
    this.watcher = fs.watch(gitPath, (eventType, filename) => {
      if (eventType === 'change' && filename === 'HEAD') {
        // 새 커밋 감지!
        this.onChangeCallback();
      }
    });
  }
}
```

**기대 효과:**
- UX 개선: 수동 새로고침 제거
- 실시간 분석: 커밋 직후 자동 업데이트
- 경쟁 제품 대비 우위

---

### ⭐⭐ 차별화 기능 2: 다중 저장소 지원

**현재:** 단일 워크스페이스만 지원
**목표:** 여러 저장소 동시 분석

```typescript
// src/multiRepoAnalyzer.ts
export class MultiRepoAnalyzer {
  async analyzeMultipleRepos(): Promise<AggregatedMetrics> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const metricsArray = [];

    for (const folder of workspaceFolders) {
      const metrics = await this.gitAnalyzer.generateMetrics(folder);
      metricsArray.push({
        repoName: folder.name,
        metrics: metrics
      });
    }

    return this.aggregateMetrics(metricsArray);
  }

  // 팀 메트릭 계산
  aggregateMetrics(metricsArray: any[]): AggregatedMetrics {
    return {
      totalCommits: sum(m.metrics.totalCommits),
      totalAuthors: union(m.metrics.authorStats.map(a => a.name)).length,
      topContributors: this.calculateTopContributors(metricsArray),
      repoBreakdown: metricsArray,
      trends: this.calculateTrends(metricsArray)
    };
  }
}
```

**B2B 활용 사례:**
- 팀 리더: 팀 전체 기여도 분석
- CTO: 기술 부채 파악
- HR: 개발자 성과 평가

**기대 수익:**
- 팀 기능 프리미엄화 가능
- B2B 라이선스 판매 기회

---

### 기능 3: 고급 필터링

**대시보드 필터:**
```typescript
interface DashboardFilters {
  authors?: string[];           // 특정 작성자만
  dateRange?: {start, end};     // 날짜 범위
  fileTypes?: string[];         // 파일 타입 (JS, TS, etc)
  minCommits?: number;          // 최소 커밋 수
}
```

**UI 개선:**
- Sidebar에 필터 패널 추가
- 필터 프리셋 저장
- 필터 조합 저장/로드

---

### 기능 4: 히스토리 추적 & 트렌드 분석

**SQLite 데이터베이스:**
```sql
CREATE TABLE daily_metrics (
  id INTEGER PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_commits INTEGER,
  total_authors INTEGER,
  new_files INTEGER,
  deleted_files INTEGER,
  avg_commit_size REAL,
  top_contributor TEXT,
  created_at TIMESTAMP
);

CREATE TABLE commit_trends (
  id INTEGER PRIMARY KEY,
  metric_name TEXT,
  date DATE,
  value REAL,
  trend_direction TEXT  -- 'up', 'down', 'stable'
);
```

**분석 기능:**
- 90일 트렌드 차트
- 월간 성장률 계산
- 이상 탐지 (비정상 활동)
- 예측 분석 (다음 달 예상 커밋)

**기대 효과:**
- 사용자 참여도 ↑↑↑
- 데이터 기반 의사결정 지원
- 프리미엄 기능 기반

---

### 📊 Phase 3 예상 결과

| 메트릭 | 현재 | 목표 | 차이 |
|-------|------|------|------|
| 다운로드 | 500 | 2,000+ | 4배 |
| 활성 사용자 | 150 | 500+ | 3배 |
| GitHub Stars | 300 | 1,000+ | 3배 |
| 기능 수 | 5개 | 15개 | 3배 |

**Version:** v1.0.0 출시 🚀 (프로덕션 안정화)

---

## 📋 Phase 4: 장기 비전 (6개월)

### 옵션 1: GitHub Sponsors/Buy Me A Coffee (추천)
**장점:** 구현 간단, 사용자 친화적
**예상 수익:** $200-500/월

### 옵션 2: 프리미엄 기능 (고려)
**프리미엄 기능:**
- PDF 내보내기 (고급 포매팅)
- 팀 협업 (10명 이상)
- 클라우드 저장소 동기화
- 정기 리포트 이메일

**라이선스:**
- 개인: 무료 (MIT)
- 팀: 월 $5-10

### 옵션 3: 웹 대시보드 (장기)
**GitHub + 웹 플랫폼 결합**
- VS Code: 로컬 분석
- 웹: 팀 공유 및 협업

**기술:**
- Next.js / React
- GitHub API 연동
- AWS / Vercel 호스팅

---

## 🎯 성공 지표 (KPI)

### 사용자 지표
```
✅ 월간 활성 사용자: 현재 30 → 목표 500 (6개월)
✅ Marketplace 다운로드: 현재 100 → 목표 5,000+ (12개월)
✅ GitHub Stars: 현재 ~20 → 목표 1,000+ (12개월)
✅ 별점: 목표 4.8+ (프로덕션 품질)
```

### 기술 지표
```
✅ 테스트 커버리지: 현재 10% → 목표 70+% (3개월)
✅ 보안 취약점: 현재 3개 → 목표 0개 (1개월)
✅ 성능: 대시보드 로드 < 2초 (캐싱 최적화)
✅ 안정성: Uptime 99%+ (배포된 VS Code 확장)
```

### 비즈니스 지표
```
✅ GitHub Sponsors: $100-300/월 (6개월)
✅ 기여자: 현재 1명 → 목표 3-5명 (12개월)
✅ 이슈 응답: 평균 < 24시간
✅ 릴리스 주기: 월 1회 이상
```

---

## 📢 마케팅 체크리스트

### Short-term (1개월)
- [ ] GitHub Sponsors 활성화
- [ ] Marketplace 메타데이터 개선
- [ ] 보안 패치 배포 (v0.0.9)
- [ ] GitHub README 영문 추가
- [ ] Twitter에서 프로젝트 공유

### Medium-term (3개월)
- [ ] Dev.to 포스팅 (3-5개)
- [ ] YouTube 튜토리얼 제작
- [ ] i18n 구현 (5개 언어)
- [ ] v0.1.0 마이너 버전 배포
- [ ] 개발 블로그 시작

### Long-term (12개월)
- [ ] GitHub 1,000 stars 달성
- [ ] 월 5,000+ 다운로드
- [ ] v1.0.0 프로덕션 배포
- [ ] 다중 저장소 지원
- [ ] 커뮤니티 기여자 3명 이상

---

## 💡 추가 팁

### 1. Marketplace 최적화
```
✨ 매력적인 설명 (영어)
✨ 고품질 스크린샷 (5장)
✨ 데모 GIF (2개)
✨ 규칙적 업데이트 (월 1회+)
✨ 활발한 GitHub 활동
```

### 2. 사용자 피드백 수집
```
📊 Marketplace 리뷰
📊 GitHub Issues/Discussions
📊 사용자 설문조사 (분기별)
📊 Google Forms 피드백
```

### 3. 커뮤니티 구축
```
💬 GitHub Discussions 활성화
💬 Discord 서버 개설 (선택)
💬 개발 블로그/뉴스레터
💬 Twitter 커뮤니티
```

### 4. 경쟁 분석
```
🔍 유사 플러그인 모니터링
🔍 사용자 리뷰 분석
🔍 기능 벤치마킹
🔍 가격/가치 비교
```

---

## 📚 참고 자료

### VS Code Extension Development
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### Marketplace Best Practices
- [Marketplace Documentation](https://code.visualstudio.com/docs/editor/extension-marketplace)
- [Extension Manifest Format](https://code.visualstudio.com/api/references/extension-manifest)

### Git Integration
- [simple-git Documentation](https://github.com/steveukx/git-js)
- [Node.js child_process](https://nodejs.org/api/child_process.html)

### i18n
- [i18next Documentation](https://www.i18next.com/)
- [i18next React](https://react.i18next.com/)

---

## 📝 정리

### 즉시 실행 (이번 주)
1. ✅ 보안 패치 계획 수립
2. ✅ Marketplace 메타데이터 목록 작성
3. ✅ GitHub Sponsors 설정

### 이번 달
1. 🔄 보안 패치 배포 (v0.0.9)
2. 🔄 메타데이터 업로드
3. 🔄 마케팅 캠페인 시작

### 3개월 목표
1. 📈 500+ 다운로드
2. 📈 i18n 구현
3. 📈 v0.1.0 배포

### 12개월 비전
1. 🚀 v1.0.0 프로덕션 배포
2. 🚀 1,000+ GitHub Stars
3. 🚀 5,000+ 다운로드/월
4. 🚀 500+ 활성 사용자

---

**마지막 업데이트:** 2025-11-24
**다음 검토:** 2025-12-24
**책임자:** jiwan-dev (jiwan8985@gmail.com)

---

## 🚀 Get Started

1. 지금 바로: `TODO.md`의 **Phase 1** 항목 시작
2. 이번 주: 보안 패치 배포
3. 이번 달: 마케팅 캠페인 시작
4. 3개월: 사용자 500명 달성

**함께 성장해요! 🎉**
