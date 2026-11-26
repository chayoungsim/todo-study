// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { MemoryRouter, NavLink, Outlet, Route, Routes } from "react-router";

// 공통 레이아웃: 메뉴는 그대로 두고, Outlet 자리에 맞는 페이지가 렌더링된다.
function Layout() {
  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    fontWeight: isActive ? "bold" : "normal",
    marginRight: 12,
  });

  return (
    <div>
      <nav>
        {/* end: 정확히 "/" 일 때만 활성으로 본다. */}
        <NavLink to="/" end style={linkStyle}>
          홈
        </NavLink>
        <NavLink to="/about" style={linkStyle}>
          소개
        </NavLink>
        <NavLink to="/contact" style={linkStyle}>
          연락처
        </NavLink>
        <NavLink to="/없는-주소" style={linkStyle}>
          없는 주소
        </NavLink>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

const Home = () => <h2>홈 화면</h2>;
const About = () => <h2>소개 화면</h2>;
const Contact = () => <h2>연락처 화면</h2>;
const NotFound = () => <h2>404: 페이지를 찾을 수 없습니다</h2>;

export default function App() {
  // 이 예제는 iframe 안에서 실행되므로 주소창 대신 메모리에서 주소를 관리한다.
  return (
    <MemoryRouter initialEntries={["/"]}>
      <h1>React Router</h1>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
