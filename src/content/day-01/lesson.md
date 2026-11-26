## 컴포넌트란?

React 화면은 **컴포넌트**라는 작은 조각들을 조립해서 만듭니다.
컴포넌트는 UI를 반환하는 **함수**입니다. 이름은 반드시 **대문자**로 시작합니다.

```tsx
function Greeting() {
  return <h1>안녕하세요!</h1>;
}
```

## JSX란?

위 코드의 `<h1>...</h1>` 처럼 JavaScript 안에 쓰는 HTML 비슷한 문법이 **JSX**입니다.
JSX는 HTML과 비슷하지만 몇 가지 규칙이 다릅니다.

- 반드시 **하나의 부모 요소**로 감싸야 합니다. (`<>...</>` 프래그먼트 사용 가능)
- `class` 대신 `className`을 씁니다.
- 모든 태그는 닫아야 합니다. (`<img />`)
- 중괄호 `{}` 안에 JavaScript 표현식을 넣을 수 있습니다.

```tsx
const name = "React";
const element = <p className="intro">{name} 공부 시작!</p>;
```

## 컴포넌트 조립하기

컴포넌트 안에서 다른 컴포넌트를 태그처럼 사용할 수 있습니다.

```tsx
function App() {
  return (
    <>
      <Greeting />
      <Greeting />
    </>
  );
}
```

## 오늘의 정리

- 컴포넌트는 UI를 반환하는 대문자 이름의 함수다.
- JSX는 JavaScript 안에서 UI를 표현하는 문법이다.
- `{}` 안에는 JavaScript 표현식을 쓴다.
