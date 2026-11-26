## props가 계속 늘어나는 컴포넌트

처음에는 단순했던 컴포넌트가 요구사항이 늘면서 props로 뒤덮이는 일이 흔합니다.

```tsx
<Card
  title="제목"
  subtitle="부제"
  showFooter
  footerText="확인"
  footerAlign="right"
  hasBorder
  headerIcon={<Icon />}
/>
```

props가 많아질수록 **어떤 조합이 가능한지** 알기 어렵고, 새 요구가 생길 때마다 prop을 또 추가해야 합니다.

## 해결: 상속이 아니라 합성(Composition)

React의 기본 철학은 **작은 컴포넌트를 조립**하는 것입니다. 설정값을 넘기는 대신, **내용을 직접 넘깁니다.**

```tsx
<Card>
  <Card.Header>제목</Card.Header>
  <Card.Body>내용 아무거나</Card.Body>
  <Card.Footer>
    <button>확인</button>
  </Card.Footer>
</Card>
```

필요한 조각만 골라 쓰고, 순서도 자유롭습니다. 새 요구가 생겨도 Card 자체를 고칠 필요가 없습니다.

## 패턴 1: children 슬롯

`children`은 가장 단순한 합성입니다. 여러 자리가 필요하면 props로 JSX를 넘길 수도 있습니다.

```tsx
function Layout({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}

<Layout sidebar={<Menu />}>
  <Content />
</Layout>
```

## 패턴 2: Compound Components

`Tabs`, `Accordion`, `Select`처럼 **여러 조각이 하나의 상태를 공유**해야 할 때 씁니다.
부모가 Context로 상태를 들고, 자식 조각들이 그것을 읽습니다. (Day 7의 Context 활용)

```tsx
<Tabs defaultValue="a">
  <Tabs.List>
    <Tabs.Tab value="a">첫째</Tabs.Tab>
    <Tabs.Tab value="b">둘째</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="a">첫째 내용</Tabs.Panel>
  <Tabs.Panel value="b">둘째 내용</Tabs.Panel>
</Tabs>
```

사용하는 쪽은 어떤 탭이 선택됐는지 **신경 쓰지 않아도** 됩니다. 상태는 `Tabs` 안에 숨겨져 있습니다.

### 만드는 방법

```tsx
const TabsContext = createContext<{ value: string; setValue: (v: string) => void } | null>(null);

function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [value, setValue] = useState(defaultValue);
  return <TabsContext value={{ value, setValue }}>{children}</TabsContext>;
}

function Tab({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useTabs();
  return <button onClick={() => ctx.setValue(value)}>{children}</button>;
}

Tabs.Tab = Tab; // Tabs.Tab 으로 쓸 수 있게 붙인다
```

## 패턴 3: Render Props

내용을 **함수로** 넘겨, 부모가 가진 값을 자식 쪽에서 쓰게 합니다.

```tsx
<MouseTracker>
  {(pos) => <p>{pos.x}, {pos.y}</p>}
</MouseTracker>
```

요즘은 같은 일을 **커스텀 훅**(Day 6)으로 하는 경우가 많아서 덜 쓰지만, 알아 두면 라이브러리 코드를 읽을 때 도움이 됩니다.

## 언제 무엇을 쓸까

| 상황 | 패턴 |
|---|---|
| 감싸는 틀 (카드, 레이아웃) | `children`, 슬롯 props |
| 여러 조각이 상태를 공유 (탭, 아코디언) | Compound Components |
| 로직만 재사용하고 UI는 자유롭게 | 커스텀 훅 |

## 오늘의 정리

- props를 늘리기보다 `children`으로 내용을 직접 조립한다.
- 여러 조각이 상태를 공유하면 Compound Components(Context)를 쓴다.
- 상태는 부모 안에 숨기고, 사용하는 쪽은 조립만 한다.
- 로직 재사용에는 보통 커스텀 훅이 더 단순하다.
