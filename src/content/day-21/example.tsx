// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useEffect, useRef } from "react";
import { create } from "zustand";

// 렌더링 횟수 배지 (Day 11 과 같은 방식: effect 안에서 세어 DOM 에 표시)
function RenderBadge() {
  const spanRef = useRef<HTMLSpanElement>(null);
  const renders = useRef(0);
  useEffect(() => {
    renders.current += 1;
    if (spanRef.current) spanRef.current.textContent = `렌더링 ${renders.current}회`;
  });
  return <span ref={spanRef} />;
}

// 스토어: 상태와 그것을 바꾸는 action 을 함께 둔다. Provider 는 필요 없다.
interface AppState {
  count: number;
  name: string;
  increment: () => void;
  reset: () => void;
  toggleName: () => void;
}

const useAppStore = create<AppState>()((set) => ({
  count: 0,
  name: "손님",
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }), // set 은 병합하므로 name 은 그대로다.
  toggleName: () => set((state) => ({ name: state.name === "손님" ? "회원" : "손님" })),
}));

// selector 로 count 만 구독한다. name 이 바뀌어도 다시 렌더링되지 않는다.
function CountView() {
  const count = useAppStore((state) => state.count);
  return (
    <p>
      카운트: {count} <RenderBadge />
    </p>
  );
}

// name 만 구독한다. count 가 바뀌어도 다시 렌더링되지 않는다.
function NameView() {
  const name = useAppStore((state) => state.name);
  return (
    <p>
      이름: {name} <RenderBadge />
    </p>
  );
}

// action 만 가져오는 컴포넌트: action 은 바뀌지 않으므로 상태가 바뀌어도 렌더링되지 않는다.
function Controls() {
  const increment = useAppStore((state) => state.increment);
  const reset = useAppStore((state) => state.reset);
  const toggleName = useAppStore((state) => state.toggleName);
  return (
    <p>
      <button onClick={increment}>+1</button>
      <button onClick={reset}>카운트 초기화</button>
      <button onClick={toggleName}>이름 바꾸기</button> <RenderBadge />
    </p>
  );
}

export default function App() {
  return (
    <div>
      <h1>Zustand</h1>
      <CountView />
      <NameView />
      <Controls />
      <small>
        개발 모드(StrictMode)라 횟수가 2회부터 시작합니다. 버튼을 눌렀을 때 어느 컴포넌트만
        늘어나는지 비교하세요.
      </small>
    </div>
  );
}
