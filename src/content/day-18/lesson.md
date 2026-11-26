## React 밖의 상태

지금까지의 state는 모두 React 안(`useState`, `useReducer`, Context)에 있었습니다.
그런데 상태가 **React 밖**에 있는 경우도 많습니다.

- 브라우저 API: `window.innerWidth`, 온라인 여부(`navigator.onLine`)
- 전역 스토어 라이브러리: Zustand, Redux 등
- 직접 만든 모듈 수준의 변수

이 값이 바뀌어도 React는 알지 못해 **화면이 갱신되지 않습니다.** React에게 "이 값을 구독해서, 바뀌면 다시 그려라"라고 알려 줄 도구가 필요합니다.

## useSyncExternalStore

```tsx
const value = useSyncExternalStore(subscribe, getSnapshot);
```

| 인자 | 역할 |
|---|---|
| `subscribe(callback)` | 외부 상태가 바뀔 때 `callback`을 호출하도록 등록하고, **구독 해제 함수**를 반환 |
| `getSnapshot()` | 외부 상태의 **현재 값**을 돌려준다 |

React는 `subscribe`로 변경을 감지하고, 바뀌면 `getSnapshot`을 다시 불러 값이 달라졌을 때만 다시 렌더링합니다.

## 예: 브라우저의 온라인 상태

```tsx
function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function useOnline() {
  return useSyncExternalStore(subscribe, () => navigator.onLine);
}
```

## 직접 만드는 작은 스토어

전역 스토어의 원리는 의외로 단순합니다. 상태, 구독자 목록, 변경 함수만 있으면 됩니다.

```tsx
function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (next: T) => {
      state = next;                       // 새 객체로 교체
      listeners.forEach((l) => l());      // 구독자에게 알린다
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener); // 구독 해제
    },
  };
}
```

그리고 React에서 쓰는 훅을 만듭니다.

```tsx
function useStore<T, S>(store: Store<T>, selector: (s: T) => S): S {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()));
}
```

Zustand 같은 라이브러리는 이 구조 위에 편의 기능을 얹은 것입니다.

## 중요한 규칙: getSnapshot은 안정적이어야 한다

`getSnapshot`은 상태가 **바뀌지 않았다면 항상 같은 값(같은 참조)** 을 돌려줘야 합니다.

```tsx
// 잘못됨: 호출할 때마다 새 객체 → 무한 렌더링
useSyncExternalStore(subscribe, () => ({ count: store.count }));

// 올바름: 저장된 값을 그대로 반환하거나, 원시값을 반환
useSyncExternalStore(subscribe, () => store.getState().count);
```

그래서 스토어의 상태는 **직접 수정하지 않고 새 객체로 교체**합니다. (Day 3, Day 8에서 배운 불변성과 같은 이유입니다.)

## 왜 useEffect + useState로 안 될까?

직접 구독을 구현하면 렌더링 도중 값이 바뀌는 경우, 같은 화면의 일부 컴포넌트는 새 값을, 일부는 옛 값을 보여주는 **불일치(tearing)** 가 생길 수 있습니다.
`useSyncExternalStore`는 이를 막아 모든 컴포넌트가 같은 값을 보게 보장합니다. 그래서 상태 라이브러리들이 내부에서 이 훅을 씁니다.

## 오늘의 정리

- React 밖의 상태는 `useSyncExternalStore(subscribe, getSnapshot)`으로 구독한다.
- `subscribe`는 변경 알림을 등록하고 해제 함수를 반환하며, `getSnapshot`은 현재 값을 돌려준다.
- `getSnapshot`은 상태가 같으면 같은 참조를 돌려줘야 하고, 스토어 상태는 새 객체로 교체한다.
- Zustand 같은 라이브러리는 이 구조를 바탕으로 만들어졌다.
