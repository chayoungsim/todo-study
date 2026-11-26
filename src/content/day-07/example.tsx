// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { createContext, useContext, useState, type ReactNode } from "react";

interface CartValue {
  items: string[];
  add: (name: string) => void;
  clear: () => void;
}

// 1. Context 만들기
const CartContext = createContext<CartValue | null>(null);

// 2. Provider: state 를 가지고 값을 제공한다.
function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const add = (name: string) => setItems((prev) => [...prev, name]);
  const clear = () => setItems([]);
  return <CartContext value={{ items, add, clear }}>{children}</CartContext>;
}

// 3. 커스텀 훅으로 감싸서 사용하기 쉽게, Provider 밖 사용은 에러로 알린다.
function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("CartProvider 안에서 사용하세요.");
  return value;
}

// 서로 떨어진 두 컴포넌트가 props 전달 없이 같은 값을 본다.
function Header() {
  const { items } = useCart();
  return <h1>장바구니 ({items.length})</h1>;
}

function ProductList() {
  const { add } = useCart();
  return (
    <div>
      {["사과", "바나나", "포도"].map((name) => (
        <button key={name} onClick={() => add(name)}>
          {name} 담기
        </button>
      ))}
    </div>
  );
}

function CartSummary() {
  const { items, clear } = useCart();
  return (
    <div>
      <p>담긴 상품: {items.length === 0 ? "없음" : items.join(", ")}</p>
      <button onClick={clear}>비우기</button>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Header />
      <ProductList />
      <CartSummary />
    </CartProvider>
  );
}
