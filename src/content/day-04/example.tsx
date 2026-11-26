// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useEffect, useState } from "react";

// 마운트되면 타이머를 시작하고, 사라질 때 정리하는 컴포넌트
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((prev) => prev + 1); // 최신 값 기준으로 갱신
    }, 1000);

    // 정리: 컴포넌트가 사라질 때 타이머를 멈춘다.
    return () => clearInterval(id);
  }, []); // [] : 처음 나타날 때 한 번만 실행

  return <p>경과 시간: {seconds}초</p>;
}

export default function App() {
  const [visible, setVisible] = useState(true);

  // 의존성 배열에 visible 이 있으므로 visible 이 바뀔 때마다 실행된다.
  useEffect(() => {
    document.title = visible ? "타이머 켜짐" : "타이머 꺼짐";
  }, [visible]);

  return (
    <div>
      <button onClick={() => setVisible((v) => !v)}>
        {visible ? "타이머 숨기기" : "타이머 보이기"}
      </button>
      {visible && <Timer />}
      <p>숨겼다가 다시 보이면 0초부터 새로 시작합니다.</p>
    </div>
  );
}
