// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useEffect, useState } from "react";

interface UserData {
  id: number;
  name: string;
}

// 네트워크를 흉내 내는 함수: id 에 따라 응답 시간이 다르고, 3번은 실패한다.
// id 1 은 일부러 느리게(1.5초), 나머지는 빠르게(0.4초) 응답해 경쟁 상태를 재현한다.
function fetchUser(id: number): Promise<UserData> {
  return new Promise((resolve, reject) => {
    const delay = id === 1 ? 1500 : 400;
    setTimeout(() => {
      if (id === 3) reject(new Error("3번 사용자를 불러오지 못했습니다."));
      else resolve({ id, name: `사용자 ${id}` });
    }, delay);
  });
}

// 결과에 요청한 id 를 함께 저장한다. (로딩 여부를 계산으로 구하기 위해)
type Result =
  | { id: number; status: "success"; data: UserData }
  | { id: number; status: "error"; message: string };

export default function App() {
  const [id, setId] = useState(2);
  const [result, setResult] = useState<Result | null>(null);
  const [retry, setRetry] = useState(0); // 다시 시도 버튼용

  useEffect(() => {
    let ignore = false; // 이 effect 실행에 묶인 플래그 (경쟁 상태 방지)

    fetchUser(id)
      .then((data) => {
        if (!ignore) setResult({ id, status: "success", data });
      })
      .catch((e: Error) => {
        if (!ignore) setResult({ id, status: "error", message: e.message });
      });

    return () => {
      ignore = true; // id 가 바뀌면 이전 요청의 응답은 버린다.
    };
  }, [id, retry]);

  // 현재 id 의 결과가 아직 없으면 로딩 중이다.
  const loading = result === null || result.id !== id;

  return (
    <div>
      <h1>데이터 가져오기</h1>
      <p>
        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => setId(n)} disabled={n === id}>
            {n}번
          </button>
        ))}
      </p>

      {loading && <p>불러오는 중...</p>}
      {!loading && result.status === "success" && <p>이름: {result.data.name}</p>}
      {!loading && result.status === "error" && (
        <p role="alert">
          {result.message}{" "}
          <button
            onClick={() => {
              setResult(null); // 이전 결과를 비워 로딩 표시가 다시 나타나게 한다.
              setRetry((r) => r + 1);
            }}
          >
            다시 시도
          </button>
        </p>
      )}
      <small>1번은 느리고(1.5초), 3번은 실패합니다.</small>
    </div>
  );
}
