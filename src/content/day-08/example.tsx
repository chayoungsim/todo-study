// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
import { useReducer } from "react";

interface Player {
  id: number;
  name: string;
  score: number;
}

interface State {
  players: Player[];
  nextId: number;
}

// action 은 유니온 타입으로 정의: type 에 따라 필요한 필드가 달라진다.
type Action =
  | { type: "add"; name: string }
  | { type: "score"; id: number; delta: number }
  | { type: "remove"; id: number }
  | { type: "resetScores" };

const initialState: State = {
  players: [
    { id: 1, name: "민수", score: 0 },
    { id: 2, name: "지영", score: 0 },
  ],
  nextId: 3,
};

// reducer: 순수 함수. state 를 직접 수정하지 않고 새 객체를 반환한다.
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":
      return {
        players: [...state.players, { id: state.nextId, name: action.name, score: 0 }],
        nextId: state.nextId + 1,
      };
    case "score":
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.id ? { ...p, score: p.score + action.delta } : p,
        ),
      };
    case "remove":
      return { ...state, players: state.players.filter((p) => p.id !== action.id) };
    case "resetScores":
      return { ...state, players: state.players.map((p) => ({ ...p, score: 0 })) };
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const total = state.players.reduce((sum, p) => sum + p.score, 0);

  return (
    <div>
      <h1>점수판 (합계 {total})</h1>
      <ul>
        {state.players.map((p) => (
          <li key={p.id}>
            {p.name}: {p.score}{" "}
            <button onClick={() => dispatch({ type: "score", id: p.id, delta: 1 })}>+1</button>
            <button onClick={() => dispatch({ type: "score", id: p.id, delta: -1 })}>-1</button>
            <button onClick={() => dispatch({ type: "remove", id: p.id })}>삭제</button>
          </li>
        ))}
      </ul>
      <button onClick={() => dispatch({ type: "add", name: `선수 ${state.nextId}` })}>
        선수 추가
      </button>
      <button onClick={() => dispatch({ type: "resetScores" })}>점수 초기화</button>
    </div>
  );
}
