// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useSyncExternalStore } from "react";

// ---- 작은 전역 스토어: React 바깥에 있는 상태 ----
function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (updater: (prev: T) => T) => {
      state = updater(state); // 직접 수정하지 않고 새 객체로 교체한다.
      listeners.forEach((l) => l()); // 구독자에게 알린다.
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener); // 구독 해제
      };
    },
  };
}

type Store<T> = ReturnType<typeof createStore<T>>;

// selector 로 필요한 값만 구독한다. (그 값이 바뀔 때만 다시 렌더링)
function useStore<T, S>(store: Store<T>, selector: (s: T) => S): S {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()));
}

interface AppState {
  count: number;
  name: string;
}
const store = createStore<AppState>({ count: 0, name: "손님" });

// 서로 떨어진 컴포넌트들이 같은 스토어를 본다. (Context 도, props 도 필요 없다.)
function CountView() {
  const count = useStore(store, (s) => s.count);
  return <p>카운트: {count}</p>;
}

function Controls() {
  return (
    <p>
      <button onClick={() => store.setState((s) => ({ ...s, count: s.count + 1 }))}>+1</button>
      <button onClick={() => store.setState((s) => ({ ...s, count: 0 }))}>초기화</button>
    </p>
  );
}

function NameView() {
  const name = useStore(store, (s) => s.name);
  return (
    <p>
      이름: {name}{" "}
      <button onClick={() => store.setState((s) => ({ ...s, name: s.name === "손님" ? "회원" : "손님" }))}>
        이름 바꾸기
      </button>
    </p>
  );
}

export default function App() {
  return (
    <div>
      <h1>외부 스토어</h1>
      <CountView />
      <CountView />
      <Controls />
      <NameView />
    </div>
  );
}
