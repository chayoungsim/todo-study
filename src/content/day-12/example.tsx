// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// 렌더링 횟수 배지 (effect 안에서 세어 DOM 에 표시)
function RenderBadge() {
  const spanRef = useRef<HTMLSpanElement>(null);
  const renders = useRef(0);
  useEffect(() => {
    renders.current += 1;
    if (spanRef.current) spanRef.current.textContent = `렌더링 ${renders.current}회`;
  });
  return <span ref={spanRef} />;
}

interface ButtonProps {
  label: string;
  onClick: () => void;
}

// 같은 memo 컴포넌트에 함수 props 를 두 가지 방식으로 넘겨 비교한다.
const ActionButton = memo(function ActionButton({ label, onClick }: ButtonProps) {
  return (
    <p>
      <button onClick={onClick}>{label}</button> <RenderBadge />
    </p>
  );
});

const words = ["apple", "banana", "grape", "melon", "orange", "peach"];

export default function App() {
  const [count, setCount] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [log, setLog] = useState("");

  // 매 렌더링마다 새 함수 → memo 가 무력화된다.
  const plainHandler = () => setLog("일반 함수 클릭");

  // useCallback: 같은 함수 참조를 유지 → memo 가 동작한다.
  const stableHandler = useCallback(() => setLog("useCallback 함수 클릭"), []);

  // useMemo: keyword 가 바뀔 때만 다시 필터링한다.
  const filtered = useMemo(
    () => words.filter((w) => w.includes(keyword)),
    [keyword],
  );

  return (
    <div>
      <h1>useMemo / useCallback</h1>
      <button onClick={() => setCount((c) => c + 1)}>부모 count: {count}</button>

      <ActionButton label="일반 함수 전달" onClick={plainHandler} />
      <ActionButton label="useCallback 전달" onClick={stableHandler} />
      <p>{log}</p>
      <small>
        개발 모드(StrictMode)에서는 처음 마운트 때 effect 가 두 번 실행되어 횟수가 2회부터
        시작합니다. 숫자 자체보다 클릭할 때 <b>얼마나 늘어나는지</b>를 비교하세요.
      </small>

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="검색어"
      />
      <p>결과: {filtered.join(", ") || "없음"}</p>
    </div>
  );
}
