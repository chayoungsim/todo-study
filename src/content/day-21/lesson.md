## 왜 상태 관리 라이브러리인가?

Day 7에서 Context로 멀리 있는 컴포넌트에 값을 전달했고, Day 18에서는 `useSyncExternalStore`로 **직접 스토어를 만들어** 봤습니다.
앱이 커지면 이런 필요가 반복됩니다.

- 여러 곳에서 읽고 쓰는 **전역 상태**(로그인 사용자, 장바구니, 설정)
- Provider를 겹겹이 감싸지 않고 쓰고 싶다
- **필요한 값만** 구독해 불필요한 리렌더링을 막고 싶다

**Zustand**는 Day 18에서 만든 구조를 다듬어 놓은 작고 단순한 라이브러리입니다. 이 프로젝트(React 데일리)도 진행 기록을 Zustand로 관리합니다.

## 스토어 만들기

```tsx
import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
```

- `create`가 **훅**(`useCounterStore`)을 돌려줍니다.
- 상태와 **그것을 바꾸는 함수(action)** 를 한 객체에 함께 둡니다.
- `set`은 상태를 **병합**합니다. 바꾸지 않을 필드는 그대로 남습니다.
- 이전 값이 필요하면 `set((state) => ...)`처럼 함수를 넘깁니다.
- TypeScript에서는 `create<State>()(...)`처럼 **괄호를 두 번** 씁니다.

## 컴포넌트에서 사용하기

Provider가 필요 없습니다. 훅을 호출하기만 하면 됩니다.

```tsx
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return <button onClick={increment}>{count}</button>;
}
```

## 핵심: selector

훅에 넘기는 `(state) => state.count`를 **selector**라고 합니다. 이 컴포넌트는 **selector가 돌려주는 값이 바뀔 때만** 다시 렌더링됩니다.

```tsx
const name = useStore((s) => s.name);   // name 이 바뀔 때만 렌더링
const all = useStore();                 // 피하세요: 아무 값이나 바뀌어도 렌더링
```

Day 11에서 배운 불필요한 리렌더링을 막는 가장 쉬운 방법입니다. **필요한 값만 골라 구독하세요.**

## 컴포넌트 밖에서도 쓸 수 있다

스토어는 React 밖에 있으므로, 훅이 아닌 방법으로도 접근합니다. (이벤트 핸들러, 유틸 함수, 라우터 로더 등)

```tsx
useCounterStore.getState().count;            // 현재 값 읽기 (구독 아님)
useCounterStore.getState().increment();      // action 호출
useCounterStore.setState({ count: 10 });     // 직접 설정
```

## Context와 비교

| | Context | Zustand |
|---|---|---|
| Provider | 필요 | 불필요 |
| 일부 값만 구독 | 어려움 (값이 바뀌면 전부 렌더링) | selector로 쉬움 |
| 컴포넌트 밖에서 접근 | 불가 | `getState()` |
| 용도 | 테마, 로케일 같은 거의 안 바뀌는 값 | 자주 바뀌는 앱 상태 |

## 주의할 점

- 전역 상태는 **정말 여러 곳에서 쓰는 값**에만 쓰세요. 한 컴포넌트나 가까운 몇 개만 쓰는 값은 `useState`와 상태 끌어올리기가 더 단순합니다.
- state는 직접 수정하지 말고 `set`으로만 바꿉니다. (불변성)
- selector에서 **새 객체나 배열을 만들어 반환**하면 매번 다른 값으로 보여 리렌더링이 반복될 수 있습니다. 원시값이나 저장된 값을 그대로 반환하세요.

## 오늘의 정리

- `create`로 상태와 action을 담은 스토어 훅을 만든다. Provider가 필요 없다.
- 컴포넌트에서는 `useStore((s) => s.값)`처럼 selector로 필요한 값만 구독한다.
- `set`은 상태를 병합하고, 컴포넌트 밖에서는 `getState()`, `setState()`를 쓴다.
- 전역 상태는 정말 공유되는 값에만 쓴다.
