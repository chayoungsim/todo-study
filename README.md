# React 데일리

매일 하나씩 푸는 30일 React 학습 사이트입니다. 개인용이며 서버 없이 정적 사이트로 동작합니다.

## 기능

- 매일 하나의 학습(Day): 마크다운 설명 → 라이브 코드 예제(Sandpack) → 객관식 퀴즈
- 완료 기준 해금: Day N을 끝내면 Day N+1이 열립니다.
- 연속 학습일(streak)과 진행률
- 학습 기록은 브라우저 `localStorage`에 저장되며, 설정 화면에서 JSON으로 내보내기/가져오기 할 수 있습니다.
- 반응형, 다크모드

## 개발

```bash
npm install
npm run dev      # 개발 서버
npm test         # 단위 테스트 (해금, streak, 퀴즈 채점, 백업 검증)
npm run build    # 타입 검사 + 프로덕션 빌드
```

## 콘텐츠 추가

`src/content/day-NN/` 폴더를 추가하면 코드 수정 없이 코스 목록에 나타납니다.
자세한 방법은 `src/content/_template/README.md`를 참고하세요.

## 배포

Vercel에 정적 사이트로 배포합니다. `vercel.json`이 모든 경로를 `index.html`로 보내
`/days/1` 같은 주소를 직접 열거나 새로고침해도 동작합니다.

## 알아둘 점

- 학습 기록은 기기·브라우저별로 따로 저장됩니다. 다른 기기로 옮기려면 백업 파일을 사용하세요.
- 코드 예제 미리보기는 codesandbox.io 번들러를 쓰므로 인터넷 연결이 필요합니다.
