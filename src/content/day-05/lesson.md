## 조건부 렌더링

JSX는 JavaScript이므로 `if`, 삼항 연산자, `&&` 같은 일반 문법으로 **무엇을 보여줄지** 정합니다.

### 1. if 문으로 일찍 반환하기

```tsx
function Profile({ user }: { user: User | null }) {
  if (!user) return <p>로그인이 필요합니다.</p>;
  return <h1>{user.name}님, 환영합니다</h1>;
}
```

### 2. 삼항 연산자: 둘 중 하나

```tsx
<p>{isOnline ? "온라인" : "오프라인"}</p>
```

### 3. && 연산자: 조건이 참일 때만 보여주기

```tsx
{hasNewMessage && <Badge />}
```

### && 사용 시 함정

`&&`의 왼쪽이 숫자 `0`이면 React는 아무것도 그리지 않는 대신 **0을 그대로 화면에 출력**합니다.

```tsx
{count && <Badge />}      // count 가 0 이면 화면에 "0" 이 나온다
{count > 0 && <Badge />}  // 올바름: 왼쪽을 불리언으로 만든다
```

`null`, `undefined`, `true`, `false`는 화면에 아무것도 그려지지 않습니다.

## 리스트 렌더링

배열의 `map`으로 각 항목을 JSX로 바꿔 목록을 만듭니다.

```tsx
const fruits = ["사과", "바나나", "포도"];

<ul>
  {fruits.map((fruit) => (
    <li key={fruit}>{fruit}</li>
  ))}
</ul>
```

### key가 필요한 이유

`key`는 React가 **어떤 항목이 어떤 항목인지** 구별하는 이름표입니다.
항목이 추가, 삭제, 재정렬될 때 key를 보고 "바뀐 것만" 효율적으로 갱신하고, 각 항목의 state도 올바른 항목에 붙어 있게 합니다.

```tsx
{todos.map((todo) => (
  <TodoItem key={todo.id} todo={todo} />
))}
```

### key 규칙

- 형제 항목 사이에서 **고유**해야 합니다. (전역으로 고유할 필요는 없음)
- **변하지 않는 값**을 씁니다. 보통 데이터의 `id`가 가장 좋습니다.
- 배열 인덱스(`map`의 두 번째 인자)는 항목이 추가/삭제/재정렬되면 어긋나므로 되도록 피합니다.
- `key`는 props로 전달되지 않으므로 자식 컴포넌트에서 읽을 수 없습니다.

## 필터링과 정렬

원본 state는 그대로 두고, 화면에 그릴 때 `filter`와 `map`으로 가공합니다.

```tsx
const visibleTodos = showDone ? todos : todos.filter((t) => !t.done);
```

`sort`는 원본 배열을 바꾸므로, 쓰려면 먼저 복사하세요: `[...todos].sort(...)`.

## 오늘의 정리

- 조건부 렌더링은 `if`, 삼항 연산자, `&&`로 한다. `&&` 왼쪽에 숫자를 직접 쓰지 않는다.
- 목록은 `map`으로 그리고, 각 항목에 고유하고 안정적인 `key`를 준다.
- key는 인덱스보다 데이터의 `id`를 쓴다.
- 파생 목록은 state에 따로 저장하지 말고 렌더링 중에 `filter`로 계산한다.
