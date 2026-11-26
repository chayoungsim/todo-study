// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { memo, useDeferredValue, useState, useTransition } from "react";

const ALL_ITEMS = Array.from({ length: 120 }, (_, i) => `항목 ${i + 1}`);

// 일부러 느린 항목: 렌더링마다 무거운 계산을 한다. (실제로는 이런 코드를 쓰지 않는다.)
function SlowItem({ text }: { text: string }) {
  let sum = 0;
  // Sandpack 은 반복문 하나가 10만 번을 넘으면 무한 루프로 보고 멈춘다.
  // 그래서 바깥 반복문으로 나눠서 부담을 만든다.
  for (let round = 0; round < 20; round++) {
    for (let i = 0; i < 50000; i++) sum += i % 7;
  }
  return <li title={String(sum)}>{text}</li>;
}

// memo: keyword 가 같으면 렌더링을 건너뛴다. (deferred 값이 바뀔 때만 느린 목록을 다시 그린다.)
const SlowList = memo(function SlowList({ keyword }: { keyword: string }) {
  const items = ALL_ITEMS.filter((t) => t.includes(keyword));
  return (
    <ul>
      {items.map((t) => (
        <SlowItem key={t} text={t} />
      ))}
    </ul>
  );
});

export default function App() {
  // 1) useDeferredValue: 입력은 즉시, 목록은 나중에 따라온다.
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  // 2) useTransition: 탭 전환(무거운 갱신)을 급하지 않은 갱신으로 표시한다.
  const [tab, setTab] = useState<"home" | "list">("home");
  const [isPending, startTransition] = useTransition();

  function selectTab(next: "home" | "list") {
    startTransition(() => setTab(next));
  }

  return (
    <div>
      <h1>동시성 훅</h1>

      <h2>useDeferredValue</h2>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색어 (예: 12)"
      />
      <p>{isStale ? "목록 업데이트 중..." : "목록이 최신입니다."}</p>
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <SlowList keyword={deferredQuery} />
      </div>

      <h2>useTransition</h2>
      <button onClick={() => selectTab("home")}>홈 탭</button>
      <button onClick={() => selectTab("list")}>목록 탭</button>
      <p>
        현재 탭: {tab} {isPending && "(전환 중...)"}
      </p>
    </div>
  );
}
