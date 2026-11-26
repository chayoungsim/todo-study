// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

// 컴포넌트 밖에서 한 번만 만든다. (캐시를 보관한다.)
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }, // 예제에서는 재시도를 끈다.
});

// 서버를 흉내 내는 함수: 호출될 때마다 요청 번호를 올려, 캐시가 동작하는지 눈으로 확인한다.
let requestCount = 0;
function fetchUser(id: number): Promise<{ name: string; requestNo: number }> {
  return new Promise((resolve, reject) => {
    const requestNo = ++requestCount;
    setTimeout(() => {
      if (id === 3) reject(new Error("3번 사용자를 불러오지 못했습니다."));
      else resolve({ name: `사용자 ${id}`, requestNo });
    }, 500);
  });
}

function User({ id }: { id: number }) {
  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["user", id], // 캐시의 이름표. queryFn 이 쓰는 id 를 반드시 넣는다.
    queryFn: () => fetchUser(id),
    staleTime: 4000, // 4초 동안은 신선하다 → 다시 가져오지 않는다.
  });

  // Day 13 의 loading / error / ignore / useEffect 가 모두 사라졌다.
  if (isPending) return <p>불러오는 중...</p>;
  if (isError) return <p role="alert">{error.message}</p>;
  return (
    <p>
      {data.name} (서버 응답 #{data.requestNo}) {isFetching && <em>· 뒤에서 갱신 중</em>}
    </p>
  );
}

export default function App() {
  const [id, setId] = useState(1);

  return (
    <QueryClientProvider client={queryClient}>
      <h1>TanStack Query</h1>
      <p>
        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => setId(n)} disabled={n === id}>
            {n}번
          </button>
        ))}
      </p>
      <User id={id} />
      <small>
        1→2→1 로 오가 보세요. 4초 안에는 캐시를 즉시 보여주고 서버 응답 번호가 늘지 않습니다.
        3번은 실패합니다.
      </small>
    </QueryClientProvider>
  );
}
