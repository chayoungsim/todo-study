## useRef란?

`useRef`는 **렌더링 사이에 값을 기억**하되, 그 값이 바뀌어도 **다시 렌더링하지 않는** 상자를 만듭니다.

```tsx
const ref = useRef(0);

ref.current;      // 읽기
ref.current = 5;  // 쓰기 (화면은 다시 그려지지 않는다)
```

`useRef(초기값)`은 `{ current: 초기값 }` 객체를 돌려주고, 이 객체는 컴포넌트가 사라질 때까지 **같은 것**이 유지됩니다.

## state와의 차이

| | state | ref |
|---|---|---|
| 값이 바뀌면 | 다시 렌더링 | 렌더링 안 함 |
| 화면에 쓰는 값 | O | X |
| 읽고 쓰는 위치 | 어디서든 | 이벤트 핸들러나 effect 안 (렌더링 중에는 X) |

화면에 보여줘야 하는 값은 **state**, 화면과 무관하게 기억만 하면 되는 값은 **ref**입니다.

## 용도 1: DOM 요소에 접근하기

React가 화면을 그리는 선언적 방식으로 해결되지 않는 일(포커스, 스크롤 위치, 텍스트 선택 등)은 DOM 요소를 직접 다뤄야 합니다.
요소에 `ref`를 연결하면 `ref.current`가 그 DOM 요소를 가리킵니다.

```tsx
function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus(); // 화면에 나타나면 자동으로 포커스
  }, []);

  return <input ref={inputRef} />;
}
```

DOM이 만들어지기 전(렌더링 중)에는 `ref.current`가 `null`이므로 **`?.`로 null을 처리**하세요.

> 참고: 이 사이트의 코드 예제 미리보기는 별도의 iframe 안에서 실행되어, 브라우저 정책상 **사용자 조작 없이** 일어나는 포커스(위처럼 화면이 나타날 때 자동으로 주는 포커스)가 막힐 수 있습니다. 예제에서는 버튼을 눌러 포커스를 주는 방식으로 확인해 보세요.

## 용도 2: 타이머 id 같은 값 보관하기

`setInterval`이 돌려주는 id는 화면에 쓰지 않지만, 나중에 멈추려면 기억해 두어야 합니다. 이런 값이 ref에 딱 맞습니다.

```tsx
const timerId = useRef<number | null>(null);

function start() {
  timerId.current = window.setInterval(() => { /* ... */ }, 1000);
}
function stop() {
  if (timerId.current !== null) clearInterval(timerId.current);
  timerId.current = null;
}
```

## 렌더링 중에 ref를 읽고 쓰지 마세요

ref는 변경을 React에 알리지 않으므로, **렌더링 도중에** `ref.current`를 읽거나 쓰면 결과가 일관되지 않을 수 있습니다.
ref는 **이벤트 핸들러와 effect 안에서만** 사용하세요. 린터(`react-hooks/refs`)도 이를 경고합니다.

## ref를 남용하지 않기

DOM을 직접 바꾸는 코드(`ref.current.style.color = "red"`)는 React가 관리하는 화면과 어긋날 수 있습니다.
**포커스, 스크롤, 크기 측정**처럼 꼭 필요한 곳에만 쓰고, 화면 내용은 state로 표현하세요.

## 오늘의 정리

- `useRef`는 렌더링 사이에 값을 기억하지만, 바뀌어도 다시 렌더링하지 않는다.
- DOM 요소에 `ref`를 연결하면 포커스 같은 직접 조작이 가능하다. 초기값은 `null`이다.
- 타이머 id처럼 화면에 쓰지 않는 값은 ref에 보관한다.
- 렌더링 중이 아니라 이벤트 핸들러나 effect 안에서만 ref를 읽고 쓴다.
