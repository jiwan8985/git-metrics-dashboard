# 🎨 Git Metrics Dashboard 아이콘 생성 가이드

## 📐 아이콘 요구사항

- **크기**: 128x128 픽셀 (정확히)
- **형식**: PNG
- **배경**: 투명 또는 단색
- **파일명**: `icon.png`
- **위치**: 프로젝트 루트 디렉토리

## 🎨 디자인 제안

### 컨셉
- 📊 차트/그래프 요소
- 🔄 Git 브랜치 심볼
- 📈 성장/분석을 나타내는 요소

### 색상 팔레트
```
주 색상: #0078D4 (VSCode 블루)
보조 색상: #F25022 (Git 오렌지)
배경: 투명 또는 #1E1E1E (다크 테마)
```

## 🛠️ 아이콘 생성 방법

### 1. 온라인 도구 사용
- [Canva](https://www.canva.com) - 무료 템플릿
- [Figma](https://www.figma.com) - 벡터 디자인
- [IconsFlow](https://iconsflow.com) - 아이콘 생성기

### 2. 디자인 도구 사용
```bash
# ImageMagick을 사용한 간단한 아이콘 생성
convert -size 128x128 xc:transparent \
  -fill '#0078D4' -draw 'rectangle 20,20 108,108' \
  -fill white -pointsize 80 -gravity center \
  -annotate +0+0 '📊' \
  icon.png
```

### 3. SVG를 PNG로 변환
```xml
<!-- icon.svg -->
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" fill="#0078D4" rx="16"/>
  <text x="64" y="64" font-size="60" text-anchor="middle" 
        dominant-baseline="middle" fill="white">📊</text>
</svg>
```

```bash
# SVG를 PNG로 변환
convert icon.svg -resize 128x128 icon.png
```

## 📝 임시 아이콘 생성

PowerShell 스크립트:
```powershell
# 간단한 아이콘 생성 (Windows)
Add-Type -AssemblyName System.Drawing

$bitmap = New-Object System.Drawing.Bitmap 128, 128
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# 배경
$graphics.Clear([System.Drawing.Color]::FromArgb(30, 120, 212))

# 텍스트
$font = New-Object System.Drawing.Font("Arial", 60, [System.Drawing.FontStyle]::Bold)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics.DrawString("GM", $font, $brush, 10, 20)

$bitmap.Save("icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()
```

Node.js 스크립트:
```javascript
// create-icon.js
const { createCanvas } = require('canvas');
const fs = require('fs');

const canvas = createCanvas(128, 128);
const ctx = canvas.getContext('2d');

// 배경
ctx.fillStyle = '#0078D4';
ctx.fillRect(0, 0, 128, 128);

// 텍스트
ctx.fillStyle = 'white';
ctx.font = 'bold 48px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('📊', 64, 64);

// PNG로 저장
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./icon.png', buffer);
```

## ✅ 체크리스트

- [ ] 128x128 픽셀 크기
- [ ] PNG 형식
- [ ] 파일명: icon.png
- [ ] 프로젝트 루트에 위치
- [ ] 배경 투명도 확인
- [ ] VSCode에서 테스트
- [ ] 다크/라이트 테마에서 가시성 확인

## 🎯 좋은 아이콘의 특징

1. **단순함**: 작은 크기에서도 인식 가능
2. **관련성**: Git과 메트릭을 연상시킴
3. **독특함**: 다른 확장과 구별됨
4. **일관성**: VSCode 디자인 가이드라인 준수

---

아이콘이 준비되면 프로젝트 루트에 `icon.png`로 저장하세요!