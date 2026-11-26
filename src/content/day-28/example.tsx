// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useState, type FormEvent } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

interface Todo {
  id: number;
  text: string;
}

// ---- 서버를 흉내 낸다: 메모리에 있는 배열이 "서버의 데이터" ----
let serverTodos: Todo[] = [{ id: 1, text: "useQuery 익히기" }];
let nextId = 2;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchTodos(): Promise<Todo[]> {
  await delay(300);
  return [...serverTodos];
}

async function addTodo(text: string): Promise<Todo> {
  await delay(500);
  if (text.includes("실패")) throw new Error("서버가 요청을 거부했습니다.");
  const todo = { id: nextId++, text };
  serverTodos = [...serverTodos, todo];
  return todo;
}

async function removeTodo(id: number): Promise<void> {
  await delay(300);
  serverTodos = serverTodos.filter((t) => t.id !== id);
}

function Todos() {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  // 읽기: useQuery
  const {
    data: todos,
    isPending,
    isError,
  } = useQuery({ queryKey: ["todos"], queryFn: fetchTodos });

  // 쓰기: useMutation → 성공하면 "todos" 캐시를 무효화해 자동으로 다시 가져온다.
  const add = useMutation({
    mutationFn: addTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });
  const remove = useMutation({
    mutationFn: removeTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;
    // 이 호출에만 해당하는 동작(입력창 비우기)은 mutate 의 콜백에 둔다.
    add.mutate(text.trim(), { onSuccess: () => setText("") });
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="할 일 ('실패' 포함 시 오류)" />
        <button type="submit" disabled={add.isPending}>
          {add.isPending ? "추가 중..." : "추가"}
        </button>
      </form>
      {add.isError && <p role="alert">{add.error.message}</p>}

      {/* isPending 이 아니어도 에러일 수 있다. 에러 상태에서는 data 가 없으므로 먼저 처리한다. */}
      {isPending ? (
        <p>불러오는 중...</p>
      ) : isError ? (
        <p role="alert">목록을 불러오지 못했습니다.</p>
      ) : (
        <ul>
          {todos.map((t) => (
            <li key={t.id}>
              {t.text} <button onClick={() => remove.mutate(t.id)}>삭제</button>
            </li>
          ))}
        </ul>
      )}
      <p>전체 {todos?.length ?? 0}개</p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <h1>useMutation</h1>
      <Todos />
    </QueryClientProvider>
  );
}
