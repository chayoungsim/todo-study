// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useState, type ChangeEvent, type FormEvent } from "react";

interface FormState {
  name: string;
  email: string;
  agree: boolean;
}

export default function App() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", agree: false });
  const [submitted, setSubmitted] = useState(false); // 제출을 시도했는가
  const [result, setResult] = useState("");

  // 필드 하나당 핸들러를 만들지 않고, name 속성으로 구분한다.
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  // 검증 결과는 form 값에서 계산한다. (state 로 따로 저장하지 않음)
  const errors = {
    name: form.name.trim() === "" ? "이름을 입력하세요." : "",
    email: form.email.includes("@") ? "" : "올바른 이메일이 아닙니다.",
    agree: form.agree ? "" : "약관에 동의해야 합니다.",
  };
  const isValid = !errors.name && !errors.email && !errors.agree;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // 페이지 새로고침 방지
    setSubmitted(true);
    if (!isValid) return;
    setResult(`${form.name}님(${form.email}) 가입 완료!`);
    setForm({ name: "", email: "", agree: false });
    setSubmitted(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>회원가입</h1>

      <p>
        <label>
          이름 <input name="name" value={form.name} onChange={handleChange} />
        </label>
        {submitted && errors.name && <span role="alert"> {errors.name}</span>}
      </p>

      <p>
        <label>
          이메일 <input name="email" value={form.email} onChange={handleChange} />
        </label>
        {submitted && errors.email && <span role="alert"> {errors.email}</span>}
      </p>

      <p>
        <label>
          <input name="agree" type="checkbox" checked={form.agree} onChange={handleChange} />
          약관에 동의합니다
        </label>
        {submitted && errors.agree && <span role="alert"> {errors.agree}</span>}
      </p>

      <button type="submit">가입</button>
      {result && <p>{result}</p>}
    </form>
  );
}
