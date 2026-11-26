// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useEffect, useRef, useState } from "react";

export default function App() {
  // 용도 1: DOM 요소 접근 (처음엔 null, 렌더링 후 요소를 가리킨다)
  const inputRef = useRef<HTMLInputElement>(null);

  // 용도 2: 타이머 id 보관 (화면에 쓰지 않으므로 state 가 아니라 ref)
  const timerId = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0); // 화면에 보여줄 값은 state
  const [running, setRunning] = useState(false);

  // 컴포넌트가 사라질 때 타이머 정리 (Day 4 의 cleanup)
  useEffect(() => {
    return () => {
      if (timerId.current !== null) clearInterval(timerId.current);
    };
  }, []);

  function start() {
    if (timerId.current !== null) return; // 이미 실행 중이면 무시
    timerId.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    setRunning(true);
  }

  function stop() {
    if (timerId.current !== null) clearInterval(timerId.current);
    timerId.current = null;
    setRunning(false);
  }

  return (
    <div>
      <h1>useRef</h1>

      <p>
        <input ref={inputRef} placeholder="여기에 입력해 보세요" />
        <button onClick={() => inputRef.current?.focus()}>입력창으로 포커스</button>
      </p>

      <p>스톱워치: {elapsed}초 ({running ? "실행 중" : "멈춤"})</p>
      <button onClick={start} disabled={running}>시작</button>
      <button onClick={stop} disabled={!running}>정지</button>
      <button onClick={() => setElapsed(0)}>초기화</button>
    </div>
  );
}
