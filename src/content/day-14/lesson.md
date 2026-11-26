## 로딩과 에러를 컴포넌트 밖으로

Day 13에서는 컴포넌트 안에서 `loading`, `error` 상태를 직접 관리했습니다.
React는 이것을 **선언적으로** 다루는 두 도구를 제공합니다.

- **Suspense**: "아직 준비 중"일 때 보여줄 대체 화면(fallback)을 정한다.
- **Error Boundary**: 하위 컴포넌트에서 에러가 나면 보여줄 화면을 정한다.

컴포넌트는 **성공한 경우만** 신경 쓰면 되고, 로딩과 에러는 바깥에서 감싸서 처리합니다.

## use: Promise를 읽는 훅

React 19의 `use`는 **Promise가 끝날 때까지 컴포넌트를 "일시 중단"** 시킵니다.

```tsx
function Profile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // 끝날 때까지 이 컴포넌트는 멈춘다
  return <p>{user.name}</p>;      // 여기서는 항상 데이터가 있다
}
```

`use`는 다른 훅과 달리 **조건문 안에서도 호출할 수 있고**, Context도 읽을 수 있습니다(`use(MyContext)`).

## Suspense로 로딩 화면 지정

```tsx
<Suspense fallback={<p>불러오는 중...</p>}>
  <Profile userPromise={promise} />
</Suspense>
```

`Profile`이 멈춰 있는 동안 `fallback`이 보이고, 끝나면 `Profile`이 나타납니다.
Suspense 하나가 **안쪽의 여러 컴포넌트**를 한 번에 감쌀 수 있어, 로딩 표시를 한 곳에서 관리합니다.

## 중요한 규칙: Promise는 렌더링마다 새로 만들면 안 된다

```tsx
function Bad({ id }: { id: number }) {
  const user = use(fetchUser(id)); // 렌더링마다 새 Promise → 무한 대기/재요청
}
```

같은 입력에는 **같은 Promise**를 돌려줘야 합니다. 보통 캐시(`Map`)나 라이브러리, 또는 부모에서 만들어 props로 내려줍니다.

```tsx
const cache = new Map<number, Promise<User>>();
function getUser(id: number) {
  if (!cache.has(id)) cache.set(id, fetchUser(id));
  return cache.get(id)!;
}
```

## Error Boundary

Promise가 **실패하면** `use`는 에러를 던지고, 렌더링 중에 던져진 에러는 가장 가까운 **Error Boundary**가 받습니다.
Error Boundary는 아직 클래스 컴포넌트로만 만들 수 있습니다.

```tsx
class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error }; // 에러가 나면 state 에 저장해 대체 화면을 보여준다
  }

  render() {
    if (this.state.error) return <p>문제가 생겼습니다.</p>;
    return this.props.children;
  }
}
```

실무에서는 직접 만들기보다 `react-error-boundary` 같은 라이브러리를 많이 씁니다.

## 둘을 함께 쓰기

```tsx
<ErrorBoundary>            {/* 실패 → 에러 화면 */}
  <Suspense fallback={...}> {/* 진행 중 → 로딩 화면 */}
    <Profile />             {/* 성공 → 데이터 화면 */}
  </Suspense>
</ErrorBoundary>
```

## Error Boundary가 잡지 못하는 에러

- **이벤트 핸들러** 안의 에러 (렌더링 중이 아니므로 `try/catch`로 처리)
- 비동기 코드(`setTimeout` 등)의 에러
- Error Boundary 자신의 에러

## 오늘의 정리

- Suspense는 준비 중일 때의 fallback을, Error Boundary는 에러가 났을 때의 화면을 정한다.
- `use(promise)`는 Promise가 끝날 때까지 컴포넌트를 멈춘다. Promise는 캐시해서 같은 것을 재사용한다.
- 렌더링 중 던져진 에러만 Error Boundary가 잡는다. 이벤트 핸들러의 에러는 못 잡는다.
