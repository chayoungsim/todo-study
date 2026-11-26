## State란?

props가 부모에게서 받는 읽기 전용 값이라면, **state**는 컴포넌트가 스스로 기억하는 **변하는 값**입니다.
state가 바뀌면 React가 컴포넌트를 다시 그려(리렌더링) 화면이 갱신됩니다.

## useState

`useState`는 `[현재 값, 값을 바꾸는 함수]` 한 쌍을 돌려줍니다.

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0); // 초기값 0

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}번 클릭
    </button>
  );
}
```

일반 변수(`let count = 0`)를 바꾸면 화면이 갱신되지 않습니다.
React에게 "값이 바뀌었으니 다시 그려라"라고 알리는 방법이 `setCount`입니다.

## 이벤트 처리

이벤트는 camelCase 속성에 **함수를 넘겨서** 처리합니다. 함수를 호출하는 것이 아니라 **넘기는 것**임에 주의하세요.

```tsx
<button onClick={handleClick}>   {/* 올바름: 함수를 넘김 */}
<button onClick={handleClick()}> {/* 잘못됨: 렌더링 중에 바로 실행됨 */}
```

값을 넘겨야 할 때는 화살표 함수로 감쌉니다.

```tsx
<button onClick={() => remove(id)}>삭제</button>
```

## 이전 값을 기준으로 바꾸기

새 값이 이전 값에 의존하면 **함수형 업데이트**를 씁니다. 한 번의 이벤트에서 여러 번 갱신해도 안전합니다.

```tsx
setCount((prev) => prev + 1);
```

## 객체와 배열은 새로 만들어서 바꾸기

state를 직접 수정(`items.push(...)`)하면 React가 변경을 알아채지 못합니다.
**새 배열/객체**를 만들어 `set` 함수에 넘기세요.

```tsx
setItems([...items, newItem]);          // 추가
setItems(items.filter((i) => i.id !== id)); // 삭제
```

## 오늘의 정리

- state는 컴포넌트가 기억하는 변하는 값이고, 바뀌면 리렌더링된다.
- `useState`는 `[값, set 함수]`를 반환한다.
- 이벤트에는 함수를 **넘긴다**. 호출하지 않는다.
- 이전 값 기반 갱신은 `set((prev) => ...)`, 배열/객체는 새로 만들어 교체한다.
