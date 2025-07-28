# 🚀 Git Metrics Dashboard - 빠른 시작 가이드

## 📦 설치 및 실행 (5분)

### 1. 저장소 클론
```bash
git clone https://github.com/jiwan8985/git-metrics-dashboard.git
cd git-metrics-dashboard
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 아이콘 생성 (임시)
```bash
# Node.js로 간단한 아이콘 생성
node -e "
const fs = require('fs');
const { createCanvas } = require('canvas');
const canvas = createCanvas(128, 128);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#0078D4';
ctx.fillRect(0, 0, 128, 128);
ctx.fillStyle = 'white';
ctx.font = 'bold 60px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('📊', 64, 64);
fs.writeFileSync('./icon.png', canvas.toBuffer('image/png'));
console.log('icon.png created!');
"
```

### 4. 컴파일 및 실행
```bash
# 컴파일
npm run compile

# VSCode에서 프로젝트 열기
code .

# F5 키를 눌러 디버깅 시작
```

## 🎯 첫 사용

1. **새 VSCode 창이 열립니다** (Extension Development Host)
2. **Git 저장소 폴더 열기** (`File` → `Open Folder`)
3. **명령 팔레트 열기** (`Ctrl+Shift+P` 또는 `Cmd+Shift+P`)
4. **"Git Metrics Dashboard 열기"** 입력 및 실행
5. **대시보드가 표시됩니다!** 🎉

## 📤 리포트 내보내기 테스트

1. 대시보드 우측 상단의 **"📤 내보내기"** 버튼 클릭
2. 원하는 형식 선택:
   - **PDF**: 상세 리포트
   - **PNG**: 스크린샷
   - **CSV**: 데이터 파일
3. 파일이 `git-metrics-reports/` 폴더에 저장됨

## ⚙️ 설정 변경

`File` → `Preferences` → `Settings` → "Git Metrics" 검색

```json
{
  "gitMetrics.defaultPeriod": 30,
  "gitMetrics.autoRefresh": true,
  "gitMetrics.autoRefreshInterval": 30
}
```

## 🐛 문제 해결

### "Git 저장소가 없습니다" 에러
- Git이 초기화된 폴더인지 확인 (`git status`)
- `.git` 폴더가 있는지 확인

### 차트가 표시되지 않음
- 개발자 도구 열기 (`Help` → `Toggle Developer Tools`)
- Console 탭에서 에러 확인

### 컴파일 에러
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
npm run compile
```

## 📱 빠른 개발 팁

### 자동 컴파일
```bash
# 별도 터미널에서 실행
npm run watch
```

### 웹뷰 새로고침
- 대시보드에서 `Ctrl+R` (새로고침)
- 또는 "🔄 새로고침" 버튼 클릭

### 로그 확인
```typescript
// extension.ts에 추가
console.log('Debug:', yourVariable);
```
개발자 도구의 Console에서 확인

## 🚢 배포 준비

### 1. VSIX 파일 생성
```bash
# vsce 설치
npm install -g vsce

# 패키지 생성
vsce package
```

### 2. 로컬 테스트
1. VSCode에서 `Extensions` 탭 열기
2. `...` 메뉴 → `Install from VSIX...`
3. 생성된 `.vsix` 파일 선택

### 3. Marketplace 배포
```bash
vsce publish
```

## 📚 다음 단계

- [README.md](README.md) - 전체 기능 문서
- [DEPLOYMENT.md](DEPLOYMENT.md) - 상세 배포 가이드
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - 코드 구조 이해

---

**도움이 필요하신가요?** 
- 📧 Issues: https://github.com/jiwan8985/git-metrics-dashboard/issues
- 💬 Discussions: https://github.com/jiwan8985/git-metrics-dashboard/discussions

Happy Coding! 🎉