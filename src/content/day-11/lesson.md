## 컴포넌트는 언제 다시 렌더링될까?

React는 다음 경우에 컴포넌트 함수를 **다시 호출**(리렌더링)합니다.

1. 자기 **state가 바뀔 때**
2. **부모가 리렌더링될 때** (자식의 props가 그대로여도!)
3. 읽고 있는 **Context 값이 바뀔 때**

두 번째가 핵심입니다. 부모가 다시 그려지면 **자식은 기본적으로 모두 다시 그려집니다.**

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <Child /> {/* count 와 무관하지만 Parent 가 그려질 때마다 같이 그려진다 */}
    </>
  );
}
```

## 렌더링은 나쁜 것이 아니다

"다시 렌더링"은 **함수를 다시 호출해 결과를 계산**하는 것이지, 곧바로 화면(DOM)을 바꾸는 것이 아닙니다.
React는 이전 결과와 비교해 **실제로 달라진 부분만** DOM에 반영합니다. 대부분의 경우 리렌더링은 충분히 빠릅니다.

그래서 최적화는 **느려졌을 때** 하는 것입니다. 측정하지 않고 미리 `memo`를 붙이지 마세요.

## React.memo

`React.memo`로 감싼 컴포넌트는 **props가 이전과 같으면 리렌더링을 건너뜁니다.**

```tsx
const Child = memo(function Child({ label }: { label: string }) {
  return <p>{label}</p>;
});
```

props 비교는 `Object.is`(얕은 비교)로 합니다. 값이 같아 보여도 **새로 만든 객체/배열/함수는 매번 다른 값**으로 취급됩니다.

```tsx
<Child style={{ color: "red" }} />  // 렌더링마다 새 객체 → memo 효과 없음
<Child onClick={() => {}} />        // 렌더링마다 새 함수 → memo 효과 없음
```

이 문제를 푸는 도구가 다음 시간의 `useMemo`와 `useCallback`입니다.

## 자식을 children으로 받으면 다시 렌더링되지 않는다

`memo` 없이도 리렌더링을 줄이는 구조가 있습니다. 상태를 가진 컴포넌트가 **자식을 `children`으로 받으면**,
그 자식은 부모 쪽에서 이미 만들어져 전달되므로 상태가 바뀌어도 다시 계산되지 않습니다.

```tsx
function Counter({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      {children} {/* count 가 바뀌어도 다시 렌더링되지 않는다 */}
    </>
  );
}
```

state를 필요한 곳 **가까이로 내리는 것**이 `memo`보다 먼저 시도할 방법입니다.

## 오늘의 정리

- 컴포넌트는 state 변경, 부모 렌더링, Context 변경 때 다시 렌더링된다.
- 부모가 렌더링되면 자식은 props가 같아도 기본적으로 다시 렌더링된다.
- `React.memo`는 props가 같으면 리렌더링을 건너뛴다. 비교는 얕은 비교다.
- 새로 만든 객체/함수 props는 memo를 무력화한다.
- 최적화는 느려졌을 때 측정하고 하며, 먼저 state를 가까이로 내려 본다.
