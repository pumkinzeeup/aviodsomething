# 비둘기 피하기 - GitHub Pages 모바일 버전

## 실행
`index.html`을 GitHub Pages로 배포하면 됩니다.

## 이미지 교체
`assets/` 안의 파일을 같은 파일명으로 교체하세요.

- `player.png` : 플레이어
- `pigeon.png` : 비둘기
- `samgyeopsal.png` : 목숨 +1 아이템
- `background.png` : 게임 배경

## 권장 이미지 크기
- player.png: 256×256 PNG
- pigeon.png: 256×256 PNG
- samgyeopsal.png: 256×256 PNG
- background.png: 1080×1920 PNG/JPG (9:16)

캐릭터 이미지는 투명 PNG를 권장합니다.

## 게임오버
게임이 끝나면 `다시하기`와 `𝕏 트위터 공유하기` 버튼이 동시에 표시됩니다.
공유 버튼은 현재 게임 페이지 URL과 점수를 포함한 X(Twitter) 게시글 작성 화면을 엽니다.

## 화면 구성
- HUD에는 점수 / 목숨 / 레벨만 표시됩니다.
- 게임 영역은 9:16 세로 비율을 유지합니다.
- 화면 전체 뒤에는 `background.png`가 약 50px 블러 처리되어 깔립니다.
- 뒤쪽 배경은 약 80%가 보이지 않도록 어둡게 오버레이됩니다.
- 실제 게임 영역의 배경은 기존 `background.png`를 그대로 사용합니다.

## 제목 이미지
`assets/title.png`에 원하는 제목 PNG를 넣으면 헤더 상단에 표시됩니다.
- 투명 PNG 권장
- 가로형 제목 이미지 권장
- 표시 높이는 약 58px이며 화면 폭에 맞춰 자동으로 축소됩니다.

## 폰트
전체 UI는 Google Fonts의 개구쟁이(Gaegu), weight 700을 사용합니다.

## 목숨 표시
목숨은 숫자 대신 하트 3개로 표시됩니다.
- 시작: ♥ ♥ ♥
- 한 번 피격: ♥ ♥ ♡
- 두 번 피격: ♥ ♡ ♡
- 세 번 피격: ♡ ♡ ♡ → GAME OVER

점수 / 목숨 / 레벨에는 검정색 약 3px 외곽선과 그림자가 적용됩니다.
