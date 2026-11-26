// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useState } from "react";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

const initialTodos: Todo[] = [
  { id: 1, text: "JSX 복습", done: true },
  { id: 2, text: "props 연습", done: false },
  { id: 3, text: "state 만들기", done: false },
];

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [hideDone, setHideDone] = useState(false);

  function toggle(id: number) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  // 파생 목록은 state 로 따로 저장하지 않고 렌더링 중에 계산한다.
  const visibleTodos = hideDone ? todos.filter((t) => !t.done) : todos;
  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div>
      <h1>할 일</h1>
      <label>
        <input
          type="checkbox"
          checked={hideDone}
          onChange={(e) => setHideDone(e.target.checked)}
        />
        완료한 항목 숨기기
      </label>

      {/* 조건부 렌더링: 목록이 비면 안내 문구를 보여준다. */}
      {visibleTodos.length === 0 ? (
        <p>보여줄 항목이 없습니다.</p>
      ) : (
        <ul>
          {visibleTodos.map((todo) => (
            // key 는 index 가 아니라 변하지 않는 id 를 쓴다.
            <li key={todo.id}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggle(todo.id)}
                />
                <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
                  {todo.text}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {/* remaining > 0 처럼 불리언으로 만들어 && 의 0 출력 함정을 피한다. */}
      {remaining > 0 && <p>남은 할 일: {remaining}개</p>}
    </div>
  );
}
