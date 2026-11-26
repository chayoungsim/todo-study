// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { createContext, useContext, useState, type ReactNode } from "react";

// ---- Compound Components: Tabs ----
interface TabsValue {
  value: string;
  setValue: (v: string) => void;
}
const TabsContext = createContext<TabsValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs 안에서 사용하세요.");
  return ctx;
}

// 부모: 선택된 탭 상태를 가지고 Context 로 제공한다. (사용하는 쪽에는 숨겨져 있다.)
function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [value, setValue] = useState(defaultValue);
  return <TabsContext value={{ value, setValue }}>{children}</TabsContext>;
}

function TabList({ children }: { children: ReactNode }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useTabs();
  const selected = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={selected}
      onClick={() => ctx.setValue(value)}
      style={{ fontWeight: selected ? "bold" : "normal" }}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useTabs();
  if (ctx.value !== value) return null; // 선택된 탭의 내용만 보인다.
  return <div role="tabpanel">{children}</div>;
}

// Tabs.Tab 처럼 쓸 수 있게 붙인다.
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// ---- children 슬롯: Card ----
function Card({ children }: { children: ReactNode }) {
  return <section style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>{children}</section>;
}

export default function App() {
  return (
    <div>
      <h1>합성 패턴</h1>
      <Card>
        <Tabs defaultValue="intro">
          <Tabs.List>
            <Tabs.Tab value="intro">소개</Tabs.Tab>
            <Tabs.Tab value="usage">사용법</Tabs.Tab>
            <Tabs.Tab value="faq">FAQ</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="intro">합성은 작은 컴포넌트를 조립하는 방식입니다.</Tabs.Panel>
          <Tabs.Panel value="usage">
            <p>필요한 조각만 골라 원하는 순서로 배치하세요.</p>
          </Tabs.Panel>
          <Tabs.Panel value="faq">props 를 계속 늘리지 않아도 됩니다.</Tabs.Panel>
        </Tabs>
      </Card>
    </div>
  );
}
