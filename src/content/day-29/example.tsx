// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
// 하나의 장바구니를 "계산 / 로직 / 화면 조각 / 조립" 네 층으로 나눈 예제입니다.
import { memo, useReducer } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
}
interface CartItem extends Product {
  qty: number;
}

// ───────── 1) 계산: React 와 무관한 순수 함수. 입력 → 출력만 확인하면 테스트할 수 있다. ─────────
function calcSummary(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = subtotal >= 50000 ? Math.round(subtotal * 0.1) : 0; // 5만 원 이상 10% 할인
  return { subtotal, discount, total: subtotal - discount };
}

// ───────── 2) 로직: 상태와 변경 방법을 reducer + 커스텀 훅으로 모은다. ─────────
type Action =
  | { type: "add"; product: Product }
  | { type: "changeQty"; id: number; delta: number }
  | { type: "remove"; id: number };

function cartReducer(items: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "add": {
      const exists = items.some((i) => i.id === action.product.id);
      return exists
        ? items.map((i) => (i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i))
        : [...items, { ...action.product, qty: 1 }];
    }
    case "changeQty":
      return items
        .map((i) => (i.id === action.id ? { ...i, qty: i.qty + action.delta } : i))
        .filter((i) => i.qty > 0); // 0개가 되면 사라진다.
    case "remove":
      return items.filter((i) => i.id !== action.id);
  }
}

function useCart() {
  const [items, dispatch] = useReducer(cartReducer, []);
  return {
    items,
    summary: calcSummary(items),
    add: (product: Product) => dispatch({ type: "add", product }),
    changeQty: (id: number, delta: number) => dispatch({ type: "changeQty", id, delta }),
    remove: (id: number) => dispatch({ type: "remove", id }),
  };
}

// ───────── 3) 화면 조각: 받은 props 로 그리기만 한다. 상태도 계산도 모른다. ─────────
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

const CartRow = memo(function CartRow({
  item,
  onChangeQty,
  onRemove,
}: {
  item: CartItem;
  onChangeQty: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <li>
      {item.name} {won(item.price)} ×{" "}
      <button aria-label={`${item.name} 수량 감소`} onClick={() => onChangeQty(item.id, -1)}>
        -
      </button>{" "}
      <span aria-label={`${item.name} 수량`}>{item.qty}</span>{" "}
      <button aria-label={`${item.name} 수량 증가`} onClick={() => onChangeQty(item.id, 1)}>
        +
      </button>{" "}
      <button onClick={() => onRemove(item.id)}>삭제</button>
    </li>
  );
});

function Summary({ subtotal, discount, total }: ReturnType<typeof calcSummary>) {
  return (
    <dl>
      <dt>상품 합계</dt>
      <dd data-testid="subtotal">{won(subtotal)}</dd>
      <dt>할인</dt>
      <dd data-testid="discount">-{won(discount)}</dd>
      <dt>결제 금액</dt>
      <dd data-testid="total">
        <strong>{won(total)}</strong>
      </dd>
    </dl>
  );
}

const PRODUCTS: Product[] = [
  { id: 1, name: "마우스", price: 15000 },
  { id: 2, name: "키보드", price: 35000 },
  { id: 3, name: "모니터 받침대", price: 25000 },
];

// ───────── 4) 조립: 위 세 가지를 엮어 한 화면을 만든다. ─────────
export default function App() {
  const cart = useCart();

  return (
    <div>
      <h1>컴포넌트 설계</h1>
      <p>
        {PRODUCTS.map((p) => (
          <button key={p.id} onClick={() => cart.add(p)}>
            {p.name} 담기
          </button>
        ))}
      </p>
      {cart.items.length === 0 ? (
        <p>장바구니가 비어 있습니다.</p>
      ) : (
        <ul>
          {cart.items.map((item) => (
            <CartRow key={item.id} item={item} onChangeQty={cart.changeQty} onRemove={cart.remove} />
          ))}
        </ul>
      )}
      <Summary {...cart.summary} />
    </div>
  );
}
