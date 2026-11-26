// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { MemoryRouter, NavLink, Outlet, Route, Routes, useParams } from "react-router";

interface User {
  id: number;
  name: string;
  role: string;
}

const USERS: User[] = [
  { id: 1, name: "민수", role: "프론트엔드" },
  { id: 2, name: "지영", role: "디자이너" },
  { id: 3, name: "철수", role: "백엔드" },
];

// 부모 레이아웃: 목록은 항상 보이고, 오른쪽(Outlet) 영역만 바뀐다.
function UsersLayout() {
  return (
    <div style={{ display: "flex", gap: 24 }}>
      <nav aria-label="사용자 목록">
        <ul>
          {USERS.map((u) => (
            <li key={u.id}>
              {/* 상대 경로: 현재 /users 아래에서 /users/1 로 이동한다. */}
              <NavLink to={String(u.id)}>{u.name}</NavLink>
            </li>
          ))}
          <li>
            <NavLink to="99">없는 사용자(99)</NavLink>
          </li>
        </ul>
      </nav>
      <section>
        <Outlet />
      </section>
    </div>
  );
}

// 동적 라우트: 주소의 :userId 를 읽는다.
function UserDetail() {
  const { userId } = useParams(); // 항상 문자열(또는 undefined)
  const user = USERS.find((u) => u.id === Number(userId));

  // 주소는 사용자가 바꿀 수 있으므로 없는 값도 처리한다.
  if (!user) return <p role="alert">{userId}번 사용자는 존재하지 않습니다.</p>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>직무: {user.role}</p>
    </div>
  );
}

export default function App() {
  return (
    <MemoryRouter initialEntries={["/users"]}>
      <h1>중첩 라우트</h1>
      <Routes>
        <Route path="users" element={<UsersLayout />}>
          {/* index: 부모 경로(/users) 그대로일 때의 기본 화면 */}
          <Route index element={<p>왼쪽에서 사용자를 선택하세요.</p>} />
          <Route path=":userId" element={<UserDetail />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
