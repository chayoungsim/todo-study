// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
// 종합 예제: 메모장. 30일 동안 배운 것을 한 앱에 모았습니다.
//  - Zustand persist(전역 상태) · React Router(화면 전환) · useSearchParams(검색)
//  - 제어 컴포넌트와 검증 · 접근성(label, role) · 판별 유니온에 가까운 안전한 분기
import { useState, type FormEvent } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Link,
  MemoryRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";

interface Note {
  id: number;
  title: string;
  body: string;
}

// ───── 상태: Zustand + persist (새로고침해도 유지) ─────
interface NoteState {
  notes: Note[];
  add: (title: string, body: string) => number;
  remove: (id: number) => void;
}

const useNotes = create<NoteState>()(
  persist(
    (set) => ({
      notes: [],
      add: (title, body) => {
        const id = Date.now();
        set((s) => ({ notes: [...s.notes, { id, title, body }] }));
        return id;
      },
      remove: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
    }),
    { name: "react-daily-day30-notes" },
  ),
);

// ───── 목록: 검색어는 state 가 아니라 주소(?q=)에 담는다. ─────
function NoteList() {
  const notes = useNotes((s) => s.notes);
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";

  // 파생 값은 저장하지 않고 렌더링 중에 계산한다.
  const visible = notes.filter((n) => n.title.includes(q) || n.body.includes(q));

  return (
    <div>
      <h2>메모 목록</h2>
      <p>
        <label>
          검색{" "}
          <input
            value={q}
            onChange={(e) => setSearchParams(e.target.value ? { q: e.target.value } : {})}
          />
        </label>{" "}
        <Link to="/new">새 메모</Link>
      </p>
      {visible.length === 0 ? (
        <p>{notes.length === 0 ? "아직 메모가 없습니다." : "검색 결과가 없습니다."}</p>
      ) : (
        <ul>
          {visible.map((n) => (
            <li key={n.id}>
              <Link to={`/note/${n.id}`}>{n.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ───── 작성: 제어 컴포넌트 + 검증 + 접근성 + 코드로 이동 ─────
function NewNote() {
  const add = useNotes((s) => s.add);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const titleError = title.trim() === "" ? "제목을 입력하세요." : "";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    if (titleError) return;
    const id = add(title.trim(), body.trim());
    navigate(`/note/${id}`, { replace: true }); // 작성 화면으로 뒤로 가기 방지
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>새 메모</h2>
      <p>
        <label>
          제목{" "}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={submitted && !!titleError}
          />
        </label>
        {submitted && titleError && <span role="alert"> {titleError}</span>}
      </p>
      <p>
        <label>
          내용 <textarea value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
      </p>
      <button type="submit">저장</button> <Link to="/">취소</Link>
    </form>
  );
}

// ───── 상세: 동적 라우트 + 없는 값 처리 ─────
function NoteDetail() {
  const { id } = useParams();
  const note = useNotes((s) => s.notes.find((n) => n.id === Number(id)));
  const remove = useNotes((s) => s.remove);
  const navigate = useNavigate();

  if (!note) {
    return (
      <p role="alert">
        존재하지 않는 메모입니다. <Link to="/">목록으로</Link>
      </p>
    );
  }

  return (
    <article>
      <h2>{note.title}</h2>
      <p>{note.body || "(내용 없음)"}</p>
      <button
        onClick={() => {
          remove(note.id);
          navigate("/", { replace: true });
        }}
      >
        삭제
      </button>{" "}
      <Link to="/">목록으로</Link>
    </article>
  );
}

export default function App() {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <h1>메모장</h1>
      <Routes>
        <Route path="/" element={<NoteList />} />
        <Route path="/new" element={<NewNote />} />
        <Route path="/note/:id" element={<NoteDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MemoryRouter>
  );
}
