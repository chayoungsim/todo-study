## 이 프로젝트가 이미 쓰고 있는 기능

Day 21에서 스토어의 기본을 배웠습니다. 이번에는 실제 앱에서 거의 항상 필요한 세 가지를 다룹니다.
이 사이트의 학습 기록도 오늘 배울 `persist`로 `localStorage`에 저장됩니다.

## 1. persist: 새로고침해도 상태를 유지하기

`persist` 미들웨어로 스토어를 감싸면, 상태가 바뀔 때마다 `localStorage`에 저장되고 앱을 다시 열 때 복원됩니다.

```tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "settings" }, // localStorage 의 키 이름
  ),
);
```

### 일부만 저장하기: partialize

함수(action)나 일시적인 값(로딩 중 여부)까지 저장할 필요는 없습니다. 저장할 필드만 골라 줍니다.

```tsx
{
  name: "todos",
  partialize: (state) => ({ todos: state.todos }), // todos 만 저장
}
```

### 버전 관리

저장 형식이 바뀌면 옛 데이터와 충돌합니다. `version`을 올리고 `migrate`로 변환할 수 있습니다.

```tsx
{ name: "todos", version: 2, migrate: (saved, version) => { /* 변환 */ return saved as State; } }
```

## 2. 비동기 action

action은 평범한 함수이므로 `async`로 만들 수 있습니다. 로딩 상태도 스토어에 함께 둡니다.

```tsx
loadSamples: async () => {
  set({ loading: true });
  const samples = await fetchSamples();
  set({ todos: samples, loading: false });
},
```

컴포넌트는 `loading` 값만 구독하면 되므로, Day 13처럼 effect와 `ignore` 플래그를 직접 관리하지 않아도 됩니다.
다만 캐싱, 재시도, 중복 요청 제거가 필요한 **서버 데이터**는 TanStack Query 같은 전용 도구가 더 알맞습니다. 스토어는 **클라이언트 상태**에 쓰세요.

## 3. 여러 값을 한꺼번에 구독하기: useShallow

한 번에 여러 값을 객체로 뽑으면 문제가 생깁니다.

```tsx
// 문제: 매번 새 객체를 반환 → 항상 "바뀐 것"으로 보여 불필요한 렌더링 반복
const { total, done } = useStore((s) => ({
  total: s.todos.length,
  done: s.todos.filter((t) => t.done).length,
}));
```

Day 11에서 배운 **참조 비교**의 함정입니다. `useShallow`로 감싸면 객체의 **각 필드를 얕게 비교**해서, 값이 같으면 같은 것으로 취급합니다.

```tsx
import { useShallow } from "zustand/react/shallow";

const { total, done } = useStore(
  useShallow((s) => ({
    total: s.todos.length,
    done: s.todos.filter((t) => t.done).length,
  })),
);
```

## 파생 값은 저장하지 않는다

`done` 같은 값은 `todos`에서 **계산할 수 있으므로** 스토어에 따로 저장하지 않습니다. (Day 4, Day 5에서 배운 원칙과 같습니다.)
저장해 두면 `todos`와 어긋날 위험만 생깁니다.

## 오늘의 정리

- `persist`로 상태를 `localStorage`에 저장하고, `partialize`로 저장할 필드만 고른다.
- 저장 형식이 바뀌면 `version`과 `migrate`를 쓴다.
- action은 `async`로 만들 수 있고, 로딩 상태도 스토어에 둔다.
- 여러 값을 객체로 뽑을 때는 `useShallow`로 감싼다. 파생 값은 저장하지 않고 계산한다.
