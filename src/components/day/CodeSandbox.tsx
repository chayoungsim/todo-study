import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";

interface CodeSandboxProps {
  /** example.tsx 원문. default export 컴포넌트가 미리보기에 렌더링된다. */
  code: string;
}

/** 수정하고 바로 실행해볼 수 있는 라이브 코드 에디터 (Sandpack). */
export default function CodeSandbox({ code }: CodeSandboxProps) {
  // 앱의 라이트/다크 전환 버튼과 에디터 테마를 맞춘다. ("auto" 는 OS 설정만 따른다)
  const { resolvedTheme } = useTheme();
  return (
    <SandpackProvider
      template="react-ts"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      files={{ "/App.tsx": code }}
      options={{ activeFile: "/App.tsx" }}
    >
      {/* 좁은 화면에서는 에디터와 미리보기를 세로로 쌓는다. */}
      <SandpackLayout className="!flex-col md:!flex-row">
        <SandpackCodeEditor
          showTabs={false}
          showLineNumbers
          style={{ minHeight: 240 }}
        />
        <SandpackPreview
          showOpenInCodeSandbox={false}
          style={{ minHeight: 240 }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}
