## Props란?

컴포넌트는 **props**(properties)로 부모에게서 데이터를 받습니다.
함수의 매개변수와 같다고 생각하면 쉽습니다. 부모가 태그의 속성처럼 값을 넘기고, 자식은 객체 하나로 받습니다.

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>안녕하세요, {name}!</h1>;
}

// 부모에서 사용
<Greeting name="React" />
```

## 타입 지정하기 (TypeScript)

props의 모양은 `interface`나 `type`으로 선언합니다. 필수가 아닌 props는 `?`를 붙입니다.

```tsx
interface ProfileProps {
  name: string;
  age?: number; // 선택
}

function Profile({ name, age = 20 }: ProfileProps) {
  return <p>{name} ({age}세)</p>;
}
```

구조 분해 할당과 함께 `age = 20`처럼 **기본값**을 줄 수 있습니다.

## 문자열이 아닌 값 넘기기

문자열은 따옴표로, 그 외의 값(숫자, 불리언, 배열, 함수)은 **중괄호**로 넘깁니다.

```tsx
<Profile name="민수" age={30} />
```

## children

태그 사이에 넣은 내용은 `children`이라는 특별한 prop으로 전달됩니다.
감싸는 틀(카드, 버튼, 레이아웃)을 만들 때 자주 씁니다.

```tsx
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

<Card>
  <h2>제목</h2>
  <p>내용</p>
</Card>
```

## 꼭 기억할 규칙

props는 **읽기 전용**입니다. 자식 컴포넌트에서 받은 props를 직접 바꾸면 안 됩니다.
값이 바뀌어야 한다면 부모가 새 값을 내려주거나, 다음 시간에 배울 state를 사용합니다.

## 오늘의 정리

- props는 부모가 자식에게 넘기는 데이터이고, 읽기 전용이다.
- 문자열 외의 값은 `{}`로 넘긴다.
- 태그 사이의 내용은 `children`으로 받는다.
- 선택 props는 `?`와 기본값으로 처리한다.
