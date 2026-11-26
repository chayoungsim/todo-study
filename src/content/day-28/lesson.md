## 읽기와 쓰기

Day 27의 `useQuery`는 서버 데이터를 **읽는** 도구였습니다.
추가, 수정, 삭제처럼 서버 데이터를 **바꾸는** 일에는 **`useMutation`** 을 씁니다.

`useQuery`는 컴포넌트가 나타나면 자동으로 실행되지만, `useMutation`은 **내가 호출했을 때만** 실행됩니다.

## useMutation

```tsx
const mutation = useMutation({
  mutationFn: (text: string) => api.addTodo(text), // 서버를 바꾸는 함수
});

mutation.mutate("새 할 일");   // 실행
```

| 값 | 의미 |
|---|---|
| `mutation.mutate(변수)` | 실행한다 |
| `mutation.isPending` | 요청 중인가 (버튼 비활성화에 사용) |
| `mutation.isError` / `error` | 실패했는가 |
| `mutation.isSuccess` | 성공했는가 |

Day 19의 `useActionState`의 `isPending`과 비슷한 역할입니다.

## 핵심: 바꾼 뒤 캐시를 갱신하기

서버의 데이터를 바꿨으니, 화면에 보이는 **캐시는 이제 오래된 것**입니다. 이 캐시를 무효화해 다시 가져오게 합니다.

```tsx
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: addTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["todos"] }); // "todos" 캐시를 오래된 것으로 표시 → 다시 가져온다
  },
});
```

- `invalidateQueries`는 `queryKey`가 맞는 캐시를 **stale로 표시**하고, 지금 화면에 쓰이는 것은 **즉시 다시 가져옵니다.**
- 키가 **앞부분만 맞아도** 해당됩니다. `["todos"]`로 무효화하면 `["todos", { done: true }]`도 함께 갱신됩니다.

그래서 흐름은 항상 이렇습니다. **서버를 바꾼다 → 캐시를 무효화한다 → 자동으로 다시 가져와 화면이 갱신된다.**

## 콜백

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: (data, variables) => { /* 성공 */ },
  onError: (error) => { /* 실패: 사용자에게 알리기 */ },
  onSettled: () => { /* 성공이든 실패든 마지막에 */ },
});
```

`mutate`에도 콜백을 줄 수 있어서, 폼을 비우는 일처럼 **이 호출에만 해당하는** 동작에 알맞습니다.

```tsx
mutation.mutate(text, { onSuccess: () => setText("") });
```

## 낙관적 업데이트(Optimistic Update)

서버 응답을 기다리지 않고 **먼저 화면을 바꾸고**, 실패하면 되돌리는 기법입니다. "좋아요"처럼 거의 성공하는 동작에서 반응이 빨라 보입니다.

```tsx
useMutation({
  mutationFn: toggleTodo,
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ["todos"] });
    const previous = queryClient.getQueryData(["todos"]);       // 되돌릴 값을 저장
    queryClient.setQueryData(["todos"], /* 먼저 바꾼 값 */);
    return { previous };
  },
  onError: (_err, _id, context) => {
    queryClient.setQueryData(["todos"], context?.previous);      // 실패하면 되돌린다
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
});
```

처음에는 **단순한 방식(성공 후 무효화)** 으로 시작하세요. 낙관적 업데이트는 체감 속도가 정말 문제일 때 추가합니다.

## 주의할 점

- 변경 후에는 **반드시 관련 캐시를 무효화**하세요. 빼먹으면 화면이 서버와 어긋납니다.
- 실패했을 때 **사용자에게 알리고**, 입력값을 지우지 않습니다. (Day 19의 원칙)
- `isPending` 동안 같은 버튼을 다시 누르지 못하게 합니다. 중복 제출을 막습니다.

## 오늘의 정리

- 서버 데이터를 바꿀 때는 `useMutation`을 쓰고, `mutate()`로 실행한다.
- 성공하면 `invalidateQueries`로 관련 캐시를 무효화해 화면을 최신으로 갱신한다.
- `isPending`으로 중복 제출을 막고, `onError`로 실패를 알린다.
- 낙관적 업데이트는 반응성이 중요할 때만, 실패 시 되돌릴 값을 저장해 둔다.
