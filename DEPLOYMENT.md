# 🚀 Git Metrics Dashboard 배포 가이드

## 📋 배포 전 체크리스트

### 1. 코드 준비
- [ ] 모든 기능 테스트 완료
- [ ] TypeScript 컴파일 에러 없음
- [ ] ESLint 경고 해결
- [ ] 버전 번호 업데이트 (package.json)
- [ ] CHANGELOG.md 업데이트

### 2. 필수 파일 확인
- [ ] `icon.png` (128x128 픽셀) - 확장 프로그램 아이콘
- [ ] `README.md` - 완전한 문서
- [ ] `LICENSE` - MIT 라이선스
- [ ] `.vscodeignore` - 패키징 제외 파일 목록

## 🔧 빌드 및 패키징

### 1. 의존성 설치
```bash
npm install
```

### 2. 컴파일
```bash
npm run compile
```

### 3. 테스트 실행
```bash
npm test
```

### 4. VSIX 패키지 생성
```bash
# vsce 설치 (처음 한 번만)
npm install -g vsce

# 패키지 생성
vsce package
```

## 📤 VSCode Marketplace 배포

### 1. Personal Access Token 생성
1. https://dev.azure.com/[your-organization] 접속
2. User Settings → Personal Access Tokens
3. New Token 생성
   - Organization: All accessible organizations
   - Scopes: Marketplace → Manage

### 2. Publisher 생성/확인
1. https://marketplace.visualstudio.com/manage 접속
2. Publisher ID: `jiwan-dev` 확인

### 3. 배포
```bash
# 로그인
vsce login jiwan-dev

# 배포
vsce publish

# 또는 버전 자동 증가와 함께 배포
vsce publish minor  # 1.0.0 → 1.1.0
vsce publish patch  # 1.1.0 → 1.1.1
```

## 📊 배포 후 확인

1. **Marketplace 확인**
   - https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard
   - 설명, 스크린샷, 설치 수 확인

2. **설치 테스트**
   - VSCode에서 확장 프로그램 검색
   - 설치 및 기능 테스트

3. **사용자 피드백 모니터링**
   - GitHub Issues
   - Marketplace 리뷰

## 🔄 업데이트 배포

### 버전 관리
- **Major (x.0.0)**: 호환성이 깨지는 변경
- **Minor (0.x.0)**: 새로운 기능 추가
- **Patch (0.0.x)**: 버그 수정

### 업데이트 프로세스
1. 버전 번호 증가
2. CHANGELOG.md 업데이트
3. 컴파일 및 테스트
4. 새 VSIX 생성
5. `vsce publish` 실행

## 🐛 문제 해결

### 일반적인 문제

1. **"Missing publisher name" 에러**
   ```json
   // package.json에 추가
   "publisher": "jiwan-dev"
   ```

2. **"Icon not found" 에러**
   - 128x128 PNG 파일 생성
   - 프로젝트 루트에 `icon.png` 저장

3. **"Invalid manifest" 에러**
   - package.json 검증
   - 필수 필드 확인: name, version, engines

### 디버깅 팁
- `vsce ls` - 패키지에 포함될 파일 목록 확인
- `vsce package --yarn` - yarn 사용 시
- `--pre-release` 플래그로 프리릴리즈 배포

## 📈 마케팅 및 홍보

1. **README 최적화**
   - 명확한 기능 설명
   - 스크린샷/GIF 추가
   - 사용 예시 포함

2. **태그 설정**
   - git, metrics, dashboard, analytics, visualization

3. **소셜 미디어**
   - Twitter/LinkedIn 공유
   - Reddit (r/vscode)
   - Dev.to 블로그 포스트

## 📝 체크리스트 템플릿

```markdown
## Release v1.1.0 Checklist

- [ ] 기능 구현 완료
  - [ ] PDF 내보내기
  - [ ] PNG 내보내기
  - [ ] CSV 내보내기
- [ ] 테스트 완료
- [ ] 문서 업데이트
- [ ] 버전 번호 변경
- [ ] CHANGELOG 작성
- [ ] 컴파일 성공
- [ ] VSIX 생성
- [ ] Marketplace 배포
- [ ] 배포 확인
- [ ] 공지사항 작성
```

---

더 자세한 정보는 [VSCode Extension 공식 문서](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)를 참조하세요.