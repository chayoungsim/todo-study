// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import type { ReactNode } from "react";

interface BadgeProps {
  label: string;
  count?: number;
}

function Badge({ label, count = 0 }: BadgeProps) {
  return (
    <span style={{ marginRight: 8 }}>
      {label}: {count}
    </span>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function App() {
  return (
    <Card title="오늘의 학습">
      <Badge label="완료" count={2} />
      <Badge label="남음" count={28} />
      <Badge label="연속" />
    </Card>
  );
}
