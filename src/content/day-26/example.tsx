// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
// 주의: 미리보기는 타입 검사를 하지 않습니다. 타입 오류는 로컬 에디터에서 확인하세요.
import { useState, type ChangeEvent, type ReactNode } from "react";

// 1) 판별 유니온: status 에 따라 가질 수 있는 필드가 다르다.
type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

// 2) 제네릭 컴포넌트: T 가 무엇이든 받을 수 있다.
function StatusView<T>({ state, render }: { state: LoadState<T>; render: (data: T) => ReactNode }) {
  switch (state.status) {
    case "idle":
      return <p>대기 중</p>;
    case "loading":
      return <p>불러오는 중...</p>;
    case "success":
      return <p>{render(state.data)}</p>; // success 일 때만 data 에 접근할 수 있다.
    case "error":
      return <p role="alert">{state.message}</p>;
  }
}

interface ListProps<T> {
  items: T[];
  getKey: (item: T) => string | number;
  render: (item: T) => ReactNode;
}

function List<T>({ items, getKey, render }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={getKey(item)}>{render(item)}</li>
      ))}
    </ul>
  );
}

// 3) 유니온 props: kind 에 따라 필요한 props 가 달라진다.
type ActionProps = { label: string } & (
  | { kind: "button"; onClick: () => void }
  | { kind: "link"; href: string }
);

function Action(props: ActionProps) {
  if (props.kind === "button") {
    return <button onClick={props.onClick}>{props.label}</button>;
  }
  return (
    <a href={props.href} onClick={(e) => e.preventDefault()}>
      {props.label}
    </a>
  );
}

// 4) 유틸리티 타입: Pick 으로 폼 필드만 고른다.
interface Profile {
  id: number;
  name: string;
  email: string;
}
type ProfileForm = Pick<Profile, "name" | "email">;

const STATES: LoadState<string>[] = [
  { status: "idle" },
  { status: "loading" },
  { status: "success", data: "불러온 데이터" },
  { status: "error", message: "요청에 실패했습니다." },
];

export default function App() {
  const [index, setIndex] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [form, setForm] = useState<ProfileForm>({ name: "홍길동", email: "hong@example.com" });

  // 이벤트 타입: ChangeEvent<HTMLInputElement>
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div>
      <h1>TypeScript 와 React</h1>

      <h2>판별 유니온 + 제네릭 컴포넌트</h2>
      <button onClick={() => setIndex((i) => (i + 1) % STATES.length)}>
        상태 바꾸기 ({STATES[index].status})
      </button>
      <StatusView state={STATES[index]} render={(text) => `성공: ${text}`} />

      <h2>제네릭 List</h2>
      <List
        items={[
          { id: 1, name: "민수" },
          { id: 2, name: "지영" },
        ]}
        getKey={(u) => u.id}
        render={(u) => u.name}
      />

      <h2>유니온 props</h2>
      <Action kind="button" label={`버튼 (${clicks})`} onClick={() => setClicks((c) => c + 1)} />{" "}
      <Action kind="link" label="링크" href="#docs" />

      <h2>Pick 과 이벤트 타입</h2>
      <p>
        <input name="name" value={form.name} onChange={handleChange} aria-label="이름" />
        <input name="email" value={form.email} onChange={handleChange} aria-label="이메일" />
      </p>
      <p>
        입력값: {form.name} / {form.email}
      </p>
    </div>
  );
}
