// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { memo, useEffect, useRef, useState } from "react";

// 렌더링 횟수를 보여주는 배지.
// 렌더링 중에 ref 를 쓰면 안 되므로, effect 안에서 세고 DOM 에 직접 표시한다.
function RenderBadge() {
  const spanRef = useRef<HTMLSpanElement>(null);
  const renders = useRef(0);
  useEffect(() => {
    renders.current += 1; // 렌더링이 끝날 때마다 실행(의존성 없음)
    if (spanRef.current) spanRef.current.textContent = `렌더링 ${renders.current}회`;
  });
  return <span ref={spanRef} data-testid="badge" />;
}

// 일반 자식: 부모가 렌더링되면 같이 렌더링된다.
function PlainChild({ label }: { label: string }) {
  return (
    <p>
      {label} <RenderBadge />
    </p>
  );
}

// memo 자식: props 가 같으면 건너뛴다.
const MemoChild = memo(function MemoChild({ label }: { label: string }) {
  return (
    <p>
      {label} <RenderBadge />
    </p>
  );
});

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>리렌더링 비교</h1>
      <button onClick={() => setCount((c) => c + 1)}>부모 count: {count}</button>
      <PlainChild label="일반 자식" />
      <MemoChild label="memo 자식" />
      <small>
        개발 모드(StrictMode)에서는 처음 마운트 때 effect 가 두 번 실행되어 횟수가 2회부터
        시작합니다. 숫자 자체보다 클릭할 때 <b>얼마나 늘어나는지</b>를 비교하세요.
      </small>
    </div>
  );
}
