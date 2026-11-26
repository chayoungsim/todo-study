// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

interface State {
  message: string;
  error: boolean;
  email: string; // 실패했을 때 입력값을 다시 채우기 위해 보관한다.
}

// 서버 요청을 흉내 내는 함수 (0.8초 걸린다)
const fakeSubscribe = () => new Promise<void>((resolve) => setTimeout(resolve, 800));

// action: (이전 state, formData) => 새 state. 반환값이 곧 상태가 된다.
async function subscribeAction(_prev: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email.includes("@")) {
    return { message: "올바른 이메일이 아닙니다.", error: true, email };
  }
  await fakeSubscribe();
  return { message: `${email} 구독 완료!`, error: false, email: "" };
}

// 폼 안쪽 자식은 useFormStatus 로 진행 상태를 직접 읽는다. (props 로 내릴 필요가 없다.)
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "처리 중..." : "구독"}
    </button>
  );
}

export default function App() {
  const [state, formAction] = useActionState(subscribeAction, {
    message: "",
    error: false,
    email: "",
  });

  return (
    <form action={formAction}>
      <h1>뉴스레터 구독</h1>
      <p>
        <label>
          이메일{" "}
          {/* action 이 끝나면 입력창이 초기화되므로, 실패 시 값을 defaultValue 로 다시 채운다. */}
          <input name="email" defaultValue={state.email} key={state.message} />
        </label>
      </p>
      <SubmitButton />
      {state.message && <p role={state.error ? "alert" : "status"}>{state.message}</p>}
    </form>
  );
}
