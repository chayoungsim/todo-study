## 부수 효과(Side Effect)란?

컴포넌트의 본업은 props와 state로 **화면을 계산해 반환하는 것**입니다.
그 밖에 React 바깥 세계와 상호작용하는 일을 **부수 효과**라고 부릅니다.

- 타이머 시작(`setInterval`)
- 이벤트 리스너 등록(`window.addEventListener`)
- 서버에서 데이터 가져오기
- `document.title` 같은 브라우저 값 바꾸기

이런 일을 렌더링 도중에 직접 하면 렌더링이 일어날 때마다 반복되어 문제가 됩니다.
그래서 **렌더링이 끝난 뒤**에 실행하도록 맡기는 도구가 `useEffect`입니다.

## useEffect 기본 형태

```tsx
import { useEffect } from "react";

useEffect(() => {
  // 렌더링이 화면에 반영된 뒤 실행할 코드
  return () => {
    // (선택) 정리(cleanup) 코드
  };
}, [의존성1, 의존성2]);
```

## 의존성 배열: 언제 다시 실행할까?

두 번째 인자인 **의존성 배열**이 실행 시점을 정합니다.

```tsx
useEffect(() => { ... });          // 매 렌더링 후 실행 (거의 안 씀)
useEffect(() => { ... }, []);      // 처음 나타날 때(마운트) 한 번만
useEffect(() => { ... }, [count]); // 처음 + count 가 바뀔 때마다
```

effect 안에서 읽는 props/state는 **전부 의존성 배열에 적어야** 합니다.
빠뜨리면 오래된 값을 기억하는 버그가 생깁니다. ESLint의 `react-hooks/exhaustive-deps` 규칙이 알려줍니다.

## 정리(Cleanup)

타이머나 이벤트 리스너는 시작만 하고 끝내지 않으면 컴포넌트가 사라진 뒤에도 계속 돕니다.
effect가 함수를 반환하면, React가 **다음 실행 직전**과 **컴포넌트가 사라질 때** 그 함수를 호출합니다.

```tsx
useEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(id); // 정리
}, []);
```

"시작한 것은 반드시 정리한다"가 기본 원칙입니다.

## 개발 중에 effect가 두 번 실행돼요

`StrictMode`(이 프로젝트에서 사용 중)에서는 개발 환경에 한해 effect를 **한 번 더** 실행해 봅니다.
정리 코드가 제대로 짝을 이루는지 확인하기 위한 것이고, 배포 환경에서는 한 번만 실행됩니다.
정리 코드를 올바르게 쓰면 두 번 실행되어도 문제가 없습니다.

## effect가 필요 없는 경우

state나 props로 **계산할 수 있는 값**은 effect로 state를 또 만들지 말고 렌더링 중에 계산하세요.

```tsx
// 불필요: effect 로 파생 값을 state 에 복사
const [fullName, setFullName] = useState("");
useEffect(() => setFullName(first + " " + last), [first, last]);

// 권장: 그냥 계산
const fullName = first + " " + last;
```

사용자의 클릭에 반응하는 일은 effect가 아니라 **이벤트 핸들러**에서 처리합니다.

## 오늘의 정리

- 부수 효과는 렌더링 밖의 일이고, `useEffect`로 렌더링이 끝난 뒤 실행한다.
- 의존성 배열이 실행 시점을 정한다. `[]`는 마운트 때 한 번이다.
- 타이머와 리스너는 반환 함수(cleanup)로 정리한다.
- 계산할 수 있는 값과 클릭 처리에는 effect를 쓰지 않는다.
