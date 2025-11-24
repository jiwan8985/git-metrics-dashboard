# Git Metrics Dashboard - 개발자 가이드

## 📌 Quick Start

**이 프로젝트는:**
- ✅ **배포된 제품** (VS Code Marketplace)
- ✅ **활발히 개선 중** (v0.0.8 → v1.0.0 로드맵)
- ✅ **공개 오픈소스** (MIT 라이선스)

---

## 📚 주요 문서

### 1. **CLAUDE.md** 📖 (포괄적 코드 분석)
**대상:** 개발자, 아키텍처 이해를 원하는 사람

**내용:**
- 프로젝트 구조 (8,025줄 TypeScript)
- 6가지 핵심 컴포넌트 상세 분석
- 아키텍처 다이어그램
- 데이터 흐름
- 설정 및 명령어

**언제 읽을까:**
- 새로운 기능을 추가하고 싶을 때
- 코드를 이해하고 싶을 때
- 버그를 수정하고 싶을 때

**읽는 시간:** 30-45분

---

### 2. **TODO.md** 📋 (개발 로드맵)
**대상:** 프로젝트 관리자, 개발팀 리더

**내용:**
- 39개 개발 항목 (우선순위별 분류)
- 각 항목의 예상 시간/영향도
- 5가지 Phase별 로드맵
- Marketplace 성장 전략
- KPI 및 목표

**구조:**
```
🔴 긴급 (2개, 26-34시간)
├─ 명령 인젝션 취약점
└─ 테스트 커버리지

🟠 높음 (17개, 95-145시간)
├─ 보안 개선
├─ 성능 최적화
├─ 기능 추가
└─ 국제화

🟡 낮음 (14개, 38-56시간)
└─ 문서화, 유지보수

💡 향후 기능 (6개)
└─ 프리미엄, 팀 협업 등
```

**언제 읽을까:**
- 다음 스프린트 계획을 세울 때
- 우선순위를 결정할 때
- 진행 상황을 추적할 때

**읽는 시간:** 20-30분

---

### 3. **MARKETPLACE_STRATEGY.md** 🎯 (성장 전략)
**대상:** 프로덕션 운영 담당자, 마케팅 담당자

**내용:**
- 12개월 로드맵 (4개 Phase)
- Phase별 구체적 실행 계획
- 마케팅 전략
- 기대 결과
- KPI 및 성공 지표

**Phase 구성:**
```
Phase 1 (1개월):    긴급 안정화
  └─ 보안 패치, 메타데이터, Sponsors

Phase 2 (3개월):    기능 개선 & 안정화
  └─ 테스트, i18n, 마케팅

Phase 3 (3개월):    기능 확장
  └─ 실시간 감지, 다중 저장소

Phase 4 (6개월):    장기 비전
  └─ 프리미엄, 웹 대시보드
```

**언제 읽을까:**
- 장기 전략을 수립할 때
- Marketplace 성장 계획을 세울 때
- 마케팅 캠페인을 준비할 때

**읽는 시간:** 25-35분

---

## 🚀 지금 바로 해야 할 일

### 이번 주 (1주)
1. **보안 패치 계획**
   - [ ] 명령 인젝션 취약점 분석
   - [ ] simple-git 라이브러리 검토
   - [ ] 수정 계획 수립
   - **파일:** `src/gitAnalyzer.ts`
   - **시간:** 4-6시간

2. **Marketplace 메타데이터 개선**
   - [ ] Keywords 확대 (14 → 25개)
   - [ ] Category 변경 ("Other" → "Developer Tools")
   - [ ] 설명 영문화
   - **파일:** `package.json`
   - **시간:** 2-3시간

3. **GitHub Sponsors 설정**
   - [ ] GitHub 프로필 설정
   - [ ] Stripe 계정 연결
   - [ ] README에 배지 추가
   - **시간:** 1-2시간

### 이번 달 (4주)
1. **보안 패치 배포** (v0.0.9)
   - 명령 인젝션 취약점 제거
   - XSS 방지
   - CSV 인젝션 방지

2. **마케팅 시작**
   - GitHub README 개선 (영문)
   - Dev.to 포스팅
   - Twitter 공유

3. **테스트 프레임워크 설정**
   - Jest/Mocha 설정
   - 초기 테스트 작성

---

## 💡 개발 노하우

### 빌드 및 테스트

```bash
# 의존성 설치
npm install

# TypeScript 컴파일
npm run compile

# 린팅 (자동 수정)
npm run lint -- --fix

# 테스트
npm test

# 로컬 개발 (watch 모드)
npm run watch

# 패키징
npm run package

# Marketplace에 배포
npm run publish
```

### 일반적인 워크플로우

```bash
# 1. 브랜치 생성
git checkout -b feature/your-feature

# 2. 코드 작성
# ... 수정 ...

# 3. 테스트
npm run compile && npm run lint && npm test

# 4. 커밋
git commit -m "feat: describe your changes"

# 5. Push
git push origin feature/your-feature

# 6. Pull Request 생성
```

### 주의사항

⚠️ **배포된 제품이므로:**
- 모든 변경사항을 철저히 테스트하세요
- 보안 취약점을 먼저 수정하세요
- 버전 번호를 따라가세요 (Semantic Versioning)
- 변경사항을 CHANGELOG에 기록하세요

---

## 📊 현재 상태 대시보드

### 코드 품질
```
테스트 커버리지:     10% ⚠️ (목표: 70%)
보안 취약점:         3개 🔴 (목표: 0개)
ESLint 경고:         16개 ⚠️ (목표: 0개)
TypeScript any:      15개 ⚠️ (목표: 0개)
```

### 사용자/마케팅
```
Marketplace 다운로드:  ~100 📈
GitHub Stars:          ~20  📈
활성 사용자:           ~30  📈
별점:                  ? (리뷰 필요)
```

### 배포
```
최신 버전:    0.0.8 🟢
배포 상태:    라이브 🟢
Marketplace:  활성 🟢
GitHub:       활성 🟢
```

---

## 🎯 우선순위 기준

### 🔴 CRITICAL (즉시 처리)
- 보안 취약점
- 데이터 손실 위험
- Marketplace 정책 위반

### 🟠 HIGH (이번 달)
- 주요 버그
- 사용자 피드백
- 성능 문제

### 🟡 MEDIUM (이번 분기)
- 기능 개선
- 테스트 추가
- 문서화

### 🟢 LOW (우선순위 낮음)
- 사소한 버그
- 코드 스타일
- 미래 기능

---

## 📞 도움이 필요한가요?

### 리소스
- **문서:** CLAUDE.md, TODO.md, MARKETPLACE_STRATEGY.md
- **이슈:** https://github.com/jiwan8985/git-metrics-dashboard/issues
- **토론:** GitHub Discussions
- **이메일:** jiwan8985@gmail.com

### 대답 받을 수 있는 질문
- 코드 구조 설명 → CLAUDE.md 참고
- 개발 계획 → TODO.md 참고
- Marketplace 전략 → MARKETPLACE_STRATEGY.md 참고
- 버그 리포트 → GitHub Issues

---

## 🏆 기여하기

### 기여 방법
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 기여 확인사항
- [ ] 모든 테스트 통과
- [ ] ESLint 경고 없음
- [ ] TypeScript 컴파일 오류 없음
- [ ] 변경사항을 CHANGELOG에 기록
- [ ] PR 설명에 관련 이슈 참고

---

**Happy Coding! 🚀**

마지막 업데이트: 2025-11-24
