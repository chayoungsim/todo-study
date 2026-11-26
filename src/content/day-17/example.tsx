// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useState, type FormEvent } from "react";

const USERS = ["민수", "지영"];

// 작성 중인 글(draft)을 state 로 가진 에디터
function Editor({ user }: { user: string }) {
  const [draft, setDraft] = useState("");
  return (
    <label>
      {user}에게 쓰는 글{" "}
      <input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label={`${user}에게 쓰는 글`} />
    </label>
  );
}

// 비제어 폼: input 이 값을 스스로 기억하고, 제출할 때 FormData 로 읽는다.
function NicknameForm() {
  const [saved, setSaved] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSaved(String(data.get("nickname") ?? ""));
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="nickname" defaultValue="손님" aria-label="닉네임" />
      <button type="submit">저장</button>
      <p>저장된 닉네임: {saved || "없음"}</p>
    </form>
  );
}

export default function App() {
  const [user, setUser] = useState(USERS[0]);

  return (
    <div>
      <h1>key 와 비제어 컴포넌트</h1>
      <p>
        {USERS.map((u) => (
          <button key={u} onClick={() => setUser(u)} disabled={u === user}>
            {u}
          </button>
        ))}
      </p>

      <h2>key 없음: 사용자를 바꿔도 글이 남는다</h2>
      <div data-testid="no-key">
        <Editor user={user} />
      </div>

      <h2>key 있음: 사용자를 바꾸면 초기화된다</h2>
      <div data-testid="with-key">
        <Editor key={user} user={user} />
      </div>

      <h2>비제어 컴포넌트</h2>
      <NicknameForm />
    </div>
  );
}
