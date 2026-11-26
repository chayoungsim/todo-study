## 서버 데이터는 클라이언트 상태와 다르다

Day 13에서 `useEffect`로 데이터를 가져오며 **로딩, 에러, 경쟁 상태**를 직접 다뤘습니다.
그런데 실제 앱에서는 여기에 더해 이런 문제가 따라옵니다.

- 같은 데이터를 여러 컴포넌트가 요청하면 **중복 요청**이 나간다
- 화면을 오갈 때마다 **다시 불러오면 느리다** (캐싱)
- 데이터가 **오래되었는지** 판단하고 다시 가져와야 한다
- 실패하면 **자동으로 재시도**하고 싶다

**TanStack Query**(React Query)는 이런 일을 대신 해 주는 서버 상태 관리 라이브러리입니다.
Day 21에서 본 Zustand는 **클라이언트 상태**(UI, 설정)를, TanStack Query는 **서버 상태**(서버에 있는 데이터의 사본)를 맡습니다.

## 설정

앱을 `QueryClientProvider`로 감쌉니다. `QueryClient`가 캐시를 보관합니다.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient(); // 컴포넌트 밖에서 한 번만 만든다

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

## useQuery

```tsx
const { data, isPending, isError, error } = useQuery({
  queryKey: ["user", id],          // 이 데이터의 이름표(캐시 키)
  queryFn: () => fetchUser(id),    // 데이터를 가져오는 함수 (Promise 반환)
});
```

```tsx
if (isPending) return <p>불러오는 중...</p>;
if (isError) return <p>{error.message}</p>;
return <p>{data.name}</p>;   // 여기서는 data 가 있다
```

Day 13의 `loading`, `error`, `ignore` 플래그, `useEffect`가 **전부 사라졌습니다.** 경쟁 상태도 라이브러리가 처리합니다.

## queryKey: 캐시의 이름표

`queryKey`는 배열이며 **같은 키는 같은 데이터**입니다. 키가 바뀌면 다른 데이터로 보고 새로 가져옵니다.

```tsx
["user", 1]   // 1번 사용자
["user", 2]   // 2번 사용자 (다른 캐시)
["todos", { done: true }]  // 키에 객체를 넣어 조건도 표현
```

`queryFn`에서 쓰는 값(`id`)은 **반드시 `queryKey`에 넣으세요.** Day 4의 의존성 배열과 같은 원칙입니다.

## 캐시와 staleTime

한 번 가져온 데이터는 캐시에 남습니다. 다시 그 화면에 오면 **캐시를 즉시 보여주고**, 오래되었다면 **뒤에서 조용히 다시 가져옵니다.**

- **`staleTime`**: 데이터가 "신선"한 시간. 이 시간 동안은 다시 가져오지 않습니다. (기본값 **0** = 가져오는 즉시 오래된 것으로 취급)
- **`gcTime`**: 아무도 쓰지 않는 캐시를 메모리에 보관하는 시간. (기본 5분)

```tsx
useQuery({ queryKey, queryFn, staleTime: 60_000 }); // 1분 동안은 신선하다
```

그래서 목록에서 상세로, 상세에서 목록으로 오갈 때 로딩 화면이 반복되지 않습니다.

## isPending과 isFetching

| 값 | 의미 |
|---|---|
| `isPending` | **데이터가 아직 한 번도 없다** (처음 로딩) |
| `isFetching` | **지금 요청 중이다** (캐시가 있어도 뒤에서 다시 가져오는 중일 수 있다) |

`isFetching`으로 "새로고침 중" 같은 작은 표시를 할 수 있습니다.

## 자동으로 해 주는 것들

- 같은 `queryKey`의 **중복 요청을 하나로** 합침
- 실패 시 **자동 재시도**(기본 3회)
- 창에 다시 **포커스**하면 오래된 데이터 갱신
- 컴포넌트가 사라져도 **캐시 유지**

## 언제 쓰고 언제 안 쓸까?

| | TanStack Query | Zustand / useState |
|---|---|---|
| 서버에서 온 데이터 | 알맞음 | 직접 캐시를 구현해야 함 |
| 모달 열림, 입력 중 글, 테마 | 알맞지 않음 | 알맞음 |

서버 데이터를 Zustand에 복사해 두면 **같은 데이터가 두 곳**에 생겨 어긋납니다. 서버 데이터는 Query에 맡기세요.

## 오늘의 정리

- TanStack Query는 서버 상태의 캐싱, 중복 제거, 재시도, 갱신을 대신해 준다.
- `useQuery({ queryKey, queryFn })`로 가져오고, `isPending`/`isError`/`data`로 화면을 그린다.
- `queryKey`는 캐시의 이름표이고, `queryFn`에서 쓰는 값은 키에 넣는다.
- `staleTime` 동안은 다시 가져오지 않고, 캐시는 즉시 보여준 뒤 필요하면 뒤에서 갱신한다.
