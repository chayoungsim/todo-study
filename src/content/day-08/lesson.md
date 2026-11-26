## useState가 힘들어지는 순간

state가 하나이고 바꾸는 방법도 단순하면 `useState`로 충분합니다.
하지만 **여러 값이 얽혀 있고, 바꾸는 방법이 여러 가지**가 되면 이벤트 핸들러마다 `setState` 로직이 흩어져 읽기 어려워집니다.

`useReducer`는 "상태를 어떻게 바꾸는가"를 **reducer라는 함수 한 곳**에 모아 둡니다.

## 기본 형태

```tsx
const [state, dispatch] = useReducer(reducer, initialState);
```

- `state`: 현재 상태
- `dispatch`: "무슨 일이 일어났는지"를 **action**으로 알리는 함수
- `reducer`: `(현재 상태, action) => 새 상태`를 계산하는 함수

## reducer 작성하기

```tsx
interface State {
  count: number;
}

type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "set"; value: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "set":
      return { count: action.value };
  }
}
```

TypeScript의 **유니온 타입**으로 action을 정의하면, `switch`에서 `action.type`에 따라 `action.value` 같은 필드가 자동으로 좁혀지고, 빠뜨린 case는 컴파일 단계에서 잡힙니다.

## dispatch로 사용하기

컴포넌트는 "무엇을 할지"를 **설명**만 하고, 실제 계산은 reducer가 합니다.

```tsx
<button onClick={() => dispatch({ type: "increment" })}>+1</button>
<button onClick={() => dispatch({ type: "set", value: 10 })}>10으로</button>
```

## reducer의 규칙

reducer는 **순수 함수**여야 합니다.

- 같은 state와 action이면 항상 같은 결과를 반환한다.
- 기존 state를 **직접 수정하지 않고** 새 객체/배열을 반환한다.
- API 호출, 타이머, 랜덤 같은 **부수 효과를 넣지 않는다.**

```tsx
// 잘못됨: 기존 배열을 직접 수정
case "add":
  state.items.push(action.item);
  return state;

// 올바름: 새 배열을 반환
case "add":
  return { ...state, items: [...state.items, action.item] };
```

## useState vs useReducer

| | useState | useReducer |
|---|---|---|
| 알맞은 경우 | 독립적이고 단순한 값 | 여러 값이 얽힌 상태, 변경 방법이 많음 |
| 상태 변경 로직 | 이벤트 핸들러에 흩어짐 | reducer 한 곳에 모임 |
| 테스트 | 컴포넌트를 거쳐야 함 | reducer 만 따로 쉽게 테스트 |

처음에는 `useState`로 시작하고, 로직이 복잡해지면 `useReducer`로 옮기면 됩니다.

## 오늘의 정리

- `useReducer(reducer, 초기값)`은 `[state, dispatch]`를 반환한다.
- 컴포넌트는 `dispatch(action)`으로 일어난 일을 알리고, 계산은 reducer가 한다.
- reducer는 순수 함수이고, state를 직접 수정하지 않고 새 값을 반환한다.
- 변경 방법이 여러 가지로 늘어나면 `useReducer`가 코드를 정리해 준다.
