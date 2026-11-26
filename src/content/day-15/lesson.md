## 문제: 무거운 렌더링이 입력을 막는다

검색창에 글자를 입력할 때마다 수천 개 항목의 목록을 다시 그려야 한다고 해 봅시다.
목록 렌더링이 느리면 **입력창 자체가 버벅입니다.** 글자를 치는 것은 급한 일이고, 목록 갱신은 조금 늦어도 되는 일인데 React가 둘을 구분하지 못하기 때문입니다.

React 18부터는 **"급한 갱신"과 "급하지 않은 갱신"** 을 구분해서 알려줄 수 있습니다.

## useDeferredValue: 값을 뒤늦게 따라오게 하기

```tsx
const [query, setQuery] = useState("");
const deferredQuery = useDeferredValue(query); // query 를 "나중에" 따라오는 복사본

<input value={query} onChange={(e) => setQuery(e.target.value)} />
<SlowList keyword={deferredQuery} />
```

- `query`는 즉시 바뀌어 입력창이 바로 반응합니다.
- `deferredQuery`는 React가 **여유가 있을 때** 따라옵니다. 그 사이 목록은 이전 값으로 보입니다.

값을 **받기만 하는** 쪽(자식)에 적용하기 좋습니다.

```tsx
const isStale = query !== deferredQuery; // 따라오는 중이면 true
```

## useTransition: 상태 갱신을 "급하지 않음"으로 표시

```tsx
const [isPending, startTransition] = useTransition();

function selectTab(next: string) {
  startTransition(() => {
    setTab(next); // 이 갱신은 급하지 않다고 표시
  });
}
```

- `startTransition` 안의 갱신은 **낮은 우선순위**로 처리됩니다.
- 그 사이 다른 입력(클릭 등)이 들어오면 **진행 중이던 갱신을 버리고** 새 입력을 먼저 처리합니다.
- `isPending`이 `true`인 동안 "불러오는 중" 같은 표시를 할 수 있습니다.

상태를 **바꾸는** 코드에 접근할 수 있을 때 `useTransition`을, 값만 받을 때 `useDeferredValue`를 씁니다.

## Suspense와 함께

Day 14의 Suspense에서, 이미 화면에 보이는 내용이 **다시 fallback으로 바뀌어 깜빡이는** 일을 Transition이 막아 줍니다.
`startTransition`으로 갱신하면 React는 새 내용이 준비될 때까지 **이전 화면을 유지**합니다.

## 주의할 점

- 이 도구들은 **렌더링을 빠르게 만들지 않습니다.** 느린 렌더링을 뒤로 미룰 뿐입니다. 근본적으로 느리다면 먼저 계산 자체를 줄이세요(Day 11~12).
- `startTransition` 안에는 **동기 코드만** 넣습니다. 입력창의 `value`를 바꾸는 갱신은 Transition에 넣으면 안 됩니다. 입력이 막힙니다.

## 오늘의 정리

- 급한 갱신(입력)과 급하지 않은 갱신(무거운 목록)을 구분해 알려줄 수 있다.
- `useDeferredValue(value)`는 값이 나중에 따라오는 복사본을 준다. 값을 받기만 할 때 쓴다.
- `useTransition`은 `startTransition`으로 상태 갱신을 낮은 우선순위로 표시하고 `isPending`을 준다.
- 렌더링 자체가 빨라지는 것은 아니다. 입력이 끊기지 않게 하는 도구다.
