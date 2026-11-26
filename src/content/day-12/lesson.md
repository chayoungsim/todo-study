## 참조가 매번 바뀌는 문제

Day 11에서 새로 만든 객체나 함수는 렌더링마다 **다른 값**으로 취급된다고 배웠습니다.

```tsx
function Parent() {
  const handleClick = () => { /* ... */ };  // 렌더링마다 새 함수
  return <MemoChild onClick={handleClick} />; // memo 가 소용없다
}
```

`useMemo`와 `useCallback`은 값과 함수를 **기억해서 같은 참조를 유지**하게 해 줍니다.

## useCallback: 함수를 기억한다

```tsx
const handleClick = useCallback(() => {
  console.log("클릭");
}, []); // 의존성이 바뀔 때만 새 함수를 만든다
```

`memo`로 감싼 자식에게 함수를 넘길 때 짝으로 씁니다. 함수 안에서 쓰는 props/state는 **의존성 배열에 모두** 적어야 합니다.

```tsx
const addTodo = useCallback((text: string) => {
  setTodos((prev) => [...prev, text]); // prev 를 쓰면 todos 를 의존성에 안 넣어도 된다
}, []);
```

## useMemo: 계산 결과를 기억한다

```tsx
const visible = useMemo(
  () => items.filter((item) => item.name.includes(keyword)),
  [items, keyword], // 이 값이 바뀔 때만 다시 계산한다
);
```

두 가지 경우에 씁니다.

1. **계산이 정말 무거울 때** (수천 개 항목 필터링·정렬 등)
2. 객체나 배열을 `memo` 자식의 props로 넘길 때, **참조를 유지**하려고

## 둘은 같은 도구다

`useCallback(fn, deps)`는 `useMemo(() => fn, deps)`와 같습니다. 함수를 기억하느냐, 값을 기억하느냐의 차이입니다.

## 남용하지 마세요

메모이제이션도 **비용**이 있습니다. 이전 값과 의존성을 저장하고 비교해야 합니다.
간단한 계산에 `useMemo`를 붙이면 오히려 코드만 복잡해지고 이득이 없습니다.

다음 경우가 아니라면 쓰지 않아도 됩니다.

- 측정해 보니 실제로 느린 계산
- `memo` 자식에게 넘기는 함수/객체 (그 `memo`가 실제 효과가 있을 때)
- 다른 훅(`useEffect` 등)의 **의존성**으로 쓰이는 함수/객체

## 의존성 배열을 정직하게 쓰기

의존성을 빼먹으면 **오래된 값을 기억하는 버그**가 생깁니다. 린터(`react-hooks/exhaustive-deps`)의 경고를 무시하지 마세요.

## 오늘의 정리

- `useCallback`은 함수를, `useMemo`는 계산 값을 기억해 같은 참조를 유지한다.
- `memo` 자식에게 함수/객체를 넘길 때 짝으로 쓰면 리렌더링을 막을 수 있다.
- 무거운 계산에는 `useMemo`를 쓴다.
- 의존성은 빠짐없이 적고, 간단한 곳에는 남용하지 않는다.
