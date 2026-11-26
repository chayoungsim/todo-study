## 데이터를 가져올 때 생각할 것

서버에서 데이터를 가져오는 일은 **시간이 걸리고, 실패할 수 있습니다.**
그래서 화면은 항상 세 가지 상태를 다뤄야 합니다.

- **로딩 중**: 아직 데이터가 없다
- **성공**: 데이터가 있다
- **실패**: 에러가 났다

## 기본 패턴

Day 4에서 배운 대로, 데이터 가져오기는 렌더링 밖의 일이므로 `useEffect`에서 합니다.

```tsx
function User({ id }: { id: number }) {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetchUser(id).then(setUser);
  }, [id]); // id 가 바뀌면 다시 가져온다

  if (!user) return <p>불러오는 중...</p>;
  return <p>{user.name}</p>;
}
```

## 함정 1: 경쟁 상태(Race Condition)

사용자가 `id`를 빠르게 바꾸면 요청이 여러 개 날아갑니다.
**응답이 요청 순서대로 도착한다는 보장은 없습니다.** 먼저 보낸 느린 요청이 나중에 도착해 최신 화면을 덮어쓸 수 있습니다.

해결: effect의 **정리(cleanup)** 를 이용해 "이 요청은 이제 무효"라고 표시합니다.

```tsx
useEffect(() => {
  let ignore = false; // 이 effect 실행에 묶인 플래그

  fetchUser(id).then((data) => {
    if (!ignore) setUser(data); // 무효가 된 요청의 응답은 버린다
  });

  return () => {
    ignore = true; // id 가 바뀌거나 사라지면 이전 요청을 무효화
  };
}, [id]);
```

실제 `fetch`는 `AbortController`로 요청 자체를 취소할 수도 있습니다.

## 함정 2: 로딩 state를 따로 관리하기

`loading`, `error`, `data` state를 각각 두고 effect에서 직접 바꾸면 값이 서로 어긋나기 쉽습니다.
**결과가 어느 요청의 것인지(id)를 함께 저장**하고, 로딩 여부는 계산으로 구하면 단순해집니다.

```tsx
type Result =
  | { id: number; status: "success"; data: UserData }
  | { id: number; status: "error"; message: string };

const [result, setResult] = useState<Result | null>(null);

// 현재 id 의 결과가 없으면 로딩 중이다. (별도 loading state 가 필요 없다)
const loading = result === null || result.id !== id;
```

## 에러 처리

`catch`에서 에러 상태를 저장하고, 화면에서 **다시 시도** 같은 다음 행동을 안내하세요.
사용자는 실패 이유보다 "그래서 뭘 하면 되는지"가 궁금합니다.

## 직접 만들지 않아도 된다

실무에서는 캐싱, 재시도, 중복 요청 제거까지 필요해서 보통 **TanStack Query** 같은 라이브러리를 씁니다.
하지만 그 라이브러리들이 해결하는 문제가 무엇인지 알려면, 오늘 배운 로딩/에러/경쟁 상태를 직접 겪어 보는 것이 좋습니다.

## 오늘의 정리

- 데이터 가져오기는 로딩, 성공, 실패 세 상태를 모두 다룬다.
- 요청은 `useEffect`에서 하고, 의존성이 바뀌면 다시 요청한다.
- 정리 함수에서 `ignore = true`로 오래된 응답을 버려 경쟁 상태를 막는다.
- 결과에 요청의 `id`를 함께 저장하면 로딩 여부를 계산으로 구할 수 있다.
