// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useState } from "react";

// 커스텀 훅 1: 켜고 끄기
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn((prev) => !prev);
  return [on, toggle] as const;
}

// 커스텀 훅 2: 범위가 있는 카운터
function useCounter(initial = 0, { min = 0, max = 5 } = {}) {
  const [count, setCount] = useState(initial);
  const increase = () => setCount((c) => Math.min(c + 1, max));
  const decrease = () => setCount((c) => Math.max(c - 1, min));
  const reset = () => setCount(initial);
  return { count, increase, decrease, reset };
}

// 같은 훅을 쓰는 두 컴포넌트: 로직은 같지만 state 는 서로 독립이다.
function Counter({ label }: { label: string }) {
  const { count, increase, decrease, reset } = useCounter(2);
  return (
    <p>
      {label}: {count}{" "}
      <button onClick={decrease}>-</button>
      <button onClick={increase}>+</button>
      <button onClick={reset}>초기화</button>
    </p>
  );
}

export default function App() {
  const [open, toggleOpen] = useToggle();

  return (
    <div>
      <h1>커스텀 훅</h1>
      <Counter label="카운터 A" />
      <Counter label="카운터 B" />

      <button onClick={toggleOpen}>{open ? "설명 접기" : "설명 펼치기"}</button>
      {open && <p>A 를 올려도 B 는 변하지 않습니다. 호출마다 state 가 따로입니다.</p>}
    </div>
  );
}
