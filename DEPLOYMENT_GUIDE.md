# 🚀 VS Code Marketplace 배포 가이드

## 📋 배포 체크리스트

- ✅ 코드 컴파일: `npm run compile` (0 errors)
- ✅ 테스트: `npm run test:unit`
- ✅ Lint: `npm run lint` (0 warnings)
- ✅ 패키징: `npm run package`
- ✅ Version 업데이트: `0.0.9`
- ✅ CHANGELOG 업데이트
- ✅ Git 커밋 및 태그

---

## 🔑 Step 1: Personal Access Token (PAT) 생성

### Azure DevOps에서 PAT 생성하기

1. [Azure DevOps](https://dev.azure.com) 방문
2. **User Settings** → **Personal access tokens** 클릭
3. **New Token** 클릭
4. 다음과 같이 설정:
   - **Name**: `VS Code Marketplace Publishing`
   - **Organization**: `All accessible organizations`
   - **Expiration**: `1년` (또는 원하는 기간)
   - **Scopes**: `Marketplace` (Manage)

5. **Create** 클릭
6. **Token 값 복사** (나중에 사용할 예정)

⚠️ **주의**: 토큰은 한 번만 표시되므로 안전한 곳에 저장하세요!

---

## 🔐 Step 2: VSCE 인증

### 방법 1: vsce login 사용 (권장)

```bash
# 인증
vsce login jiwan-dev
# PAT를 입력하라는 메시지가 나타나면 1단계에서 복사한 토큰 붙여넣기

# 인증 확인
vsce verify-pat
```

### 방법 2: 직접 PAT 입력

```bash
vsce publish --pat <YOUR_PAT>
```

---

## 📤 Step 3: 배포 실행

### 옵션 A: 저장된 인증 사용

```bash
npm run publish
```

또는

```bash
vsce publish
```

### 옵션 B: 직접 PAT 입력

```bash
vsce publish --pat <YOUR_PAT>
```

### 옵션 C: 먼저 패키징 후 배포

```bash
# VSIX 파일 생성
npm run package

# 생성된 파일 배포
vsce publish -i git-metrics-dashboard-0.0.9.vsix --pat <YOUR_PAT>
```

---

## 📊 배포 진행 상황 확인

배포 후 다음에서 확인 가능합니다:

1. **VS Code Marketplace**
   - https://marketplace.visualstudio.com/items?itemName=jiwan-dev.git-metrics-dashboard

2. **VS Code 내부**
   - Extensions 탭에서 "Git Metrics Dashboard" 검색
   - 새 버전이 표시될 때까지 1-2시간 대기 필요

---

## 🔄 배포 후 확인

```bash
# 로컬 설치 테스트
vsce package git-metrics-dashboard-0.0.9.vsix
code --install-extension git-metrics-dashboard-0.0.9.vsix
```

---

## 🆘 문제 해결

### 오류: "Agent string value sent to Marketplace is not valid"
- **원인**: 버전이 semver 형식이 아님
- **해결**: package.json의 version을 `X.Y.Z` 형식으로 수정

### 오류: "Authentication failed"
- **원인**: PAT가 만료되었거나 잘못됨
- **해결**: Azure DevOps에서 새 PAT 생성

### 오류: "Repository not found"
- **원인**: package.json의 repository 정보가 잘못됨
- **해결**: 올바른 GitHub URL 확인

### 오류: "Icon not found"
- **원인**: images/icon.png 파일이 없음
- **해결**: 확장 폴더에 아이콘 파일 확인

---

## 📝 배포 후 작업

1. **GitHub Release 생성**
   ```bash
   git tag v0.0.9
   git push origin v0.0.9
   ```

2. **README 업데이트**
   - 새 기능 설명
   - 설치 가능 확인

3. **사용자 공지**
   - GitHub Releases
   - Changelog
   - 소셜 미디어

---

## 🎉 현재 배포 상태

**현재 버전**: v0.0.9
**상태**: 배포 준비 완료 ✅

### 필요한 정보
- Personal Access Token (PAT): **사용자가 제공 필요**

### 다음 단계
1. Azure DevOps에서 PAT 생성
2. `vsce login` 실행
3. `npm run publish` 실행

---

**배포 가이드 작성일**: 2025-11-24
**최초 배포 버전**: 0.0.9
