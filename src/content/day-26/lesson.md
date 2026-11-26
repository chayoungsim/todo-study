## 왜 타입을 붙일까?

이 사이트의 코드는 처음부터 TypeScript로 작성되었습니다. 타입은 다음 문제를 **실행하기 전에** 알려 줍니다.

- props 이름 오타, 필수 props 누락
- `null`일 수 있는 값을 그대로 쓰는 실수
- 함수에 잘못된 종류의 값을 넘기는 실수

> 이 사이트의 코드 예제 미리보기는 코드를 **실행만** 하고 타입 오류를 표시하지 않습니다. 타입 검사는 로컬 에디터와 `tsc`에서 확인하세요.

## props 타입

```tsx
interface ButtonProps {
  label: string;                    // 필수
  size?: "small" | "large";         // 선택, 정해진 문자열만 허용
  onClick: (id: number) => void;    // 함수 props
  children?: ReactNode;             // 안에 넣을 수 있는 모든 것
}

function Button({ label, size = "small", onClick }: ButtonProps) { /* ... */ }
```

`interface`와 `type`은 props에서는 거의 같게 쓸 수 있습니다. 팀 규칙을 따르세요.

## 이벤트와 state 타입

```tsx
function handleChange(e: ChangeEvent<HTMLInputElement>) { /* e.target.value */ }
function handleSubmit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); }
function handleClick(e: MouseEvent<HTMLButtonElement>) { /* ... */ }
```

타입 이름을 모르겠다면 JSX에서 핸들러를 **인라인으로 먼저 쓰고** 에디터에서 `e`에 마우스를 올려 보세요.

`useState`는 초기값으로 타입을 추론합니다. 초기값만으로 알 수 없을 때(`null`, 빈 배열)는 **제네릭**으로 알려 줍니다.

```tsx
const [count, setCount] = useState(0);                // number 로 추론
const [user, setUser] = useState<User | null>(null);  // 처음엔 null, 나중에 User
const [tags, setTags] = useState<string[]>([]);       // 빈 배열은 타입을 알려줘야 한다
```

## 판별 유니온: 상태를 안전하게

Day 13에서 `loading`, `error`, `data`를 따로 두면 서로 어긋나기 쉽다고 했습니다.
**판별 유니온**은 "지금 어떤 상태인가"를 나타내는 필드(`status`)를 하나 두고, 상태마다 **가질 수 있는 필드를 다르게** 선언합니다.

```tsx
type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }       // data 는 success 일 때만 존재
  | { status: "error"; message: string };

function View({ state }: { state: LoadState<User> }) {
  if (state.status === "success") {
    return <p>{state.data.name}</p>;      // 여기서만 data 에 접근할 수 있다
  }
  // state.data 를 여기서 쓰면 컴파일 오류!
}
```

`status`를 확인하는 순간 TypeScript가 타입을 **좁혀서**, 잘못된 접근을 막아 줍니다.
Day 8의 reducer action이 같은 패턴이었습니다.

## 제네릭 컴포넌트

"어떤 타입의 항목이든" 받는 재사용 컴포넌트는 타입 매개변수 `T`를 씁니다.

```tsx
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

<List items={users} getKey={(u) => u.id} render={(u) => u.name} />
// u 의 타입이 User 로 자동 추론된다
```

## 유틸리티 타입

이미 있는 타입에서 새 타입을 만듭니다.

```tsx
type User = { id: number; name: string; email: string };

Partial<User>              // 모든 필드가 선택
Pick<User, "name" | "email">  // 일부 필드만
Omit<User, "id">           // 일부 필드를 뺀 나머지
Record<string, number>     // 키는 문자열, 값은 숫자인 객체
```

폼 수정처럼 "일부만 바꾸는" 곳에 `Partial`이 자주 쓰입니다.

## 피해야 할 것

- **`any`**: 타입 검사를 꺼 버립니다. 모르는 값은 `unknown`으로 받고 확인한 뒤 쓰세요.
- **`as` 단언 남용**: "내가 안다"고 컴파일러를 속이는 것입니다. 틀리면 실행 중에 터집니다.
- 모든 곳에 타입을 적기: 추론되는 곳은 생략하고, **경계(props, 함수 인자, 외부 데이터)** 에 적으세요.

외부에서 온 데이터(API 응답, `JSON.parse`, 이 사이트의 백업 파일처럼)는 타입이 맞는지 **실행 중에 직접 검증**해야 합니다. TypeScript의 타입은 실행 전에만 존재하기 때문입니다.

## 오늘의 정리

- props, 이벤트, state의 경계에 타입을 적는다. 빈 배열과 `null`은 `useState<T>`로 알려 준다.
- 상태는 판별 유니온으로 표현하면 잘못된 접근이 컴파일 단계에서 막힌다.
- 제네릭 컴포넌트와 유틸리티 타입(`Partial`, `Pick`, `Omit`)으로 재사용성을 높인다.
- `any`와 `as`를 피하고, 외부 데이터는 실행 중에 검증한다.
