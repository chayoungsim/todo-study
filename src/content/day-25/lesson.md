## 링크 말고 코드로 이동하기

`Link`는 사용자가 **클릭**했을 때의 이동입니다. 폼을 제출한 뒤, 로그인에 성공한 뒤처럼
**코드가 판단해서** 이동해야 할 때도 있습니다.

## useNavigate: 이벤트 핸들러에서 이동

```tsx
import { useNavigate } from "react-router";

function LoginForm() {
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // 로그인 처리...
    navigate("/dashboard"); // 성공하면 이동
  }
}
```

- `navigate(-1)`은 **뒤로 가기**입니다.
- `navigate("/dashboard", { replace: true })`는 현재 기록을 **대체**해서 뒤로 가기로 돌아올 수 없게 합니다. 로그인 화면처럼 되돌아오면 어색한 곳에 씁니다.

## Navigate: 렌더링 중 리다이렉트

렌더링 도중에 "이 화면은 보여주면 안 된다, 다른 곳으로 보내라"고 선언할 때는 **`<Navigate>` 컴포넌트**를 반환합니다.

```tsx
function ProtectedRoute({ loggedIn, children }: { loggedIn: boolean; children: ReactNode }) {
  if (!loggedIn) return <Navigate to="/login" replace />;
  return children;
}

<Route path="/dashboard" element={<ProtectedRoute loggedIn={loggedIn}><Dashboard /></ProtectedRoute>} />
```

> `useNavigate()`는 **이벤트 핸들러나 effect**에서, `<Navigate>`는 **렌더링 결과로** 씁니다. 렌더링 도중에 `navigate()`를 직접 호출하면 안 됩니다. (Day 4의 "렌더링은 순수해야 한다"와 같은 원칙입니다.)

## useSearchParams: 주소에 상태 담기

`/products?category=fruit&sort=price`의 `?` 뒤를 **검색 파라미터(쿼리 스트링)** 라고 합니다.
`useState`와 비슷하지만, **상태가 주소에 들어간다**는 점이 다릅니다.

```tsx
const [searchParams, setSearchParams] = useSearchParams();

const category = searchParams.get("category") ?? "all"; // 읽기 (없으면 null)
setSearchParams({ category: "fruit" });                  // 바꾸기 → 주소가 바뀐다
```

### 왜 state 대신 주소에 담을까?

- **새로고침해도 유지**된다.
- **링크로 공유**할 수 있다. 같은 필터가 걸린 화면을 다른 사람도 본다.
- 브라우저의 **뒤로 가기**가 필터 변경 이력을 따라간다.

검색어, 필터, 정렬, 페이지 번호처럼 **"이 화면을 어떻게 볼 것인가"** 에 해당하는 값에 알맞습니다.
반대로 입력 중인 글, 열린 메뉴 같은 **일시적인 UI 상태**는 `useState`가 낫습니다.

### 주의: 값은 문자열이고, 사용자가 바꿀 수 있다

```tsx
const raw = searchParams.get("category");
const category = CATEGORIES.includes(raw as Category) ? (raw as Category) : "all"; // 검증
```

`useParams`와 마찬가지로 **검증 없이 믿지 마세요.**

## 현재 위치 알기: useLocation

```tsx
const location = useLocation();
location.pathname; // "/products"
location.search;   // "?category=fruit"
```

## 오늘의 정리

- 이벤트 핸들러에서는 `useNavigate()`로, 렌더링 중 리다이렉트는 `<Navigate>`로 이동한다.
- `replace`는 기록을 대체해 뒤로 가기로 돌아오지 못하게 한다.
- 필터, 정렬 같은 "화면을 보는 방식"은 `useSearchParams`로 주소에 담으면 새로고침, 공유, 뒤로 가기에 강하다.
- 주소에서 읽은 값은 항상 검증한다.
