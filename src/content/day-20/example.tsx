// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useId, useState, type FormEvent } from "react";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

// 재사용 컴포넌트: useId 로 인스턴스마다 고유한 id 를 만든다.
function Field({ label, value, onChange, error }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <p>
      <label htmlFor={id}>{label}</label>{" "}
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error} // 잘못된 값임을 알린다.
        aria-describedby={error ? errorId : undefined} // 에러 메시지와 연결한다.
      />
      {error && (
        <span id={errorId} role="alert">
          {" "}
          {error}
        </span>
      )}
    </p>
  );
}

export default function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [notify, setNotify] = useState(false);

  const errors = {
    name: submitted && name.trim() === "" ? "이름을 입력하세요." : "",
    email: submitted && !email.includes("@") ? "올바른 이메일이 아닙니다." : "",
  };

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>접근 가능한 폼</h1>

      {/* 같은 Field 를 두 번 써도 id 가 겹치지 않는다. */}
      <Field label="이름" value={name} onChange={setName} error={errors.name} />
      <Field label="이메일" value={email} onChange={setEmail} error={errors.email} />

      {/* div onClick 이 아니라 button: 키보드(Enter/Space)와 역할이 기본 제공된다. */}
      <button type="button" aria-pressed={notify} onClick={() => setNotify((n) => !n)}>
        알림 {notify ? "켜짐" : "꺼짐"}
      </button>{" "}
      <button type="submit">제출</button>
    </form>
  );
}
