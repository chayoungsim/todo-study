import { lazy, Suspense, use } from "react";
import { Link, Navigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { StateScreen } from "@/components/StateScreen";
import Markdown from "@/components/day/Markdown";
import Quiz from "@/components/day/Quiz";
import { loadDay } from "@/content/loader";
import type { DayContent } from "@/content/types";
import { useProgress } from "@/hooks/useProgress";

// Sandpack 은 용량이 커서 코드 예제 영역이 보일 때만 불러온다.
const CodeSandbox = lazy(() => import("@/components/day/CodeSandbox"));

// use() 는 렌더마다 같은 Promise 를 받아야 하므로 Day 별로 캐시한다.
const dayCache = new Map<number, Promise<DayContent | undefined>>();
function getDayPromise(day: number) {
  let promise = dayCache.get(day);
  if (!promise) {
    promise = loadDay(day);
    dayCache.set(day, promise);
  }
  return promise;
}

function DayBody({ day }: { day: number }) {
  const content = use(getDayPromise(day));
  const { statusOf } = useProgress();

  if (!content) {
    return (
      <StateScreen
        kind="empty"
        title={`Day ${day} 는 준비 중입니다`}
        hint="아직 작성되지 않은 학습입니다."
        action={
          <Button asChild variant="outline">
            <Link to="/days">코스 목록으로</Link>
          </Button>
        }
      />
    );
  }

  const status = statusOf(day);
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Day {content.day} · 약 {content.minutes}분
          {status === "completed" && " · 완료"}
        </p>
        <h1 className="text-2xl font-bold">{content.title}</h1>
      </header>

      <Markdown>{content.lesson}</Markdown>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">코드 예제</h2>
        <p className="text-sm text-muted-foreground">코드를 직접 수정하면 오른쪽(모바일은 아래) 미리보기가 바뀝니다.</p>
        <Suspense fallback={<StateScreen kind="loading" title="에디터를 불러오는 중입니다." />}>
          {/* Day 가 바뀌면 코드와 패키지 설정이 섞이지 않도록 새로 만든다. */}
          <CodeSandbox
            key={content.day}
            code={content.example}
            dependencies={content.dependencies}
          />
        </Suspense>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">퀴즈</h2>
        {/* day 가 바뀌면 퀴즈 상태도 초기화되도록 key 지정 */}
        <Quiz key={content.day} day={content.day} quiz={content.quiz} />
      </section>
    </div>
  );
}

export default function DayPage() {
  const { day: dayParam } = useParams();
  const day = Number(dayParam);
  const { statusOf, currentDay } = useProgress();

  if (!Number.isInteger(day) || day < 1) return <Navigate to="/days" replace />;

  if (statusOf(day) === "locked") {
    return (
      <StateScreen
        kind="empty"
        title={`Day ${day} 는 아직 잠겨 있습니다`}
        hint={`Day ${currentDay} 부터 순서대로 완료하면 열립니다.`}
        action={
          <Button asChild>
            <Link to={`/days/${currentDay}`}>Day {currentDay} 로 이동</Link>
          </Button>
        }
      />
    );
  }

  return (
    <Suspense fallback={<StateScreen kind="loading" title="학습을 불러오는 중입니다." />}>
      <DayBody day={day} />
    </Suspense>
  );
}
