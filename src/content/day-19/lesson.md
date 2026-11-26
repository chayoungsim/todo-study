## 지금까지의 폼 처리

Day 9에서는 폼을 이렇게 처리했습니다.

- 입력값마다 state를 만들고(제어 컴포넌트)
- `onSubmit`에서 `preventDefault()`를 호출하고
- 로딩 중인지, 에러가 났는지도 state로 직접 관리했습니다.

React 19는 이 흐름을 훨씬 단순하게 만드는 **폼 Actions**를 제공합니다.

## form의 action에 함수 넘기기

`<form>`의 `action`에 **함수**를 넘기면, 제출할 때 React가 그 함수를 호출하고 폼 데이터를 `FormData`로 건네줍니다.
`preventDefault()`를 직접 호출할 필요가 없습니다.

```tsx
async function subscribe(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  await api.subscribe(email);
}

<form action={subscribe}>
  <input name="email" />
  <button type="submit">구독</button>
</form>
```

Day 17의 **비제어 컴포넌트 + FormData** 방식이 그대로 쓰입니다. 입력마다 state를 만들 필요가 없습니다.

## useActionState: 결과 상태 관리

action의 결과(에러 메시지, 성공 여부)를 보관하려면 `useActionState`를 씁니다.

```tsx
const [state, formAction, isPending] = useActionState(action, initialState);
```

| 값 | 의미 |
|---|---|
| `state` | action이 **마지막으로 반환한 값** (처음에는 `initialState`) |
| `formAction` | `<form action={...}>`에 넘길 함수 |
| `isPending` | action이 **진행 중**인지 |

`action`은 `(이전 state, formData) => 새 state`의 모양입니다. (Day 8의 reducer와 닮았습니다.)

```tsx
interface State {
  message: string;
  error: boolean;
}

async function subscribeAction(prev: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "");
  if (!email.includes("@")) return { message: "올바른 이메일이 아닙니다.", error: true };
  await api.subscribe(email);
  return { message: `${email} 구독 완료!`, error: false };
}

function SubscribeForm() {
  const [state, formAction, isPending] = useActionState(subscribeAction, { message: "", error: false });

  return (
    <form action={formAction}>
      <input name="email" />
      <button type="submit" disabled={isPending}>
        {isPending ? "처리 중..." : "구독"}
      </button>
      {state.message && <p role={state.error ? "alert" : "status"}>{state.message}</p>}
    </form>
  );
}
```

로딩 state, 에러 state를 따로 만들 필요 없이 **action의 반환값 하나**로 정리됩니다.

## useFormStatus: 폼 안의 자식에서 상태 읽기

폼 **안쪽**의 자식 컴포넌트(예: 제출 버튼)가 진행 상태를 알아야 할 때, props로 `isPending`을 내리지 않고 `react-dom`의 `useFormStatus`로 직접 읽을 수 있습니다.

```tsx
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus(); // 가장 가까운 부모 <form> 의 상태
  return <button disabled={pending}>{pending ? "처리 중..." : "구독"}</button>;
}
```

`useFormStatus`는 반드시 `<form>` **안에 렌더링되는 컴포넌트**에서 호출해야 합니다.

## 알아둘 점

- action이 끝나면 React가 **비제어 입력창을 자동으로 초기화**합니다. 실패 시 입력값을 남기고 싶다면 action이 입력값을 `state`에 담아 반환하고, 입력창에 `defaultValue`로 다시 채웁니다.
- `isPending` 동안 같은 폼을 중복 제출하지 않도록 버튼을 비활성화하세요.
- 서버 컴포넌트(Next.js 등)의 Server Actions도 같은 `action` 개념을 씁니다.

## 오늘의 정리

- `<form action={함수}>`는 제출 시 `FormData`를 받아 호출되고, `preventDefault()`가 필요 없다.
- `useActionState`는 `[state, formAction, isPending]`을 주며, action의 반환값이 곧 상태다.
- `useFormStatus`는 폼 안쪽 자식 컴포넌트에서 `pending`을 읽게 해 준다.
- action 후 비제어 입력창은 초기화되므로, 남기려면 반환값으로 다시 채운다.
