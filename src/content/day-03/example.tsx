// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<string[]>([]);

  function addItem() {
    // 배열은 직접 push 하지 않고 새 배열로 교체한다.
    setItems([...items, `항목 ${items.length + 1}`]);
  }

  return (
    <div>
      <h1>카운터: {count}</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>+1</button>
      <button onClick={() => setCount(0)}>초기화</button>

      <h2>목록 ({items.length})</h2>
      <button onClick={addItem}>항목 추가</button>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
