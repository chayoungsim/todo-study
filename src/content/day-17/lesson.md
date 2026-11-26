## 컴포넌트의 상태는 "위치"에 붙어 있다

React는 컴포넌트의 state를 **화면 트리에서의 위치와 타입**으로 기억합니다.
같은 자리에 같은 컴포넌트가 계속 나타나면 React는 "같은 컴포넌트"로 보고 **state를 유지**합니다.

```tsx
function Editor({ user }: { user: User }) {
  const [draft, setDraft] = useState(""); // 작성 중인 글
  // ...
}

// user 가 바뀌어도 Editor 는 같은 자리의 같은 컴포넌트 → draft 가 그대로 남는다!
<Editor user={selectedUser} />
```

사용자 A를 보며 쓰던 글이, 사용자 B로 바꿔도 **그대로 남아 있는** 버그가 생깁니다.

## key로 "다른 컴포넌트"라고 알려 주기

Day 5에서 `key`는 목록에서 항목을 구별하는 이름표라고 배웠습니다. 사실 `key`는 **목록 밖에서도** 쓸 수 있습니다.
`key`가 바뀌면 React는 **이전 컴포넌트를 버리고 새로 만듭니다.** state도 처음부터 다시 시작합니다.

```tsx
<Editor key={selectedUser.id} user={selectedUser} />
```

사용자가 바뀔 때마다 `Editor`가 새로 만들어져 `draft`가 빈 값으로 초기화됩니다.

### effect로 초기화하지 마세요

```tsx
// 피하세요: props 가 바뀔 때 effect 로 state 를 리셋
useEffect(() => { setDraft(""); }, [user.id]);
```

한 박자 늦게 리셋되어 **이전 값이 잠깐 보이고**, 코드도 복잡합니다. `key`가 더 단순하고 정확합니다.

## 제어 vs 비제어 컴포넌트

Day 9에서는 입력값을 state로 관리하는 **제어 컴포넌트**를 배웠습니다.
반대로 입력값을 **DOM이 스스로 기억**하게 두는 방식이 **비제어(uncontrolled) 컴포넌트**입니다.

```tsx
<input defaultValue="처음 값" name="nickname" />
```

- `value` 대신 **`defaultValue`**로 초기값만 정합니다.
- 값이 필요한 순간(제출 등)에 DOM에서 읽습니다.

```tsx
function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const data = new FormData(e.currentTarget); // 폼의 모든 값을 한 번에
  console.log(data.get("nickname"));
}
```

## 언제 무엇을 쓸까

| | 제어 | 비제어 |
|---|---|---|
| 입력할 때마다 반응 (실시간 검증, 미리보기) | 알맞음 | 불편함 |
| 제출할 때만 값이 필요 | 과함 | 알맞음 |
| 입력값을 다른 곳에서 바꿔야 함 | 알맞음 | 어려움 |
| 파일 입력(`type="file"`) | 불가능 | 유일한 방법 |

입력 하나하나를 state로 만드는 것이 부담스러운 **단순한 폼**은 비제어 + `FormData`가 훨씬 간단합니다.
(다음 시간의 폼 Actions도 이 방식을 활용합니다.)

## 오늘의 정리

- state는 화면 트리의 위치와 타입에 붙어 있어서, 같은 자리의 같은 컴포넌트는 state가 유지된다.
- `key`가 바뀌면 컴포넌트가 새로 만들어져 state가 초기화된다. effect로 리셋하지 않는다.
- 비제어 컴포넌트는 `defaultValue`로 초기값만 주고, 필요할 때 `FormData`나 ref로 읽는다.
- 실시간 반응이 필요하면 제어, 제출 때만 필요하면 비제어가 알맞다.
