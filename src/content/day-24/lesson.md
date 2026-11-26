## 동적 라우트: 주소의 일부가 변수

사용자가 100명이라고 해서 `/users/1`, `/users/2`, ... 100개의 `Route`를 만들 수는 없습니다.
경로에 **`:이름`** 을 쓰면 그 자리가 변수가 됩니다.

```tsx
<Route path="/users/:userId" element={<UserDetail />} />
```

이 `Route`는 `/users/1`, `/users/42`, `/users/abc` 모두에 맞습니다. (이 사이트의 `/days/:day`도 같은 방식입니다.)

## useParams: 변수 읽기

```tsx
import { useParams } from "react-router";

function UserDetail() {
  const { userId } = useParams(); // 타입: string | undefined
  const id = Number(userId);      // 주소의 값은 항상 문자열이다
  // ...
}
```

주의할 점이 두 가지입니다.

- **항상 문자열**입니다. 숫자가 필요하면 `Number()`로 바꿉니다.
- 사용자가 주소를 **직접 고칠 수 있으므로** 잘못된 값(`/users/abc`, 없는 id)이 올 수 있습니다. 반드시 확인하고 처리하세요.

```tsx
const user = users.find((u) => u.id === Number(userId));
if (!user) return <p>존재하지 않는 사용자입니다.</p>;
```

이 사이트의 `DayPage`도 `Number.isInteger(day)`를 확인해 잘못된 주소는 코스 목록으로 보냅니다.

## 중첩 라우트(Nested Routes)

화면 안에 또 다른 화면이 들어가는 구조입니다. 목록은 그대로 두고 **오른쪽 영역만** 바뀌는 경우가 대표적입니다.
`Route`를 중첩하고, 부모 컴포넌트에서 `Outlet`으로 자식 자리를 정합니다.

```tsx
<Route path="users" element={<UsersLayout />}>
  <Route index element={<p>사용자를 선택하세요</p>} />
  <Route path=":userId" element={<UserDetail />} />
</Route>
```

```tsx
function UsersLayout() {
  return (
    <div className="two-column">
      <UserList />   {/* 항상 보인다 */}
      <Outlet />     {/* /users 면 index, /users/3 이면 UserDetail */}
    </div>
  );
}
```

- 자식의 `path`는 부모 경로에 **이어 붙습니다.** (`users` + `:userId` → `/users/:userId`)
- **`index`** Route는 부모 경로 그대로(`/users`)일 때 보여 줄 기본 화면입니다.

## 상대 경로 링크

중첩 안에서는 `to`를 **상대 경로**로 쓸 수 있습니다. 부모 경로가 바뀌어도 링크를 고칠 필요가 없습니다.

```tsx
<NavLink to="3">3번 사용자</NavLink>   {/* 현재 /users 아래 → /users/3 */}
```

## 언제 중첩하나?

- **레이아웃이 공유**될 때: 사이드바, 탭, 목록-상세 화면
- 주소의 계층이 화면의 계층과 일치할 때

단순히 URL만 비슷하다고 중첩할 필요는 없습니다. 화면 구조가 독립적이라면 평평하게 두는 편이 읽기 쉽습니다.

## 오늘의 정리

- `:이름`으로 동적 경로를 만들고 `useParams()`로 읽는다. 값은 항상 문자열이다.
- 주소는 사용자가 바꿀 수 있으니 잘못된 값과 없는 데이터를 반드시 처리한다.
- 중첩 `Route`와 `Outlet`으로 공유 레이아웃 안의 화면만 바꾼다. `index`는 기본 화면이다.
- 중첩 안의 링크는 상대 경로로 쓸 수 있다.
