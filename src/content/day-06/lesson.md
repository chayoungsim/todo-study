## 왜 커스텀 훅인가?

`useState`와 `useEffect`로 컴포넌트를 만들다 보면 **같은 상태 로직이 여러 컴포넌트에서 반복**됩니다.
화면(JSX)은 컴포넌트로 재사용하듯, **상태를 다루는 로직**은 **커스텀 훅**으로 재사용합니다.

## 만드는 방법

이름이 `use`로 시작하는 평범한 함수를 만들고, 그 안에서 다른 훅을 호출하면 끝입니다.

```tsx
import { useState } from "react";

function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn((prev) => !prev);
  return [on, toggle] as const;
}
```

사용하는 쪽은 내장 훅처럼 호출합니다.

```tsx
function Panel() {
  const [open, toggleOpen] = useToggle();
  return (
    <>
      <button onClick={toggleOpen}>{open ? "접기" : "펼치기"}</button>
      {open && <p>내용</p>}
    </>
  );
}
```

## 상태는 공유되지 않는다

커스텀 훅은 **로직**을 공유할 뿐 **state를 공유하지 않습니다.**
훅을 호출할 때마다 독립적인 state가 새로 생깁니다.

```tsx
const [a, toggleA] = useToggle(); // a 와 b 는 서로 별개의 state
const [b, toggleB] = useToggle();
```

두 컴포넌트가 같은 값을 보게 하려면 state를 공통 부모로 끌어올리거나(상태 끌어올리기), 다음 단계에서 배울 전역 상태 관리를 사용합니다.

## 훅의 규칙

React는 훅이 **항상 같은 순서로 호출된다**고 믿고 동작합니다. 그래서 두 가지 규칙을 지켜야 합니다.

1. **최상위에서만 호출한다.** `if`, 반복문, 중첩 함수, 이벤트 핸들러 안에서 호출하지 않습니다.
2. **React 함수에서만 호출한다.** 컴포넌트나 다른 커스텀 훅 안에서만 호출합니다. 일반 함수에서는 안 됩니다.

```tsx
function Bad({ show }: { show: boolean }) {
  if (show) {
    const [n, setN] = useState(0); // 잘못됨: 조건 안에서 훅 호출
  }
}
```

`use` 접두사는 단순한 관례가 아니라 **린터가 이 함수를 훅으로 인식하고 규칙을 검사하게 하는 신호**입니다.

## 값과 함수를 돌려주는 방식

반환 형태는 자유입니다. 값이 두세 개면 배열(`useState`처럼 이름을 자유롭게 지을 수 있음), 많으면 객체를 씁니다.

```tsx
function useCounter(initial = 0, { min = 0, max = 10 } = {}) {
  const [count, setCount] = useState(initial);
  const increase = () => setCount((c) => Math.min(c + 1, max));
  const decrease = () => setCount((c) => Math.max(c - 1, min));
  const reset = () => setCount(initial);
  return { count, increase, decrease, reset };
}
```

## 언제 만들까?

- 같은 `useState` + `useEffect` 조합이 **두 곳 이상**에서 반복될 때
- 컴포넌트가 길어져 **"무엇을 하는지"** 보다 **"어떻게 하는지"** 가 눈에 띌 때

처음부터 미리 만들 필요는 없습니다. 반복이 보일 때 뽑아내세요.

## 오늘의 정리

- 커스텀 훅은 `use`로 시작하고 다른 훅을 호출하는 함수로, 상태 로직을 재사용한다.
- 로직은 공유하지만 state는 호출마다 독립적이다.
- 훅은 최상위에서, React 함수 안에서만 호출한다.
- 반복이 보일 때 뽑아낸다. 미리 만들지 않는다.
