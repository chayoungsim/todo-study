## 문제: 두 컴포넌트가 같은 값을 봐야 한다

Day 6에서 커스텀 훅은 state를 **공유하지 않는다**고 배웠습니다.
그렇다면 헤더의 장바구니 개수와 상품 목록의 "담기" 버튼처럼, 서로 떨어진 컴포넌트가 **같은 값**을 보려면 어떻게 할까요?

## 1단계: 상태 끌어올리기 (Lifting State Up)

가장 가까운 **공통 부모**로 state를 올리고, 자식들에게는 props로 값과 변경 함수를 내려줍니다.

```tsx
function Shop() {
  const [count, setCount] = useState(0); // 공통 부모가 state 를 가진다

  return (
    <>
      <Header count={count} />
      <ProductList onAdd={() => setCount((c) => c + 1)} />
    </>
  );
}
```

데이터는 **위에서 아래로**(props), 변경 요청은 **아래에서 위로**(함수 호출) 흐릅니다. 이것이 React의 단방향 데이터 흐름입니다.

## 2단계: props 드릴링이라는 불편함

공통 부모와 값을 쓰는 컴포넌트 사이에 중간 컴포넌트가 여러 겹 끼어 있으면,
**자기는 쓰지도 않는 props를 계속 전달**해야 합니다. 이를 props 드릴링(prop drilling)이라고 부릅니다.

```tsx
<Page user={user}>        // user 를 쓰지 않지만 전달
  <Layout user={user}>    // 이것도 전달만
    <Sidebar user={user}> // 이것도 전달만
      <Avatar user={user} /> // 여기서야 사용
```

## 3단계: Context

**Context**는 중간 단계를 건너뛰고 멀리 있는 자손에게 값을 바로 전달하는 방법입니다. 세 단계로 씁니다.

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";

// 1. Context 만들기
interface CartValue {
  count: number;
  add: () => void;
}
const CartContext = createContext<CartValue | null>(null);

// 2. Provider 로 값을 제공하기
function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const add = () => setCount((c) => c + 1);
  return <CartContext value={{ count, add }}>{children}</CartContext>;
}

// 3. 자손에서 useContext 로 읽기
function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("CartProvider 안에서 사용하세요.");
  return value;
}
```

React 19부터는 `<CartContext.Provider>` 대신 `<CartContext value={...}>`로 바로 쓸 수 있습니다.

## 실전 패턴: Provider + 커스텀 훅

위처럼 `useContext`를 **커스텀 훅으로 감싸면** 두 가지 이점이 있습니다.

- 사용하는 쪽이 `useCart()` 한 줄이면 끝난다.
- Provider 밖에서 쓰면 **명확한 에러**로 바로 알려준다. (`null` 체크 덕분)

## 주의할 점

- Context 값이 **바뀌면, 그 값을 읽는 모든 컴포넌트가 다시 렌더링**됩니다. 자주 바뀌는 값을 큰 Context 하나에 몰아넣지 마세요.
- Context는 만능이 아닙니다. **가까운 컴포넌트끼리만** 공유한다면 상태 끌어올리기가 더 단순합니다.
- 테마, 로그인 사용자, 언어처럼 **앱 전반에서 읽는 값**에 어울립니다.

## 오늘의 정리

- 같은 값이 필요하면 state를 공통 부모로 끌어올린다.
- props가 여러 겹 전달되면 Context로 건너뛴다. `createContext` → Provider → `useContext`.
- `useContext`는 커스텀 훅으로 감싸 쓰고, Provider 밖 사용을 에러로 알린다.
- Context 값이 바뀌면 읽는 컴포넌트가 모두 다시 그려진다.
