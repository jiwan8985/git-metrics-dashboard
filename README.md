<!-- # 📊 Git Metrics Dashboard

> 팀의 Git 활동을 실시간으로 분석하고 시각화하는 VSCode Extension  
> Real-time Git activity analysis and visualization for development teams

[![VSCode](https://img.shields.io/badge/VSCode-Extension-blue.svg)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ 주요 기능 (Key Features)
![cap1](https://github.com/user-attachments/assets/60c3224f-9a2b-4b56-935d-128b9a79ab1a)
![cap2](https://github.com/user-attachments/assets/f77ceecb-ccff-45ad-8a9a-8d6f9cdc60bb)
![cap3](https://github.com/user-attachments/assets/5389d1b1-b3cc-4334-a1a0-90fe5d7e96eb)
![cap4](https://github.com/user-attachments/assets/8e1cc321-5408-4a3c-b17b-634ce4d9f1b5)
![cap5](https://github.com/user-attachments/assets/cd92e413-38bd-47fd-8508-190fadcdc1a5)
![cap6](https://github.com/user-attachments/assets/775ecbe8-91a1-4e32-b6a6-0be5140394f8)

### 📈 **일별 커밋 추이 분석**
- 최근 7일/30일/90일 커밋 트렌드를 라인 차트로 시각화
- 일평균 커밋 수, 최고 기록 등 핵심 메트릭 제공
- Interactive line chart showing commit trends over 7/30/90 days

### 👥 **작성자별 기여도 분석**
- 개발자별 커밋 수, 수정 파일 수, 코드 라인 변경량 추적
- 개인별 작업 패턴 및 활동 주기 분석
- Team member contribution ranking with medal system

### 📁 **파일 타입별 기술 스택 분석**
- **20+ 프로그래밍 언어** 자동 인식 및 분류
- Frontend/Backend/Mobile/Database 카테고리별 활동 분포
- 언어별 색상 코딩 및 아이콘으로 직관적 표시
- Technology stack analysis with 20+ programming languages

### ⏰ **시간대별 작업 패턴 분석**
- **24시간 레이더 차트**로 시간대별 활동 패턴
- **요일별 폴라 차트**로 주간 작업 분포
- **히트맵**으로 요일×시간 매트릭스 시각화
- 야간형/주말형/정규형/균형형 작업 스타일 자동 분류
- Comprehensive time-based activity analysis with heatmaps

### 🔄 **실시간 자동 새로고침**
- 10초~5분 간격으로 자동 업데이트
- 실시간 카운트다운 및 상태 표시
- 팀 모니터링용 대시보드 모드
- Real-time auto-refresh with countdown timer

## 🚀 설치 방법 (Installation)
### 1. 직접 설치 (Direct Installation)
```bash
# 저장소 클론
git clone https://github.com/jiwan8985/git-metrics-dashboard.git
cd git-metrics-dashboard

# 의존성 설치
npm install

# 컴파일
npm run compile
```

### 2. 개발 모드 실행
1. VSCode에서 프로젝트 열기
2. `F5` 키를 눌러 Extension Development Host 실행
3. Git 저장소가 있는 폴더 열기
4. `Ctrl+Shift+P` → "Git Metrics Dashboard 열기" 실행

## 📊 사용법 (Usage)
### 기본 사용법
1. **Git 저장소**가 있는 VSCode 워크스페이스 열기
2. 명령 팔레트(`Ctrl+Shift+P`) 열기
3. **"📊 Git Metrics Dashboard 열기"** 명령 실행
4. 대시보드에서 다양한 메트릭 확인

### 자동 새로고침 설정
```typescript
// settings.json
{
  "gitMetrics.autoRefresh": true,           // 자동 새로고침 활성화
  "gitMetrics.autoRefreshInterval": 30,     // 30초 간격
  "gitMetrics.enableNotifications": true    // 알림 표시
}
```

## ⚙️ 설정 옵션 (Configuration)
| 설정 | 기본값 | 설명 |
|------|--------|------|
| `gitMetrics.defaultPeriod` | `30` | 기본 분석 기간 (일)           
| `gitMetrics.autoRefresh` | `false` | 자동 새로고침 활성화         
| `gitMetrics.autoRefreshInterval` | `30` | 새로고침 간격 (초)      
| `gitMetrics.maxTopFiles` | `10` | 상위 파일 표시 개수             
| `gitMetrics.enableNotifications` | `true` | 새로고침 알림 표시    


### 🎯 지원하는 언어 및 기술 스택
```
Frontend:  🟨 JavaScript  ⚛️ React  🔷 TypeScript  💚 Vue.js
Backend:   🐍 Python  ☕ Java  🔵 Go  🦀 Rust  🐘 PHP
Mobile:    🍎 Swift  🎯 Dart  📱 Kotlin
Database:  🗃️ SQL  📋 JSON  ⚙️ YAML
Scripts:   🖥️ Shell  📄 Batch  💻 PowerShell
```

## 🛠️ 개발 환경 (Development)
### 시스템 요구사항
- **VSCode**: 1.102.0 이상
- **Node.js**: 20.x 이상
- **TypeScript**: 5.8.3 이상
- **Git**: 저장소 필수

### 개발 명령어
```bash
# 개발 모드 실행
npm run watch

# 컴파일
npm run compile  

# 린트 검사
npm run lint

# 테스트 실행
npm test

# VSIX 패키지 생성
vsce package
```

## 📋 주요 메트릭 (Key Metrics)
### 📊 **기본 통계**
- 총 커밋 수 및 수정된 파일 수
- 일평균 커밋 수 및 최고 기록
- 활성 개발자 수 및 TOP 기여자

### 👥 **작성자 분석**
- 개발자별 커밋 수, 파일 수, 코드 라인 변경량
- 기여도 퍼센티지 및 순위
- 첫 커밋/마지막 커밋 날짜
- 일평균 커밋 수

### 📁 **파일 타입 분석**
- 확장자별 커밋 분포
- 프로그래밍 언어별 활동량
- Frontend/Backend/Mobile 카테고리 분류

### ⏰ **시간 패턴 분석**
- 시간대별/요일별 활동 분포
- 야간 작업 비율 (22시-06시)
- 주말 작업 비율
- 핵심 근무시간 (연속 8시간 구간)
- 작업 패턴 분류: 🦉야간형 🏖️주말형 🏢정규형 ⚖️균형형

## 🤝 기여 방법 (Contributing)
1. 저장소를 Fork
2. 새로운 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 🐛 버그 리포트 (Bug Reports)
버그를 발견하셨나요? [Issues](https://github.com/jiwan8985/git-metrics-dashboard/issues)에서 다음 정보와 함께 제보해주세요:
- VSCode 버전
- Extension 버전
- Git 저장소 정보
- 재현 단계
- 예상 결과 vs 실제 결과

## 🔮 로드맵 (Roadmap)
### 🚧 개발 예정 기능
- [ ] 📤 **리포트 내보내기** (PDF, PNG, CSV)
- [ ] 📊 **커스텀 대시보드** 위젯 구성
- [ ] 🔔 **슬랙/팀즈 통합** 알림
- [ ] 📈 **트렌드 예측** AI 분석
- [ ] 🌐 **웹 대시보드** 공유 기능
- [ ] 📱 **모바일 알림** 지원
- [ ] 🎨 다크/라이트 테마 커스터마이징
- [ ] 🔍 고급 필터링 및 검색
- [ ] 📊 커스텀 메트릭 정의
- [ ] 🏆 개발자 뱃지 시스템

## 📄 라이센스 (License)
이 프로젝트는 [MIT License](LICENSE) 하에 배포됩니다.

## 👏 감사 인사 (Acknowledgments)
- [Chart.js](https://www.chartjs.org/) - 데이터 시각화
- [VSCode Extension API](https://code.visualstudio.com/api) - Extension 개발 프레임워크
- Git 커뮤니티의 모든 기여자들

---
<div align="center">

**⭐ 이 프로젝트가 유용하다면 별표를 눌러주세요! ⭐**
Made with ❤️ by developers, for developers
[🐛 버그 리포트](https://github.com/jiwan8985/git-metrics-dashboard/issues) | [💡 기능 제안](https://github.com/jiwan8985/git-metrics-dashboard/issues) | [📖 문서](https://github.com/jiwan8985/git-metrics-dashboard/wiki)
</div> -->

# 📊 Git Metrics Dashboard

팀의 Git 활동을 실시간으로 분석하고 시각화하는 VSCode Extension  
Real-time Git activity analysis and visualization for development teams

## ✨ 주요 기능

### 📈 커밋 트렌드 분석
- 최근 7일/30일/90일 커밋 트렌드를 라인 차트로 시각화
- 일평균 커밋 수, 최고 기록 등 핵심 메트릭 제공
- Interactive line chart showing commit trends over 7/30/90 days

### 👥 팀원별 기여도 추적
- 개발자별 커밋 수, 수정 파일 수, 코드 라인 변경량 추적
- 개인별 작업 패턴 및 활동 주기 분석
- Team member contribution ranking with medal system

### 💻 프로그래밍 언어 분석
- 20+ 프로그래밍 언어 자동 인식 및 분류
- Frontend/Backend/Mobile/Database 카테고리별 활동 분포
- 언어별 색상 코딩 및 아이콘으로 직관적 표시
- Technology stack analysis with 20+ programming languages

### ⏰ 시간대별 활동 패턴
- 24시간 레이더 차트로 시간대별 활동 패턴
- 요일별 폴라 차트로 주간 작업 분포
- 히트맵으로 요일×시간 매트릭스 시각화
- 야간형/주말형/정규형/균형형 작업 스타일 자동 분류
- Comprehensive time-based activity analysis with heatmaps

### 🔄 실시간 자동 업데이트
- 10초~5분 간격으로 자동 업데이트
- 실시간 카운트다운 및 상태 표시
- 팀 모니터링용 대시보드 모드
- Real-time auto-refresh with countdown timer

### 📤 **NEW! 리포트 내보내기 기능**
- **PDF 내보내기**: 전체 대시보드를 상세한 PDF 리포트로 생성
  - 요약 통계, 기여자 순위, 언어 분포 포함
  - 작업 패턴 분석 및 시간대별 통계
  - 프린트 및 공유에 최적화된 레이아웃
- **PNG 내보내기**: 대시보드를 고해상도 이미지로 캡처
  - 프레젠테이션 및 문서 삽입용
  - 웹뷰에서 직접 캡처 기능
- **CSV 내보내기**: 모든 데이터를 구조화된 CSV 파일로 추출
  - Excel, Google Sheets 등에서 추가 분석 가능
  - Raw 커밋 데이터 포함 옵션

## 🚀 설치 방법

### VSCode Marketplace에서 설치
1. VSCode Extensions 탭 열기
2. "Git Metrics Dashboard" 검색
3. Install 버튼 클릭

### 개발 환경 설정
```bash
# 저장소 클론
git clone https://github.com/jiwan8985/git-metrics-dashboard.git
cd git-metrics-dashboard

# 의존성 설치
npm install

# 컴파일
npm run compile
```

## 📖 사용 방법

1. Git 저장소가 있는 VSCode 워크스페이스 열기
2. 명령 팔레트(`Ctrl+Shift+P`) 열기
3. "📊 Git Metrics Dashboard 열기" 명령 실행
4. 대시보드에서 다양한 메트릭 확인

### 리포트 내보내기
1. 대시보드 우측 상단의 "📤 내보내기" 버튼 클릭
2. 원하는 형식 선택:
   - 📑 PDF - 전체 리포트
   - 🖼️ PNG - 이미지 캡처
   - 📊 CSV - 데이터 파일
3. 저장 위치는 `[프로젝트폴더]/git-metrics-reports/`

## ⚙️ 설정

```json
// settings.json
{
    "gitMetrics.defaultPeriod": 30,           // 기본 분석 기간 (일)
    "gitMetrics.autoRefresh": true,           // 자동 새로고침 활성화
    "gitMetrics.autoRefreshInterval": 30,     // 새로고침 간격 (초)
    "gitMetrics.maxTopFiles": 10,             // 상위 파일 표시 개수
    "gitMetrics.enableNotifications": true    // 새로고침 알림 표시
}
```

## 📊 대시보드 구성

```
┌────────────────────────────────────────────────────────────────
│ 📊 Git Metrics Dashboard 🔄 자동 ⏱️30초           [📤 내보내기]
├────────────────────────────────────────────────────────────────
│ 🔥 총 커밋: 247  📁 파일: 89  📊 일평균: 8.2  🏆 최고: 23
│ 👥 개발자: 5명  🥇 TOP: Alice  📁 주력: .ts  ⏰ 피크: 14시
├────────────────────────────────────────────────────────────────
│ 📈 [일별 커밋 추이 라인 차트]
│ 👥 [작성자별 기여도 바 차트]  
│ 💻 [프로그래밍 언어 도넛 차트]  📊 [카테고리별 바 차트]
│ 🕐 [24시간 레이더 차트]  📅 [요일별 폴라 차트]
│ 🔥 [활동 히트맵 - 요일×시간 매트릭스]
└────────────────────────────────────────────────────────────────
```

## 🏷️ 언어 카테고리

**Frontend**: 🟨 JavaScript ⚛️ React 🔷 TypeScript 💚 Vue.js  
**Backend**: 🐍 Python ☕ Java 🔵 Go 🦀 Rust 🐘 PHP  
**Mobile**: 🍎 Swift 🎯 Dart 📱 Kotlin  
**Database**: 🗃️ SQL 📋 JSON ⚙️ YAML  
**Scripts**: 🖥️ Shell 📄 Batch 💻 PowerShell  

## 📋 요구 사항

- VSCode: 1.74.0 이상
- Node.js: 16.x 이상
- Git: 저장소 필수

## 🛠️ 개발

```bash
# 개발 모드 실행
npm run watch

# 컴파일
npm run compile

# 린트 검사
npm run lint

# 테스트 실행
npm test

# VSIX 패키지 생성
vsce package
```

## 🎯 활용 사례

### 팀 리더 & 매니저
- 팀원별 작업량 및 기여도 모니터링
- 프로젝트 진행 상황 실시간 추적
- 코드 리뷰 우선순위 결정
- **주간/월간 리포트 생성 (PDF)**

### 개발자
- 개인 작업 패턴 분석 및 생산성 개선
- 기술 스택 다양성 확인
- 워라밸 균형 체크
- **포트폴리오용 활동 증명 (PNG/PDF)**

### 프로젝트 관리자
- 개발 속도 및 품질 메트릭 추적
- 리소스 배분 최적화
- 데드라인 관리 및 위험 요소 식별
- **이해관계자 보고서 작성 (PDF/CSV)**

## 🔮 향후 계획

- [x] 📤 리포트 내보내기 (PDF, PNG, CSV)
- [ ] 📊 커스텀 대시보드 위젯 구성
- [ ] 🔔 슬랙/팀즈 통합 알림
- [ ] 📈 트렌드 예측 AI 분석
- [ ] 🌐 웹 대시보드 공유 기능
- [ ] 📱 모바일 알림 지원
- [ ] 🎨 다크/라이트 테마 커스터마이징
- [ ] 🔍 고급 필터링 및 검색
- [ ] 📊 커스텀 메트릭 정의
- [ ] 🏆 개발자 뱃지 시스템

## 🤝 기여하기

1. 저장소를 Fork
2. 새로운 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 🐛 버그 제보

버그를 발견하셨나요? [Issues](https://github.com/jiwan8985/git-metrics-dashboard/issues)에서 다음 정보와 함께 제보해주세요:

- VSCode 버전
- Extension 버전  
- Git 저장소 정보
- 재현 단계
- 예상 결과 vs 실제 결과

## 📄 라이선스

이 프로젝트는 [MIT License](LICENSE) 하에 배포됩니다.

## 🙏 감사의 말

- [Chart.js](https://www.chartjs.org/) - 데이터 시각화
- [html2canvas](https://html2canvas.hertzen.com/) - PNG 내보내기
- [jsPDF](https://github.com/parallax/jsPDF) - PDF 생성
- [PapaParse](https://www.papaparse.com/) - CSV 처리
- [VSCode Extension API](https://code.visualstudio.com/api) - Extension 개발 프레임워크
- Git 커뮤니티의 모든 기여자들

---

Made with ❤️ by [jiwan8985](https://github.com/jiwan8985)