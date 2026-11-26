## 접근성(Accessibility, a11y)이란?

누구나 웹을 쓸 수 있게 만드는 것입니다.
화면을 볼 수 없어 **스크린 리더**로 듣는 사람, 마우스를 쓸 수 없어 **키보드만** 쓰는 사람, 색을 구분하기 어려운 사람 등이 포함됩니다.
접근성은 특별한 사람을 위한 기능이 아니라 **모든 사용자에게 더 나은 화면**을 만드는 기본기입니다.

## 규칙 1: 의미에 맞는 HTML 요소를 쓰기

가장 효과가 큰 접근성은 **올바른 태그**를 쓰는 것입니다.

```tsx
// 나쁨: 클릭은 되지만 키보드로 접근할 수 없고, 스크린 리더는 버튼인 줄 모른다
<div onClick={save}>저장</div>

// 좋음: 포커스, Enter/Space 키, 버튼 역할이 모두 기본으로 제공된다
<button onClick={save}>저장</button>
```

- 동작을 일으키면 `<button>`, 다른 곳으로 이동하면 `<a>`
- 제목은 `<h1>`~`<h6>`를 순서대로, 영역은 `<nav>`, `<main>`, `<section>` 등으로

## 규칙 2: 입력창에는 label을 연결하기

`<label>`이 입력창과 연결되어 있어야 스크린 리더가 "이름, 입력란"이라고 읽어 주고, 라벨을 클릭하면 입력창에 포커스가 갑니다. 연결 방법은 두 가지입니다.

```tsx
// 방법 1: 감싸기
<label>이름 <input /></label>

// 방법 2: htmlFor 와 id 로 연결 (React 에서는 for 대신 htmlFor)
<label htmlFor="name">이름</label>
<input id="name" />
```

## 문제: 재사용 컴포넌트에서 id가 겹친다

방법 2는 `id`가 **페이지에서 고유**해야 합니다. 같은 컴포넌트를 두 번 쓰면 `id="name"`이 겹쳐 연결이 깨집니다.

## useId: 고유한 id 만들기

`useId`는 컴포넌트마다 **겹치지 않는 id**를 만들어 줍니다.

```tsx
function Field({ label }: { label: string }) {
  const id = useId(); // 인스턴스마다 고유한 문자열 (모양은 React 버전에 따라 다르다)
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}

<Field label="이름" />
<Field label="이메일" /> {/* 각자 다른 id 를 가진다 */}
```

`useId`로 만든 값은 **CSS 선택자나 리스트의 `key`로 쓰는 용도가 아닙니다.** 접근성 속성(`htmlFor`, `aria-describedby` 등)을 연결하는 용도입니다.

## 규칙 3: 에러 메시지를 입력창과 연결하기

에러가 화면에만 보이면 스크린 리더 사용자는 알 수 없습니다. 속성으로 연결합니다.

```tsx
<input
  id={id}
  aria-invalid={!!error}                       // 잘못된 값임을 알린다
  aria-describedby={error ? `${id}-error` : undefined} // 설명(에러) 요소와 연결
/>
{error && <p id={`${id}-error`} role="alert">{error}</p>}
```

`role="alert"`는 내용이 나타나는 즉시 스크린 리더가 읽어 줍니다.

## 규칙 4: 상태를 전달하기

색이나 모양만으로 상태를 표현하지 말고 속성으로도 알립니다.

```tsx
<button aria-pressed={on}>알림 {on ? "켜짐" : "꺼짐"}</button>
```

## 규칙 5: 그 밖의 기본기

- 이미지에는 `alt`를 쓰고, 장식용이면 `alt=""`
- 키보드 `Tab`으로 모든 기능에 접근 가능한지 직접 확인
- 포커스 표시(outline)를 함부로 없애지 않기
- 색 대비를 충분히 확보하기

## 확인하는 방법

- 마우스를 놓고 **키보드만으로** 화면을 사용해 본다.
- 브라우저 개발자 도구의 **Accessibility** 탭, Lighthouse, ESLint의 `jsx-a11y` 규칙을 활용한다.

## 오늘의 정리

- 의미에 맞는 요소(`button`, `a`, `label`)를 쓰면 접근성의 대부분이 기본으로 해결된다.
- 입력창은 `label`과 연결한다. 재사용 컴포넌트의 고유 id는 `useId`로 만든다.
- 에러는 `aria-invalid`, `aria-describedby`, `role="alert"`로 입력창과 연결한다.
- 상태는 색뿐 아니라 `aria-pressed` 같은 속성으로도 전달한다.
