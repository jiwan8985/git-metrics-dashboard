# 📊 Git Metrics Dashboard

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-1.102.0+-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

Git 저장소의 커밋 통계와 메트릭을 시각적으로 분석하고, 다양한 형식으로 리포트를 내보낼 수 있는 VS Code 확장 프로그램입니다.

## ✨ 주요 기능

### 📈 대시보드 기능
- **실시간 Git 통계**: 커밋 수, 파일 변경, 개발자별 기여도 등
- **시각적 차트**: Chart.js를 활용한 인터랙티브 차트
- **개발자별 분석**: 순위, 기여도, 활동 패턴 분석
- **파일 타입별 분석**: **70+ 프로그래밍 언어** 지원
- **시간대별 분석**: 시간별, 요일별 활동 패턴
- **스마트 테마**: 다크/라이트 테마 완벽 지원

### 📄 리포트 내보내기
- **다양한 포맷 지원**: HTML, JSON, CSV, Markdown
- **테마 적용 리포트**: VS Code 테마를 리포트에 반영
- **사용자 정의 옵션**: 기간, 포함 섹션 선택 가능
- **프로페셔널 리포트**: 회사 보고서나 프로젝트 문서용
- **자동화 친화적**: JSON/CSV 형식으로 추가 분석 가능

## 🚀 설치 방법

1. VS Code Marketplace에서 "Git Metrics Dashboard" 검색
2. 설치 버튼 클릭
3. Git 저장소가 있는 워크스페이스에서 사용

## 📋 사용 방법

### 대시보드 사용
1. **상태바에서 실행**: `📊 Git Stats` 버튼 클릭
2. **명령 팔레트**: `Ctrl+Shift+P` → "Git Metrics Dashboard 열기"
3. **키보드 단축키**: `Ctrl+Shift+G` → `Ctrl+Shift+D`

### 테마 전환
1. **상태바 버튼**: 테마 버튼 클릭 (🔄 자동/☀️ 라이트/🌙 다크)
2. **키보드 단축키**: `Ctrl+Shift+G` → `Ctrl+Shift+T`

### 리포트 내보내기
1. **빠른 내보내기**:
   - 상태바의 `📄 Export` 버튼 클릭
   - 또는 `Ctrl+Shift+G` → `Ctrl+Shift+E`
   
2. **사용자 정의 내보내기**:
   - 명령 팔레트 → "사용자 정의 리포트 내보내기"
   - 분석 기간, 포맷, 포함 섹션 선택

3. **대시보드에서 내보내기**:
   - 대시보드 우상단 "📄 리포트 내보내기" 버튼## 📊 리포트 형식

### HTML 리포트
- 웹 브라우저에서 볼 수 있는 인터랙티브 리포트
- **테마 적용**: VS Code 테마를 리포트에 반영
- 프린트 친화적 디자인
- 회사 프레젠테이션이나 문서화에 적합

### JSON 리포트
- 프로그래밍적 처리를 위한 구조화된 데이터
- API 연동이나 추가 분석 도구와 연계 가능
- 자동화된 리포팅 시스템에 적합

### CSV 리포트
- Excel이나 Google Sheets에서 열기 가능
- 표 형식의 데이터 분석에 적합
- 통계 소프트웨어와 연동 가능

### Markdown 리포트
- GitHub README 스타일 문서
- 프로젝트 문서화에 적합
- 버전 관리 시스템에 포함 가능

## ⚙️ 설정 옵션

```json
{
  "gitMetrics.defaultPeriod": 30,                    // 기본 분석 기간 (일)
  "gitMetrics.maxTopFiles": 10,                      // 상위 파일 표시 개수
  "gitMetrics.theme": "auto",                        // 테마 설정 (auto/light/dark)
  "gitMetrics.export.defaultFormat": "html",         // 기본 내보내기 형식
  "gitMetrics.export.useThemeInReports": true,       // 리포트에 테마 적용
  "gitMetrics.export.autoOpenAfterExport": false,    // 내보내기 후 자동 열기
  "gitMetrics.export.customReportsPath": ""          // 사용자 정의 저장 경로
}

## 📁 리포트 저장 위치

리포트는 기본적으로 다음 위치에 저장됩니다:
```
프로젝트루트/
├── git-metrics-reports/
│   ├── git-metrics-report-2025-01-15-30days.html
│   ├── git-metrics-report-2025-01-15-30days.json
│   └── ...
```

## 🎯 사용 사례

### 팀 리더/매니저
- 팀원별 기여도 분석
- 프로젝트 진행 상황 모니터링
- 월별/분기별 리포트 생성

### 개발자
- 개인 개발 활동 추적
- 기술 스택 분석
- 작업 패턴 최적화

### 프로젝트 관리
- 코드베이스 건강도 체크
- 기술 부채 파악
- 리소스 배분 최적화

## 🔧 명령어

| 명령어 | 단축키 | 설명 |
|--------|--------|------|
| `gitMetrics.showDashboard` | `Ctrl+Shift+G` `D` | 대시보드 열기 |
| `gitMetrics.quickExport` | `Ctrl+Shift+G` `E` | 빠른 리포트 내보내기 |
| `gitMetrics.customExport` | - | 사용자 정의 리포트 내보내기 |
| `gitMetrics.openReportsFolder` | - | 리포트 폴더 열기 |

## 📸 스크린샷

### 대시보드

![Dashboard](images/dashboard-screenshot.png)
![Dashboard](images/dashboard-screenshot-2.png)
![Dashboard](images/dashboard-screenshot-3.png)
![Dashboard](images/dashboard-screenshot-4.png)

### HTML 리포트
![HTML Report](images/html-report-screenshot.png)

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🛠️ 문제 해결

### 일반적인 문제
리포트 내보내기가 작동하지 않는 경우:
1. Git 저장소인지 확인 (`git status` 명령어 실행)
2. 폴더 쓰기 권한 확인
3. VS Code를 관리자/sudo 권한으로 재시작
4. 설정에서 다른 저장 경로로 변경 시도

### 자주 묻는 질문
1. Git 저장소인지 확인
2. 분석 기간에 커밋이 있는지 확인
3. 파일 쓰기 권한 확인

### 차트가 표시되지 않을 때
1. 브라우저에서 JavaScript 활성화 확인
2. VS Code 재시작

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 확인하세요.

## 🙋‍♂️ 지원

- 🐛 **버그 리포트**: [GitHub Issues](https://github.com/jiwan8985/git-metrics-dashboard/issues)
- 💡 **기능 요청**: [GitHub Issues](https://github.com/jiwan8985/git-metrics-dashboard/issues)
- 📧 **문의**: jiwan8985@gmail.com

---

⭐ 이 확장 프로그램이 유용하다면 [GitHub](https://github.com/jiwan8985/git-metrics-dashboard)에서 스타를 눌러주세요!