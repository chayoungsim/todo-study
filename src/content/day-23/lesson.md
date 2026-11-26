## 라우팅이란?

지금까지의 예제는 한 화면이었습니다. 실제 사이트는 **주소(URL)에 따라 다른 화면**을 보여 줍니다.
`/`는 홈, `/about`은 소개, `/days/3`은 Day 3처럼요.

문제는 일반 링크(`<a href>`)를 누르면 **페이지 전체가 새로고침**된다는 점입니다. React 앱의 상태가 모두 사라집니다.
**React Router**는 새로고침 없이 **주소만 바꾸고 알맞은 컴포넌트를 보여 주는** 라이브러리입니다. 이 사이트도 React Router v7로 만들어져 있습니다.

## 라우터 설정

앱을 `BrowserRouter`로 감싸고, 주소별로 보여줄 컴포넌트를 `Routes` 안에 `Route`로 선언합니다.

```tsx
import { BrowserRouter, Routes, Route } from "react-router";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- `path`가 현재 주소와 맞는 `Route`의 `element`가 렌더링됩니다.
- `path="*"`는 **어디에도 맞지 않을 때**의 404 화면입니다. 가장 마지막에 둡니다.

> v7부터 패키지 이름이 `react-router`입니다. (예전의 `react-router-dom`을 합쳤습니다.)

## 이 예제에서 MemoryRouter를 쓰는 이유

`BrowserRouter`는 브라우저의 **실제 주소창**을 바꿉니다. 이 사이트의 코드 예제는 작은 iframe 안에서 실행되므로,
주소창 대신 **메모리에서 주소를 관리하는 `MemoryRouter`** 를 씁니다. 사용법은 `BrowserRouter`와 같습니다.
테스트 코드에서도 `MemoryRouter`를 자주 씁니다.

## 이동하기: Link와 NavLink

`<a>` 대신 `Link`를 쓰면 새로고침 없이 이동합니다.

```tsx
<Link to="/about">소개</Link>
```

`NavLink`는 현재 주소와 맞으면 **활성 상태**를 알 수 있는 `Link`입니다. 메뉴에 알맞습니다.

```tsx
<NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
  소개
</NavLink>
```

활성 상태의 `NavLink`에는 `aria-current="page"`가 자동으로 붙어, 스크린 리더 사용자에게도 현재 위치가 전달됩니다. (Day 20)

### end 속성

`to="/"`인 `NavLink`는 `/about`일 때도 "맞는 주소"로 봅니다. 정확히 `/`일 때만 활성으로 만들려면 `end`를 씁니다.

```tsx
<NavLink to="/" end>홈</NavLink>
```

## 공통 레이아웃과 Outlet

모든 페이지에 같은 헤더(메뉴)를 보여 주려면, 레이아웃 컴포넌트를 만들고 자리에 `Outlet`을 둡니다.

```tsx
function Layout() {
  return (
    <>
      <nav>...</nav>
      <Outlet /> {/* 맞는 자식 Route 의 element 가 여기에 렌더링된다 */}
    </>
  );
}

<Routes>
  <Route element={<Layout />}>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Route>
</Routes>
```

`path`가 없는 `Route`는 **레이아웃 전용**입니다. 이 사이트의 `AppLayout`도 이 구조입니다.

## 주의할 점

- 앱 안의 이동에는 `<a>`가 아니라 `Link`를 쓴다. (외부 사이트로 가는 링크만 `<a>`)
- 배포할 때는 서버가 모든 주소를 `index.html`로 보내도록 설정해야 한다. (이 프로젝트의 `vercel.json`이 하는 일)
- 404용 `path="*"` Route를 잊지 않는다.

## 오늘의 정리

- `BrowserRouter`로 앱을 감싸고 `Routes`/`Route`로 주소별 화면을 선언한다.
- 이동은 `Link`, 활성 표시가 필요한 메뉴는 `NavLink`(홈은 `end`)를 쓴다.
- 공통 틀은 레이아웃 `Route`와 `Outlet`으로 만든다.
- 모르는 주소는 `path="*"`로 404 화면을 보여 준다.
