// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useState, type ReactNode } from "react";
import {
  MemoryRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";

const PRODUCTS = [
  { id: 1, name: "사과", category: "fruit" },
  { id: 2, name: "바나나", category: "fruit" },
  { id: 3, name: "당근", category: "vegetable" },
  { id: 4, name: "시금치", category: "vegetable" },
];
const CATEGORIES = ["all", "fruit", "vegetable"] as const;
type Category = (typeof CATEGORIES)[number];

// useSearchParams: 필터를 state 가 아니라 주소(?category=...)에 담는다.
function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // 주소의 값은 사용자가 바꿀 수 있으므로 검증한다.
  const raw = searchParams.get("category");
  const category: Category = CATEGORIES.includes(raw as Category) ? (raw as Category) : "all";

  const visible = PRODUCTS.filter((p) => category === "all" || p.category === category);

  return (
    <div>
      <h2>상품</h2>
      <p>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            aria-pressed={c === category}
            onClick={() => setSearchParams(c === "all" ? {} : { category: c })}
          >
            {c}
          </button>
        ))}
      </p>
      <p>현재 주소: {location.pathname + location.search}</p>
      <ul>
        {visible.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}

// useNavigate: 로그인에 성공하면 코드로 이동한다.
function Login({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  return (
    <div>
      <h2>로그인</h2>
      <button
        onClick={() => {
          onLogin();
          navigate("/dashboard", { replace: true }); // 로그인 화면으로 뒤로 가기 방지
        }}
      >
        로그인하기
      </button>
    </div>
  );
}

// Navigate: 렌더링 결과로 "다른 곳으로 보내라"고 선언한다.
function ProtectedRoute({ loggedIn, children }: { loggedIn: boolean; children: ReactNode }) {
  if (!loggedIn) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <MemoryRouter initialEntries={["/products"]}>
      <h1>이동과 검색 파라미터</h1>
      <nav>
        <NavLink to="/products" style={{ marginRight: 12 }}>
          상품
        </NavLink>
        <NavLink to="/dashboard" style={{ marginRight: 12 }}>
          대시보드
        </NavLink>
        <span>{loggedIn ? "로그인됨" : "로그아웃 상태"}</span>
      </nav>
      <hr />
      <Routes>
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login onLogin={() => setLoggedIn(true)} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <h2>대시보드 (로그인한 사람만 보입니다)</h2>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </MemoryRouter>
  );
}
