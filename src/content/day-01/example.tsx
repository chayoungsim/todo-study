// Sandpack 에서 실행되는 예제 코드입니다. (default export 가 화면에 렌더링됨)
function Greeting({ name }: { name: string }) {
  return <h1>안녕하세요, {name}!</h1>;
}

export default function App() {
  return (
    <>
      <Greeting name="React" />
      <Greeting name="JSX" />
    </>
  );
}
