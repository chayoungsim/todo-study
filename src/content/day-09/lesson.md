## 제어 컴포넌트(Controlled Component)

HTML의 `<input>`은 원래 **자기 값을 스스로 기억**합니다.
React에서는 입력값을 **state가 기억하게** 하고, input은 그 값을 보여주기만 하도록 만드는 것이 일반적입니다. 이를 제어 컴포넌트라고 합니다.

```tsx
function NameInput() {
  const [name, setName] = useState("");

  return (
    <input
      value={name}                              // 화면에 보이는 값은 state
      onChange={(e) => setName(e.target.value)} // 입력이 있으면 state 를 갱신
    />
  );
}
```

`value`만 주고 `onChange`를 빼면 **입력이 막힌 것처럼** 동작합니다. state가 바뀌지 않으니 화면의 값도 바뀌지 않기 때문입니다.

## 여러 필드는 객체 하나로

필드마다 state를 만들면 금방 늘어납니다. 객체 하나에 담고, `name` 속성으로 어떤 필드인지 구분하면 핸들러 하나로 처리됩니다.

```tsx
const [form, setForm] = useState({ name: "", email: "" });

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value })); // [name]: 계산된 속성 이름
}

<input name="name" value={form.name} onChange={handleChange} />
<input name="email" value={form.email} onChange={handleChange} />
```

## 입력 종류별 차이

- 텍스트, 이메일, `<textarea>`, `<select>`: `value` + `e.target.value`
- 체크박스: `checked` + `e.target.checked`
- 라디오: `checked={선택값 === 이 항목의 값}`

## 제출 처리

`<form>`의 `onSubmit`을 쓰고, 브라우저의 기본 동작(페이지 새로고침)을 막아야 합니다.

```tsx
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault(); // 새로고침 방지
  // 검증하고 제출한다
}

<form onSubmit={handleSubmit}>
  ...
  <button type="submit">가입</button>
</form>
```

버튼을 `onClick`이 아닌 **form의 submit**으로 처리하면 Enter 키로도 제출되어 접근성과 사용성이 좋아집니다.

## 검증과 에러 메시지

검증 결과는 **form 값에서 계산할 수 있는 파생 값**입니다. Day 4에서 배운 대로, effect로 state를 또 만들지 말고 렌더링 중에 계산하세요.

```tsx
const errors = {
  name: form.name.trim() === "" ? "이름을 입력하세요." : "",
  email: form.email.includes("@") ? "" : "올바른 이메일이 아닙니다.",
};
const isValid = !errors.name && !errors.email;
```

사용자가 아직 입력하지도 않았는데 에러부터 보여주면 불친절합니다. **제출을 시도한 뒤**부터 에러를 보여주는 식으로 `submitted` 같은 state를 하나 둡니다.

## 오늘의 정리

- 제어 컴포넌트는 `value`(또는 `checked`)와 `onChange`가 짝이다.
- 여러 필드는 객체 state 하나와 `name` 기반 핸들러로 다룬다.
- `<form onSubmit>`에서 `e.preventDefault()`로 새로고침을 막는다.
- 검증 에러는 form 값에서 계산하고, 제출을 시도한 뒤에 보여준다.
