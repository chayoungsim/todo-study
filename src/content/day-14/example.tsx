// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { Component, Suspense, use, useState, type ReactNode } from "react";

interface UserData {
  id: number;
  name: string;
}

// 네트워크를 흉내 내는 함수: 0.6초 뒤 응답, 3번은 실패한다.
function fetchUser(id: number): Promise<UserData> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 3) reject(new Error(`${id}번 사용자를 불러오지 못했습니다.`));
      else resolve({ id, name: `사용자 ${id}` });
    }, 600);
  });
}

// use() 는 같은 입력에 같은 Promise 를 받아야 하므로 캐시한다.
const cache = new Map<number, Promise<UserData>>();
function getUser(id: number) {
  if (!cache.has(id)) cache.set(id, fetchUser(id));
  return cache.get(id)!;
}

// Error Boundary: 렌더링 중 던져진 에러를 받아 대체 화면을 보여준다. (클래스 컴포넌트만 가능)
interface BoundaryProps {
  children: ReactNode;
  onRetry: () => void;
}
class ErrorBoundary extends Component<BoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <p role="alert">
          {this.state.error.message}{" "}
          <button
            onClick={() => {
              this.props.onRetry(); // 실패한 Promise 를 캐시에서 지운다.
              this.setState({ error: null });
            }}
          >
            다시 시도
          </button>
        </p>
      );
    }
    return this.props.children;
  }
}

// 이 컴포넌트는 "성공한 경우"만 신경 쓴다. 로딩과 에러는 바깥에서 처리한다.
function Profile({ id }: { id: number }) {
  const user = use(getUser(id)); // 끝날 때까지 이 컴포넌트는 멈춘다.
  return <p>이름: {user.name}</p>;
}

export default function App() {
  const [id, setId] = useState(1);

  return (
    <div>
      <h1>Suspense + Error Boundary</h1>
      <p>
        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => setId(n)} disabled={n === id}>
            {n}번
          </button>
        ))}
      </p>

      {/* id 가 바뀌면 Error Boundary 도 새로 시작하도록 key 를 준다. */}
      <ErrorBoundary key={id} onRetry={() => cache.delete(id)}>
        <Suspense fallback={<p>불러오는 중...</p>}>
          <Profile id={id} />
        </Suspense>
      </ErrorBoundary>
      <small>3번은 실패합니다.</small>
    </div>
  );
}
