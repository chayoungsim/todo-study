# 새 Day 추가 방법

1. `src/content/day-01` 폴더를 복사해 `day-02`처럼 번호를 올려 만든다.
2. 네 파일을 수정한다.
   - `meta.ts`: 제목, 예상 소요 시간(분), 한 줄 요약
   - `lesson.md`: 개념 설명 (마크다운)
   - `example.tsx`: Sandpack 예제 (default export 컴포넌트)
   - `quiz.json`: 객관식 3~5문항 (`answer` 는 정답 보기 인덱스, 0부터)
3. 저장하면 코스 목록에 자동으로 나타난다. (로더 코드 수정 불필요)

폴더 이름은 반드시 `day-` 뒤에 숫자여야 한다. (`day-1`, `day-01` 모두 가능)
