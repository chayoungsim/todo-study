import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** 학습 본문 마크다운 렌더러 (Tailwind typography 의 prose 스타일 사용) */
export default function Markdown({ children }: { children: string }) {
  return (
    <article className="prose max-w-none dark:prose-invert prose-pre:bg-muted prose-pre:text-foreground prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:[&_code]:bg-transparent prose-pre:[&_code]:p-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </article>
  );
}
