// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useState, type FormEvent } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

interface TodoState {
  todos: Todo[];
  loading: boolean; // 저장하지 않는 일시적인 값
  add: (text: string) => void;
  toggle: (id: number) => void;
  clearDone: () => void;
  loadSamples: () => Promise<void>;
}

// 서버 요청을 흉내 낸다 (0.6초)
const fetchSamples = () =>
  new Promise<Todo[]>((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: 1001, text: "persist 써 보기", done: false },
          { id: 1002, text: "useShallow 이해하기", done: true },
        ]),
      600,
    ),
  );

const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
      loading: false,
      add: (text) =>
        set((s) => ({ todos: [...s.todos, { id: Date.now(), text, done: false }] })),
      toggle: (id) =>
        set((s) => ({
          todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),
      clearDone: () => set((s) => ({ todos: s.todos.filter((t) => !t.done) })),
      // 비동기 action: 로딩 상태도 스토어에 함께 둔다.
      loadSamples: async () => {
        set({ loading: true });
        const samples = await fetchSamples();
        set({ todos: samples, loading: false });
      },
    }),
    {
      name: "react-daily-day22-todos", // localStorage 키
      partialize: (state) => ({ todos: state.todos }), // todos 만 저장한다.
    },
  ),
);

function AddForm() {
  const add = useTodoStore((s) => s.add);
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;
    add(text.trim());
    setText("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="할 일" />
      <button type="submit">추가</button>
    </form>
  );
}

function Stats() {
  // 여러 값을 객체로 뽑을 때는 useShallow 로 감싼다.
  const { total, done } = useTodoStore(
    useShallow((s) => ({
      total: s.todos.length,
      done: s.todos.filter((t) => t.done).length,
    })),
  );
  return (
    <p>
      전체 {total}개 · 완료 {done}개
    </p>
  );
}

function List() {
  const todos = useTodoStore((s) => s.todos);
  const toggle = useTodoStore((s) => s.toggle);
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>
          <label>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            {t.text}
          </label>
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const loading = useTodoStore((s) => s.loading);
  const loadSamples = useTodoStore((s) => s.loadSamples);
  const clearDone = useTodoStore((s) => s.clearDone);

  return (
    <div>
      <h1>Zustand 심화</h1>
      <AddForm />
      <Stats />
      <List />
      <button onClick={loadSamples} disabled={loading}>
        {loading ? "불러오는 중..." : "샘플 불러오기"}
      </button>
      <button onClick={clearDone}>완료 항목 지우기</button>
      <p>
        <small>미리보기의 새로고침 버튼을 눌러도 목록이 유지됩니다. (localStorage 저장)</small>
      </p>
    </div>
  );
}
